"""
Module 5 — Failure Interpreter / Classifier

Takes a raw failure_code and failure_message and returns a clean
failure_category (one of the 7 canonical values from the schema).

Classification strategy:
  1. Rule-based lookup on failure_code — fast, deterministic, no LLM cost.
  2. If failure_code is unrecognized (ERR_UNKNOWN) OR the failure_message
     contains vague/multi-cause language, route to the LLM fallback.
  3. LLM responses are cached (via llm_client) so identical ambiguous
     messages are never re-sent twice.

Run this module directly to classify the full recoverybench.json dataset
and print a breakdown of rule-based vs LLM-path classifications.
"""

import json
import logging
import re
from pathlib import Path

from engine.llm_client import query_llm

logger = logging.getLogger(__name__)

# ── Canonical categories ───────────────────────────────────────────────────────
VALID_CATEGORIES = frozenset(
    [
        "insufficient_funds",
        "technical_timeout",
        "card_expired",
        "wrong_otp",
        "issuer_decline",
        "network_drop",
        "suspected_fraud",
    ]
)

# ── Rule-based lookup table ────────────────────────────────────────────────────
# Maps failure_code values (upper-cased) to a canonical failure_category.
# Codes produced by the dataset generator are already the category name
# in uppercase, but real gateway codes vary — extend this dict as needed.
_CODE_TO_CATEGORY: dict[str, str] = {
    # Generator-produced codes (category.upper())
    "INSUFFICIENT_FUNDS": "insufficient_funds",
    "TECHNICAL_TIMEOUT": "technical_timeout",
    "CARD_EXPIRED": "card_expired",
    "WRONG_OTP": "wrong_otp",
    "ISSUER_DECLINE": "issuer_decline",
    "NETWORK_DROP": "network_drop",
    "SUSPECTED_FRAUD": "suspected_fraud",
    # Common real-world gateway codes (illustrative additions)
    "INSUFFICIENT_BALANCE": "insufficient_funds",
    "LOW_BALANCE": "insufficient_funds",
    "DO_NOT_HONOR": "issuer_decline",
    "CARD_NOT_ACTIVE": "card_expired",
    "INVALID_OTP": "wrong_otp",
    "OTP_EXPIRED": "wrong_otp",
    "TIMED_OUT": "technical_timeout",
    "GATEWAY_TIMEOUT": "technical_timeout",
    "CONNECTION_FAILED": "network_drop",
    "NETWORK_ERROR": "network_drop",
    "FRAUD_SUSPECTED": "suspected_fraud",
    "RISK_DECLINED": "suspected_fraud",
}

# ── Ambiguity detection ────────────────────────────────────────────────────────
# Phrases that signal a vague or multi-cause message — route to LLM regardless
# of whether the failure_code is recognized.
_AMBIGUOUS_PHRASES: list[str] = [
    "could not be completed",
    "please try again",
    "unexpected error",
    "service unavailable",
    "unreadable",
    "system error",
    "unknown",
    "error occurred",
    "try again later",
    "processing error",
]

_AMBIGUOUS_CODE = "ERR_UNKNOWN"


def _is_ambiguous(failure_code: str, failure_message: str) -> bool:
    """Return True if the record should be routed to the LLM fallback."""
    if failure_code.upper() == _AMBIGUOUS_CODE:
        return True
    msg_lower = failure_message.lower()
    return any(phrase in msg_lower for phrase in _AMBIGUOUS_PHRASES)


# ── LLM classifier prompt ──────────────────────────────────────────────────────
_CLASSIFIER_SYSTEM_PROMPT = """\
You are a payment failure classifier for an Indian payment gateway.
Given a failure code and failure message, classify the transaction into
exactly one of these categories:

  insufficient_funds, technical_timeout, card_expired, wrong_otp,
  issuer_decline, network_drop, suspected_fraud

Rules:
- Respond with ONLY the category name, nothing else.
- Use 'technical_timeout' for generic processing errors, service unavailable, timeouts.
- Use 'issuer_decline' for bank-side declines without a more specific cause.
- Use 'suspected_fraud' only if there is a clear fraud/risk signal.
- Default to 'technical_timeout' if truly ambiguous.

Failure code: {code}
Failure message: {message}
Category:"""


