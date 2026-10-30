# ABS vs AudioSilo benchmark: v251-5000

Run 2026-10-30T06:33:56+0000 to 2026-10-30T07:24:44+0000, total 3017.0 s. Library `/mnt/user/librivox/tier-5000` at start: 4949 book folders, 67497 MP3 + 2290 M4B files, 799.18 GiB; at end: 4949 folders.

Host: Intel(R) Core(TM) i3-N305, 8 CPUs, 16150928 kB RAM, kernel 6.1.106-Unraid, Docker 24.0.9. Load average at start 0.58/1.11/1.07, at end 1.17. Other containers running on the host (idle, untouched): 19.

- Library on disk during the Audiobookshelf run: 4949 folders before, 4949 after.
- Library on disk during the AudioSilo run: 4949 folders before, 4949 after.

Settings (scan,rescan,startup,latency,web,admin): initial scans x1 (fresh data each), no-change rescans x3 cold + x3 warm, cold starts x3, API 5 warm-up + 100 timed requests each, concurrency 20 clients x 20 s, web UI 5 runs per page and cache state. AudioSilo metadata setting: default.

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
| Idle, empty library: docker / anon / RSS | 63.7 MiB / 51.4 MiB / 118.6 MiB | 22.2 MiB / 13.6 MiB / 29.2 MiB |
| Idle timeline, anon at s after setup | 10s 82, 30s 82, 60s 83, 120s 51 MiB | 10s 12, 30s 12, 60s 14, 120s 14 MiB |
| Peak during initial scan: anon (sampled) | 598.7 MiB | 112.5 MiB |
| Peak during initial scan: docker (sampled) | 1795.4 MiB | 349.5 MiB |
| memory.peak since container start (incl. page cache) | 4923.4 MiB | 3744.8 MiB |
| 60 s after scan: docker / anon / RSS | 1493.9 MiB / 311.9 MiB / 349.5 MiB | 291.3 MiB / 30.4 MiB / 43.8 MiB |
| CPU time used by initial scan (user+sys) | 6351.95 s | 79.76 s |
| Data dir after initial scan | 147.0 MiB | 65.9 MiB |
| End of run (after API + web tests): docker / anon | 899.1 MiB / 612.0 MiB | 236.2 MiB / 41.5 MiB |

- Audiobookshelf data dir breakdown (last initial run): `./config` 128.0 MiB, `./metadata` 19.0 MiB. Largest top-level files: `./config/absdatabase.sqlite` 127.9 MiB. 4965 files in all.
- AudioSilo data dir breakdown (last initial run): `./cache` 0.0 MiB. Largest top-level files: `./audiosilo.db` 61.3 MiB, `./audiosilo.db-wal` 4.6 MiB, `./audiosilo.db-shm` 0.0 MiB, `./config.yaml` 0.0 MiB. 4 files in all.

## Scanning

| | Audiobookshelf | AudioSilo |
|---|---|---|
| Initial full scan, wall (median, min-max) | 1348.45 s | 39.87 s |
| Initial full scan, app-reported | 1348.19 s | 39.66 s |
| Books found | 4947 | 4949 |
| No-change rescan, cold cache: wall | 21.88 s (21.69-21.90) | 3.64 s (3.63-3.65) |
| No-change rescan, cold cache: CPU | 13.38 s (13.01-14.82) | 4.38 s (4.34-4.39) |
| No-change rescan, warm cache: wall | 19.11 s (18.91-19.27) | 2.60 s (2.60-2.85) |
| No-change rescan, warm cache: CPU | 12.38 s (12.03-12.54) | 3.80 s (3.80-3.80) |
| Cold start to first authenticated library response | 6.02 s (5.95-6.57) | 3.91 s (3.77-3.98) |

- Audiobookshelf completion signal: GET /api/libraries/:id lastScan changes (set when LibraryScanner finishes) and no 'library-scan' task left in GET /api/tasks; app-reported = log timestamps of '[LibraryScanner] Starting ... library scan' -> 'Library scan ... completed in'.
- AudioSilo completion signal: GET /api/v1/admin/scan-runs: the new run has finished_at and a final status; app-reported = finished_at - started_at of that run (server clock).
- ABS initial scans ran as `(forced)`: [True] (ABS forces the first scan of a new library because its metadata precedence was never recorded; this is its out-of-box behaviour).
- AudioSilo queues a no-change scan of every library on each start (pkg/launcher); runs recorded after the cold starts: ok 4949 books, ok 4949 books, ok 4949 books. ABS does not scan on start.
- Item sanity (by library-relative folder): ABS 4947, AudioSilo 4949, in both 4947. Only in ABS: []. Only in AudioSilo: ['Charles Dickens/Seven Poor Travellers', 'Friedrich Nietzsche/Antichrist'].

