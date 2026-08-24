---
name: research
description: Investigate a bounded external factual question with primary sources and citations. Use when repository evidence and accepted project knowledge do not answer a material question; do not use for quick library syntax already covered by Context7 or unbounded browsing.
---

# Research

Research only the external facts needed to make or verify a decision.

## Trigger

Use when repository evidence and accepted project knowledge do not answer a material external factual question. Do not use for a narrow Context7 API lookup or unbounded browsing.

## Procedure

1. State the research question in one sentence and name the decision it informs.
2. Check repository evidence through Sherclaw and accepted project knowledge through LoreCat before seeking external evidence.
3. Prefer official documentation, specifications, source repositories, and vendor announcements. Use SearchPurr for bounded external research; use Context7 for a quick official library/API lookup.
4. Separate the result into `Facts`, `Inferences`, and `Open questions`. Cite every material factual claim with its source URL.
5. Redact credentials, tokens, private identifiers, and unnecessary personal data from queries and results.

## Output and persistence

Return the cited finding in chat unless it will be reused. For reusable project knowledge, route the finding to LoreCat; do not write `.ai/docs` directly and do not treat Git recency as authority.

## Boundaries

- This does not replace Sherclaw for code truth, LoreCat for project truth, Context7 for narrow official API documentation, or a product decision by the user.
- Do not broaden the question while researching. Record a new question as open.
- Do not present an inference as a sourced fact.
