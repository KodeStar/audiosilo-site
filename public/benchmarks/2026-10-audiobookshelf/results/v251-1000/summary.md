# ABS vs AudioSilo benchmark: v251-1000

Run 2026-10-30T04:59:37+0000 to 2026-10-30T05:48:16+0000, total 2910.0 s. Library `/mnt/user/librivox/tier-1000` at start: 1000 book folders, 12653 MP3 + 472 M4B files, 151.77 GiB; at end: 1000 folders.

Host: Intel(R) Core(TM) i3-N305, 8 CPUs, 16150928 kB RAM, kernel 6.1.106-Unraid, Docker 24.0.9. Load average at start 0.15/0.11/0.16, at end 1.26. Other containers running on the host (idle, untouched): 19.

- Library on disk during the Audiobookshelf run: 1000 folders before, 1000 after.
- Library on disk during the AudioSilo run: 1000 folders before, 1000 after.

Settings (scan,rescan,startup,latency,web,admin): initial scans x3 (fresh data each), no-change rescans x3 cold + x3 warm, cold starts x3, API 5 warm-up + 100 timed requests each, concurrency 20 clients x 20 s, web UI 5 runs per page and cache state. AudioSilo metadata setting: default.

## Images

| | Audiobookshelf | AudioSilo |
|---|---|---|
| Version | 2.37.2 | 2.5.1 |
| Image (pinned digest) | `ghcr.io/advplyr/audiobookshelf@sha256:b897c33f05972fb1bf484f7487bc878fa91ec8691335c1db6e2929c3a7658efa` | `ghcr.io/kodestar/audiosilo-server@sha256:898a06b7436b7de0b2add87c3aa9747c13361bacf9abe6b5c16f30166e1b03de` |
| Compressed size (registry, linux/amd64) | 125.0 MiB | 65.4 MiB |
| Uncompressed size (docker image inspect) | 343.2 MiB | 171.7 MiB |

## Memory, CPU and disk

`docker` = docker stats MEM USAGE (cgroup memory.current minus inactive_file). `anon` = cgroup anonymous memory (the process heap, no page cache). `RSS` = summed VmRSS of the container's processes. Peak during scan is sampled every 0.5 s; `memory.peak` is the kernel's high-water mark of memory.current, which also counts page cache from reading the audio files, so it overstates the app's own memory.

| | Audiobookshelf | AudioSilo |
|---|---|---|
| Idle, empty library: docker / anon / RSS | 59.9 MiB / 48.9 MiB / 116.1 MiB | 27.2 MiB / 20.3 MiB / 34.8 MiB |
| Idle timeline, anon at s after setup | 10s 79, 30s 79, 60s 79, 120s 47 MiB | 10s 15, 30s 15, 60s 17, 120s 18 MiB |
| Peak during initial scan: anon (sampled) | 397.6 MiB | 53.9 MiB |
| Peak during initial scan: docker (sampled) | 978.5 MiB | 99.2 MiB |
| memory.peak since container start (incl. page cache) | 3871.1 MiB | 2565.8 MiB |
| 60 s after scan: docker / anon / RSS | 910.1 MiB / 196.6 MiB / 263.6 MiB | 85.5 MiB / 29.1 MiB / 44.7 MiB |
| CPU time used by initial scan (user+sys) | 1145.31 s (1130.66-1207.62) | 11.38 s (11.37-11.51) |
| Data dir after initial scan | 27.8 MiB | 17.1 MiB |
| End of run (after API + web tests): docker / anon | 373.3 MiB / 264.7 MiB | 105.2 MiB / 35.6 MiB |

- Audiobookshelf data dir breakdown (last initial run): `./config` 24.0 MiB, `./metadata` 3.8 MiB. Largest top-level files: `./config/absdatabase.sqlite` 23.9 MiB. 1017 files in all.
- AudioSilo data dir breakdown (last initial run): `./cache` 0.0 MiB. Largest top-level files: `./audiosilo.db` 12.7 MiB, `./audiosilo.db-wal` 4.3 MiB, `./audiosilo.db-shm` 0.0 MiB, `./config.yaml` 0.0 MiB. 4 files in all.

## Scanning

