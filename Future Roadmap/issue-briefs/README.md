# Issue Briefs

This folder holds candidate work orders before they become GitHub issues.

Issue briefs are not active work by default. They are queue entries. An agent should not implement a brief unless the user explicitly asks for that candidate or the generated master table marks it as promoted or ready for promotion.

The YAML frontmatter in each brief is the roadmap source of truth. `../MASTER_ROADMAP_TABLE.md` is generated from that metadata, so agents may edit briefs but must not manually edit the table.

## Naming Convention

Use a four-digit queue number and a short kebab-case title:

```text
0001-ui-shell-rework.md
0002-mode-a-vertical-slice.md
0003-tutorial-page-x.md
0004-docs-centralization.md
```

The number should match or clearly map to the `FR-0001` style `id` in the brief frontmatter.

## Required Steps

1. Copy [`../ISSUE_BRIEF_TEMPLATE.md`](../ISSUE_BRIEF_TEMPLATE.md).
2. Fill in the required frontmatter fields, including `id`, `status`, `priority`, dependencies, risk ratings, owner, GitHub issue, and `last_decision`.
3. Fill in value, scope, risks, dependencies, acceptance criteria, test plan, documentation impact, rollback plan, and open questions in the body.
4. Set the status honestly. Use `Needs Clarification` or `Needs Architecture Review` when the work is not ready.
5. Run `npm run roadmap:generate`.
6. Run `npm run roadmap:check`.
7. Promote to GitHub issue only after the queue decision says it is actionable.
8. When a promoted issue is fully fixed by a PR, move the completed record to [`../archive/`](../archive/) on that PR branch before merge, then run `npm run roadmap:generate` and `npm run roadmap:check`.
9. After merge, verify `main` still passes `npm run roadmap:check`; if a completed row slipped through, archive it immediately in a cleanup branch.

If a PR only partially resolves a brief, keep the brief here and update `last_decision` so the remaining work is visible in the generated table.

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
