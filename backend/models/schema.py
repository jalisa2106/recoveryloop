from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class PaymentMethod(str, Enum):
    CARD = "card"
    UPI = "upi"
    NETBANKING = "netbanking"
    WALLET = "wallet"


class FailureCategory(str, Enum):
    INSUFFICIENT_FUNDS = "insufficient_funds"
    TECHNICAL_TIMEOUT = "technical_timeout"
    CARD_EXPIRED = "card_expired"
    WRONG_OTP = "wrong_otp"
    ISSUER_DECLINE = "issuer_decline"
    NETWORK_DROP = "network_drop"
    SUSPECTED_FRAUD = "suspected_fraud"


class TransactionStatus(str, Enum):
    FAILED = "failed"
    RECOVERING = "recovering"
    RECOVERED = "recovered"
    STOPPED = "stopped"


class SubscriptionType(str, Enum):
    EMI = "emi"
    SAAS = "saas"
    RECURRING = "recurring"
    ONE_TIME = "one_time"


class ContactChannelPref(str, Enum):
    SMS = "sms"
    EMAIL = "email"
    WHATSAPP = "whatsapp"
    PUSH = "push"


class ActionTaken(str, Enum):
    RETRY_NOW = "retry_now"
    RETRY_LATER = "retry_later"
    ALT_METHOD = "alt_method"
    PAYMENT_LINK = "payment_link"
    REMINDER = "reminder"
    STOP = "stop"


class Outcome(str, Enum):
    RECOVERED = "recovered"
    FAILED = "failed"
    PENDING = "pending"


class Transaction(BaseModel):
    transaction_id: str
    amount: float = Field(description="Amount in INR")
    timestamp: str = Field(description="ISO datetime string")
    payment_method: PaymentMethod
    failure_code: str
    failure_message: str
    failure_category: FailureCategory
    status: TransactionStatus
    subscription_type: SubscriptionType


class CustomerContext(BaseModel):
    customer_id: str
    tenure_days: int
    is_new_customer: bool = Field(description="True if tenure_days < 30")
    payment_history_score: float = Field(ge=0.0, le=1.0, description="Score from 0.0 to 1.0")
    contact_channel_pref: ContactChannelPref


class RecoveryAttempt(BaseModel):
    attempt_id: str
    transaction_id: str
    action_taken: ActionTaken
    timestamp: str = Field(description="ISO datetime string")
    outcome: Outcome


class BlockedAction(BaseModel):
    action: ActionTaken
    reason: str


class Decision(BaseModel):
    transaction_id: str
    selected_action: ActionTaken
    confidence: float = Field(ge=0.0, le=1.0, description="Confidence score 0.0 to 1.0")
    reasoning: str
    blocked_actions: List[BlockedAction] = Field(default_factory=list)
    timestamp: str = Field(description="ISO datetime string")


class AuditEntry(BaseModel):
    transaction_id: str
    decision_snapshot: Decision
    recovered: bool
    amount_recovered: float
    outcome_timestamp: str = Field(description="ISO datetime string")