| | Audiobookshelf | AudioSilo |
|---|---|---|
| Initial full scan, wall (median, min-max) | 240.29 s (237.47-252.64) | 6.80 s (6.78-6.85) |
| Initial full scan, app-reported | 240.10 s (237.34-252.44) | 6.65 s (6.62-6.83) |
| Books found | 999, 999, 999 | 1000, 1000, 1000 |
| No-change rescan, cold cache: wall | 4.61 s (4.46-4.67) | 0.78 s (0.78-0.79) |
| No-change rescan, cold cache: CPU | 2.75 s (2.68-2.88) | 0.86 s (0.85-0.86) |
| No-change rescan, warm cache: wall | 3.71 s (3.70-3.79) | 0.53 s (0.52-0.79) |
| No-change rescan, warm cache: CPU | 2.48 s (2.48-2.51) | 0.76 s (0.76-0.77) |
| Cold start to first authenticated library response | 4.15 s (3.96-4.27) | 2.98 s (2.94-2.99) |

- Audiobookshelf completion signal: GET /api/libraries/:id lastScan changes (set when LibraryScanner finishes) and no 'library-scan' task left in GET /api/tasks; app-reported = log timestamps of '[LibraryScanner] Starting ... library scan' -> 'Library scan ... completed in'.
- AudioSilo completion signal: GET /api/v1/admin/scan-runs: the new run has finished_at and a final status; app-reported = finished_at - started_at of that run (server clock).
- ABS initial scans ran as `(forced)`: [True, True, True] (ABS forces the first scan of a new library because its metadata precedence was never recorded; this is its out-of-box behaviour).
- AudioSilo queues a no-change scan of every library on each start (pkg/launcher); runs recorded after the cold starts: ok 1000 books, ok 1000 books, ok 1000 books. ABS does not scan on start.
- Item sanity (by library-relative folder): ABS 999, AudioSilo 1000, in both 999. Only in ABS: []. Only in AudioSilo: ['Friedrich Nietzsche/Antichrist'].

## API latency from the Mac over the LAN

Sequential requests over one keep-alive connection (first-byte requests open a fresh connection each), request starts spaced at least 25 ms apart (AudioSilo limits each client IP to about 50 API requests/s; the spacing is applied to both apps and is never inside a timed sample). p50 / p95 / max in ms; size is the decoded body (wire size with gzip in the JSON files); for the two-step play flows it is the first step's body plus the 1 audio byte.

