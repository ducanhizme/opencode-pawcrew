---
description: Convert relevant knowledge from the current conversation into verified, normalized, linked project knowledge in .ai/docs.
agent: lorecat
---

Run a knowledge save transaction on the current conversation and its execution outcome.

This does NOT mean "save chat as Markdown". Follow this pipeline:

1. Extract knowledge worth persisting from this conversation (specs, architecture, decisions with rationale, workflows, references).
2. Classify each candidate: knowledge_kind + authority (normative/descriptive).
3. `wiki_search` for existing concepts that should be updated or superseded instead of duplicated.
4. Verify implementation claims against current HEAD (dispatch Sherclaw).
5. Write via `wiki_save_concept` (OKF frontmatter, `x_wikiguy` metadata, `verified_commit`).
6. `wiki_sync` (indexes + log) then `wiki_validate`.
7. Report what was created/updated/superseded, verification evidence, and remaining drift.

$ARGUMENTS
