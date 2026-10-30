# ABS vs AudioSilo: tiers side by side

| Tier | Path | Book folders | MP3 files | M4B files | Size |
|---|---|---|---|---|---|
| v251-1000 | `/mnt/user/librivox/tier-1000` | 1000 | 12653 | 472 | 152 GiB |
| v251-1000-m4b | `/mnt/user/librivox/tier-1000-m4b` | 1000 | 4588 | 1046 | 153 GiB |
| v251-5000 | `/mnt/user/librivox/tier-5000` | 4949 | 67497 | 2290 | 799 GiB |

| Metric | v251-1000 ABS | v251-1000 AudioSilo | v251-1000-m4b ABS | v251-1000-m4b AudioSilo | v251-5000 ABS | v251-5000 AudioSilo |
|---|---|---|---|---|---|---|
| Initial scan, wall (median) | 240.3 s | 6.8 s | 135.2 s | 5.0 s | 1348.5 s | 39.9 s |
| Initial scan, CPU time | 1145.3 s | 11.4 s | 395.1 s | 8.3 s | 6351.9 s | 79.8 s |
| Books found | 999, 999, 999 | 1000, 1000, 1000 | 998, 998, 998 | 1000, 1000, 1000 | 4947 | 4949 |
| Peak anon memory during scan | 398 MiB | 54 MiB | 478 MiB | 48 MiB | 599 MiB | 113 MiB |
| Idle memory, empty library (docker / anon) | 60 MiB / 49 MiB | 27 MiB / 20 MiB | 66 MiB / 48 MiB | 22 MiB / 16 MiB | 64 MiB / 51 MiB | 22 MiB / 14 MiB |
| Memory 60 s after scan (docker / anon) | 910 MiB / 197 MiB | 86 MiB / 29 MiB | 767 MiB / 71 MiB | 93 MiB / 25 MiB | 1494 MiB / 312 MiB | 291 MiB / 30 MiB |
| Data dir after scan | 28 MiB | 17 MiB | 19 MiB | 17 MiB | 147 MiB | 66 MiB |
| No-change rescan, cold cache | 4.6 s | 0.8 s | 3.0 s | 0.5 s | 21.9 s | 3.6 s |
| No-change rescan, warm cache | 3.7 s | 0.5 s | 2.4 s | 0.5 s | 19.1 s | 2.6 s |
| Cold start to first library answer | 4.15 s | 2.98 s | 4.83 s | 3.41 s | 6.02 s | 3.91 s |
| API p50: home shelves | 2.01 ms | 1.36 ms | 2.09 ms | 1.47 ms | 2.13 ms | 1.45 ms |
| API p50: library page 1 | 2.10 ms | 1.25 ms | 2.11 ms | 1.31 ms | 2.07 ms | 1.31 ms |
| API p50: deep page | 2.01 ms | 1.35 ms | 1.98 ms | 1.28 ms | 1.99 ms | 1.39 ms |
| API p50: search 'the' | 2.35 ms | 1.46 ms | 1.97 ms | 1.41 ms | 2.97 ms | 1.46 ms |
| API p50: search 'bleak house' | 1.97 ms | 1.36 ms | 1.81 ms | 1.29 ms | 1.85 ms | 1.39 ms |
| API p50: book detail (M4B) | 7.62 ms | 1.46 ms | 7.82 ms | 1.62 ms | 14.39 ms | 1.78 ms |
| API p50: play to first byte (MP3) | 14.04 ms | 5.36 ms | 14.79 ms | 5.13 ms | 21.23 ms | 5.17 ms |
| API p50: play to first byte (M4B) | 12.82 ms | 5.25 ms | 13.52 ms | 5.13 ms | 19.80 ms | 5.17 ms |
| API p50: cover, uncached | 63.03 ms | 6.01 ms | 63.36 ms | 6.19 ms | 63.47 ms | 5.71 ms |
| API p50: cover, cached | 2.06 ms | 2.73 ms | 2.05 ms | 2.64 ms | 2.08 ms | 2.77 ms |
| Steady 40 req/s, p95 | 2.79 ms | 1.84 ms | 2.69 ms | 1.82 ms | 2.52 ms | 2.00 ms |
| Saturating, ok req/s (one client IP) | 1843 | 14409 | 1683 | 14608 | 1941 | 14571 |
| Web grid, cold: first cover / screen | 223 / 239 ms | 191 / 209 ms | 223 / 240 ms | 190 / 203 ms | 274 / 286 ms | 191 / 206 ms |
| Web grid, warm: first cover / screen | 212 / 212 ms | 188 / 188 ms | 222 / 222 ms | 186 / 186 ms | 268 / 268 ms | 187 / 187 ms |
| Web home, cold: first cover / screen | 201 / 209 ms | 179 / 200 ms | 206 / 212 ms | 179 / 194 ms | 213 / 231 ms | 181 / 197 ms |
| Admin health page, cold: ready | 196 ms (5 API req) | 142 ms (8 API req) | 186 ms (5 API req) | 145 ms (8 API req) | 191 ms (5 API req) | 143 ms (8 API req) |
| Admin health page, warm: ready | 186 ms (5 API req) | 138 ms (8 API req) | 185 ms (5 API req) | 139 ms (8 API req) | 183 ms (5 API req) | 137 ms (8 API req) |
| Admin health API p50 (AS /admin/issues; ABS items?filter=issues) | 1.57 ms | 1.45 ms | 1.36 ms | 1.38 ms | 1.64 ms | 1.74 ms |
| Admin system page, cold: ready | n/a | 115 ms (6 API req) | n/a | 114 ms (6 API req) | n/a | 114 ms (6 API req) |
| Web grid, cold: transferred / JS | 4148 / 2643 KiB | 2232 / 1300 KiB | 4150 / 2643 KiB | 2246 / 1300 KiB | 4283 / 2643 KiB | 2641 / 1300 KiB |

Full figures, request URLs and caveats: each tier's `summary.md` and the harness README.