| Request | Audiobookshelf p50 / p95 / max | Audiobookshelf bytes | AudioSilo p50 / p95 / max | AudioSilo bytes |
|---|---|---|---|---|
| cover_first_request | 63.03 / 69.62 / 374.37 | 16180 | 6.01 / 7.18 / 9.89 | 10725 |
| home_shelves | 2.01 / 2.33 / 4.56 | 28058 (shelves=4, entities=32) | 1.36 / 1.75 / 2.14 | 23052 (books=48) |
| home_library_filterdata | 2.12 / 2.53 / 3.24 | 43996 | n/a |  |
| libraries | 1.74 / 2.21 / 3.2 | 872 (libraries=1) | 1.36 / 1.64 / 1.8 | 118 (libraries=1) |
| library_page1 | 2.1 / 2.55 / 3.61 | 43006 (results=36, total=999) | 1.25 / 1.59 / 1.81 | 80515 (books=200) |
| library_deep_page | 2.01 / 2.72 / 3.49 | 41295 (results=36, total=999) | 1.35 / 1.71 / 2.01 | 79742 (books=200) |
| search_the | 2.35 / 2.87 / 3.32 | 307350 (book=12, authors=12) | 1.46 / 1.7 / 2.36 | 23994 (books=50) |
| search_the_typeahead | 1.76 / 2.21 / 2.92 | 62365 (book=3, authors=3) | n/a |  |
| search_dickens | 1.63 / 1.95 / 2.22 | 306 (authors=1) | 1.39 / 1.65 / 2.35 | 6434 (books=14) |
| search_title | 1.97 / 2.61 / 3.22 | 26572 (book=1) | 1.36 / 1.65 / 1.93 | 457 (books=1) |
| search_dickens_then_author_page | 17.06 / 19.42 / 20.99 | 16323 (libraryItems=14) | n/a |  |
| search_dickens_typeahead | 1.66 / 2.09 / 3.89 | 306 (authors=1) | n/a |  |
| detail_mp3 | 8.74 / 10.33 / 13.33 | 52772 (audioFiles=20, chapters=20) | 1.7 / 2.15 / 2.77 | 8615 (files=20, chapters=20) |
| detail_m4b | 7.62 / 8.43 / 11.73 | 4396 (audioFiles=1, chapters=1) | 1.46 / 1.73 / 1.9 | 799 (files=1, chapters=1) |
| play_first_byte_mp3 | 14.04 / 15.31 / 20.65 | 77567 (audioTracks=20, chapters=20) | 5.36 / 6.13 / 6.39 | 19 |
| play_first_byte_m4b | 12.82 / 15.08 / 19.47 | 6876 (audioTracks=1, chapters=1) | 5.25 / 6.11 / 6.57 | 19 |
| cover_grid | 2.06 / 2.56 / 13.92 | 10332 | 2.73 / 3.18 / 3.32 | 7548 |
| home_progress | n/a |  | 1.36 / 1.73 / 1.83 | 18 |
| home_stats | n/a |  | 2.13 / 2.54 / 2.93 | 1827 |
| home_listening | n/a |  | 1.63 / 2.06 / 2.9 | 12924 |
| home_favourites | n/a |  | 1.38 / 1.75 / 1.82 | 20 |
| server_info | n/a |  | 1.11 / 1.51 / 1.76 | 790 |
| library_all_pages | n/a |  | 6.58 / 7.91 / 8.44 | 398203 (books=1000) |
| detail_mp3_chapters | n/a |  | 1.75 / 2.14 / 3.03 | 8341 (files=20, chapters=20) |
| detail_m4b_chapters | n/a |  | 1.47 / 1.83 / 2.18 | 506 (files=1, chapters=1) |
| **concurrency, steady load: library page 1** | 40.0 ok req/s, p50 2.07 / p95 2.79 ms | 20 clients x 20 s, 40.0 req/s offered, status {'200': 800} | 40.0 ok req/s, p50 1.37 / p95 1.84 ms | 20 clients x 20 s, 40.0 req/s offered, status {'200': 800} |
| **concurrency, saturating: library page 1** | 1843.2 ok req/s, p50 8.76 / p95 18.81 ms | 20 clients x 20 s, back to back, status {'200': 36864} | 14409.1 ok req/s, p50 0.56 / p95 0.8 ms | 20 clients x 20 s, back to back, status {'200': 288182} |

Exact requests (tokens elided):

