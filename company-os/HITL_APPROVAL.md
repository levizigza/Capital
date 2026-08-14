# Human-in-the-Loop approval (pointer)

Risk dimensions → LOW / MEDIUM / HIGH / CRITICAL gates.

- LOW: auto execute  
- MEDIUM: explicit policy thresholds  
- HIGH: founder approval  
- CRITICAL: founder + second confirmation  

Code: `src/business/hitl/` · Docs: `docs/HITL_APPROVAL.md`

All decisions are append-logged. Agents cannot approve as founder.
