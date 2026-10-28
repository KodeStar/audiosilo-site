# ABS vs AudioSilo benchmark: final-1000-m4b

Run 2026-10-28T12:31:45+0000 to 2026-10-28T13:17:37+0000, total 2745.0 s. Library `/mnt/user/librivox/tier-1000-m4b` at start: 1000 book folders, 4588 MP3 + 1046 M4B files, 153.18 GiB; at end: 1000 folders.

Host: Intel(R) Core(TM) i3-N305, 8 CPUs, 16150928 kB RAM, kernel 6.1.106-Unraid, Docker 24.0.9. Load average at start 0.38/1.64/2.47, at end 1.3. Other containers running on the host (idle, untouched): 18.

- Library on disk during the Audiobookshelf run: 1000 folders before, 1000 after.
- Library on disk during the AudioSilo run: 1000 folders before, 1000 after.

Settings (scan,rescan,startup,latency,web,admin): initial scans x3 (fresh data each), no-change rescans x3 cold + x3 warm, cold starts x3, API 5 warm-up + 100 timed requests each, concurrency 20 clients x 20 s, web UI 5 runs per page and cache state. AudioSilo metadata setting: default.

## Images

| | Audiobookshelf | AudioSilo |
|---|---|---|
| Version | 2.37.2 | dev-e465ccb |
| Image (pinned digest) | `ghcr.io/advplyr/audiobookshelf@sha256:b897c33f05972fb1bf484f7487bc878fa91ec8691335c1db6e2929c3a7658efa` | `ghcr.io/kodestar/audiosilo-server@sha256:6085ff292f449fffcd75edc87c563cae9ca6bc3f54ec3214d7c66d95c2e6c9ef` |
| Compressed size (registry, linux/amd64) | 125.0 MiB | 65.2 MiB |
| Uncompressed size (docker image inspect) | 343.2 MiB | 171.3 MiB |

## Memory, CPU and disk

`docker` = docker stats MEM USAGE (cgroup memory.current minus inactive_file). `anon` = cgroup anonymous memory (the process heap, no page cache). `RSS` = summed VmRSS of the container's processes. Peak during scan is sampled every 0.5 s; `memory.peak` is the kernel's high-water mark of memory.current, which also counts page cache from reading the audio files, so it overstates the app's own memory.

| | Audiobookshelf | AudioSilo |
|---|---|---|
| Idle, empty library: docker / anon / RSS | 58.5 MiB / 48.3 MiB / 115.5 MiB | 22.3 MiB / 13.9 MiB / 30.2 MiB |
| Idle timeline, anon at s after setup | 10s 82, 30s 82, 60s 82, 120s 50 MiB | 10s 11, 30s 11, 60s 13, 120s 13 MiB |
| Peak during initial scan: anon (sampled) | 440.1 MiB | 302.2 MiB |
| Peak during initial scan: docker (sampled) | 1025.2 MiB | 447.0 MiB |
| memory.peak since container start (incl. page cache) | 5384.1 MiB | 2464.5 MiB |
| 60 s after scan: docker / anon / RSS | 889.6 MiB / 125.3 MiB / 192.6 MiB | 213.1 MiB / 24.5 MiB / 40.2 MiB |
| CPU time used by initial scan (user+sys) | 387.04 s (385.76-391.04) | 529.60 s (528.04-530.92) |
| Data dir after initial scan | 18.9 MiB | 16.8 MiB |
| End of run (after API + web tests): docker / anon | 315.1 MiB / 230.6 MiB | 117.9 MiB / 52.8 MiB |

- Audiobookshelf data dir breakdown (last initial run): `./config` 14.8 MiB, `./metadata` 4.0 MiB. Largest top-level files: `./config/absdatabase.sqlite` 14.7 MiB. 1016 files in all.
- AudioSilo data dir breakdown (last initial run): `./cache` 0.0 MiB. Largest top-level files: `./audiosilo.db` 12.4 MiB, `./audiosilo.db-wal` 4.4 MiB, `./audiosilo.db-shm` 0.0 MiB, `./config.yaml` 0.0 MiB. 4 files in all.

