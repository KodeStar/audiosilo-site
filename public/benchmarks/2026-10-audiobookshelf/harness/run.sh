#!/usr/bin/env bash
# Full, repeatable ABS vs AudioSilo run for one library tier.
#
#   ./run.sh <tier-label> <library-path-on-host> [bench.py options...]
#   ./run.sh 1000 /mnt/user/librivox/tier-1000
#   ./run.sh 5000 /mnt/user/librivox/tier-5000 --host-latency
#   ./run.sh smoke /mnt/user/librivox/books --initial 1 --rescan 1 --startup 1 --latency-n 20 --conc-seconds 5 --web-runs 2
#
# Writes results/<tier>/{meta.json,abs/,as/,summary.md,run.log}.
# Needs on the Mac: python3, node (>= 18) with Playwright (see README), ssh key access
# to the host. Needs on the host: docker, curl.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
TIER="${1:?usage: run.sh <tier-label> <library-path-on-host> [options]}"
LIB="${2:?usage: run.sh <tier-label> <library-path-on-host> [options]}"
shift 2
export BENCH_LIBRARY="$LIB"   # mounted read-only into both containers at /audiobooks
OUT="$HERE/results/$TIER"
mkdir -p "$OUT"
cd "$HERE"
python3 -u bench.py --tier "$TIER" "$@" 2>&1 | tee "$OUT/run.log"
python3 summarize.py "$OUT"
