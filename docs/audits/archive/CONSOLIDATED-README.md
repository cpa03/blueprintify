# Archived Audit Reports

> This directory contains historical audit reports that have been consolidated.
> For current audits, see `docs/audits/README.md` and the files directly in `docs/audits/`.

## Consolidation Dates

- **2026-06-17** — Initial RepoKeeper Cycle consolidation
- **2026-07-05** — RepoKeeper Cycle 193: Retention cleanup (removed files from Jun 1-4, >30 days old)
- **2026-07-07** — RepoKeeper Cycle 204: Retention cleanup (removed 4 files from Jun 6, >30 days old)
- **2026-07-08** — RepoKeeper Cycle 207: Retention cleanup (removed 6 files from Jun 7, >30 days old)
- **2026-07-11** — RepoKeeper Cycle 229: Retention cleanup (removed 14 files from Jun 8–10, >30 days old)
- **2026-07-12** — RepoKeeper Cycle 231: Retention cleanup (removed 3 files from Jun 11, >30 days old)
- **2026-07-13** — RepoKeeper Cycle 242: Retention cleanup (removed 2 files from Jun 12, >30 days old)
- **2026-07-15** — RepoKeeper Cycle 250: Retention cleanup (removed 4 files from Jun 15, >30 days old)
- **2026-07-15** — RepoKeeper Cycle 252: Retention cleanup (removed 1 file from Jun 14 — `ulw-loop-phase1-audit-2026-06-14.md`, >30 days old)
- **2026-07-27** — RepoKeeper Cycle 312: Archive consolidation (moved 5 current audit reports from Jul 23-24 to archive)
- **2026-07-21** — RepoKeeper Cycle 280: Retention cleanup (removed 6 files from Jun 19-20 — `brocula-hunt-2026-06-20-run{2,3,4,5}.md`, `ulw-loop-audit-2026-06-20.md`, `issue-audit-report-2026-06-19.md`, >30 days old)
- **2026-07-24** — RepoKeeper Cycle 298: Retention cleanup (removed 12 files from Jun 23-24 — `brocula-hunt-2026-06-23-run{1,2,3,4,5}.md`, `brocula-hunt-2026-06-24-run{1,2,3,4,5,6}.md`, `issue-audit-report-2026-06-24.md`, >30 days old); Archive consolidation (moved 56 audit reports from Jul 8-19 to archive)
- **2026-07-31** — RepoKeeper Cycle 325: Retention cleanup (removed 6 files from Jun 30 — `brocula-hunt-2026-06-30-run{1,2,3,4,5,6}.md`, >30 days old)
- **2026-08-01** — RepoKeeper Cycle 326: Retention cleanup (removed 3 files from Jul 1 — `brocula-hunt-2026-07-01-run{1,2,3}.md`, >30 days old); duplicate removal (5 root copies of Jul 23-24 audit reports that had been moved to archive in Cycle 312)
- **2026-08-01** — BugFixer Cycle 13 (BUG-037): Retention cleanup (removed 3 files from Jul 1 — `brocula-hunt-2026-07-01-run{1,2,3}.md`, >30 days old; prior cycles' retention checks only scanned `brocula-audit-*` and missed the `brocula-hunt-*` series)
- **2026-08-02** — RepoKeeper Cycle 327: Retention cleanup (removed 3 files from Jul 2 — `brocula-hunt-2026-07-02-run{1,2,3}.md`, >30 days old; BugFixer Cycle 16 audit misreported "oldest Jul 13" — these Jul 2 files had been missed because the retention scan used the audit-run date in the report title instead of the file's creation date; verified via `git log --follow` that they date from Jul 2, 31 days old)
- **2026-08-08** — RepoKeeper Cycle 378: Retention cleanup (removed 4 files from Jul 8 — `brocula-hunt-2026-07-08-run{2,3,4}.md`, `diagnostic-scoring-2026-07-08.md`, >30 days old; BugFixer Cycle 41 had misreported "oldest Jul 13" — the Jul 8 `brocula-hunt-*`/`diagnostic-*` files were missed by the retention scan, same `brocula-audit-*`-only scan gap as BugFixer Cycle 16; verified via `git log --follow` that they date from Jul 8, 31 days old)
- **2026-08-13** — RepoKeeper Cycle 445: Retention cleanup (removed 22 files from Jul 9–13 — `brocula-hunt-2026-07-09-run{1..5}.md`, `brocula-hunt-2026-07-10-run{1..4}.md`, `brocula-hunt-2026-07-11-run{1..3}.md`, `brocula-hunt-2026-07-12-run{1..4}.md`, `brocula-hunt-2026-07-13-run1.md`, `brocula-hunt-2026-07-13-run-11-17.md`, `brocula-audit-2026-07-13{,-run2,-run3,-run4}.md`, 31–35 days old; verified via `git log --follow` that they date from Jul 9–13; oldest remaining now Jul 14 = 30 days, at boundary)
- **2026-08-14** — RepoKeeper Cycle 461: Retention cleanup (removed 5 files from Jul 14 — `brocula-audit-2026-07-14{,-run2,-run3}.md`, `brocula-hunt-2026-07-14-run{4,5}.md`, 31 days old by strict calendar, past 30-day policy — Cycle 458/459 same-day deferral respected through Cycle 460, mandatory purge executed this cycle per Cycle 459 flag; verified via `git log --follow` that they date from Jul 14; oldest remaining now Jul 15 = 30 days, at boundary)
- **2026-08-16** — RepoKeeper Cycle 495: Retention cleanup (removed 7 files from Jul 15 — `brocula-audit-2026-07-15{,-run2,-run3,-run4}.md`, `brocula-hunt-2026-07-15-run4.md`, `issue-audit-report-2026-07-15.md`, `phase1-scoring-report-2026-07-15.md`, 32 days old by strict calendar, past 30-day policy — "next purge due Aug 16+" per Cycles 445/449/451/454/458/462/464/466/469/474/477; verified via `git log --follow` that they date from Jul 14–15 (2 files — `brocula-audit-2026-07-15.md` `a08c3d14`, `brocula-hunt-2026-07-15-run4.md` `5bb5610e` — actually originated Jul 14, slipped past the Cycle 461 purge under Jul 15 filenames); oldest remaining now Jul 16 = 30 days, at boundary)
- **2026-08-17** — RepoKeeper Cycle 522: Retention cleanup (removed 7 files from Jul 16–17 — `brocula-audit-2026-07-16{,-run2,-run3,-run5}.md`, `brocula-audit-2026-07-17{,-run2,-run3}.md`, 31–32 days old by strict calendar, past 30-day policy — "next purge due Aug 17+" per Cycle 495 flag ("next when Jul 16 files exceed boundary"); titles date them Jul 16–17 and `git log --follow` confirms all moved-to-archive together 2026-07-24 under their run-date filenames, consistent with prior title-date retention scans; oldest remaining now Jul 18 = 30 days, at boundary)
- **2026-08-18** — RepoKeeper Cycle 541: Retention cleanup (removed 6 files from Jul 18 — `brocula-audit-2026-07-18-run{1,2,3,4}.md`, `phase1-diagnostic-2026-07-18.md`, `ulw-loop-audit-2026-07-18.md`, 31 days old by strict calendar, past 30-day policy — "next purge due Aug 18+" per Cycle 522 flag ("next when Jul 18 files exceed boundary"); titles date them Jul 18 and `git log --follow` confirms all moved-to-archive together 2026-07-24 under their run-date filenames, consistent with prior title-date retention scans; oldest remaining now Jul 19 = 30 days, at boundary)

## What's Here

These files are retained for historical reference only. Current archive contents:

### BroCula / BroCula-Audit Reports (Jul 19 - Jul 24, 2026)
- Daily brocula-hunt and brocula-audit run reports covering browser console error detection and Lighthouse audit optimization
- Each file represents one run cycle from the CI pipeline

### Diagnostic & Issue Reports (Jul 2026)
- Diagnostic scoring reports
- Phase 1 scoring and diagnostic reports
- Issue audit reports
- ULW Loop audit report

## Retention Policy

Archive files are kept for 30 days from creation, then eligible for deletion.
Last cleanup: 2026-08-18 (RepoKeeper Cycle 541 — removed 6 files from Jul 18 — `brocula-audit-2026-07-18-run{1,2,3,4}.md`, `phase1-diagnostic-2026-07-18.md`, `ulw-loop-audit-2026-07-18.md`, 31 days old by strict calendar, past 30-day policy — "next purge due Aug 18+" per Cycle 522 flag; titles date them Jul 18, `git log --follow` confirms all moved-to-archive together 2026-07-24 under their run-date filenames. Oldest remaining archive files now date from Jul 19 = 30 days, at boundary — no further purge needed).