## Scanning

| | Audiobookshelf | AudioSilo |
|---|---|---|
| Initial full scan, wall (median, min-max) | 131.50 s (131.47-131.53) | 78.79 s (78.33-79.32) |
| Initial full scan, app-reported | 130.72 s (130.69-130.73) | 78.70 s (78.08-79.20) |
| Books found | 998, 998, 998 | 1000, 1000, 1000 |
| No-change rescan, cold cache: wall | 3.57 s (3.52-3.62) | 0.52 s (0.52-0.52) |
| No-change rescan, cold cache: CPU | 1.73 s (1.63-2.02) | 0.40 s (0.39-0.41) |
| No-change rescan, warm cache: wall | 4.01 s (4.01-4.09) | 1.39 s (1.36-1.41) |
| No-change rescan, warm cache: CPU | 1.57 s (1.56-1.64) | 0.34 s (0.34-0.35) |
| Cold start to first authenticated library response | 4.41 s (4.34-4.43) | 3.32 s (2.98-3.42) |

- Audiobookshelf completion signal: GET /api/libraries/:id lastScan changes (set when LibraryScanner finishes) and no 'library-scan' task left in GET /api/tasks; app-reported = log timestamps of '[LibraryScanner] Starting ... library scan' -> 'Library scan ... completed in'.
- AudioSilo completion signal: GET /api/v1/admin/scan-runs: the new run has finished_at and a final status; app-reported = finished_at - started_at of that run (server clock).
- ABS initial scans ran as `(forced)`: [True, True, True] (ABS forces the first scan of a new library because its metadata precedence was never recorded; this is its out-of-box behaviour).
- AudioSilo queues a no-change scan of every library on each start (pkg/launcher); runs recorded after the cold starts: ok 1000 books, ok 1000 books, ok 1000 books. ABS does not scan on start.
- Item sanity (by library-relative folder): ABS 998, AudioSilo 1000, in both 998. Only in ABS: []. Only in AudioSilo: ['Charles Dickens/Seven Poor Travellers', 'Friedrich Nietzsche/Antichrist'].

## API latency from the Mac over the LAN

Sequential requests over one keep-alive connection (first-byte requests open a fresh connection each), request starts spaced at least 25 ms apart (AudioSilo limits each client IP to about 50 API requests/s; the spacing is applied to both apps and is never inside a timed sample). p50 / p95 / max in ms; size is the decoded body (wire size with gzip in the JSON files); for the two-step play flows it is the first step's body plus the 1 audio byte.

