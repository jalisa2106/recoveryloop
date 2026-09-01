from datetime import datetime
import logging
from models.schema import Decision, RecoveryAttempt, Transaction, CustomerContext, ActionTaken
from engine.constraints import evaluate_constraints
from engine.evaluation import evaluate_actions
from engine.llm_client import query_llm

logger = logging.getLogger(__name__)

def calculate_confidence(erv_scores: dict[ActionTaken, float]) -> float:
    """Calculates confidence score 0.0-1.0 based on margin between top 2 actions."""
    scores = list(erv_scores.values())
    if not scores:
        return 0.0
    if len(scores) == 1:
        return 0.95
    
    top_score = max(0.001, scores[0]) # Avoid division by zero
    margin = scores[0] - scores[1]
    
    # Simple normalization: larger margin = higher confidence, capped at 99%
    confidence = 0.50 + (margin / top_score) * 0.50
    return round(max(0.50, min(0.99, confidence)), 2)

def generate_reasoning(
    transaction: Transaction, 
    context: CustomerContext, 
    selected_action: ActionTaken, 
    blocked_reasons: list
) -> str:
    """Uses LLM to generate a human-readable diagnostic narrative."""
    prompt = f"""You are an AI payment recovery agent. Write a 2-sentence explanation of your decision.
    
    Context:
    Customer Tenure: {context.tenure_days} days (Score: {context.payment_history_score})
    Failure: {transaction.failure_category.value} on {transaction.payment_method.value}
    Action Chosen: {selected_action.value}
    Blocked Actions: {len(blocked_reasons)}
    
    Draft a concise, professional explanation of why this action was selected considering the customer profile and failure type. Do not use robotic greetings.
    """
    try:
        return query_llm(prompt, temperature=0.2)
    except Exception as e:
        logger.warning(f"LLM reasoning generation fallback triggered: {e}")
        return f"Selected {selected_action.value} based on optimal ERV score for {transaction.failure_category.value}."

def make_decision(
    transaction: Transaction, 
    customer: CustomerContext, 
    prior_attempts: list[RecoveryAttempt]
) -> Decision:
    """Core orchestrator generating a final autonomous decision."""
    
    # 1. Hard Guardrails
    allowed_actions, blocked_actions = evaluate_constraints(transaction, prior_attempts)
    
    # 2. ERV Scoring
    friction_score = sum(1 for a in prior_attempts if a.action_taken in 
                         {ActionTaken.REMINDER, ActionTaken.PAYMENT_LINK, ActionTaken.ALT_METHOD})
    
    erv_scores = evaluate_actions(transaction, allowed_actions, friction_score)
    
    # Fallback to STOP if all actions have negative ERV or empty
    selected_action = ActionTaken.STOP
    confidence = 0.99
    
    if erv_scores:
        selected_action = list(erv_scores.keys())[0]
        confidence = calculate_confidence(erv_scores)

    # 3. LLM Diagnostic Narrative
    reasoning = generate_reasoning(transaction, customer, selected_action, blocked_actions)

    return Decision(
        transaction_id=transaction.transaction_id,
        selected_action=selected_action,
        confidence=confidence,
        reasoning=reasoning,
        blocked_actions=blocked_actions,
        timestamp=datetime.now().isoformat()
    )