## API latency from the Mac over the LAN

Sequential requests over one keep-alive connection (first-byte requests open a fresh connection each), request starts spaced at least 25 ms apart (AudioSilo limits each client IP to about 50 API requests/s; the spacing is applied to both apps and is never inside a timed sample). p50 / p95 / max in ms; size is the decoded body (wire size with gzip in the JSON files); for the two-step play flows it is the first step's body plus the 1 audio byte.

| Request | Audiobookshelf p50 / p95 / max | Audiobookshelf bytes | AudioSilo p50 / p95 / max | AudioSilo bytes |
|---|---|---|---|---|
| cover_first_request | 63.47 / 68.08 / 374.82 | 13784 | 5.71 / 6.53 / 9.51 | 9075 |
| home_shelves | 2.13 / 2.71 / 2.99 | 31846 (shelves=4, entities=34) | 1.45 / 1.78 / 2.85 | 23051 (books=48) |
| home_library_filterdata | 2.32 / 2.78 / 3.03 | 170927 | n/a |  |
| libraries | 1.74 / 2.25 / 48.12 | 872 (libraries=1) | 1.3 / 1.7 / 2.91 | 118 (libraries=1) |
| library_page1 | 2.07 / 2.55 / 3.79 | 42411 (results=36, total=4947) | 1.31 / 1.76 / 1.9 | 80492 (books=200) |
| library_deep_page | 1.99 / 3.01 / 8.1 | 41861 (results=36, total=4947) | 1.39 / 1.65 / 1.67 | 80665 (books=200) |
| search_the | 2.97 / 4.23 / 10.09 | 834151 (book=12, authors=12, genres=1) | 1.46 / 1.87 / 2.68 | 23498 (books=50) |
| search_the_typeahead | 2.13 / 2.54 / 6.27 | 259254 (book=3, authors=3, genres=1) | n/a |  |
| search_dickens | 2.31 / 3.55 / 5.93 | 290935 (book=8, authors=2) | 1.31 / 1.7 / 2.03 | 19549 (books=41) |
| search_title | 1.85 / 2.3 / 3.98 | 26572 (book=1) | 1.39 / 1.72 / 2.26 | 458 (books=1) |
| search_dickens_then_author_page | 26.22 / 29.84 / 32.97 | 335641 (libraryItems=38) | n/a |  |
| search_dickens_typeahead | 1.97 / 2.29 / 2.47 | 130641 (book=3, authors=2) | n/a |  |
| detail_mp3 | 15.26 / 17.18 / 26.26 | 62777 (audioFiles=20, chapters=20) | 1.81 / 2.13 / 2.32 | 9153 (files=20, chapters=20) |
| detail_m4b | 14.39 / 15.86 / 20.06 | 11628 (audioFiles=1, chapters=27) | 1.78 / 2.09 / 2.3 | 7083 (files=1, chapters=27) |
| play_first_byte_mp3 | 21.23 / 24.07 / 28.92 | 92527 (audioTracks=20, chapters=20) | 5.17 / 6.23 / 8.39 | 19 |
| play_first_byte_m4b | 19.8 / 22.9 / 26.24 | 18880 (audioTracks=1, chapters=27) | 5.17 / 6.29 / 6.76 | 19 |
| cover_grid | 2.08 / 2.51 / 2.98 | 17908 | 2.77 / 3.23 / 3.41 | 10915 |
| home_progress | n/a |  | 1.27 / 1.64 / 1.74 | 18 |
| home_stats | n/a |  | 2.05 / 2.4 / 2.77 | 1827 |
| home_listening | n/a |  | 1.59 / 1.94 / 2.1 | 12924 |
| home_favourites | n/a |  | 1.46 / 1.77 / 1.94 | 20 |
| server_info | n/a |  | 1.1 / 1.45 / 1.74 | 790 |
| library_all_pages | n/a |  | 33.18 / 37.19 / 42.52 | 1985663 (books=4949) |
| detail_mp3_chapters | n/a |  | 1.76 / 2.07 / 2.14 | 8860 (files=20, chapters=20) |
| detail_m4b_chapters | n/a |  | 1.78 / 2.18 / 2.42 | 6827 (files=1, chapters=27) |
| **concurrency, steady load: library page 1** | 40.0 ok req/s, p50 2.01 / p95 2.52 ms | 20 clients x 20 s, 40.0 req/s offered, status {'200': 800} | 40.0 ok req/s, p50 1.37 / p95 2.0 ms | 20 clients x 20 s, 40.0 req/s offered, status {'200': 800} |
| **concurrency, saturating: library page 1** | 1941.0 ok req/s, p50 8.75 / p95 17.73 ms | 20 clients x 20 s, back to back, status {'200': 38821} | 14570.6 ok req/s, p50 0.56 / p95 0.8 ms | 20 clients x 20 s, back to back, status {'200': 291413} |

