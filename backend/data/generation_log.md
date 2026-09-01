# RecoveryBench Generation Log

- Total Records: 180
- Distribution (target vs actual): all categories match exactly (validated at generation time).

## Measured correlation rates (this run)

- insufficient_funds on day 25-31 of month: 41/45 (91%, target ~70%)
- suspected_fraud with is_new_customer=true: 7/9 (78%, target ~85%)
- suspected_fraud in night window (11pm-5am): 6/9 (67%, target ~70%)
- card_expired with tenure_days > 180: 27/27 (100%, target ~80%)
- card_expired with subscription_type in [emi, recurring]: 26/27 (96%, target ~90%)

- Ambiguous failure_message strings injected for LLM classifier testing (~18% of records).
- transaction_id and customer_id uniqueness enforced at generation time (see validate()).
