import json
import os
from models.schema import ActionTaken, Transaction

PRIORS_FILE = "data/priors.json"

# Base configuration values from Antigravity spec
INTERVENTION_COSTS = {
    ActionTaken.RETRY_NOW: 2.0,
    ActionTaken.RETRY_LATER: 2.0,
    ActionTaken.REMINDER: 5.0,
    ActionTaken.PAYMENT_LINK: 8.0,
    ActionTaken.ALT_METHOD: 10.0,
    ActionTaken.STOP: 0.0,
}

FRICTION_WEIGHTS = {
    ActionTaken.RETRY_NOW: 0.0,
    ActionTaken.RETRY_LATER: 0.0,
    ActionTaken.REMINDER: 15.0,
    ActionTaken.PAYMENT_LINK: 20.0,
    ActionTaken.ALT_METHOD: 25.0,
    ActionTaken.STOP: 0.0,
}

LEARNING_RATE = 0.1

def _load_priors() -> dict:
    if not os.path.exists(PRIORS_FILE):
        raise FileNotFoundError(f"{PRIORS_FILE} is missing. Please initialize it.")
    with open(PRIORS_FILE, "r") as f:
        return json.load(f)

def _save_priors(priors: dict):
    with open(PRIORS_FILE, "w") as f:
        json.dump(priors, f, indent=2)

def evaluate_actions(
    transaction: Transaction,
    allowed_actions: list[ActionTaken],
    friction_score: int
) -> dict[ActionTaken, float]:
    """
    Scores allowed actions using Expected Recovery Value (ERV).
    ERV = (probability * amount) - cost - (friction_weight * friction_score)
    """
    priors = _load_priors()
    category_priors = priors.get(transaction.failure_category.value, {})
    
    erv_scores = {}
    for action in allowed_actions:
        prob = category_priors.get(action.value, 0.0)
        cost = INTERVENTION_COSTS.get(action, 0.0)
        weight = FRICTION_WEIGHTS.get(action, 0.0)
        
        erv = (prob * transaction.amount) - cost - (weight * friction_score)
        erv_scores[action] = erv
        
    # Return actions sorted by highest ERV first
    return dict(sorted(erv_scores.items(), key=lambda item: item[1], reverse=True))

def update_prior(failure_category: str, action: ActionTaken, recovered: bool):
    """
    Adjusts the prior probability incrementally based on real observed outcomes.
    Uses: new_prior = old_prior + learning_rate * (observed_outcome - old_prior)
    """
    observed_outcome = 1.0 if recovered else 0.0
    priors = _load_priors()
    
    if failure_category in priors and action.value in priors[failure_category]:
        old_prior = priors[failure_category][action.value]
        new_prior = old_prior + LEARNING_RATE * (observed_outcome - old_prior)
        
        # Clamp between 0.0 and 1.0 and save
        priors[failure_category][action.value] = max(0.0, min(1.0, round(new_prior, 4)))
        _save_priors(priors)

if __name__ == "__main__":
    from models.schema import FailureCategory, PaymentMethod, SubscriptionType, TransactionStatus
    from datetime import datetime
    
    # Quick Test
    test_txn = Transaction(
        transaction_id="TXN_TEST_1",
        amount=5000.0,
        timestamp=datetime.now().isoformat(),
        payment_method=PaymentMethod.CARD,
        failure_code="INSUFFICIENT_FUNDS",
        failure_message="Low balance",
        failure_category=FailureCategory.INSUFFICIENT_FUNDS,
        status=TransactionStatus.FAILED,
        subscription_type=SubscriptionType.SAAS
    )
    
    allowed = [ActionTaken.RETRY_LATER, ActionTaken.PAYMENT_LINK, ActionTaken.STOP]
    scores = evaluate_actions(test_txn, allowed, friction_score=1)
    
    print(f"Test Transaction Amount: INR {test_txn.amount}")
    print("Action ERV Rankings:")
    for action, score in scores.items():
        print(f"  {action.value}: {score:.2f}")