Exact requests (tokens elided):

**Audiobookshelf** (base http://192.168.0.10:13399, page size 36, total 4947):

- `home_shelves`: GET /audiobookshelf/api/libraries/ec01579e-972a-4b6d-873b-0ac97f9935ac/personalized?include=rssfeed,numEpisodesIncomplete,share
- `home_library_filterdata`: GET /audiobookshelf/api/libraries/ec01579e-972a-4b6d-873b-0ac97f9935ac?include=filterdata
- `libraries`: GET /audiobookshelf/api/libraries
- `library_page1`: GET /audiobookshelf/api/libraries/ec01579e-972a-4b6d-873b-0ac97f9935ac/items?sort=media.metadata.title&desc=0&limit=36&page=0&minified=1&include=rssfeed,numEpisodesIncomplete,share
- `library_deep_page`: GET /audiobookshelf/api/libraries/ec01579e-972a-4b6d-873b-0ac97f9935ac/items?sort=media.metadata.title&desc=0&limit=36&page=68&minified=1&include=rssfeed,numEpisodesIncomplete,share
- `search_the`: GET /audiobookshelf/api/libraries/:id/search?q=the (search results page; server default limit 12)
- `search_the_typeahead`: GET /audiobookshelf/api/libraries/ec01579e-972a-4b6d-873b-0ac97f9935ac/search?q=the&limit=3
- `search_dickens`: GET /audiobookshelf/api/libraries/:id/search?q=dickens (ABS matches book titles, not authors: the answer is the author entry, 'Charles Dickens', with its book count)
- `search_title`: GET /audiobookshelf/api/libraries/ec01579e-972a-4b6d-873b-0ac97f9935ac/search?q=bleak%20house
- `search_dickens_then_author_page`: search?q=dickens, then the author page the result opens: GET /audiobookshelf/api/authors/:id?include=items,series (sequential sum; this is where ABS lists the author's books)
- `search_dickens_typeahead`: GET /audiobookshelf/api/libraries/ec01579e-972a-4b6d-873b-0ac97f9935ac/search?q=dickens&limit=3
- `detail_mp3`: GET /audiobookshelf/api/items/6e9dd98b-b6d3-4abc-9f26-c37f95ee85d7?expanded=1&include=downloads,rssfeed,share
- `detail_m4b`: GET /audiobookshelf/api/items/d98344a1-7f1d-4e81-8670-f6f7e0962bfd?expanded=1&include=downloads,rssfeed,share
- `play_first_byte_mp3`: POST /audiobookshelf/api/items/:id/play (direct play) then GET /audiobookshelf/public/session/:sid/track/:index Range: bytes=0- (first body byte)
- `play_first_byte_m4b`: as play_first_byte_mp3, M4B book
- `cover_grid`: GET /audiobookshelf/api/items/:id/cover?ts=<updatedAt> (no auth; server sends 400px webp)

**AudioSilo** (base http://192.168.0.10:8199, page size 200, total 4949):

- `home_shelves`: GET /api/v1/books/recent?limit=48 (the Recently added shelf; the home screen also fires the requests below in parallel)
- `home_progress`: GET /api/v1/me/progress
- `home_stats`: GET /api/v1/me/stats?range=30d
- `home_listening`: GET /api/v1/me/listening?range=1y
- `home_favourites`: GET /api/v1/me/favourites
- `libraries`: GET /api/v1/libraries
- `server_info`: GET /api/v1/server
- `library_page1`: GET /api/v1/libraries/1/books?sort=recent&limit=200
- `library_deep_page`: GET /api/v1/libraries/:id/books?sort=recent&limit=200&cursor=<cursor of page 12> (keyset pagination)
- `library_all_pages`: the grid's full load: 25 sequential cursor pages of 200 (the web player loads the whole library and sorts in the browser)
- `search_the`: GET /api/v1/search?q=the&limit=50
- `search_dickens`: GET /api/v1/search?q=dickens&limit=50 (full-text over title, author, narrator, series: the answer is the author's books)
- `search_title`: GET /api/v1/search?q=bleak+house&limit=50
- `detail_mp3`: GET /api/v1/libraries/:id/item?path=<book> (the book page fires /chapters, /progress, /bookmarks, /notes, /rating alongside)
- `detail_mp3_chapters`: GET /api/v1/libraries/1/chapters?path=Abner+Doubleday%2FChancellorsville+and+Gettysburg
- `detail_m4b`: GET /api/v1/libraries/1/item?path=Karl+Wilson+Gehrkens%2FMusic+Notation+and+Terminology
- `detail_m4b_chapters`: GET /api/v1/libraries/1/chapters?path=Karl+Wilson+Gehrkens%2FMusic+Notation+and+Terminology
- `play_first_byte_mp3`: GET /api/v1/libraries/:id/progress?path=<book> then GET /api/v1/libraries/:id/stream?path=<first file>&token= Range: bytes=0- (first body byte)
- `play_first_byte_m4b`: as play_first_byte_mp3, M4B book
- `cover_grid`: GET /api/v1/libraries/:id/cover?path=<book>&size=320&v=<cover_version>&token=<token> (grid tile at DPR 1)

## API latency from the host (loopback, python:3-alpine)

Sequential requests over one keep-alive connection (first-byte requests open a fresh connection each), request starts spaced at least 25 ms apart (AudioSilo limits each client IP to about 50 API requests/s; the spacing is applied to both apps and is never inside a timed sample). p50 / p95 / max in ms; size is the decoded body (wire size with gzip in the JSON files); for the two-step play flows it is the first step's body plus the 1 audio byte.

| Request | Audiobookshelf p50 / p95 / max | Audiobookshelf bytes | AudioSilo p50 / p95 / max | AudioSilo bytes |
|---|---|---|---|---|
| home_shelves | 1.25 / 1.46 / 1.59 | 31846 (shelves=4, entities=34) | 0.9 / 1.07 / 1.13 | 23051 (books=48) |
| home_library_filterdata | 1.67 / 1.94 / 2.26 | 170927 | n/a |  |
| libraries | 1.1 / 1.31 / 1.57 | 872 (libraries=1) | 0.79 / 0.94 / 1.07 | 118 (libraries=1) |
| library_page1 | 1.26 / 1.43 / 1.69 | 42411 (results=36, total=4947) | 0.7 / 0.81 / 0.86 | 80492 (books=200) |
| library_deep_page | 1.28 / 1.53 / 1.7 | 41861 (results=36, total=4947) | 0.66 / 0.76 / 1.12 | 80665 (books=200) |
| search_the | 2.77 / 3.34 / 4.11 | 834151 (book=12, authors=12, genres=1) | 0.88 / 1.01 / 1.09 | 23498 (books=50) |
| search_the_typeahead | 1.81 / 2.07 / 2.57 | 259254 (book=3, authors=3, genres=1) | n/a |  |
| search_dickens | 1.89 / 2.11 / 8.11 | 290935 (book=8, authors=2) | 0.89 / 1.03 / 1.11 | 19549 (books=41) |
| search_title | 1.24 / 1.51 / 1.73 | 26572 (book=1) | 0.83 / 0.95 / 0.97 | 458 (books=1) |
| search_dickens_then_author_page | 24.82 / 27.83 / 34.39 | 335641 (libraryItems=38) | n/a |  |
| search_dickens_typeahead | 1.52 / 1.92 / 8.21 | 130641 (book=3, authors=2) | n/a |  |
| detail_mp3 | 14.56 / 16.73 / 20.22 | 62777 (audioFiles=20, chapters=20) | 1.24 / 1.43 / 1.89 | 9153 (files=20, chapters=20) |
| detail_m4b | 13.82 / 15.16 / 16.44 | 11628 (audioFiles=1, chapters=27) | 1.19 / 1.36 / 1.5 | 7083 (files=1, chapters=27) |
| play_first_byte_mp3 | 18.63 / 21.53 / 39.82 | 92524 (audioTracks=20, chapters=20) | 2.89 / 3.32 / 3.66 | 19 |
| play_first_byte_m4b | 17.58 / 19.98 / 28.82 | 18877 (audioTracks=1, chapters=27) | 2.93 / 3.31 / 3.48 | 19 |
| cover_grid | 1.51 / 1.86 / 2.53 | 17908 | 1.94 / 2.38 / 2.76 | 10915 |
| home_progress | n/a |  | 0.92 / 1.04 / 1.36 | 18 |
| home_stats | n/a |  | 1.57 / 1.75 / 2.09 | 1827 |
| home_listening | n/a |  | 1.07 / 1.37 / 1.58 | 12924 |
| home_favourites | n/a |  | 1.04 / 1.17 / 1.24 | 20 |
| server_info | n/a |  | 0.67 / 0.77 / 0.83 | 790 |
| library_all_pages | n/a |  | 17.42 / 19.27 / 20.27 | 1985663 (books=4949) |
| detail_mp3_chapters | n/a |  | 1.2 / 1.41 / 1.83 | 8860 (files=20, chapters=20) |
| detail_m4b_chapters | n/a |  | 1.19 / 1.45 / 1.63 | 6827 (files=1, chapters=27) |
| **concurrency, steady load: library page 1** | 40.0 ok req/s, p50 1.36 / p95 1.66 ms | 20 clients x 20 s, 40.0 req/s offered, status {'200': 800} | 40.0 ok req/s, p50 0.76 / p95 0.95 ms | 20 clients x 20 s, 40.0 req/s offered, status {'200': 800} |
| **concurrency, saturating: library page 1** | 1561.4 ok req/s, p50 10.42 / p95 21.89 ms | 20 clients x 20 s, back to back, status {'200': 31228} | 2481.2 ok req/s, p50 2.96 / p95 8.88 ms | 20 clients x 20 s, back to back, status {'200': 49625} |

## Web UI (Playwright Chromium, 1440x900, DPR 1, from the Mac)

Medians of the runs. Times in ms from navigation start. `first cover`: first cover image inside the viewport fully loaded; `screen`: last cover inside the viewport loaded (all visible loaded, then stable 1.5 s). Bytes are transferred (compressed) bytes; cache hits count 0.

| Page | Cache | Audiobookshelf first cover / screen / LCP | Audiobookshelf req / KiB / JS KiB | AudioSilo first cover / screen / LCP | AudioSilo req / KiB / JS KiB |
|---|---|---|---|---|---|
| home | cold | 213 / 231 / 233.0 | 61 / 4296 / 2643 | 181 / 197 / 217.0 | 56 / 1931 / 1306 |
| home | warm | 200 / 200 / 229.0 | 61 / 13 / 8 | 180 / 192 / 197.0 | 56 / 12 / 0 |
| grid | cold | 274 / 286 / 624.0 | 72 / 4283 / 2643 | 191 / 206 / 229.0 | 98 / 2641 / 1300 |
| grid | warm | 268 / 268 / 617 | 72 / 13 / 8 | 187 / 187 / 217 | 98 / 519 / 0 |

- Audiobookshelf: grid URL `/audiobookshelf/library/ec01579e-972a-4b6d-873b-0ac97f9935ac/bookshelf` (ended at `audiobookshelf/library/ec01579e-972a-4b6d-873b-0ac97f9935ac/bookshelf?sort=media.metadata.title&desc=0`), 18 covers in view; home `/audiobookshelf/library/ec01579e-972a-4b6d-873b-0ac97f9935ac`, 14 covers in view. Screenshots: abs-admin-issues-cold.png, abs-admin-issues-warm.png, abs-grid-cold.png, abs-grid-warm.png, abs-home-cold.png, abs-home-warm.png. External requests blocked: ['https://api.github.com/repos/advplyr/audiobookshelf/releases']. Failed same-origin requests: none.
- AudioSilo: grid URL `/web/library` (ended at `web/library`), 15 covers in view; home `/web/`, 14 covers in view. Screenshots: as-admin-issues-cold.png, as-admin-issues-warm.png, as-admin-system-cold.png, as-admin-system-warm.png, as-grid-cold.png, as-grid-warm.png, as-home-cold.png, as-home-warm.png. External requests blocked: none. Failed same-origin requests: none.

## Admin health page

AudioSilo: the admin console's Health section, Issues (the default tab) and System. Audiobookshelf has no health or system-status page; its nearest equivalent to Issues is the bookshelf filtered to `issues` (items it marked missing or invalid; the sidebar shows the link only when there are any). It has nothing comparable to System, so that row is n/a.

Browser: Playwright Chromium from the Mac, medians of the runs, ms from navigation start. `ready`: the page's data has rendered (its text shows the result) and no API request is in flight; `last API`: end of the last API response.

| Page | Cache | Audiobookshelf ready / last API ms | Audiobookshelf API req / KiB | AudioSilo ready / last API ms | AudioSilo API req / KiB |
|---|---|---|---|---|---|
| issues | cold | 191 / 182 | 5 / 3672 | 143 / 143 | 8 / 621 |
| issues | warm | 183 / 173 | 5 / 13 | 137 / 137 | 8 / 111 |
| system | cold | n/a |  | 114 / 99 | 6 / 464 |
| system | warm | n/a |  | 109 / 94 | 6 / 5 |

- Audiobookshelf issues (`/audiobookshelf/library/ec01579e-972a-4b6d-873b-0ac97f9935ac/bookshelf?filter=issues`), API requests on the first cold load: POST /audiobookshelf/api/authorize (3 ms, 2353 B); GET /audiobookshelf/api/libraries/ec01579e-972a-4b6d-873b-0ac97f9935ac?include=filterdata (2 ms, 171225 B); GET /audiobookshelf/api/libraries (2 ms, 1165 B); GET /audiobookshelf/api/tasks?include=queue (2 ms, 341 B); GET /audiobookshelf/api/libraries/ec01579e-972a-4b6d-873b-0ac97f9935ac/items?filter=issues&sort=media.metadata.title&desc=0&limit=36&page=0&minified=1&include=rssfeed,numEpisodesIncomplete,share (20 ms, 522 B).
- AudioSilo issues (`/admin/health`), API requests on the first cold load: GET /api/v1/me (2 ms, 466 B); GET /api/v1/admin/setup (3 ms, 462 B); GET /api/v1/server (2 ms, 1064 B); GET /api/v1/admin/libraries (5 ms, 598 B); GET /api/v1/admin/events?limit=20 (1 ms, 752 B); GET /api/v1/admin/issues (134 ms, 1034 B); GET /api/v1/admin/books?issue=scan_error&sort=added&order=desc&limit=50 (12 ms, 991 B); POST /api/v1/admin/covers (15 ms, 107375 B); POST /api/v1/admin/covers (3 ms, 17721 B).
- AudioSilo system (`/admin/health/system`), API requests on the first cold load: GET /api/v1/me (2 ms, 466 B); GET /api/v1/admin/setup (2 ms, 462 B); GET /api/v1/server (1 ms, 1064 B); GET /api/v1/admin/libraries (2 ms, 598 B); GET /api/v1/admin/events?limit=20 (1 ms, 752 B); GET /api/v1/admin/system (269 ms, 984 B).

API replay (same method as the latency tables: 5 warm-up + timed requests, paced):

| Request | Audiobookshelf p50 / p95 / max | Audiobookshelf bytes | AudioSilo p50 / p95 / max | AudioSilo bytes |
|---|---|---|---|---|
| admin_issues | 1.64 / 2.07 / 2.54 | 195 (results=0, total=0) | 1.74 / 2.08 / 2.79 | 1892 (categories=10, categories.[].count=4972) |
| admin_issue_books | n/a |  | 1.1 / 1.52 / 1.58 | 1935 (books=2) |
| admin_system | n/a |  | 1.94 / 2.22 / 2.54 | 1241 |

- Audiobookshelf `admin_issues`: GET items?filter=issues (the bookshelf's issues filter: items missing or invalid on disk)
- AudioSilo `admin_issues`: GET /api/v1/admin/issues (every issue category with its count and sample covers)
- AudioSilo `admin_issue_books`: GET /api/v1/admin/books?issue=scan_error... (the open category's queue)
- AudioSilo `admin_system`: GET /api/v1/admin/system (ffmpeg, ffprobe, community metadata reachability, TLS, database, backups, library folders)

