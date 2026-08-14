# Task routing (pointer)

Every incoming admin/ops task is classified into exactly one of:

`DETERMINISTIC_WORKFLOW` · `AI_ASSISTED_WORKFLOW` · `AI_AGENT` · `HUMAN_DECISION`

Code: `src/business/taskRouting/`  
Docs: `docs/TASK_ROUTING.md`

`reason_for_routing` is required on every decision. Human-consequence signals always win.
