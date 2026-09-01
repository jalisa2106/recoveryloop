"""
LLM Client wrapper for RecoveryLoop.

Used only for:
  1. Interpreting ambiguous raw failure messages (Module 5 -- Classifier)
  2. Generating human-readable decision explanations (Module 8 -- Decision Engine)

Reads the API key from the GEMINI_API_KEY environment variable (set in .env).
Simple in-memory + file-backed cache prevents re-querying identical prompts.

Never used for core decision-making -- the decision engine is deterministic.
"""

import os
import json
import hashlib
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

# Cache setup
_CACHE_DIR = Path(__file__).resolve().parent.parent / "data"
_CACHE_FILE = _CACHE_DIR / "llm_cache.json"

_memory_cache: dict[str, str] = {}


def _load_cache() -> None:
    """Load persisted cache from disk into the in-memory dict."""
    global _memory_cache
    if _CACHE_FILE.exists():
        try:
            with open(_CACHE_FILE, "r", encoding="utf-8") as f:
                _memory_cache = json.load(f)
        except (json.JSONDecodeError, OSError):
            _memory_cache = {}


def _save_cache() -> None:
    """Persist the in-memory cache back to disk."""
    _CACHE_DIR.mkdir(parents=True, exist_ok=True)
    with open(_CACHE_FILE, "w", encoding="utf-8") as f:
        json.dump(_memory_cache, f, indent=2)


def _cache_key(prompt: str) -> str:
    """Stable hash key for a prompt string."""
    return hashlib.sha256(prompt.encode("utf-8")).hexdigest()


# Load cache on module import
_load_cache()


def _get_api_key() -> str:
    """Read GEMINI_API_KEY from environment (supports python-dotenv if installed)."""
    try:
        # pyrefly: ignore [missing-import]
        from dotenv import load_dotenv
        load_dotenv(Path(__file__).resolve().parent.parent / ".env")
    except ImportError:
        pass  # python-dotenv is optional; key may already be in env

    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not key:
        raise EnvironmentError(
            "GEMINI_API_KEY is not set. Add it to backend/.env or your shell environment."
        )
    return key


def query_llm(prompt: str, *, temperature: float = 0.0) -> str:
    """
    Send a prompt to Gemini and return the text response.

    Results are cached (in-memory + disk) so identical prompts are never
    re-sent.  temperature=0 by default for deterministic classifier output.

    Parameters
    ----------
    prompt : str
        The full prompt text to send to the model.
    temperature : float
        Sampling temperature (0 = deterministic/greedy).

    Returns
    -------
    str
        The model's text response, stripped of leading/trailing whitespace.

    Raises
    ------
    EnvironmentError
        If GEMINI_API_KEY is not configured.
    RuntimeError
        If the API call fails.
    """
    key = _cache_key(prompt)
    if key in _memory_cache:
        logger.debug("LLM cache hit.")
        return _memory_cache[key]

    api_key = _get_api_key()

    try:
        from google import genai
        from google.genai import types
    except ImportError:
        raise ImportError(
            "google-genai is not installed. "
            "Run: pip install google-genai"
        )

    client = genai.Client(api_key=api_key)

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=temperature,
                max_output_tokens=256,
            ),
        )
        result = response.text.strip()
    except Exception as exc:
        logger.error("Gemini API call failed: %s", exc)
        raise RuntimeError(f"LLM call failed: {exc}") from exc

    # Store in cache
    _memory_cache[key] = result
    _save_cache()
    logger.debug("LLM response cached.")
    return result
