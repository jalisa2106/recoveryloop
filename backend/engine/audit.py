import json
import os
from models.schema import AuditEntry, Decision

AUDIT_FILE = "data/audit_trail.json"

def _load_audit_trail() -> list[dict]:
    if not os.path.exists(AUDIT_FILE):
        return []
    try:
        with open(AUDIT_FILE, "r") as f:
            return json.load(f)
    except Exception:
        return []

def log_decision(decision: Decision, recovered: bool = False, amount_recovered: float = 0.0):
    """Appends a new decision snapshot to the audit log."""
    trail = _load_audit_trail()
    
    entry = AuditEntry(
        transaction_id=decision.transaction_id,
        decision_snapshot=decision,
        recovered=recovered,
        amount_recovered=amount_recovered,
        outcome_timestamp=decision.timestamp # Will be updated by outcome simulator later
    )
    
    # Remove existing entry for same transaction to simulate updates, or just append
    trail = [t for t in trail if t.get("transaction_id") != decision.transaction_id]
    trail.append(entry.model_dump())
    
    with open(AUDIT_FILE, "w") as f:
        json.dump(trail, f, indent=2)

def get_audit_trail(
    failure_category: str = None, 
    action_taken: str = None, 
    outcome: str = None
) -> list[dict]:
    """
    Retrieves the audit trail, filterable by failure_category, action type, or outcome status.
    """
    trail = _load_audit_trail()
    filtered = trail
    
    if failure_category:
        filtered = [
            t for t in filtered 
            if t.get("decision_snapshot", {}).get("failure_category") == failure_category
            or t.get("failure_category") == failure_category
        ]
    if action_taken:
        filtered = [
            t for t in filtered 
            if t.get("decision_snapshot", {}).get("selected_action") == action_taken
        ]
    if outcome:
        if outcome.lower() == "recovered":
            filtered = [t for t in filtered if t.get("recovered") is True]
        elif outcome.lower() == "failed":
            filtered = [t for t in filtered if t.get("recovered") is False]
            
    return filtered