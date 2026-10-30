# ABS vs AudioSilo benchmark: v251-1000-m4b

Run 2026-10-30T05:49:32+0000 to 2026-10-30T06:32:25+0000, total 2564.0 s. Library `/mnt/user/librivox/tier-1000-m4b` at start: 1000 book folders, 4588 MP3 + 1046 M4B files, 153.18 GiB; at end: 1000 folders.

Host: Intel(R) Core(TM) i3-N305, 8 CPUs, 16150928 kB RAM, kernel 6.1.106-Unraid, Docker 24.0.9. Load average at start 0.5/1.28/1.44, at end 1.24. Other containers running on the host (idle, untouched): 19.

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
| Idle, empty library: docker / anon / RSS | 66.2 MiB / 48.5 MiB / 115.7 MiB | 21.8 MiB / 15.7 MiB / 30.6 MiB |
| Idle timeline, anon at s after setup | 10s 82, 30s 82, 60s 82, 120s 52 MiB | 10s 12, 30s 12, 60s 15, 120s 17 MiB |
| Peak during initial scan: anon (sampled) | 478.0 MiB | 47.7 MiB |
| Peak during initial scan: docker (sampled) | 975.2 MiB | 106.2 MiB |
| memory.peak since container start (incl. page cache) | 5185.5 MiB | 1604.0 MiB |
| 60 s after scan: docker / anon / RSS | 766.7 MiB / 70.7 MiB / 136.3 MiB | 93.4 MiB / 25.3 MiB / 41.1 MiB |
| CPU time used by initial scan (user+sys) | 395.15 s (391.35-400.63) | 8.35 s (8.25-8.44) |
| Data dir after initial scan | 18.9 MiB | 16.8 MiB |
| End of run (after API + web tests): docker / anon | 317.7 MiB / 232.8 MiB | 107.5 MiB / 36.4 MiB |

- Audiobookshelf data dir breakdown (last initial run): `./config` 14.8 MiB, `./metadata` 4.0 MiB. Largest top-level files: `./config/absdatabase.sqlite` 14.7 MiB. 1016 files in all.
- AudioSilo data dir breakdown (last initial run): `./cache` 0.0 MiB. Largest top-level files: `./audiosilo.db` 12.3 MiB, `./audiosilo.db-wal` 4.5 MiB, `./audiosilo.db-shm` 0.0 MiB, `./config.yaml` 0.0 MiB. 4 files in all.

## Scanning

| | Audiobookshelf | AudioSilo |
|---|---|---|
| Initial full scan, wall (median, min-max) | 135.16 s (133.14-136.02) | 4.98 s (4.97-5.01) |
| Initial full scan, app-reported | 134.95 s (132.94-135.84) | 4.85 s (4.79-4.88) |
| Books found | 998, 998, 998 | 1000, 1000, 1000 |
| No-change rescan, cold cache: wall | 3.04 s (2.98-3.16) | 0.52 s (0.52-0.53) |
| No-change rescan, cold cache: CPU | 1.85 s (1.69-2.03) | 0.52 s (0.52-0.52) |
| No-change rescan, warm cache: wall | 2.36 s (2.35-2.41) | 0.53 s (0.53-0.53) |
| No-change rescan, warm cache: CPU | 1.63 s (1.61-1.67) | 0.47 s (0.47-0.47) |
| Cold start to first authenticated library response | 4.83 s (4.53-4.99) | 3.41 s (3.35-3.41) |

- Audiobookshelf completion signal: GET /api/libraries/:id lastScan changes (set when LibraryScanner finishes) and no 'library-scan' task left in GET /api/tasks; app-reported = log timestamps of '[LibraryScanner] Starting ... library scan' -> 'Library scan ... completed in'.
- AudioSilo completion signal: GET /api/v1/admin/scan-runs: the new run has finished_at and a final status; app-reported = finished_at - started_at of that run (server clock).
- ABS initial scans ran as `(forced)`: [True, True, True] (ABS forces the first scan of a new library because its metadata precedence was never recorded; this is its out-of-box behaviour).
- AudioSilo queues a no-change scan of every library on each start (pkg/launcher); runs recorded after the cold starts: ok 1000 books, ok 1000 books, ok 1000 books. ABS does not scan on start.
- Item sanity (by library-relative folder): ABS 998, AudioSilo 1000, in both 998. Only in ABS: []. Only in AudioSilo: ['Charles Dickens/Seven Poor Travellers', 'Friedrich Nietzsche/Antichrist'].

