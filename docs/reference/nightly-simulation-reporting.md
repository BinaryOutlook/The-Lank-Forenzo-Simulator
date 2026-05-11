# Nightly Simulation Reporting

The nightly simulation report is the slow, artifact-first counterpart to the fast local balance commands. It is designed for seeded long-run diagnostics, not PR gating.

## Run Size

The default nightly profile is:

$$
R = A \times N = 8 \times 750 = 6{,}000
$$

Where:

- \(A\) is the current archetype bot count.
- \(N\) is `--runs-per-archetype`.
- Each run can last up to `30` rounds by default.

This keeps nightly work inside the `5,000` to `20,000` run band from `docs/FUTURE_REPORT.md` while avoiding large simulations on every pull request.

## Local Command

```bash
npm run report:nightly
```

Useful overrides:

```bash
npm run report:nightly -- \
  --runs-per-archetype 750 \
  --max-rounds 30 \
  --seed nightly-v1 \
  --output-dir artifacts/nightly-simulation-report
```

## GitHub Actions Schedule

`.github/workflows/nightly-simulation-report.yml` runs the report on a nightly schedule and through manual dispatch. It does **not** run on `pull_request`, so deep simulations stay separate from fast review checks.

The workflow uploads artifacts even when the report contains soft warnings. Script crashes should still fail the workflow; balance warnings are data for designers, not merge blockers.

## Artifact Set

The report writes these files:

| Artifact | Purpose |
| --- | --- |
| `nightly-report.md` | Human-readable summary with ending distribution, coverage, low-confidence counts, dominant sequences, and soft warnings. |
| `nightly-report.json` | Full structured report, including the underlying archetype matrix. |
| `low-confidence-content.json` | Detailed decisions, events, delayed events, and packs that did not receive enough coverage. |
| `low-confidence-trend.json` | A compact single-run trend point for comparing low-confidence counts across nightly artifacts. |
| `dominant-sequences.json` | Ranked sequence-prefix candidates and the components of their dominance score. |

## How To Read The Report

### Ending Distribution

Look for strategic collapse. A dominant failure ending means the simulation may be funneling varied bots into one outcome. A useful first watch line is a single ending above `60%` of total runs.

### Low-Confidence Content

Low-confidence content is not automatically bad. It means the current scripted bots did not produce enough evidence that the content is reachable.

Prioritize investigation in this order:

1. Packs below the archetype threshold.
2. Decisions never surfaced.
3. Decisions surfaced but never selected.
4. Delayed events never triggered.
5. Ambient events never triggered.

### Dominant Sequences

Dominant prefixes use the scoring model from the future report:

$$
\text{Dominance}(q) = \text{WinRate}(q) \times \text{Frequency}(q) \times \text{AverageWealth}(q)
$$

A high score means a sequence is common, wins often, and leaves the executive wealthy. Treat it as a design smell when the same prefix stays near the top across several content hashes.

### Soft Warnings

Soft warnings intentionally do not fail the job. They flag areas for balance review while preserving artifacts for comparison. Hard failures should be reserved for broken tooling, invalid content, or runtime exceptions.