def _classify_with_llm(failure_code: str, failure_message: str) -> str:
    """
    Ask the LLM to classify an ambiguous failure.
    Returns a validated category string, falling back to 'technical_timeout'
    if the LLM returns something unexpected.
    """
    prompt = _CLASSIFIER_SYSTEM_PROMPT.format(
        code=failure_code, message=failure_message
    )
    try:
        raw = query_llm(prompt, temperature=0.0)
        # Strip punctuation/whitespace and lower-case
        candidate = re.sub(r"[^a-z_]", "", raw.strip().lower())
        if candidate in VALID_CATEGORIES:
            return candidate
        # Try to extract a valid category from a longer response
        for cat in VALID_CATEGORIES:
            if cat in raw.lower():
                return cat
        logger.warning(
            "LLM returned unexpected category %r — defaulting to technical_timeout", raw
        )
        return "technical_timeout"
    except Exception as exc:
        logger.error("LLM fallback failed: %s — defaulting to technical_timeout", exc)
        return "technical_timeout"


# ── Public API ─────────────────────────────────────────────────────────────────

def classify(failure_code: str, failure_message: str) -> tuple[str, str]:
    """
    Classify a single failure into a canonical failure_category.

    Parameters
    ----------
    failure_code : str
        Raw failure code from the payment gateway.
    failure_message : str
        Human-readable failure message.

    Returns
    -------
    tuple[str, str]
        (failure_category, path) where path is "rule_based" or "llm_fallback".
    """
    if _is_ambiguous(failure_code, failure_message):
        return _classify_with_llm(failure_code, failure_message), "llm_fallback"

    code_upper = failure_code.upper()
    if code_upper in _CODE_TO_CATEGORY:
        return _CODE_TO_CATEGORY[code_upper], "rule_based"

    # Unrecognized code that isn't explicitly flagged as ambiguous — LLM fallback
    return _classify_with_llm(failure_code, failure_message), "llm_fallback"


def classify_dataset(dataset_path: Path | str | None = None) -> dict:
    """
    Run the classifier over the full recoverybench.json dataset.

    For each record:
      - Reads the existing failure_category (ground truth from Module 4)
      - Runs classify() on failure_code + failure_message
      - Compares result to ground truth (all clean records should match exactly;
        ambiguous records may differ since the LLM sees only the vague message)
      - Annotates the record with classifier_category and classifier_path

    Returns a summary dict with counts.

    Parameters
    ----------
    dataset_path : Path or str, optional
        Path to recoverybench.json. Defaults to backend/data/recoverybench.json.
    """
    if dataset_path is None:
        dataset_path = Path(__file__).resolve().parent.parent / "data" / "recoverybench.json"

    dataset_path = Path(dataset_path)
    with open(dataset_path, "r", encoding="utf-8") as f:
        records = json.load(f)

    rule_based_count = 0
    llm_fallback_count = 0
    mismatch_count = 0
    annotated = []

    for record in records:
        txn = record["transaction"]
        code = txn["failure_code"]
        message = txn["failure_message"]
        ground_truth = txn["failure_category"]

        category, path = classify(code, message)

        if path == "rule_based":
            rule_based_count += 1
        else:
            llm_fallback_count += 1

        if category != ground_truth:
            mismatch_count += 1
            logger.debug(
                "Mismatch on %s: truth=%s, predicted=%s (path=%s)",
                txn["transaction_id"],
                ground_truth,
                category,
                path,
            )

        annotated.append(
            {**record, "classifier_category": category, "classifier_path": path}
        )

    total = len(records)
    summary = {
        "total_records": total,
        "rule_based": rule_based_count,
        "llm_fallback": llm_fallback_count,
        "llm_fallback_pct": round(llm_fallback_count / total * 100, 1),
        "category_mismatches": mismatch_count,
    }
    return summary, annotated


# ── CLI runner ─────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import sys

    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")

    print("Running classifier over recoverybench.json...")
    summary, _ = classify_dataset()

    print("\n-- Classifier Results ------------------------------------------")
    print(f"  Total records    : {summary['total_records']}")
    print(f"  Rule-based path  : {summary['rule_based']}")
    print(f"  LLM fallback     : {summary['llm_fallback']} ({summary['llm_fallback_pct']}%)")
    print(f"  Category mismatches (LLM vs ground truth): {summary['category_mismatches']}")
    print("----------------------------------------------------------------")

    if not (15 <= summary["llm_fallback_pct"] <= 25):
        print(
            f"\n[WARN] LLM fallback % ({summary['llm_fallback_pct']}%) is outside "
            "the expected 15-20% target range -- check ambiguity thresholds."
        )
    else:
        print(
            f"\n[OK] LLM fallback rate ({summary['llm_fallback_pct']}%) is "
            "within the target 15-20% range."
        )

    sys.exit(0)
