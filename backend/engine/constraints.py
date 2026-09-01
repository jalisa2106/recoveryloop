from datetime import datetime
from models.schema import ActionTaken, BlockedAction, RecoveryAttempt, Transaction


CONTACT_ACTIONS = {ActionTaken.REMINDER, ActionTaken.PAYMENT_LINK, ActionTaken.ALT_METHOD}
RETRY_ACTIONS = {ActionTaken.RETRY_NOW, ActionTaken.RETRY_LATER}

MAX_RETRIES = 3
MAX_CONTACT_INTERVENTIONS = 2
EXPIRY_DAYS = 7
DND_START_HOUR = 21  # 9 PM
DND_END_HOUR = 8     # 8 AM


def _is_dnd_window(dt: datetime) -> bool:
    """Return True if timestamp falls inside 9 PM - 8 AM local window."""
    hour = dt.hour
    return hour >= DND_START_HOUR or hour < DND_END_HOUR


def evaluate_constraints(
    transaction: Transaction,
    attempts: list[RecoveryAttempt]
) -> tuple[list[ActionTaken], list[BlockedAction]]:
    """
    Evaluates hard guardrails for a transaction and prior recovery attempts.

    Returns:
        tuple[list[ActionTaken], list[BlockedAction]]:
            Allowed actions and blocked actions with audit reasons.
    """
    allowed: set[ActionTaken] = set(ActionTaken)
    blocked: list[BlockedAction] = []

    def block_action(action: ActionTaken, reason: str):
        if action in allowed:
            allowed.remove(action)
            blocked.append(BlockedAction(action=action, reason=reason))

    # Rule 1: Suspected Fraud Hard-Stop
    if transaction.failure_category == "suspected_fraud":
        for action in list(allowed):
            if action != ActionTaken.STOP:
                block_action(action, "Hard stop enforced due to high-risk fraud flag.")
        return list(allowed), blocked

    # Rule 2: Expiry Check (7 Days)
    txn_dt = datetime.fromisoformat(transaction.timestamp)
    now_dt = datetime.now()
    if (now_dt - txn_dt).days >= EXPIRY_DAYS:
        for action in list(allowed):
            if action != ActionTaken.STOP:
                block_action(action, f"Transaction expired (> {EXPIRY_DAYS} days old).")
        return list(allowed), blocked

    # Count prior attempts
    retry_count = sum(1 for a in attempts if a.action_taken in RETRY_ACTIONS)
    contact_count = sum(1 for a in attempts if a.action_taken in CONTACT_ACTIONS)

    # Rule 3: Max Retries Threshold
    if retry_count >= MAX_RETRIES:
        block_action(ActionTaken.RETRY_NOW, f"Maximum retries limit reached ({MAX_RETRIES}).")
        block_action(ActionTaken.RETRY_LATER, f"Maximum retries limit reached ({MAX_RETRIES}).")

    # Rule 4: Max Customer Interventions Budget
    if contact_count >= MAX_CONTACT_INTERVENTIONS:
        reason = f"Customer contact intervention budget depleted ({MAX_CONTACT_INTERVENTIONS}/{MAX_CONTACT_INTERVENTIONS})."
        block_action(ActionTaken.REMINDER, reason)
        block_action(ActionTaken.PAYMENT_LINK, reason)
        block_action(ActionTaken.ALT_METHOD, reason)

    # Rule 5: Do-Not-Disturb (DND) Window Check
    if _is_dnd_window(txn_dt):
        reason = "Blocked by DND compliance window (9 PM - 8 AM)."
        block_action(ActionTaken.REMINDER, reason)
        block_action(ActionTaken.PAYMENT_LINK, reason)
        block_action(ActionTaken.ALT_METHOD, reason)

    return list(allowed), blocked


if __name__ == "__main__":
    from models.schema import FailureCategory, PaymentMethod, SubscriptionType, TransactionStatus

    # Test Case: Fraud Transaction
    fraud_txn = Transaction(
        transaction_id="TXN_TEST_FRAUD",
        amount=12000.0,
        timestamp=datetime.now().isoformat(),
        payment_method=PaymentMethod.UPI,
        failure_code="SUSPECTED_FRAUD",
        failure_message="Risk flagged",
        failure_category=FailureCategory.SUSPECTED_FRAUD,
        status=TransactionStatus.FAILED,
        subscription_type=SubscriptionType.ONE_TIME
    )
    
    allowed_fraud, blocked_fraud = evaluate_constraints(fraud_txn, [])
    print(f"Fraud Test Allowed: {[a.value for a in allowed_fraud]}")
    print(f"Fraud Test Blocked Count: {len(blocked_fraud)}")