**Audiobookshelf** (base http://192.168.0.10:13399, page size 36, total 999):

- `home_shelves`: GET /audiobookshelf/api/libraries/a0819055-3a43-42e6-bacc-dea90de31353/personalized?include=rssfeed,numEpisodesIncomplete,share
- `home_library_filterdata`: GET /audiobookshelf/api/libraries/a0819055-3a43-42e6-bacc-dea90de31353?include=filterdata
- `libraries`: GET /audiobookshelf/api/libraries
- `library_page1`: GET /audiobookshelf/api/libraries/a0819055-3a43-42e6-bacc-dea90de31353/items?sort=media.metadata.title&desc=0&limit=36&page=0&minified=1&include=rssfeed,numEpisodesIncomplete,share
- `library_deep_page`: GET /audiobookshelf/api/libraries/a0819055-3a43-42e6-bacc-dea90de31353/items?sort=media.metadata.title&desc=0&limit=36&page=13&minified=1&include=rssfeed,numEpisodesIncomplete,share
- `search_the`: GET /audiobookshelf/api/libraries/:id/search?q=the (search results page; server default limit 12)
- `search_the_typeahead`: GET /audiobookshelf/api/libraries/a0819055-3a43-42e6-bacc-dea90de31353/search?q=the&limit=3
- `search_dickens`: GET /audiobookshelf/api/libraries/:id/search?q=dickens (ABS matches book titles, not authors: the answer is the author entry, 'Charles Dickens', with its book count)
- `search_title`: GET /audiobookshelf/api/libraries/a0819055-3a43-42e6-bacc-dea90de31353/search?q=bleak%20house
- `search_dickens_then_author_page`: search?q=dickens, then the author page the result opens: GET /audiobookshelf/api/authors/:id?include=items,series (sequential sum; this is where ABS lists the author's books)
- `search_dickens_typeahead`: GET /audiobookshelf/api/libraries/a0819055-3a43-42e6-bacc-dea90de31353/search?q=dickens&limit=3
- `detail_mp3`: GET /audiobookshelf/api/items/b2e83bbf-0646-4e2e-963a-6b7936e4cb72?expanded=1&include=downloads,rssfeed,share
- `detail_m4b`: GET /audiobookshelf/api/items/8a33687f-f5de-442e-9e23-a873dda94fec?expanded=1&include=downloads,rssfeed,share
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
- `detail_m4b`: GET /api/v1/libraries/1/item?path=L.+Leslie+Brooke%2FStory+of+the+Three+Little+Pigs
- `detail_m4b_chapters`: GET /api/v1/libraries/1/chapters?path=L.+Leslie+Brooke%2FStory+of+the+Three+Little+Pigs
- `play_first_byte_mp3`: GET /api/v1/libraries/:id/progress?path=<book> then GET /api/v1/libraries/:id/stream?path=<first file>&token= Range: bytes=0- (first body byte)
- `play_first_byte_m4b`: as play_first_byte_mp3, M4B book
- `cover_grid`: GET /api/v1/libraries/:id/cover?path=<book>&size=320&v=<cover_version>&token=<token> (grid tile at DPR 1)

## API latency from the host (loopback, python:3-alpine)

Sequential requests over one keep-alive connection (first-byte requests open a fresh connection each), request starts spaced at least 25 ms apart (AudioSilo limits each client IP to about 50 API requests/s; the spacing is applied to both apps and is never inside a timed sample). p50 / p95 / max in ms; size is the decoded body (wire size with gzip in the JSON files); for the two-step play flows it is the first step's body plus the 1 audio byte.

| Request | Audiobookshelf p50 / p95 / max | Audiobookshelf bytes | AudioSilo p50 / p95 / max | AudioSilo bytes |
|---|---|---|---|---|
| home_shelves | 1.2 / 1.46 / 1.82 | 28058 (shelves=4, entities=32) | 0.88 / 1.07 / 1.65 | 23052 (books=48) |
| home_library_filterdata | 1.25 / 1.48 / 1.7 | 43996 | n/a |  |
| libraries | 1.04 / 1.36 / 1.54 | 872 (libraries=1) | 0.81 / 1.02 / 1.09 | 118 (libraries=1) |
| library_page1 | 1.27 / 1.47 / 1.61 | 43006 (results=36, total=999) | 0.72 / 0.84 / 0.89 | 80515 (books=200) |
| library_deep_page | 1.17 / 1.54 / 1.65 | 41295 (results=36, total=999) | 0.76 / 0.9 / 0.97 | 79742 (books=200) |
| search_the | 1.91 / 2.29 / 2.85 | 307350 (book=12, authors=12) | 0.93 / 1.1 / 1.21 | 23994 (books=50) |
| search_the_typeahead | 1.31 / 1.56 / 1.84 | 62365 (book=3, authors=3) | n/a |  |
| search_dickens | 1.13 / 1.36 / 1.51 | 306 (authors=1) | 0.92 / 1.08 / 1.2 | 6434 (books=14) |
| search_title | 1.21 / 1.46 / 1.6 | 26572 (book=1) | 0.88 / 1.02 / 1.43 | 457 (books=1) |
| search_dickens_then_author_page | 15.1 / 16.73 / 19.12 | 16323 (libraryItems=14) | n/a |  |
| search_dickens_typeahead | 1.15 / 1.38 / 1.65 | 306 (authors=1) | n/a |  |
| detail_mp3 | 7.62 / 8.49 / 10.51 | 52772 (audioFiles=20, chapters=20) | 1.24 / 1.48 / 1.71 | 8615 (files=20, chapters=20) |
| detail_m4b | 6.63 / 7.49 / 8.47 | 4396 (audioFiles=1, chapters=1) | 1.05 / 1.2 / 1.29 | 799 (files=1, chapters=1) |
| play_first_byte_mp3 | 11.64 / 13.01 / 15.53 | 77564 (audioTracks=20, chapters=20) | 2.9 / 3.19 / 3.48 | 19 |
| play_first_byte_m4b | 10.44 / 11.53 / 15.62 | 6873 (audioTracks=1, chapters=1) | 2.99 / 3.45 / 3.7 | 19 |
| cover_grid | 1.41 / 1.61 / 2.22 | 10332 | 2.19 / 2.46 / 2.57 | 7548 |
| home_progress | n/a |  | 0.88 / 1.06 / 1.25 | 18 |
| home_stats | n/a |  | 1.57 / 1.85 / 2.26 | 1827 |
| home_listening | n/a |  | 1.06 / 1.24 / 1.54 | 12924 |
| home_favourites | n/a |  | 0.98 / 1.13 / 1.36 | 20 |
| server_info | n/a |  | 0.69 / 0.78 / 0.86 | 790 |
| library_all_pages | n/a |  | 3.67 / 4.01 / 4.51 | 398203 (books=1000) |
| detail_mp3_chapters | n/a |  | 1.25 / 1.45 / 3.69 | 8341 (files=20, chapters=20) |
| detail_m4b_chapters | n/a |  | 1.06 / 1.22 / 1.58 | 506 (files=1, chapters=1) |
| **concurrency, steady load: library page 1** | 40.0 ok req/s, p50 1.37 / p95 1.66 ms | 20 clients x 20 s, 40.0 req/s offered, status {'200': 800} | 40.0 ok req/s, p50 0.76 / p95 0.9 ms | 20 clients x 20 s, 40.0 req/s offered, status {'200': 800} |
| **concurrency, saturating: library page 1** | 1618.8 ok req/s, p50 10.42 / p95 21.17 ms | 20 clients x 20 s, back to back, status {'200': 32375} | 2482.0 ok req/s, p50 2.95 / p95 8.93 ms | 20 clients x 20 s, back to back, status {'200': 49640} |

## Web UI (Playwright Chromium, 1440x900, DPR 1, from the Mac)

Medians of the runs. Times in ms from navigation start. `first cover`: first cover image inside the viewport fully loaded; `screen`: last cover inside the viewport loaded (all visible loaded, then stable 1.5 s). Bytes are transferred (compressed) bytes; cache hits count 0.

| Page | Cache | Audiobookshelf first cover / screen / LCP | Audiobookshelf req / KiB / JS KiB | AudioSilo first cover / screen / LCP | AudioSilo req / KiB / JS KiB |
|---|---|---|---|---|---|
| home | cold | 201 / 209 / 229.0 | 59 / 4165 / 2643 | 179 / 200 / 237.0 | 56 / 1929 / 1306 |
| home | warm | 193 / 193 / 209.0 | 59 / 13 / 8 | 177 / 190 / 197 | 56 / 11 / 0 |
| grid | cold | 223 / 239 / 561.0 | 72 / 4148 / 2643 | 191 / 209 / 237 | 78 / 2232 / 1300 |
| grid | warm | 212 / 212 / 548.0 | 72 / 13 / 8 | 188 / 188 / 221.0 | 78 / 108 / 0 |

- Audiobookshelf: grid URL `/audiobookshelf/library/a0819055-3a43-42e6-bacc-dea90de31353/bookshelf` (ended at `audiobookshelf/library/a0819055-3a43-42e6-bacc-dea90de31353/bookshelf?sort=media.metadata.title&desc=0`), 18 covers in view; home `/audiobookshelf/library/a0819055-3a43-42e6-bacc-dea90de31353`, 14 covers in view. Screenshots: abs-admin-issues-cold.png, abs-admin-issues-warm.png, abs-grid-cold.png, abs-grid-warm.png, abs-home-cold.png, abs-home-warm.png. External requests blocked: ['https://api.github.com/repos/advplyr/audiobookshelf/releases']. Failed same-origin requests: none.
- AudioSilo: grid URL `/web/library` (ended at `web/library`), 15 covers in view; home `/web/`, 14 covers in view. Screenshots: as-admin-issues-cold.png, as-admin-issues-warm.png, as-admin-system-cold.png, as-admin-system-warm.png, as-grid-cold.png, as-grid-warm.png, as-home-cold.png, as-home-warm.png. External requests blocked: none. Failed same-origin requests: none.

## Admin health page

AudioSilo: the admin console's Health section, Issues (the default tab) and System. Audiobookshelf has no health or system-status page; its nearest equivalent to Issues is the bookshelf filtered to `issues` (items it marked missing or invalid; the sidebar shows the link only when there are any). It has nothing comparable to System, so that row is n/a.

Browser: Playwright Chromium from the Mac, medians of the runs, ms from navigation start. `ready`: the page's data has rendered (its text shows the result) and no API request is in flight; `last API`: end of the last API response.

| Page | Cache | Audiobookshelf ready / last API ms | Audiobookshelf API req / KiB | AudioSilo ready / last API ms | AudioSilo API req / KiB |
|---|---|---|---|---|---|
| issues | cold | 196 / 185 | 5 / 3548 | 142 / 142 | 8 / 594 |
| issues | warm | 186 / 175 | 5 / 13 | 138 / 138 | 8 / 84 |
| system | cold | n/a |  | 115 / 98 | 6 / 464 |
| system | warm | n/a |  | 111 / 95 | 6 / 5 |

- Audiobookshelf issues (`/audiobookshelf/library/a0819055-3a43-42e6-bacc-dea90de31353/bookshelf?filter=issues`), API requests on the first cold load: POST /audiobookshelf/api/authorize (3 ms, 2353 B); GET /audiobookshelf/api/libraries/a0819055-3a43-42e6-bacc-dea90de31353?include=filterdata (2 ms, 44292 B); GET /audiobookshelf/api/libraries (2 ms, 1165 B); GET /audiobookshelf/api/tasks?include=queue (2 ms, 341 B); GET /audiobookshelf/api/libraries/a0819055-3a43-42e6-bacc-dea90de31353/items?filter=issues&sort=media.metadata.title&desc=0&limit=36&page=0&minified=1&include=rssfeed,numEpisodesIncomplete,share (13 ms, 522 B).
- AudioSilo issues (`/admin/health`), API requests on the first cold load: GET /api/v1/me (2 ms, 466 B); GET /api/v1/admin/setup (3 ms, 462 B); GET /api/v1/server (2 ms, 1064 B); GET /api/v1/admin/libraries (3 ms, 598 B); GET /api/v1/admin/events?limit=20 (1 ms, 691 B); GET /api/v1/admin/issues (25 ms, 926 B); GET /api/v1/admin/books?issue=scan_error&sort=added&order=desc&limit=50 (4 ms, 1216 B); POST /api/v1/admin/covers (11 ms, 79285 B); POST /api/v1/admin/covers (3 ms, 9837 B).
- AudioSilo system (`/admin/health/system`), API requests on the first cold load: GET /api/v1/me (1 ms, 466 B); GET /api/v1/admin/setup (2 ms, 462 B); GET /api/v1/server (2 ms, 1064 B); GET /api/v1/admin/libraries (2 ms, 598 B); GET /api/v1/admin/events?limit=20 (1 ms, 691 B); GET /api/v1/admin/system (271 ms, 981 B).

API replay (same method as the latency tables: 5 warm-up + timed requests, paced):

| Request | Audiobookshelf p50 / p95 / max | Audiobookshelf bytes | AudioSilo p50 / p95 / max | AudioSilo bytes |
|---|---|---|---|---|
| admin_issues | 1.57 / 1.78 / 2.22 | 195 (results=0, total=0) | 1.45 / 1.85 / 2.29 | 1541 (categories=10, categories.[].count=1006) |
| admin_issue_books | n/a |  | 1.17 / 1.51 / 1.68 | 942 (books=1) |
| admin_system | n/a |  | 1.59 / 1.95 / 2.21 | 1240 |

- Audiobookshelf `admin_issues`: GET items?filter=issues (the bookshelf's issues filter: items missing or invalid on disk)
- AudioSilo `admin_issues`: GET /api/v1/admin/issues (every issue category with its count and sample covers)
- AudioSilo `admin_issue_books`: GET /api/v1/admin/books?issue=scan_error... (the open category's queue)
- AudioSilo `admin_system`: GET /api/v1/admin/system (ffmpeg, ffprobe, community metadata reachability, TLS, database, backups, library folders)

