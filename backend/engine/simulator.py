import json
import random
import os
from datetime import datetime
from models.schema import Transaction, CustomerContext
from engine.decision_engine import make_decision
from engine.audit import log_decision
from engine.evaluation import update_prior

HIDDEN_MODEL_FILE = "data/hidden_outcome_model.json"
DATASET_FILE = "data/recoverybench.json"

def load_json(filepath: str):
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Missing {filepath}. Ensure Module 4 generation is complete.")
    with open(filepath, "r") as f:
        return json.load(f)

def simulate_outcome(failure_category: str, selected_action: str, amount: float) -> tuple[bool, float]:
    """
    Simulates a ground-truth outcome based on decision and hidden model probabilities.
    Returns (recovered: bool, amount_recovered: float).
    """
    hidden_model = load_json(HIDDEN_MODEL_FILE)
    if selected_action == "stop":
        return False, 0.0
    
    true_prob = hidden_model.get(failure_category, {}).get(selected_action, 0.0)
    if random.random() <= true_prob:
        return True, amount
    return False, 0.0

def run_simulation():
    print("Initializing RecoveryLoop Engine Simulation...")
    dataset = load_json(DATASET_FILE)
    
    recovered_count = 0
    total_recovered_amount = 0.0
    correctly_stopped_count = 0

    for idx, record in enumerate(dataset):
        txn = Transaction(**record["transaction"])
        customer = CustomerContext(**record["customer_context"])
        
        # 1. Orchestrate Autonomous Decision (Modules 6, 7, 8)
        decision = make_decision(transaction=txn, customer=customer, prior_attempts=[])
        
        # 2. Simulate Ground Truth Outcome
        recovered, amount_recovered = simulate_outcome(
            txn.failure_category.value, 
            decision.selected_action.value, 
            txn.amount
        )
        
        if recovered:
            recovered_count += 1
            total_recovered_amount += amount_recovered
        elif decision.selected_action.value == "stop" and txn.failure_category.value == "suspected_fraud":
            correctly_stopped_count += 1

        decision.timestamp = datetime.now().isoformat()
        
        # 3. Log Output to Audit Trail (Module 9)
        log_decision(decision, recovered, amount_recovered)
        
        # 4. Adaptive Learning Update (Module 7)
        update_prior(txn.failure_category.value, decision.selected_action, recovered)

        if (idx + 1) % 25 == 0:
            print(f"Processed {idx + 1}/{len(dataset)} transactions...")

    print("\n=========================================")
    print("Simulation Complete!")
    print(f"Total Transactions Processed: {len(dataset)}")
    print(f"Total Recovered: {recovered_count} ({(recovered_count/len(dataset))*100:.1f}%)")
    print(f"Total Revenue Recovered: INR {total_recovered_amount:,.2f}")
    if correctly_stopped_count > 0:
        print(f"Fraud Accurately Halted: {correctly_stopped_count} transactions")
    print("Audit log populated at data/audit_trail.json")
    print("=========================================")

if __name__ == "__main__":
    run_simulation()