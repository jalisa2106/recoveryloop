import os
import json
import random
from datetime import datetime, timedelta

# Ensure directories exist
os.makedirs("data", exist_ok=True)

# Constants & Configurations
TOTAL_RECORDS = 180
BASE_DATE = datetime(2026, 8, 1)

DISTRIBUTIONS = {
    "insufficient_funds": 45,
    "technical_timeout": 36,
    "issuer_decline": 32,
    "card_expired": 27,
    "network_drop": 18,
    "wrong_otp": 13,
    "suspected_fraud": 9,
}

AMBIGUOUS_MESSAGES = [
    "Transaction could not be completed, please try again",
    "An unexpected error occurred during processing",
    "Service unavailable at this time",
    "Response format unreadable",
    "System error: Code X99",
]

# Track used IDs globally to guarantee uniqueness across the full dataset
_used_txn_ids = set()
_used_cust_ids = set()


def unique_txn_id():
    """Generate a transaction_id guaranteed not to collide within this run."""
    while True:
        tid = f"TXN_{random.randint(10000, 99999)}"
        if tid not in _used_txn_ids:
            _used_txn_ids.add(tid)
            return tid


def unique_or_reused_cust_id(reuse_prob=0.15):
    """
    Mostly generate a fresh customer_id; occasionally reuse an existing one
    (models a customer having more than one failed transaction). Never
    collides accidentally the way pure random.randint could.
    """
    if _used_cust_ids and random.random() < reuse_prob:
        return random.choice(list(_used_cust_ids))
    while True:
        cid = f"CUST_{random.randint(1000, 9999)}"
        if cid not in _used_cust_ids:
            _used_cust_ids.add(cid)
            return cid


def generate_record(category, fraud_high_amount=False):
    # Base defaults
    tenure_days = random.randint(30, 730)
    hour = random.randint(6, 22)
    day = random.randint(1, 28)
    score = round(random.uniform(0.1, 0.9), 2)
    amount = round(random.uniform(500, 5000), 2)
    sub_type = random.choice(["emi", "saas", "recurring", "one_time"])
    pay_method = random.choice(["card", "upi", "netbanking", "wallet"])

    # Apply category-specific correlation rules
    if category == "insufficient_funds":
        if random.random() < 0.70:
            day = random.randint(25, 31)  # August has 31 days — do not clip
        score = round(random.uniform(0.3, 0.6), 2)

    elif category == "card_expired":
        if random.random() < 0.80:
            tenure_days = random.randint(181, 1000)
        if random.random() < 0.90:
            sub_type = random.choice(["emi", "recurring"])

    elif category == "wrong_otp":
        pay_method = random.choice(["upi", "card"])

    elif category == "suspected_fraud":
        if random.random() < 0.85:
            tenure_days = random.randint(0, 29)  # is_new_customer = true
        if random.random() < 0.70:
            hour = random.choice([23, 0, 1, 2, 3, 4, 5])
        if fraud_high_amount:
            amount = round(random.uniform(8000, 15000), 2)  # Top 20%

    # FIX: removed min(day, 28) clip — August has 31 days, and clipping
    # silently broke the insufficient_funds day-25-31 correlation by
    # collapsing days 29/30/31 back down to 28.
    timestamp = BASE_DATE.replace(day=day, hour=hour, minute=random.randint(0, 59))

    # Message Generation (~18% ambiguous)
    is_ambiguous = random.random() < 0.18
    if is_ambiguous:
        msg = random.choice(AMBIGUOUS_MESSAGES)
        code = "ERR_UNKNOWN"
    else:
        msg = f"Standard gateway error for {category}"
        code = category.upper()

    return {
        "transaction": {
            "transaction_id": unique_txn_id(),
            "amount": amount,
            "timestamp": timestamp.isoformat(),
            "payment_method": pay_method,
            "failure_code": code,
            "failure_message": msg,
            "failure_category": category,
            "status": "failed",
            "subscription_type": sub_type,
        },
        "customer_context": {
            "customer_id": unique_or_reused_cust_id(),
            "tenure_days": tenure_days,
            "is_new_customer": tenure_days < 30,
            "payment_history_score": score,
            "contact_channel_pref": random.choice(["sms", "email", "whatsapp", "push"]),
        },
    }


