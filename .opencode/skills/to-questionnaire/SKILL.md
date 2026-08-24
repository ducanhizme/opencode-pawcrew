---
name: to-questionnaire
description: Create a concise questionnaire for a stakeholder or subject-matter expert. Use when an external person must provide missing facts before a decision can proceed; do not use instead of one in-chat clarification question.
---

# To Questionnaire

Turn an information gap into a recipient-ready request for answers.

## Trigger

Use when an external stakeholder or subject-matter expert must provide facts before a decision can proceed. Do not use instead of one in-chat clarification question.

## Procedure

1. Identify the recipient, the decision their response unlocks, and the minimum facts needed. Do not invent a deadline or urgency.
2. Group questions by the decision they inform, not by internal implementation.
3. Mark optional context separately from questions that require an answer.
4. Specify the expected response format, such as a choice, short answer, table, or example.
5. Explain what will happen after a response is received.

## Output

Produce a concise Markdown questionnaire with `Purpose`, `Required answers`, `Optional context`, `Response format`, and `Next step` sections.

## Boundaries

- Use `clarification` for a single material question to the active user.
- Do not make product decisions for the recipient or imply approval they have not given.
- Do not include secrets, credentials, or unnecessary private information.