| Request | Audiobookshelf p50 / p95 / max | Audiobookshelf bytes | AudioSilo p50 / p95 / max | AudioSilo bytes |
|---|---|---|---|---|
| cover_first_request | 63.44 / 65.43 / 363.8 | 18284 | 6.08 / 7.56 / 9.65 | 11044 |
| home_shelves | 2.17 / 2.85 / 5.26 | 28978 (shelves=4, entities=32) | 1.56 / 2.24 / 3.3 | 22758 (books=48) |
| home_library_filterdata | 2.19 / 2.83 / 7.22 | 45060 | n/a |  |
| libraries | 1.77 / 2.32 / 3.46 | 872 (libraries=1) | 1.37 / 2.05 / 2.59 | 118 (libraries=1) |
| library_page1 | 2.22 / 3.17 / 5.01 | 42987 (results=36, total=998) | 1.44 / 2.01 / 4.35 | 79354 (books=200) |
| library_deep_page | 2.22 / 3.18 / 4.11 | 41324 (results=36, total=998) | 1.45 / 2.72 / 22.09 | 79625 (books=200) |
| search_the | 2.08 / 2.73 / 3.94 | 129076 (book=12, authors=11) | 1.54 / 2.43 / 3.68 | 23643 (books=50) |
| search_the_typeahead | 1.87 / 2.52 / 2.79 | 45615 (book=3, authors=3) | n/a |  |
| search_dickens | 1.71 / 2.21 / 3.41 | 305 (authors=1) | 1.47 / 2.55 / 4.35 | 4474 (books=10) |
| search_title | 1.98 / 2.66 / 4.51 | 26572 (book=1) | 1.45 / 2.54 / 5.5 | 456 (books=1) |
| search_dickens_then_author_page | 13.91 / 16.42 / 18.94 | 10459 (libraryItems=9) | n/a |  |
| search_dickens_typeahead | 1.77 / 2.66 / 4.6 | 305 (authors=1) | n/a |  |
| detail_mp3 | 9.09 / 11.04 / 13.8 | 52772 (audioFiles=20, chapters=20) | 1.81 / 3.42 / 3.72 | 8616 (files=20, chapters=20) |
| detail_m4b | 8.11 / 9.93 / 12.0 | 7127 (audioFiles=1, chapters=12) | 1.71 / 2.57 / 2.84 | 3107 (files=1, chapters=12) |
| play_first_byte_mp3 | 15.09 / 18.25 / 22.22 | 77570 (audioTracks=20, chapters=20) | 5.47 / 6.86 / 7.95 | 19 |
| play_first_byte_m4b | 13.8 / 16.7 / 21.43 | 11446 (audioTracks=1, chapters=12) | 5.34 / 7.16 / 8.6 | 19 |
| cover_grid | 1.85 / 2.67 / 3.46 | 10332 | 2.8 / 3.45 / 6.9 | 7548 |
| home_progress | n/a |  | 1.42 / 2.07 / 3.37 | 18 |
| home_stats | n/a |  | 2.12 / 3.0 / 4.9 | 1827 |
| home_listening | n/a |  | 1.71 / 2.19 / 3.49 | 12924 |
| home_favourites | n/a |  | 1.57 / 2.24 / 2.49 | 20 |
| server_info | n/a |  | 1.22 / 2.02 / 2.69 | 779 |
| library_all_pages | n/a |  | 7.57 / 9.65 / 22.16 | 395803 (books=1000) |
| detail_mp3_chapters | n/a |  | 1.71 / 2.58 / 6.12 | 8341 (files=20, chapters=20) |
| detail_m4b_chapters | n/a |  | 1.55 / 2.66 / 7.23 | 2814 (files=1, chapters=12) |
| **concurrency, steady load: library page 1** | 40.0 ok req/s, p50 1.99 / p95 3.49 ms | 20 clients x 20 s, 40.0 req/s offered, status {'200': 800} | 40.0 ok req/s, p50 1.49 / p95 3.01 ms | 20 clients x 20 s, 40.0 req/s offered, status {'200': 800} |
| **concurrency, saturating: library page 1** | 1716.2 ok req/s, p50 9.36 / p95 19.73 ms | 20 clients x 20 s, back to back, status {'200': 34324} | 12085.5 ok req/s, p50 0.9 / p95 1.47 ms | 20 clients x 20 s, back to back, status {'200': 241709} |

Exact requests (tokens elided):

