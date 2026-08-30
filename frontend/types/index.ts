export type PaymentMethod = 'card' | 'upi' | 'netbanking' | 'wallet';

export type FailureCategory =
  | 'insufficient_funds'
  | 'technical_timeout'
  | 'card_expired'
  | 'wrong_otp'
  | 'issuer_decline'
  | 'network_drop'
  | 'suspected_fraud';

export type TransactionStatus = 'failed' | 'recovering' | 'recovered' | 'stopped';

export type SubscriptionType = 'emi' | 'saas' | 'recurring' | 'one_time';

export type ContactChannelPref = 'sms' | 'email' | 'whatsapp' | 'push';

export type ActionTaken =
  | 'retry_now'
  | 'retry_later'
  | 'alt_method'
  | 'payment_link'
  | 'reminder'
  | 'stop';

export type SelectedAction = ActionTaken;

export type Outcome = 'recovered' | 'failed' | 'pending';

export interface Transaction {
  transaction_id: string;
  amount: number; // INR
  timestamp: string; // ISO datetime string
  payment_method: PaymentMethod;
  failure_code: string;
  failure_message: string;
  failure_category: FailureCategory;
  status: TransactionStatus;
  subscription_type: SubscriptionType;
}

export interface CustomerContext {
  customer_id: string;
  tenure_days: number;
  is_new_customer: boolean; // tenure_days < 30
  payment_history_score: number; // float 0 to 1
  contact_channel_pref: ContactChannelPref;
}

export interface RecoveryAttempt {
  attempt_id: string;
  transaction_id: string;
  action_taken: ActionTaken;
  timestamp: string; // ISO datetime string
  outcome: Outcome;
}

export interface BlockedAction {
  action: ActionTaken;
  reason: string;
}

export interface Decision {
  transaction_id: string;
  selected_action: ActionTaken;
  confidence: number; // float 0 to 1
  reasoning: string;
  blocked_actions: BlockedAction[];
  timestamp: string; // ISO datetime string
}

export interface AuditEntry {
  transaction_id: string;
  decision_snapshot: Decision;
  recovered: boolean;
  amount_recovered: number;
  outcome_timestamp: string; // ISO datetime string
}
