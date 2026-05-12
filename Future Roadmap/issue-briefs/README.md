# Issue Briefs

This folder holds candidate work orders before they become GitHub issues.

Issue briefs are not active work by default. They are queue entries. An agent should not implement a brief unless the user explicitly asks for that candidate or the master table marks it as promoted or ready for promotion.

## Naming Convention

Use a four-digit queue number and a short kebab-case title:

```text
0001-ui-shell-rework.md
0002-mode-a-vertical-slice.md
0003-tutorial-page-x.md
0004-docs-centralization.md
```

The number should match or clearly map to the `FR-0001` style ID in [`../MASTER_ROADMAP_TABLE.md`](../MASTER_ROADMAP_TABLE.md).

## Required Steps

1. Copy [`../ISSUE_BRIEF_TEMPLATE.md`](../ISSUE_BRIEF_TEMPLATE.md).
2. Fill in value, scope, risks, dependencies, acceptance criteria, test plan, documentation impact, rollback plan, and open questions.
3. Add or update the matching row in [`../MASTER_ROADMAP_TABLE.md`](../MASTER_ROADMAP_TABLE.md).
4. Set the status honestly. Use `Needs Clarification` or `Needs Architecture Review` when the work is not ready.
5. Promote to GitHub issue only after the queue decision says it is actionable.

## Brief Quality Bar

A good brief lets a future maintainer or agent answer:

- What are we trying to improve?
- Why does it matter now?
- What is explicitly out of scope?
- Which files or systems are likely to move?
- How risky is parallel work?
- What proves the work is done?
- What docs need to change?
- How do we revert if the change is wrong?