**Audiobookshelf** (base http://192.168.0.10:13399, page size 36, total 998):

- `home_shelves`: GET /audiobookshelf/api/libraries/8c538df6-9d75-4846-a124-63980756fa82/personalized?include=rssfeed,numEpisodesIncomplete,share
- `home_library_filterdata`: GET /audiobookshelf/api/libraries/8c538df6-9d75-4846-a124-63980756fa82?include=filterdata
- `libraries`: GET /audiobookshelf/api/libraries
- `library_page1`: GET /audiobookshelf/api/libraries/8c538df6-9d75-4846-a124-63980756fa82/items?sort=media.metadata.title&desc=0&limit=36&page=0&minified=1&include=rssfeed,numEpisodesIncomplete,share
- `library_deep_page`: GET /audiobookshelf/api/libraries/8c538df6-9d75-4846-a124-63980756fa82/items?sort=media.metadata.title&desc=0&limit=36&page=13&minified=1&include=rssfeed,numEpisodesIncomplete,share
- `search_the`: GET /audiobookshelf/api/libraries/:id/search?q=the (search results page; server default limit 12)
- `search_the_typeahead`: GET /audiobookshelf/api/libraries/8c538df6-9d75-4846-a124-63980756fa82/search?q=the&limit=3
- `search_dickens`: GET /audiobookshelf/api/libraries/:id/search?q=dickens (ABS matches book titles, not authors: the answer is the author entry, 'Charles Dickens', with its book count)
- `search_title`: GET /audiobookshelf/api/libraries/8c538df6-9d75-4846-a124-63980756fa82/search?q=bleak%20house
- `search_dickens_then_author_page`: search?q=dickens, then the author page the result opens: GET /audiobookshelf/api/authors/:id?include=items,series (sequential sum; this is where ABS lists the author's books)
- `search_dickens_typeahead`: GET /audiobookshelf/api/libraries/8c538df6-9d75-4846-a124-63980756fa82/search?q=dickens&limit=3
- `detail_mp3`: GET /audiobookshelf/api/items/094f7561-1432-4bfc-9f70-8c3884da4042?expanded=1&include=downloads,rssfeed,share
- `detail_m4b`: GET /audiobookshelf/api/items/0a6514ad-3fad-4e7d-a76d-c1ee774fef74?expanded=1&include=downloads,rssfeed,share
- `play_first_byte_mp3`: POST /audiobookshelf/api/items/:id/play (direct play) then GET /audiobookshelf/public/session/:sid/track/:index Range: bytes=0- (first body byte)
- `play_first_byte_m4b`: as play_first_byte_mp3, M4B book
- `cover_grid`: GET /audiobookshelf/api/items/:id/cover?ts=<updatedAt> (no auth; server sends 400px webp)

**AudioSilo** (base http://192.168.0.10:8199, page size 200, total 1000):

- `home_shelves`: GET /api/v1/books/recent?limit=48 (the Recently added shelf; the home screen also fires the requests below in parallel)
- `home_progress`: GET /api/v1/me/progress
- `home_stats`: GET /api/v1/me/stats?range=30d
- `home_listening`: GET /api/v1/me/listening?range=1y
- `home_favourites`: GET /api/v1/me/favourites
- `libraries`: GET /api/v1/libraries
- `server_info`: GET /api/v1/server
- `library_page1`: GET /api/v1/libraries/1/books?sort=recent&limit=200
- `library_deep_page`: GET /api/v1/libraries/:id/books?sort=recent&limit=200&cursor=<cursor of page 2> (keyset pagination)
- `library_all_pages`: the grid's full load: 5 sequential cursor pages of 200 (the web player loads the whole library and sorts in the browser)
- `search_the`: GET /api/v1/search?q=the&limit=50
- `search_dickens`: GET /api/v1/search?q=dickens&limit=50 (full-text over title, author, narrator, series: the answer is the author's books)
- `search_title`: GET /api/v1/search?q=bleak+house&limit=50
- `detail_mp3`: GET /api/v1/libraries/:id/item?path=<book> (the book page fires /chapters, /progress, /bookmarks, /notes, /rating alongside)
- `detail_mp3_chapters`: GET /api/v1/libraries/1/chapters?path=Caroline+Elizabeth+Sarah+Norton%2FI+Do+Not+Love+Thee
- `detail_m4b`: GET /api/v1/libraries/1/item?path=Kenneth+Grahame%2FWind+in+the+Willows
- `detail_m4b_chapters`: GET /api/v1/libraries/1/chapters?path=Kenneth+Grahame%2FWind+in+the+Willows
- `play_first_byte_mp3`: GET /api/v1/libraries/:id/progress?path=<book> then GET /api/v1/libraries/:id/stream?path=<first file>&token= Range: bytes=0- (first body byte)
- `play_first_byte_m4b`: as play_first_byte_mp3, M4B book
- `cover_grid`: GET /api/v1/libraries/:id/cover?path=<book>&size=320&v=<cover_version>&token=<token> (grid tile at DPR 1)

## API latency from the host (loopback, python:3-alpine)

Sequential requests over one keep-alive connection (first-byte requests open a fresh connection each), request starts spaced at least 25 ms apart (AudioSilo limits each client IP to about 50 API requests/s; the spacing is applied to both apps and is never inside a timed sample). p50 / p95 / max in ms; size is the decoded body (wire size with gzip in the JSON files); for the two-step play flows it is the first step's body plus the 1 audio byte.

| Request | Audiobookshelf p50 / p95 / max | Audiobookshelf bytes | AudioSilo p50 / p95 / max | AudioSilo bytes |
|---|---|---|---|---|
| home_shelves | 1.3 / 1.58 / 1.8 | 28978 (shelves=4, entities=32) | 0.88 / 1.02 / 1.29 | 22758 (books=48) |
| home_library_filterdata | 1.21 / 1.43 / 1.56 | 45060 | n/a |  |
| libraries | 1.04 / 1.19 / 1.25 | 872 (libraries=1) | 0.85 / 0.96 / 1.25 | 118 (libraries=1) |
| library_page1 | 1.28 / 1.48 / 1.55 | 42987 (results=36, total=998) | 0.84 / 1.17 / 1.52 | 79354 (books=200) |
| library_deep_page | 1.34 / 1.53 / 1.7 | 41324 (results=36, total=998) | 0.86 / 1.06 / 1.12 | 79625 (books=200) |
| search_the | 1.53 / 1.71 / 1.9 | 129076 (book=12, authors=11) | 0.91 / 1.12 / 1.24 | 23643 (books=50) |
| search_the_typeahead | 1.34 / 1.5 / 1.6 | 45615 (book=3, authors=3) | n/a |  |
| search_dickens | 1.2 / 1.52 / 1.7 | 305 (authors=1) | 0.92 / 1.05 / 1.12 | 4474 (books=10) |
| search_title | 1.11 / 1.38 / 1.63 | 26572 (book=1) | 0.85 / 0.99 / 1.05 | 456 (books=1) |
| search_dickens_then_author_page | 11.98 / 12.96 / 14.0 | 10459 (libraryItems=9) | n/a |  |
| search_dickens_typeahead | 1.23 / 1.36 / 1.59 | 305 (authors=1) | n/a |  |
| detail_mp3 | 8.04 / 8.72 / 14.13 | 52772 (audioFiles=20, chapters=20) | 1.14 / 1.27 / 1.77 | 8616 (files=20, chapters=20) |
| detail_m4b | 7.3 / 7.8 / 9.34 | 7127 (audioFiles=1, chapters=12) | 1.08 / 1.23 / 1.35 | 3107 (files=1, chapters=12) |
| play_first_byte_mp3 | 11.89 / 12.8 / 14.36 | 77567 (audioTracks=20, chapters=20) | 2.93 / 3.38 / 4.86 | 19 |
| play_first_byte_m4b | 10.82 / 11.63 / 15.5 | 11443 (audioTracks=1, chapters=12) | 2.85 / 3.2 / 3.66 | 19 |
| cover_grid | 1.54 / 1.78 / 2.41 | 10332 | 2.23 / 2.42 / 2.8 | 7548 |
| home_progress | n/a |  | 0.92 / 1.06 / 1.12 | 18 |
| home_stats | n/a |  | 1.53 / 1.71 / 2.49 | 1827 |
| home_listening | n/a |  | 1.13 / 1.28 / 1.55 | 12924 |
| home_favourites | n/a |  | 1.02 / 1.16 / 1.7 | 20 |
| server_info | n/a |  | 0.71 / 0.82 / 0.93 | 779 |
| library_all_pages | n/a |  | 4.07 / 4.52 / 5.0 | 395803 (books=1000) |
| detail_mp3_chapters | n/a |  | 1.14 / 1.3 / 3.78 | 8341 (files=20, chapters=20) |
| detail_m4b_chapters | n/a |  | 1.07 / 1.2 / 1.28 | 2814 (files=1, chapters=12) |
| **concurrency, steady load: library page 1** | 40.0 ok req/s, p50 1.4 / p95 1.68 ms | 20 clients x 20 s, 40.0 req/s offered, status {'200': 800} | 40.0 ok req/s, p50 0.84 / p95 1.05 ms | 20 clients x 20 s, 40.0 req/s offered, status {'200': 800} |
| **concurrency, saturating: library page 1** | 1447.7 ok req/s, p50 11.07 / p95 22.77 ms | 20 clients x 20 s, back to back, status {'200': 28953} | 2961.3 ok req/s, p50 3.2 / p95 7.74 ms | 20 clients x 20 s, back to back, status {'200': 59227} |

## Web UI (Playwright Chromium, 1440x900, DPR 1, from the Mac)

Medians of the runs. Times in ms from navigation start. `first cover`: first cover image inside the viewport fully loaded; `screen`: last cover inside the viewport loaded (all visible loaded, then stable 1.5 s). Bytes are transferred (compressed) bytes; cache hits count 0.

| Page | Cache | Audiobookshelf first cover / screen / LCP | Audiobookshelf req / KiB / JS KiB | AudioSilo first cover / screen / LCP | AudioSilo req / KiB / JS KiB |
|---|---|---|---|---|---|
| home | cold | 211 / 217 / 229.0 | 59 / 4156 / 2643 | 188 / 205 / 244.0 | 56 / 1969 / 1302 |
| home | warm | 203 / 203 / 221.0 | 59 / 13 / 8 | 190 / 203 / 209.0 | 56 / 41 / 0 |
| grid | cold | 231 / 246 / 565.0 | 72 / 4150 / 2643 | 203 / 222 / 253.0 | 78 / 2564 / 1297 |
| grid | warm | 221 / 221 / 560.0 | 72 / 13 / 8 | 197 / 197 / 229.0 | 78 / 429 / 0 |

- Audiobookshelf: grid URL `/audiobookshelf/library/8c538df6-9d75-4846-a124-63980756fa82/bookshelf` (ended at `audiobookshelf/library/8c538df6-9d75-4846-a124-63980756fa82/bookshelf?sort=media.metadata.title&desc=0`), 18 covers in view; home `/audiobookshelf/library/8c538df6-9d75-4846-a124-63980756fa82`, 14 covers in view. Screenshots: abs-admin-issues-cold.png, abs-admin-issues-warm.png, abs-grid-cold.png, abs-grid-warm.png, abs-home-cold.png, abs-home-warm.png. External requests blocked: ['https://api.github.com/repos/advplyr/audiobookshelf/releases']. Failed same-origin requests: none.
- AudioSilo: grid URL `/web/library` (ended at `web/library`), 15 covers in view; home `/web/`, 14 covers in view. Screenshots: as-admin-issues-cold.png, as-admin-issues-warm.png, as-admin-system-cold.png, as-admin-system-warm.png, as-grid-cold.png, as-grid-warm.png, as-home-cold.png, as-home-warm.png. External requests blocked: none. Failed same-origin requests: none.

## Admin health page

AudioSilo: the admin console's Health section, Issues (the default tab) and System. Audiobookshelf has no health or system-status page; its nearest equivalent to Issues is the bookshelf filtered to `issues` (items it marked missing or invalid; the sidebar shows the link only when there are any). It has nothing comparable to System, so that row is n/a.

Browser: Playwright Chromium from the Mac, medians of the runs, ms from navigation start. `ready`: the page's data has rendered (its text shows the result) and no API request is in flight; `last API`: end of the last API response.

| Page | Cache | Audiobookshelf ready / last API ms | Audiobookshelf API req / KiB | AudioSilo ready / last API ms | AudioSilo API req / KiB |
|---|---|---|---|---|---|
| issues | cold | 196 / 189 | 5 / 3549 | 145 / 145 | 8 / 598 |
| issues | warm | 188 / 177 | 5 / 13 | 144 / 144 | 8 / 92 |
| system | cold | n/a |  | 120 / 103 | 6 / 461 |
| system | warm | n/a |  | 114 / 98 | 6 / 6 |

- Audiobookshelf issues (`/audiobookshelf/library/8c538df6-9d75-4846-a124-63980756fa82/bookshelf?filter=issues`), API requests on the first cold load: POST /audiobookshelf/api/authorize (2 ms, 2353 B); GET /audiobookshelf/api/libraries/8c538df6-9d75-4846-a124-63980756fa82?include=filterdata (2 ms, 45356 B); GET /audiobookshelf/api/libraries (2 ms, 1165 B); GET /audiobookshelf/api/tasks?include=queue (2 ms, 341 B); GET /audiobookshelf/api/libraries/8c538df6-9d75-4846-a124-63980756fa82/items?filter=issues&sort=media.metadata.title&desc=0&limit=36&page=0&minified=1&include=rssfeed,numEpisodesIncomplete,share (14 ms, 522 B).
- AudioSilo issues (`/admin/health`), API requests on the first cold load: GET /api/v1/me (3 ms, 443 B); GET /api/v1/admin/setup (2 ms, 439 B); GET /api/v1/server (1 ms, 1030 B); GET /api/v1/admin/libraries (4 ms, 575 B); GET /api/v1/admin/events?limit=20 (2 ms, 653 B); GET /api/v1/admin/issues (20 ms, 1838 B); GET /api/v1/admin/books?issue=scan_error&sort=added&order=desc&limit=50 (4 ms, 2129 B); POST /api/v1/admin/covers (11 ms, 86321 B).
- AudioSilo system (`/admin/health/system`), API requests on the first cold load: GET /api/v1/me (2 ms, 443 B); GET /api/v1/admin/setup (2 ms, 439 B); GET /api/v1/server (1 ms, 1030 B); GET /api/v1/admin/libraries (2 ms, 575 B); GET /api/v1/admin/events?limit=20 (1 ms, 653 B); GET /api/v1/admin/system (320 ms, 1513 B).

API replay (same method as the latency tables: 5 warm-up + timed requests, paced):

| Request | Audiobookshelf p50 / p95 / max | Audiobookshelf bytes | AudioSilo p50 / p95 / max | AudioSilo bytes |
|---|---|---|---|---|
| admin_issues | 1.7 / 2.45 / 4.14 | 195 (results=0, total=0) | 1.55 / 2.19 / 3.6 | 1586 (categories=10, categories.[].count=1009) |
| admin_issue_books | n/a |  | 1.22 / 1.68 / 2.75 | 1877 (books=2) |
| admin_system | n/a |  | 1.65 / 2.37 / 3.0 | 1261 |

- Audiobookshelf `admin_issues`: GET items?filter=issues (the bookshelf's issues filter: items missing or invalid on disk)
- AudioSilo `admin_issues`: GET /api/v1/admin/issues (every issue category with its count and sample covers)
- AudioSilo `admin_issue_books`: GET /api/v1/admin/books?issue=scan_error... (the open category's queue)
- AudioSilo `admin_system`: GET /api/v1/admin/system (ffmpeg, ffprobe, community metadata reachability, TLS, database, backups, library folders)