## API latency from the Mac over the LAN

Sequential requests over one keep-alive connection (first-byte requests open a fresh connection each), request starts spaced at least 25 ms apart (AudioSilo limits each client IP to about 50 API requests/s; the spacing is applied to both apps and is never inside a timed sample). p50 / p95 / max in ms; size is the decoded body (wire size with gzip in the JSON files); for the two-step play flows it is the first step's body plus the 1 audio byte.

| Request | Audiobookshelf p50 / p95 / max | Audiobookshelf bytes | AudioSilo p50 / p95 / max | AudioSilo bytes |
|---|---|---|---|---|
| cover_first_request | 63.36 / 68.51 / 445.26 | 18284 | 6.19 / 7.08 / 8.28 | 11044 |
| home_shelves | 2.09 / 2.57 / 3.08 | 28499 (shelves=4, entities=32) | 1.47 / 1.78 / 2.12 | 22760 (books=48) |
| home_library_filterdata | 2.1 / 2.56 / 2.8 | 45060 | n/a |  |
| libraries | 1.64 / 2.1 / 2.66 | 872 (libraries=1) | 1.26 / 1.55 / 5.14 | 118 (libraries=1) |
| library_page1 | 2.11 / 2.52 / 3.12 | 42987 (results=36, total=998) | 1.31 / 1.59 / 1.72 | 79351 (books=200) |
| library_deep_page | 1.98 / 2.7 / 3.59 | 41324 (results=36, total=998) | 1.28 / 1.67 / 3.35 | 79631 (books=200) |
| search_the | 1.97 / 2.39 / 2.58 | 129076 (book=12, authors=11) | 1.41 / 1.7 / 2.4 | 23747 (books=50) |
| search_the_typeahead | 1.78 / 2.17 / 2.81 | 45615 (book=3, authors=3) | n/a |  |
| search_dickens | 1.69 / 2.07 / 2.39 | 305 (authors=1) | 1.37 / 1.63 / 8.13 | 4476 (books=10) |
| search_title | 1.81 / 2.19 / 2.48 | 26572 (book=1) | 1.29 / 1.78 / 3.77 | 457 (books=1) |
| search_dickens_then_author_page | 13.2 / 15.45 / 17.55 | 10459 (libraryItems=9) | n/a |  |
| search_dickens_typeahead | 1.73 / 2.13 / 2.43 | 305 (authors=1) | n/a |  |
| detail_mp3 | 8.94 / 10.03 / 18.07 | 52772 (audioFiles=20, chapters=20) | 1.66 / 2.11 / 2.78 | 8616 (files=20, chapters=20) |
| detail_m4b | 7.82 / 9.14 / 12.17 | 7127 (audioFiles=1, chapters=12) | 1.62 / 2.07 / 2.53 | 3107 (files=1, chapters=12) |
| play_first_byte_mp3 | 14.79 / 16.96 / 22.51 | 77567 (audioTracks=20, chapters=20) | 5.13 / 6.01 / 6.88 | 19 |
| play_first_byte_m4b | 13.52 / 14.77 / 16.89 | 11443 (audioTracks=1, chapters=12) | 5.13 / 6.0 / 11.41 | 19 |
| cover_grid | 2.05 / 2.48 / 3.03 | 10332 | 2.64 / 3.1 / 3.26 | 7548 |
| home_progress | n/a |  | 1.34 / 1.61 / 2.08 | 18 |
| home_stats | n/a |  | 2.05 / 2.32 / 2.55 | 1827 |
| home_listening | n/a |  | 1.64 / 1.95 / 2.71 | 12924 |
| home_favourites | n/a |  | 1.42 / 1.66 / 2.74 | 20 |
| server_info | n/a |  | 1.21 / 1.55 / 1.58 | 790 |
| library_all_pages | n/a |  | 6.52 / 7.74 / 8.77 | 395805 (books=1000) |
| detail_mp3_chapters | n/a |  | 1.74 / 2.09 / 7.37 | 8341 (files=20, chapters=20) |
| detail_m4b_chapters | n/a |  | 1.6 / 1.9 / 2.95 | 2814 (files=1, chapters=12) |
| **concurrency, steady load: library page 1** | 40.0 ok req/s, p50 2.08 / p95 2.69 ms | 20 clients x 20 s, 40.0 req/s offered, status {'200': 800} | 40.0 ok req/s, p50 1.36 / p95 1.82 ms | 20 clients x 20 s, 40.0 req/s offered, status {'200': 800} |
| **concurrency, saturating: library page 1** | 1682.8 ok req/s, p50 9.58 / p95 19.85 ms | 20 clients x 20 s, back to back, status {'200': 33656} | 14608.2 ok req/s, p50 0.57 / p95 0.8 ms | 20 clients x 20 s, back to back, status {'200': 292165} |

