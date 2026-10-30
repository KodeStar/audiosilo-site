# AudioSilo v2.5.1 vs Audiobookshelf: re-run summary (2026-10-30)

**Builds.** AudioSilo `ghcr.io/kodestar/audiosilo-server:2.5.1` (sha256:898a06b7..., revision 62c9aac; same digest as the registry's `:latest`) vs Audiobookshelf **2.37.2** (`:latest`, sha256:b897c33f..., the same build as the published run). Published baseline: AudioSilo v2.5.0 (e465ccb, run as `:edge` sha256:6085ff29...) in `final-1000`, `final-1000-m4b`, `final-5000` (`compare.md`). This run: `v251-1000`, `v251-1000-m4b`, `v251-5000`, side by side in `v251-compare.md`; each tier's `run.log` is in its folder.

**Conditions.** Same harness, tiers, flags and protocol as the published run (`harness/clean-rerun.sh`: `--host-latency --require-stable`, all phases, `--initial 1` on tier 5000), one app at a time. Before each tier the host was checked (load1 < 1.5, no container above 25% CPU, nvme1n1 under 10% util, no parity check): idle on the first try all three times (load1 0.12 / 1.14 / 1.13, disk util 0%). The library did not change during any tier. The download that built the library was already stopped and was left that way. The Mac had two other long-running processes (~1 core each, also present during the v2.5.0 run) and an Android emulator open; the web rows are client-side and could carry a little of that.

**Corpus storage.** `ls -la /mnt/*/librivox`: the share exists only on **disk2** (`/mnt/disk2/librivox`; `/mnt/user` and `/mnt/user0` are the FUSE views of it, nothing on the cache pool). disk2 is XFS on `/dev/md2p1`, an Unraid **array** data disk whose device is an **NVMe SSD** (WD Blue SN5000 4 TB, `nvme1n1`, rotational=0); parity is also an NVMe (nvme4n1), and the cache pool (bench app data, `/mnt/cache/appdata/bench`) is a WD Red SN700 NVMe. So the "array is a hard disk" wording in the first version of the post was wrong: the array is all-NVMe (the md layer reports ROTA=1, which is a kernel default, not the hardware). Reads go through Unraid's md driver and `/mnt/user` FUSE.

## Headline (median; AS = AudioSilo)

| Metric | Tier | AS v2.5.0 (published) | AS v2.5.1 | ABS 2.37.2 (this run) | Winner now |
|---|---|---|---|---|---|
| Initial scan, wall | 1000 / 1000-m4b / 5000 | 171 / 79 / 971 s | **6.8 / 5.0 / 39.9 s** | 240 / 135 / 1349 s | AS (35x / 27x / 34x) |
| Initial scan, CPU time | 1000 / 1000-m4b / 5000 | 1217 / 530 / 6927 s | **11.4 / 8.3 / 79.8 s** | 1145 / 395 / 6352 s | AS (was ABS) |
| Peak anon memory during scan | 1000 / 1000-m4b / 5000 | 228 / 302 / 343 MiB | 54 / 48 / 113 MiB | 398 / 478 / 599 MiB | AS |
| Memory 60 s after scan (docker) | 1000 / 1000-m4b / 5000 | 330 / 213 / 707 MiB | 86 / 93 / 291 MiB | 910 / 767 / 1494 MiB | AS |
| No-change rescan, cold | 1000 / 1000-m4b / 5000 | 0.8 / 0.5 / 3.4 s | 0.8 / 0.5 / 3.6 s | 4.6 / 3.0 / 21.9 s | AS |
| No-change rescan, warm | 1000 / 1000-m4b / 5000 | 1.6 / 1.4 / 3.5 s | 0.5 / 0.5 / 2.6 s | 3.7 / 2.4 / 19.1 s | AS (see caveat) |
| Idle memory, empty library (anon) | 1000 / 1000-m4b / 5000 | 14 / 14 / 14 MiB | 20 / 16 / 14 MiB | 49 / 48 / 51 MiB | AS |
| Cold start to first library answer | 1000 / 1000-m4b / 5000 | 3.13 / 3.32 / 3.36 s | 2.98 / 3.41 / 3.91 s | 4.15 / 4.83 / 6.02 s | AS |
| API p50 library page 1 (Mac) | 1000 / 1000-m4b / 5000 | 1.30 / 1.44 / 0.94 ms | 1.25 / 1.31 / 1.31 ms | 2.10 / 2.11 / 2.07 ms | AS |
| API p50 search "the" (Mac) | 1000 / 1000-m4b / 5000 | 1.38 / 1.54 / 1.24 ms | 1.46 / 1.41 / 1.46 ms | 2.35 / 1.97 / 2.97 ms | AS |
| API p50 book detail M4B | 1000 / 1000-m4b / 5000 | 1.52 / 1.71 / 1.69 ms | 1.46 / 1.62 / 1.78 ms | 7.62 / 7.82 / 14.39 ms | AS |
| Play to first byte, MP3 | 1000 / 1000-m4b / 5000 | 5.28 / 5.47 / 5.30 ms | 5.36 / 5.13 / 5.17 ms | 14.04 / 14.79 / 21.23 ms | AS |
| Cover, uncached | 1000 / 1000-m4b / 5000 | 6.15 / 6.08 / 5.70 ms | 6.01 / 6.19 / 5.71 ms | 63.0 / 63.4 / 63.5 ms | AS |
| **Cover, cached** | 1000 / 1000-m4b / 5000 | 2.81 / 2.80 / 2.47 ms | 2.73 / 2.64 / 2.77 ms | **2.06 / 2.05 / 2.08 ms** | **ABS** |
| Saturating load, ok req/s (Mac, one IP) | 1000 / 1000-m4b / 5000 | 12544 / 12086 / 12130 | 14409 / 14608 / 14571 | 1843 / 1683 / 1941 | AS (~7.5x) |
| Saturating load, ok req/s (host loopback) | 1000 / 5000 | 2971 / 2871 | 2482 / 2481 | 1619 / 1561 | AS (~1.6x, was ~1.8x) |
| Web grid cold, first cover | 1000 / 1000-m4b / 5000 | 190 / 203 / 195 ms | 191 / 190 / 191 ms | 223 / 223 / 274 ms | AS |
| Web home cold, first cover | 1000 / 1000-m4b / 5000 | 177 / 188 / 189 ms | 179 / 179 / 181 ms | 201 / 206 / 213 ms | AS |
| Health page cold, ready | 1000 / 1000-m4b / 5000 | 138 / 145 / 147 ms | 142 / 145 / 143 ms | 196 / 186 / 191 ms | AS |
| **Health main request p50** (AS `/admin/issues`; ABS `items?filter=issues`) | 1000 / 1000-m4b / 5000 | 1.48 / 1.55 / 1.51 ms | 1.45 / 1.38 / **1.74 ms** | 1.57 / 1.36 / **1.64 ms** | AS / tie / **ABS** |
| Data dir after scan | 1000 / 1000-m4b / 5000 | 17 / 17 / 66 MiB | 17 / 17 / 66 MiB | 28 / 19 / 147 MiB | AS |

Per-tier tables with every compare.py row (v2.5.0, v2.5.1, ABS this run, ABS published, winner) follow below.

## Where ABS still wins

- **Cached cover** on all three tiers: ABS ~2.05 ms vs AS 2.6-2.8 ms from the Mac; on host loopback ABS 1.41-1.51 vs AS 1.94-2.19 ms (ABS serves a pre-resized webp from disk; AS from its in-memory JPEG cache). Uncached covers are the reverse by 10x.
- **Health main request at 5000**: ABS 1.64 vs AS 1.74 ms (AS computes ten issue categories; ABS runs one filtered item query). It flipped from AS's 1.51 ms in the published run; the 0.1-0.3 ms swing is within run-to-run noise at this size. At 1000-m4b it is a tie (1.36 vs 1.38). The whole Health page is still faster on AS (143 vs 191 ms).
- **Scan CPU no longer**: the published "ABS wins scan CPU" is gone (AS now uses 1-2% of ABS's CPU seconds).

## What changed from v2.5.0 and caveats

- **The scan** is the v2.5.1 change (in-process pure-Go prober, ffprobe as the fallback; see the audiosilo-server v2.5.1 release notes): 16-25x faster wall and 64-107x less CPU than v2.5.0, with peak scan memory down 3-6x. It is real work, not deferred: the same 1000/1000/4949 books, the same data dir size, the same scan errors as v2.5.0 (1 / 2 / 2: the moov-less Antichrist and Seven Poor Travellers M4Bs), and per-book durations identical to ABS's (ffprobe) for 4,946 of the 4,947 books both apps indexed (30,291 vs 30,288 hours in total). The one exception, `Leo Tolstoy/Anna Karenina, Book 4` (M4B), has a damaged header (ffprobe: "missing mandatory atoms, broken header"): ffprobe/ABS read 3,510 s, AS 2.5.1 reports 13,163 s. 105 MB at 64 kbps is ~13,100 s, so AS's figure fits the file size, but neither app flags the file. Tracked as [KodeStar/audiosilo-server#276](https://github.com/KodeStar/audiosilo-server/issues/276).
- **Warm rescan**: the ~1.1 s harness SSH overhead disclosed for the published warm-rescan row did not appear this time, for either app (AS wall 0.53 vs app-reported 0.50 s; ABS 3.7 vs 3.5 s; published AS 1.6 vs 0.43, ABS 5.4 vs 3.5). So the published warm row was inflated for both; the app-reported times (AS 0.43 -> 0.51 s at 1000, 2.24 -> 2.56 s at 5000) are the comparable ones. The harness code was not changed.
- **Small AS regressions vs v2.5.0, all still ahead of ABS**: cold start at 5000 3.36 -> 3.91 s (all three runs 3.77-3.98 s, so likely real; still faster than ABS's 6.0 s); cold no-change rescan at 5000 3.4 -> 3.6 s (app-reported 3.19 -> 3.55 s); host-loopback saturating throughput ~2,900 -> ~2,480 req/s on both tiers measured (consistent, so likely real; ABS ~1,600); idle anon at tier 1000 14 -> 18-21 MiB (rising between the 60 s and 120 s readings in all three runs; 14-16 MiB on the other tiers).
- **Mac-side API p50s at 5000** rose 0.3-0.4 ms for AS (library page 0.94 -> 1.31 ms) while the host-loopback figures for the same requests stayed flat or improved (0.82 -> 0.70 ms); treat that as LAN/client noise, not server time. Sub-millisecond Mac-side differences are noisy in general.
- **ABS** varied from its published run by the usual noise (initial scan +3-4%, web grid at 5000 350 -> 274 ms, steady-load p95 at 5000 8.9 -> 2.5 ms).
- Unchanged caveats from the README: search semantics differ, the list cache is dropped on every DB write (repeat benchmark requests hit it), LibriVox covers are only 180 px, the saturating test from one IP is client-bound on the Mac.

### Tier 1000

| Metric | AS v2.5.0 (published) | AS v2.5.1 | ABS (this run) | ABS (published) | Winner now |
|---|---|---|---|---|---|
| Initial scan, wall (median) | 170.9 s | 6.8 s | 240.3 s | 230.3 s | AudioSilo |
| Initial scan, CPU time | 1217.4 s | 11.4 s | 1145.3 s | 1113.1 s | AudioSilo |
| Peak anon memory during scan | 228 MiB | 54 MiB | 398 MiB | 446 MiB | AudioSilo |
| Idle memory, empty library (docker / anon) | 22 MiB / 14 MiB | 27 MiB / 20 MiB | 60 MiB / 49 MiB | 59 MiB / 50 MiB | AudioSilo |
| Memory 60 s after scan (docker / anon) | 330 MiB / 23 MiB | 86 MiB / 29 MiB | 910 MiB / 197 MiB | 941 MiB / 199 MiB | AudioSilo |
| Data dir after scan | 17 MiB | 17 MiB | 28 MiB | 28 MiB | AudioSilo |
| No-change rescan, cold cache | 0.8 s | 0.8 s | 4.6 s | 5.1 s | AudioSilo |
| No-change rescan, warm cache | 1.6 s | 0.5 s | 3.7 s | 5.4 s | AudioSilo |
| Cold start to first library answer | 3.13 s | 2.98 s | 4.15 s | 4.54 s | AudioSilo |
| API p50: home shelves | 1.60 ms | 1.36 ms | 2.01 ms | 1.90 ms | AudioSilo |
| API p50: library page 1 | 1.30 ms | 1.25 ms | 2.10 ms | 2.07 ms | AudioSilo |
| API p50: deep page | 1.29 ms | 1.35 ms | 2.01 ms | 2.02 ms | AudioSilo |
| API p50: search 'the' | 1.38 ms | 1.46 ms | 2.35 ms | 2.38 ms | AudioSilo |
| API p50: search 'bleak house' | 1.38 ms | 1.36 ms | 1.97 ms | 1.83 ms | AudioSilo |
| API p50: book detail (M4B) | 1.52 ms | 1.46 ms | 7.62 ms | 7.22 ms | AudioSilo |
| API p50: play to first byte (MP3) | 5.28 ms | 5.36 ms | 14.04 ms | 14.05 ms | AudioSilo |
| API p50: play to first byte (M4B) | 5.29 ms | 5.25 ms | 12.82 ms | 12.03 ms | AudioSilo |
| API p50: cover, uncached | 6.15 ms | 6.01 ms | 63.03 ms | 63.50 ms | AudioSilo |
| API p50: cover, cached | 2.81 ms | 2.73 ms | 2.06 ms | 2.01 ms | **ABS** |
| Steady 40 req/s, p95 | 1.83 ms | 1.84 ms | 2.79 ms | 2.75 ms | AudioSilo |
| Saturating, ok req/s (one client IP) | 12544 | 14409 | 1843 | 1841 | AudioSilo |
| Web grid, cold: first cover / screen | 190 / 205 ms | 191 / 209 ms | 223 / 239 ms | 219 / 237 ms | AudioSilo |
| Web grid, warm: first cover / screen | 184 / 184 ms | 188 / 188 ms | 212 / 212 ms | 221 / 221 ms | AudioSilo |
| Web home, cold: first cover / screen | 177 / 195 ms | 179 / 200 ms | 201 / 209 ms | 205 / 214 ms | AudioSilo |
| Admin health page, cold: ready | 138 ms (8 API req) | 142 ms (8 API req) | 196 ms (5 API req) | 187 ms (5 API req) | AudioSilo |
| Admin health page, warm: ready | 137 ms (8 API req) | 138 ms (8 API req) | 186 ms (5 API req) | 181 ms (5 API req) | AudioSilo |
| Admin health API p50 (AS /admin/issues; ABS items?filter=issues) | 1.48 ms | 1.45 ms | 1.57 ms | 1.54 ms | AudioSilo |

### Tier 1000-m4b

| Metric | AS v2.5.0 (published) | AS v2.5.1 | ABS (this run) | ABS (published) | Winner now |
|---|---|---|---|---|---|
| Initial scan, wall (median) | 78.8 s | 5.0 s | 135.2 s | 131.5 s | AudioSilo |
| Initial scan, CPU time | 529.6 s | 8.3 s | 395.1 s | 387.0 s | AudioSilo |
| Peak anon memory during scan | 302 MiB | 48 MiB | 478 MiB | 440 MiB | AudioSilo |
| Idle memory, empty library (docker / anon) | 22 MiB / 14 MiB | 22 MiB / 16 MiB | 66 MiB / 48 MiB | 59 MiB / 48 MiB | AudioSilo |
| Memory 60 s after scan (docker / anon) | 213 MiB / 25 MiB | 93 MiB / 25 MiB | 767 MiB / 71 MiB | 890 MiB / 125 MiB | AudioSilo |
| Data dir after scan | 17 MiB | 17 MiB | 19 MiB | 19 MiB | AudioSilo |
| No-change rescan, cold cache | 0.5 s | 0.5 s | 3.0 s | 3.6 s | AudioSilo |
| No-change rescan, warm cache | 1.4 s | 0.5 s | 2.4 s | 4.0 s | AudioSilo |
| Cold start to first library answer | 3.32 s | 3.41 s | 4.83 s | 4.41 s | AudioSilo |
| API p50: home shelves | 1.56 ms | 1.47 ms | 2.09 ms | 2.17 ms | AudioSilo |
| API p50: library page 1 | 1.44 ms | 1.31 ms | 2.11 ms | 2.22 ms | AudioSilo |
| API p50: deep page | 1.45 ms | 1.28 ms | 1.98 ms | 2.22 ms | AudioSilo |
| API p50: search 'the' | 1.54 ms | 1.41 ms | 1.97 ms | 2.08 ms | AudioSilo |
| API p50: search 'bleak house' | 1.45 ms | 1.29 ms | 1.81 ms | 1.98 ms | AudioSilo |
| API p50: book detail (M4B) | 1.71 ms | 1.62 ms | 7.82 ms | 8.11 ms | AudioSilo |
| API p50: play to first byte (MP3) | 5.47 ms | 5.13 ms | 14.79 ms | 15.09 ms | AudioSilo |
| API p50: play to first byte (M4B) | 5.34 ms | 5.13 ms | 13.52 ms | 13.80 ms | AudioSilo |
| API p50: cover, uncached | 6.08 ms | 6.19 ms | 63.36 ms | 63.44 ms | AudioSilo |
| API p50: cover, cached | 2.80 ms | 2.64 ms | 2.05 ms | 1.85 ms | **ABS** |
| Steady 40 req/s, p95 | 3.01 ms | 1.82 ms | 2.69 ms | 3.49 ms | AudioSilo |
| Saturating, ok req/s (one client IP) | 12086 | 14608 | 1683 | 1716 | AudioSilo |
| Web grid, cold: first cover / screen | 203 / 222 ms | 190 / 203 ms | 223 / 240 ms | 231 / 246 ms | AudioSilo |
| Web grid, warm: first cover / screen | 197 / 197 ms | 186 / 186 ms | 222 / 222 ms | 221 / 221 ms | AudioSilo |
| Web home, cold: first cover / screen | 188 / 205 ms | 179 / 194 ms | 206 / 212 ms | 211 / 217 ms | AudioSilo |
| Admin health page, cold: ready | 145 ms (8 API req) | 145 ms (8 API req) | 186 ms (5 API req) | 196 ms (5 API req) | AudioSilo |
| Admin health page, warm: ready | 144 ms (8 API req) | 139 ms (8 API req) | 185 ms (5 API req) | 188 ms (5 API req) | AudioSilo |
| Admin health API p50 (AS /admin/issues; ABS items?filter=issues) | 1.55 ms | 1.38 ms | 1.36 ms | 1.70 ms | tie (within 3%) |

### Tier 5000

| Metric | AS v2.5.0 (published) | AS v2.5.1 | ABS (this run) | ABS (published) | Winner now |
|---|---|---|---|---|---|
| Initial scan, wall (median) | 971.3 s | 39.9 s | 1348.5 s | 1298.1 s | AudioSilo |
| Initial scan, CPU time | 6926.9 s | 79.8 s | 6351.9 s | 6280.2 s | AudioSilo |
| Peak anon memory during scan | 343 MiB | 113 MiB | 599 MiB | 609 MiB | AudioSilo |
| Idle memory, empty library (docker / anon) | 20 MiB / 14 MiB | 22 MiB / 14 MiB | 64 MiB / 51 MiB | 64 MiB / 51 MiB | AudioSilo |
| Memory 60 s after scan (docker / anon) | 707 MiB / 31 MiB | 291 MiB / 30 MiB | 1494 MiB / 312 MiB | 1641 MiB / 315 MiB | AudioSilo |
| Data dir after scan | 66 MiB | 66 MiB | 147 MiB | 147 MiB | AudioSilo |
| No-change rescan, cold cache | 3.4 s | 3.6 s | 21.9 s | 21.8 s | AudioSilo |
| No-change rescan, warm cache | 3.5 s | 2.6 s | 19.1 s | 20.5 s | AudioSilo |
| Cold start to first library answer | 3.36 s | 3.91 s | 6.02 s | 6.11 s | AudioSilo |
| API p50: home shelves | 1.21 ms | 1.45 ms | 2.13 ms | 1.61 ms | AudioSilo |
| API p50: library page 1 | 0.94 ms | 1.31 ms | 2.07 ms | 2.01 ms | AudioSilo |
| API p50: deep page | 0.91 ms | 1.39 ms | 1.99 ms | 2.42 ms | AudioSilo |
| API p50: search 'the' | 1.24 ms | 1.46 ms | 2.97 ms | 4.11 ms | AudioSilo |
| API p50: search 'bleak house' | 1.04 ms | 1.39 ms | 1.85 ms | 2.22 ms | AudioSilo |
| API p50: book detail (M4B) | 1.69 ms | 1.78 ms | 14.39 ms | 15.33 ms | AudioSilo |
| API p50: play to first byte (MP3) | 5.30 ms | 5.17 ms | 21.23 ms | 22.73 ms | AudioSilo |
| API p50: play to first byte (M4B) | 5.06 ms | 5.17 ms | 19.80 ms | 20.86 ms | AudioSilo |
| API p50: cover, uncached | 5.70 ms | 5.71 ms | 63.47 ms | 62.29 ms | AudioSilo |
| API p50: cover, cached | 2.47 ms | 2.77 ms | 2.08 ms | 2.77 ms | **ABS** |
| Steady 40 req/s, p95 | 2.00 ms | 2.00 ms | 2.52 ms | 8.87 ms | AudioSilo |
| Saturating, ok req/s (one client IP) | 12130 | 14571 | 1941 | 2024 | AudioSilo |
| Web grid, cold: first cover / screen | 195 / 216 ms | 191 / 206 ms | 274 / 286 ms | 350 / 367 ms | AudioSilo |
| Web grid, warm: first cover / screen | 189 / 189 ms | 187 / 187 ms | 268 / 268 ms | 337 / 337 ms | AudioSilo |
| Web home, cold: first cover / screen | 189 / 205 ms | 181 / 197 ms | 213 / 231 ms | 218 / 226 ms | AudioSilo |
| Admin health page, cold: ready | 147 ms (8 API req) | 143 ms (8 API req) | 191 ms (5 API req) | 238 ms (5 API req) | AudioSilo |
| Admin health page, warm: ready | 141 ms (8 API req) | 137 ms (8 API req) | 183 ms (5 API req) | 223 ms (5 API req) | AudioSilo |
| Admin health API p50 (AS /admin/issues; ABS items?filter=issues) | 1.51 ms | 1.74 ms | 1.64 ms | 1.37 ms | **ABS** |
