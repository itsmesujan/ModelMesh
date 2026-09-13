# Subagent Task Protocol

When delegating tasks or operating across modular boundaries, adhere to the following contract:

## Task Contract
- **TASK_ID**: Unique identifier (e.g. `TSK-004`).
- **OBJECTIVE**: Specific verifiable deliverable.
- **ALLOWED_PATHS**: Explicit directory boundaries.
- **FORBIDDEN_PATHS**: Protected paths (e.g. outside workspace).
- **VERIFICATION**: Exact command used to prove success.
- **ACCEPTANCE_CRITERIA**: Testable conditions.

## Completion Evidence
Every task completion must report:
- Status (DONE / BLOCKED)
- Summary of verified changes
- Test results
- Discovered risks or follow-up recommendations