Exact requests (tokens elided):

**Audiobookshelf** (base http://192.168.0.10:13399, page size 36, total 998):

- `home_shelves`: GET /audiobookshelf/api/libraries/491e87e2-44d2-41ab-aa23-a4a4021f3d97/personalized?include=rssfeed,numEpisodesIncomplete,share
- `home_library_filterdata`: GET /audiobookshelf/api/libraries/491e87e2-44d2-41ab-aa23-a4a4021f3d97?include=filterdata
- `libraries`: GET /audiobookshelf/api/libraries
- `library_page1`: GET /audiobookshelf/api/libraries/491e87e2-44d2-41ab-aa23-a4a4021f3d97/items?sort=media.metadata.title&desc=0&limit=36&page=0&minified=1&include=rssfeed,numEpisodesIncomplete,share
- `library_deep_page`: GET /audiobookshelf/api/libraries/491e87e2-44d2-41ab-aa23-a4a4021f3d97/items?sort=media.metadata.title&desc=0&limit=36&page=13&minified=1&include=rssfeed,numEpisodesIncomplete,share
- `search_the`: GET /audiobookshelf/api/libraries/:id/search?q=the (search results page; server default limit 12)
- `search_the_typeahead`: GET /audiobookshelf/api/libraries/491e87e2-44d2-41ab-aa23-a4a4021f3d97/search?q=the&limit=3
- `search_dickens`: GET /audiobookshelf/api/libraries/:id/search?q=dickens (ABS matches book titles, not authors: the answer is the author entry, 'Charles Dickens', with its book count)
- `search_title`: GET /audiobookshelf/api/libraries/491e87e2-44d2-41ab-aa23-a4a4021f3d97/search?q=bleak%20house
- `search_dickens_then_author_page`: search?q=dickens, then the author page the result opens: GET /audiobookshelf/api/authors/:id?include=items,series (sequential sum; this is where ABS lists the author's books)
- `search_dickens_typeahead`: GET /audiobookshelf/api/libraries/491e87e2-44d2-41ab-aa23-a4a4021f3d97/search?q=dickens&limit=3
- `detail_mp3`: GET /audiobookshelf/api/items/780e9a9f-9806-405c-a519-b22ff2a6ee9a?expanded=1&include=downloads,rssfeed,share
- `detail_m4b`: GET /audiobookshelf/api/items/1c1b4e40-1d70-4e58-8067-8cbda7bff17d?expanded=1&include=downloads,rssfeed,share
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
| home_shelves | 1.27 / 1.51 / 1.84 | 28499 (shelves=4, entities=32) | 0.88 / 1.07 / 1.34 | 22760 (books=48) |
| home_library_filterdata | 1.37 / 1.82 / 1.88 | 45060 | n/a |  |
| libraries | 1.21 / 1.36 / 1.49 | 872 (libraries=1) | 0.83 / 0.95 / 1.14 | 118 (libraries=1) |
| library_page1 | 1.35 / 1.62 / 2.17 | 42987 (results=36, total=998) | 0.69 / 0.82 / 0.86 | 79351 (books=200) |
| library_deep_page | 1.31 / 1.45 / 1.58 | 41324 (results=36, total=998) | 0.69 / 0.79 / 0.89 | 79631 (books=200) |
| search_the | 1.53 / 1.98 / 2.38 | 129076 (book=12, authors=11) | 0.9 / 1.03 / 1.09 | 23747 (books=50) |
| search_the_typeahead | 1.33 / 1.59 / 1.72 | 45615 (book=3, authors=3) | n/a |  |
| search_dickens | 1.2 / 1.44 / 1.74 | 305 (authors=1) | 0.88 / 1.01 / 1.15 | 4476 (books=10) |
| search_title | 1.3 / 1.48 / 1.63 | 26572 (book=1) | 0.92 / 1.07 / 1.26 | 457 (books=1) |
| search_dickens_then_author_page | 11.93 / 13.1 / 15.77 | 10459 (libraryItems=9) | n/a |  |
| search_dickens_typeahead | 1.34 / 1.58 / 1.76 | 305 (authors=1) | n/a |  |
| detail_mp3 | 8.25 / 9.21 / 15.39 | 52772 (audioFiles=20, chapters=20) | 1.25 / 1.43 / 2.45 | 8616 (files=20, chapters=20) |
| detail_m4b | 7.43 / 8.31 / 9.76 | 7127 (audioFiles=1, chapters=12) | 1.17 / 1.33 / 1.48 | 3107 (files=1, chapters=12) |
| play_first_byte_mp3 | 12.07 / 14.32 / 16.25 | 77564 (audioTracks=20, chapters=20) | 2.89 / 3.34 / 3.59 | 19 |
| play_first_byte_m4b | 10.97 / 12.18 / 13.82 | 11440 (audioTracks=1, chapters=12) | 2.95 / 3.36 / 3.57 | 19 |
| cover_grid | 1.52 / 1.83 / 1.96 | 10332 | 2.2 / 2.48 / 2.6 | 7548 |
| home_progress | n/a |  | 0.89 / 1.04 / 1.12 | 18 |
| home_stats | n/a |  | 1.55 / 1.8 / 2.21 | 1827 |
| home_listening | n/a |  | 1.05 / 1.31 / 1.7 | 12924 |
| home_favourites | n/a |  | 0.98 / 1.12 / 1.39 | 20 |
| server_info | n/a |  | 0.66 / 0.75 / 0.78 | 790 |
| library_all_pages | n/a |  | 3.45 / 3.77 / 4.51 | 395805 (books=1000) |
| detail_mp3_chapters | n/a |  | 1.27 / 1.53 / 3.73 | 8341 (files=20, chapters=20) |
| detail_m4b_chapters | n/a |  | 1.16 / 1.32 / 1.4 | 2814 (files=1, chapters=12) |
| **concurrency, steady load: library page 1** | 40.0 ok req/s, p50 1.42 / p95 1.73 ms | 20 clients x 20 s, 40.0 req/s offered, status {'200': 800} | 40.0 ok req/s, p50 0.78 / p95 0.96 ms | 20 clients x 20 s, 40.0 req/s offered, status {'200': 800} |
| **concurrency, saturating: library page 1** | 1504.5 ok req/s, p50 11.26 / p95 22.84 ms | 20 clients x 20 s, back to back, status {'200': 30090} | 2488.9 ok req/s, p50 2.93 / p95 9.12 ms | 20 clients x 20 s, back to back, status {'200': 49779} |

## Web UI (Playwright Chromium, 1440x900, DPR 1, from the Mac)

Medians of the runs. Times in ms from navigation start. `first cover`: first cover image inside the viewport fully loaded; `screen`: last cover inside the viewport loaded (all visible loaded, then stable 1.5 s). Bytes are transferred (compressed) bytes; cache hits count 0.

| Page | Cache | Audiobookshelf first cover / screen / LCP | Audiobookshelf req / KiB / JS KiB | AudioSilo first cover / screen / LCP | AudioSilo req / KiB / JS KiB |
|---|---|---|---|---|---|
| home | cold | 206 / 212 / 225.0 | 58 / 4129 / 2643 | 179 / 194 / 225.0 | 56 / 1943 / 1306 |
| home | warm | 194 / 194 / 213.0 | 58 / 13 / 8 | 180 / 192 / 197 | 56 / 12 / 0 |
| grid | cold | 223 / 240 / 565.0 | 72 / 4150 / 2643 | 190 / 203 / 232.0 | 78 / 2246 / 1300 |
| grid | warm | 222 / 222 / 548.0 | 72 / 13 / 8 | 186 / 186 / 217.0 | 78 / 107 / 0 |

- Audiobookshelf: grid URL `/audiobookshelf/library/491e87e2-44d2-41ab-aa23-a4a4021f3d97/bookshelf` (ended at `audiobookshelf/library/491e87e2-44d2-41ab-aa23-a4a4021f3d97/bookshelf?sort=media.metadata.title&desc=0`), 18 covers in view; home `/audiobookshelf/library/491e87e2-44d2-41ab-aa23-a4a4021f3d97`, 14 covers in view. Screenshots: abs-admin-issues-cold.png, abs-admin-issues-warm.png, abs-grid-cold.png, abs-grid-warm.png, abs-home-cold.png, abs-home-warm.png. External requests blocked: ['https://api.github.com/repos/advplyr/audiobookshelf/releases']. Failed same-origin requests: none.
- AudioSilo: grid URL `/web/library` (ended at `web/library`), 15 covers in view; home `/web/`, 14 covers in view. Screenshots: as-admin-issues-cold.png, as-admin-issues-warm.png, as-admin-system-cold.png, as-admin-system-warm.png, as-grid-cold.png, as-grid-warm.png, as-home-cold.png, as-home-warm.png. External requests blocked: none. Failed same-origin requests: none.

## Admin health page

AudioSilo: the admin console's Health section, Issues (the default tab) and System. Audiobookshelf has no health or system-status page; its nearest equivalent to Issues is the bookshelf filtered to `issues` (items it marked missing or invalid; the sidebar shows the link only when there are any). It has nothing comparable to System, so that row is n/a.

Browser: Playwright Chromium from the Mac, medians of the runs, ms from navigation start. `ready`: the page's data has rendered (its text shows the result) and no API request is in flight; `last API`: end of the last API response.

| Page | Cache | Audiobookshelf ready / last API ms | Audiobookshelf API req / KiB | AudioSilo ready / last API ms | AudioSilo API req / KiB |
|---|---|---|---|---|---|
| issues | cold | 186 / 176 | 5 / 3549 | 145 / 145 | 8 / 602 |
| issues | warm | 185 / 174 | 5 / 13 | 139 / 139 | 8 / 92 |
| system | cold | n/a |  | 114 / 99 | 6 / 464 |
| system | warm | n/a |  | 110 / 95 | 6 / 5 |

- Audiobookshelf issues (`/audiobookshelf/library/491e87e2-44d2-41ab-aa23-a4a4021f3d97/bookshelf?filter=issues`), API requests on the first cold load: POST /audiobookshelf/api/authorize (2 ms, 2353 B); GET /audiobookshelf/api/libraries/491e87e2-44d2-41ab-aa23-a4a4021f3d97?include=filterdata (2 ms, 45356 B); GET /audiobookshelf/api/libraries (2 ms, 1165 B); GET /audiobookshelf/api/tasks?include=queue (2 ms, 341 B); GET /audiobookshelf/api/libraries/491e87e2-44d2-41ab-aa23-a4a4021f3d97/items?filter=issues&sort=media.metadata.title&desc=0&limit=36&page=0&minified=1&include=rssfeed,numEpisodesIncomplete,share (14 ms, 522 B).
- AudioSilo issues (`/admin/health`), API requests on the first cold load: GET /api/v1/me (2 ms, 466 B); GET /api/v1/admin/setup (2 ms, 462 B); GET /api/v1/server (1 ms, 1064 B); GET /api/v1/admin/libraries (3 ms, 598 B); GET /api/v1/admin/events?limit=20 (1 ms, 719 B); GET /api/v1/admin/issues (22 ms, 935 B); GET /api/v1/admin/books?issue=scan_error&sort=added&order=desc&limit=50 (5 ms, 989 B); POST /api/v1/admin/covers (11 ms, 87955 B); POST /api/v1/admin/covers (3 ms, 17721 B).
- AudioSilo system (`/admin/health/system`), API requests on the first cold load: GET /api/v1/me (1 ms, 466 B); GET /api/v1/admin/setup (2 ms, 462 B); GET /api/v1/server (1 ms, 1064 B); GET /api/v1/admin/libraries (1 ms, 598 B); GET /api/v1/admin/events?limit=20 (1 ms, 719 B); GET /api/v1/admin/system (289 ms, 981 B).

API replay (same method as the latency tables: 5 warm-up + timed requests, paced):

| Request | Audiobookshelf p50 / p95 / max | Audiobookshelf bytes | AudioSilo p50 / p95 / max | AudioSilo bytes |
|---|---|---|---|---|
| admin_issues | 1.36 / 1.55 / 1.71 | 195 (results=0, total=0) | 1.38 / 1.72 / 2.81 | 1589 (categories=10, categories.[].count=1009) |
| admin_issue_books | n/a |  | 1.13 / 1.39 / 1.44 | 1935 (books=2) |
| admin_system | n/a |  | 1.62 / 1.99 / 2.71 | 1241 |

- Audiobookshelf `admin_issues`: GET items?filter=issues (the bookshelf's issues filter: items missing or invalid on disk)
- AudioSilo `admin_issues`: GET /api/v1/admin/issues (every issue category with its count and sample covers)
- AudioSilo `admin_issue_books`: GET /api/v1/admin/books?issue=scan_error... (the open category's queue)
- AudioSilo `admin_system`: GET /api/v1/admin/system (ffmpeg, ffprobe, community metadata reachability, TLS, database, backups, library folders)

