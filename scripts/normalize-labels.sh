#!/usr/bin/env bash
# Normalize labels on all open issues
# Standards: Category (bug|enhancement|feature|docs|refactor|chore|test|ci|security)
#            Priority (P0|P1|P2|P3)
# Usage: GITHUB_TOKEN=ghp_xxx bash scripts/normalize-labels.sh

set -euo pipefail
REPO="cpa03/blueprintify"

echo "=== Batch 1: priority:high -> P1 ==="
gh issue edit 1621 --repo "$REPO" --add-label "P1" --remove-label "priority:high"
gh issue edit 1390 --repo "$REPO" --add-label "P1" --remove-label "priority:high"
gh issue edit 1045 --repo "$REPO" --add-label "chore,P1" --remove-label "priority:high"
gh issue edit 1043 --repo "$REPO" --add-label "bug,P1" --remove-label "priority:high"
gh issue edit 1042 --repo "$REPO" --add-label "refactor,P1" --remove-label "priority:high"
gh issue edit 980  --repo "$REPO" --add-label "P1" --remove-label "priority:high"

echo "=== Batch 2: priority:medium -> P2 ==="
gh issue edit 1165 --repo "$REPO" --add-label "P2" --remove-label "priority:medium"
gh issue edit 1163 --repo "$REPO" --add-label "P2" --remove-label "priority:medium"
gh issue edit 1141 --repo "$REPO" --add-label "P2" --remove-label "priority:medium"
gh issue edit 1100 --repo "$REPO" --add-label "bug,P2" --remove-label "priority:medium"
gh issue edit 1053 --repo "$REPO" --add-label "test,P2" --remove-label "priority:medium"
gh issue edit 1049 --repo "$REPO" --add-label "ci,P2" --remove-label "priority:medium"
gh issue edit 1048 --repo "$REPO" --add-label "bug,P2" --remove-label "priority:medium"
gh issue edit 1046 --repo "$REPO" --add-label "P2" --remove-label "priority:medium"
gh issue edit 1044 --repo "$REPO" --add-label "enhancement,P2" --remove-label "priority:medium"
gh issue edit 1019 --repo "$REPO" --add-label "P2" --remove-label "priority:medium"
gh issue edit 1015 --repo "$REPO" --add-label "P2" --remove-label "priority:medium"
gh issue edit 974  --repo "$REPO" --add-label "P2" --remove-label "priority:medium"

echo "=== Batch 3: priority:low -> P3 ==="
gh issue edit 1167 --repo "$REPO" --add-label "P3" --remove-label "priority:low"
gh issue edit 1166 --repo "$REPO" --add-label "P3" --remove-label "priority:low"
gh issue edit 1143 --repo "$REPO" --add-label "P3" --remove-label "priority:low"
gh issue edit 1142 --repo "$REPO" --add-label "P3" --remove-label "priority:low"
gh issue edit 1118 --repo "$REPO" --add-label "P3" --remove-label "priority:low"
gh issue edit 1117 --repo "$REPO" --add-label "P3" --remove-label "priority:low"
gh issue edit 1116 --repo "$REPO" --add-label "P3" --remove-label "priority:low"
gh issue edit 1054 --repo "$REPO" --add-label "feature,P3" --remove-label "priority:low"
gh issue edit 1052 --repo "$REPO" --add-label "refactor,P3" --remove-label "priority:low"
gh issue edit 1051 --repo "$REPO" --add-label "refactor,P3" --remove-label "priority:low"
gh issue edit 1050 --repo "$REPO" --add-label "P3" --remove-label "priority:low"
gh issue edit 1016 --repo "$REPO" --add-label "P3" --remove-label "priority:low"
gh issue edit 1014 --repo "$REPO" --add-label "test,P1" --remove-label "enhancement,priority:high"

echo "=== Batch 4: special cases ==="
# 1161: enhancement -> chore (title says [Chore]), priority:medium -> P2
gh issue edit 1161 --repo "$REPO" --add-label "chore,P2" --remove-label "enhancement,priority:medium"
# 1573: has bug, ci -> add P1
gh issue edit 1573 --repo "$REPO" --add-label "P1"
# 1293: has bug -> add P2
gh issue edit 1293 --repo "$REPO" --add-label "P2"

echo "=== Batch 5: unlabeled issues ==="
gh issue edit 1111 --repo "$REPO" --add-label "bug,P2"
gh issue edit 1090 --repo "$REPO" --add-label "feature,P3"
gh issue edit 1089 --repo "$REPO" --add-label "feature,P3"
gh issue edit 1088 --repo "$REPO" --add-label "security,P2"
gh issue edit 1087 --repo "$REPO" --add-label "chore,P3"
gh issue edit 1086 --repo "$REPO" --add-label "refactor,P3"
gh issue edit 1084 --repo "$REPO" --add-label "security,P2"
gh issue edit 1083 --repo "$REPO" --add-label "test,P2"
gh issue edit 1082 --repo "$REPO" --add-label "test,P1"
gh issue edit 1081 --repo "$REPO" --add-label "refactor,P2"
gh issue edit 1078 --repo "$REPO" --add-label "security,P1"
gh issue edit 1077 --repo "$REPO" --add-label "security,P1"

echo "=== All done! ==="
