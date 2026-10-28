#!/usr/bin/env bash
# Clean re-run of every tier, both apps, after the perf push (server#249/#250, frontend#176).
# AudioSilo = ghcr.io/kodestar/audiosilo-server:edge; Audiobookshelf = :latest (version recorded in meta.json).
# Run on the Mac with nothing else heavy on the host (librivox-fetch stopped) and no load tests on the Mac.
set -u
cd "$(dirname "$0")"
export BENCH_AS_IMAGE="${BENCH_AS_IMAGE:-ghcr.io/kodestar/audiosilo-server:edge}"
P="scan,rescan,startup,latency,web,admin"
PFX="${1:-clean}"
ssh root@192.168.0.10 'docker ps --format "{{.Names}}" | grep -q "^librivox-fetch$" && docker stop librivox-fetch; true'
./run.sh "$PFX-1000"     /mnt/user/librivox/tier-1000     --host-latency --require-stable --phases "$P"
./run.sh "$PFX-1000-m4b" /mnt/user/librivox/tier-1000-m4b --host-latency --require-stable --phases "$P"
./run.sh "$PFX-5000"     /mnt/user/librivox/tier-5000     --host-latency --require-stable --phases "$P" --initial 1
echo "ALL TIERS DONE $(date)"
