# Standard Execution Loop

All feature implementations and architectural extensions in ModelMesh must strictly follow this loop:

```
1. UNDERSTAND: Extract requirement, constraints, and success criteria.
2. INSPECT: Audit affected packages, schemas, and dependencies before editing.
3. PLAN: Specify changes, test vectors, and interfaces.
4. IMPLEMENT: Write clean, type-safe, modular code.
5. VERIFY: Run unit tests, contract tests, and integration assertions.
6. REVIEW: Audit git diff, verify zero secret leakage and no lint warnings.
7. DOCUMENT: Update progress, architecture, and changelog.
8. GATE: Confirm all acceptance criteria are satisfied before closing the task.
```
