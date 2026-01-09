Check all open PRs with label 'ready-for-review' (or open).

**Process them sequentially in a Loop.**

1.  **Pick OLDEST PR.**
2.  **Sync 'main'** (`git pull`).
3.  **Attempt Merge main -> PR.**
4.  **Test** (`npm run build`).
5.  **If PASS**: Squash Merge to main + **Verify 'git pull'** to update local main immediately for next item.
6.  **If FAIL**: Comment/Close.

Repeat until queue empty or time limit.