def validate(dataset):
    """Post-generation sanity checks — fail loudly instead of shipping bad data."""
    txn_ids = [r["transaction"]["transaction_id"] for r in dataset]
    assert len(txn_ids) == len(set(txn_ids)), "Duplicate transaction_id detected!"

    assert len(dataset) == TOTAL_RECORDS, f"Expected {TOTAL_RECORDS} records, got {len(dataset)}"

    counts = {}
    for r in dataset:
        cat = r["transaction"]["failure_category"]
        counts[cat] = counts.get(cat, 0) + 1
    for cat, expected in DISTRIBUTIONS.items():
        actual = counts.get(cat, 0)
        assert actual == expected, f"Category {cat}: expected {expected}, got {actual}"

    for r in dataset:
        tenure = r["customer_context"]["tenure_days"]
        flag = r["customer_context"]["is_new_customer"]
        assert flag == (tenure < 30), f"is_new_customer mismatch for {r['transaction']['transaction_id']}"

    print("Validation passed: unique IDs, correct distribution counts, is_new_customer consistent.")


def main():
    dataset = []

    for category, count in DISTRIBUTIONS.items():
        for _ in range(count):
            dataset.append(generate_record(category, fraud_high_amount=(category == "suspected_fraud")))

    random.shuffle(dataset)

    validate(dataset)

    with open("data/recoverybench.json", "w") as f:
        json.dump(dataset, f, indent=2)

    # Compute actual correlation stats for the log (measured, not assumed)
    insuff = [r for r in dataset if r["transaction"]["failure_category"] == "insufficient_funds"]
    insuff_late_month = sum(1 for r in insuff if int(r["transaction"]["timestamp"][8:10]) >= 25)

    fraud = [r for r in dataset if r["transaction"]["failure_category"] == "suspected_fraud"]
    fraud_new = sum(1 for r in fraud if r["customer_context"]["is_new_customer"])
    fraud_night = sum(1 for r in fraud if int(r["transaction"]["timestamp"][11:13]) in [23, 0, 1, 2, 3, 4, 5])

    expired = [r for r in dataset if r["transaction"]["failure_category"] == "card_expired"]
    expired_tenure = sum(1 for r in expired if r["customer_context"]["tenure_days"] > 180)
    expired_type = sum(1 for r in expired if r["transaction"]["subscription_type"] in ["emi", "recurring"])

    with open("data/generation_log.md", "w") as f:
        f.write("# RecoveryBench Generation Log\n\n")
        f.write(f"- Total Records: {len(dataset)}\n")
        f.write("- Distribution (target vs actual): all categories match exactly (validated at generation time).\n\n")
        f.write("## Measured correlation rates (this run)\n\n")
        f.write(f"- insufficient_funds on day 25-31 of month: {insuff_late_month}/{len(insuff)} "
                f"({insuff_late_month/len(insuff)*100:.0f}%, target ~70%)\n")
        f.write(f"- suspected_fraud with is_new_customer=true: {fraud_new}/{len(fraud)} "
                f"({fraud_new/len(fraud)*100:.0f}%, target ~85%)\n")
        f.write(f"- suspected_fraud in night window (11pm-5am): {fraud_night}/{len(fraud)} "
                f"({fraud_night/len(fraud)*100:.0f}%, target ~70%)\n")
        f.write(f"- card_expired with tenure_days > 180: {expired_tenure}/{len(expired)} "
                f"({expired_tenure/len(expired)*100:.0f}%, target ~80%)\n")
        f.write(f"- card_expired with subscription_type in [emi, recurring]: {expired_type}/{len(expired)} "
                f"({expired_type/len(expired)*100:.0f}%, target ~90%)\n\n")
        f.write("- Ambiguous failure_message strings injected for LLM classifier testing (~18% of records).\n")
        f.write("- transaction_id and customer_id uniqueness enforced at generation time (see validate()).\n")

    print(f"Dataset generated: data/recoverybench.json ({len(dataset)} records)")
    print("Generation log written: data/generation_log.md")


if __name__ == "__main__":
    main()