# ABS vs AudioSilo: tiers side by side

| Tier | Path | Book folders | MP3 files | M4B files | Size |
|---|---|---|---|---|---|
| final-1000 | `/mnt/user/librivox/tier-1000` | 1000 | 12653 | 472 | 152 GiB |
| final-1000-m4b | `/mnt/user/librivox/tier-1000-m4b` | 1000 | 4588 | 1046 | 153 GiB |
| final-5000 | `/mnt/user/librivox/tier-5000` | 4949 | 67497 | 2290 | 799 GiB |

| Metric | final-1000 ABS | final-1000 AudioSilo | final-1000-m4b ABS | final-1000-m4b AudioSilo | final-5000 ABS | final-5000 AudioSilo |
|---|---|---|---|---|---|---|
| Initial scan, wall (median) | 230.3 s | 170.9 s | 131.5 s | 78.8 s | 1298.1 s | 971.3 s |
| Initial scan, CPU time | 1113.1 s | 1217.4 s | 387.0 s | 529.6 s | 6280.2 s | 6926.9 s |
| Books found | 999, 999, 999 | 1000, 1000, 1000 | 998, 998, 998 | 1000, 1000, 1000 | 4947 | 4949 |
| Peak anon memory during scan | 446 MiB | 228 MiB | 440 MiB | 302 MiB | 609 MiB | 343 MiB |
| Idle memory, empty library (docker / anon) | 59 MiB / 50 MiB | 22 MiB / 14 MiB | 59 MiB / 48 MiB | 22 MiB / 14 MiB | 64 MiB / 51 MiB | 20 MiB / 14 MiB |
| Memory 60 s after scan (docker / anon) | 941 MiB / 199 MiB | 330 MiB / 23 MiB | 890 MiB / 125 MiB | 213 MiB / 25 MiB | 1641 MiB / 315 MiB | 707 MiB / 31 MiB |
| Data dir after scan | 28 MiB | 17 MiB | 19 MiB | 17 MiB | 147 MiB | 66 MiB |
| No-change rescan, cold cache | 5.1 s | 0.8 s | 3.6 s | 0.5 s | 21.8 s | 3.4 s |
| No-change rescan, warm cache | 5.4 s | 1.6 s | 4.0 s | 1.4 s | 20.5 s | 3.5 s |
| Cold start to first library answer | 4.54 s | 3.13 s | 4.41 s | 3.32 s | 6.11 s | 3.36 s |
| API p50: home shelves | 1.90 ms | 1.60 ms | 2.17 ms | 1.56 ms | 1.61 ms | 1.21 ms |
| API p50: library page 1 | 2.07 ms | 1.30 ms | 2.22 ms | 1.44 ms | 2.01 ms | 0.94 ms |
| API p50: deep page | 2.02 ms | 1.29 ms | 2.22 ms | 1.45 ms | 2.42 ms | 0.91 ms |
| API p50: search 'the' | 2.38 ms | 1.38 ms | 2.08 ms | 1.54 ms | 4.11 ms | 1.24 ms |
| API p50: search 'bleak house' | 1.83 ms | 1.38 ms | 1.98 ms | 1.45 ms | 2.22 ms | 1.04 ms |
| API p50: book detail (M4B) | 7.22 ms | 1.52 ms | 8.11 ms | 1.71 ms | 15.33 ms | 1.69 ms |
| API p50: play to first byte (MP3) | 14.05 ms | 5.28 ms | 15.09 ms | 5.47 ms | 22.73 ms | 5.30 ms |
| API p50: play to first byte (M4B) | 12.03 ms | 5.29 ms | 13.80 ms | 5.34 ms | 20.86 ms | 5.06 ms |
| API p50: cover, uncached | 63.50 ms | 6.15 ms | 63.44 ms | 6.08 ms | 62.29 ms | 5.70 ms |
| API p50: cover, cached | 2.01 ms | 2.81 ms | 1.85 ms | 2.80 ms | 2.77 ms | 2.47 ms |
| Steady 40 req/s, p95 | 2.75 ms | 1.83 ms | 3.49 ms | 3.01 ms | 8.87 ms | 2.00 ms |
| Saturating, ok req/s (one client IP) | 1841 | 12544 | 1716 | 12086 | 2024 | 12130 |
| Web grid, cold: first cover / screen | 219 / 237 ms | 190 / 205 ms | 231 / 246 ms | 203 / 222 ms | 350 / 367 ms | 195 / 216 ms |
| Web grid, warm: first cover / screen | 221 / 221 ms | 184 / 184 ms | 221 / 221 ms | 197 / 197 ms | 337 / 337 ms | 189 / 189 ms |
| Web home, cold: first cover / screen | 205 / 214 ms | 177 / 195 ms | 211 / 217 ms | 188 / 205 ms | 218 / 226 ms | 189 / 205 ms |
| Admin health page, cold: ready | 187 ms (5 API req) | 138 ms (8 API req) | 196 ms (5 API req) | 145 ms (8 API req) | 238 ms (5 API req) | 147 ms (8 API req) |
| Admin health page, warm: ready | 181 ms (5 API req) | 137 ms (8 API req) | 188 ms (5 API req) | 144 ms (8 API req) | 223 ms (5 API req) | 141 ms (8 API req) |
| Admin health API p50 (AS /admin/issues; ABS items?filter=issues) | 1.54 ms | 1.48 ms | 1.70 ms | 1.55 ms | 1.37 ms | 1.51 ms |
| Admin system page, cold: ready | n/a | 113 ms (6 API req) | n/a | 120 ms (6 API req) | n/a | 118 ms (6 API req) |
| Web grid, cold: transferred / JS | 4148 / 2643 KiB | 2552 / 1297 KiB | 4150 / 2643 KiB | 2564 / 1297 KiB | 4283 / 2643 KiB | 4220 / 1297 KiB |

Full figures, request URLs and caveats: each tier's `summary.md` and the harness README.
