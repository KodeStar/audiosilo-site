# ABS vs AudioSilo benchmark: final-5000

Run 2026-10-28T13:19:01+0000 to 2026-10-28T14:23:58+0000, total 3867.0 s. Library `/mnt/user/librivox/tier-5000` at start: 4949 book folders, 67497 MP3 + 2290 M4B files, 799.18 GiB; at end: 4949 folders.

Host: Intel(R) Core(TM) i3-N305, 8 CPUs, 16150928 kB RAM, kernel 6.1.106-Unraid, Docker 24.0.9. Load average at start 0.58/1.56/1.78, at end 1.23. Other containers running on the host (idle, untouched): 18.

- Library on disk during the Audiobookshelf run: 4949 folders before, 4949 after.
- Library on disk during the AudioSilo run: 4949 folders before, 4949 after.

Settings (scan,rescan,startup,latency,web,admin): initial scans x1 (fresh data each), no-change rescans x3 cold + x3 warm, cold starts x3, API 5 warm-up + 100 timed requests each, concurrency 20 clients x 20 s, web UI 5 runs per page and cache state. AudioSilo metadata setting: default.

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
| Idle, empty library: docker / anon / RSS | 63.6 MiB / 51.5 MiB / 118.8 MiB | 20.1 MiB / 14.1 MiB / 29.0 MiB |
| Idle timeline, anon at s after setup | 10s 83, 30s 83, 60s 83, 120s 51 MiB | 10s 12, 30s 12, 60s 14, 120s 14 MiB |
| Peak during initial scan: anon (sampled) | 608.9 MiB | 343.5 MiB |
| Peak during initial scan: docker (sampled) | 1948.6 MiB | 912.8 MiB |
| memory.peak since container start (incl. page cache) | 5243.0 MiB | 2961.2 MiB |
| 60 s after scan: docker / anon / RSS | 1641.2 MiB / 315.1 MiB / 355.4 MiB | 707.2 MiB / 30.6 MiB / 44.1 MiB |
| CPU time used by initial scan (user+sys) | 6280.20 s | 6926.88 s |
| Data dir after initial scan | 147.0 MiB | 65.9 MiB |
| End of run (after API + web tests): docker / anon | 906.0 MiB / 617.6 MiB | 237.7 MiB / 36.7 MiB |

- Audiobookshelf data dir breakdown (last initial run): `./config` 128.0 MiB, `./metadata` 19.0 MiB. Largest top-level files: `./config/absdatabase.sqlite` 127.9 MiB. 4965 files in all.
- AudioSilo data dir breakdown (last initial run): `./cache` 0.0 MiB. Largest top-level files: `./audiosilo.db` 61.5 MiB, `./audiosilo.db-wal` 4.4 MiB, `./audiosilo.db-shm` 0.0 MiB, `./config.yaml` 0.0 MiB. 4 files in all.

## Scanning

| | Audiobookshelf | AudioSilo |
|---|---|---|
| Initial full scan, wall (median, min-max) | 1298.06 s | 971.32 s |
| Initial full scan, app-reported | 1296.64 s | 971.04 s |
| Books found | 4947 | 4949 |
| No-change rescan, cold cache: wall | 21.77 s (21.74-22.21) | 3.37 s (3.09-3.60) |
| No-change rescan, cold cache: CPU | 13.16 s (12.90-14.75) | 3.80 s (3.74-3.82) |
| No-change rescan, warm cache: wall | 20.47 s (20.11-20.52) | 3.48 s (3.48-3.48) |
| No-change rescan, warm cache: CPU | 12.26 s (11.93-12.74) | 3.28 s (3.28-3.29) |
| Cold start to first authenticated library response | 6.11 s (6.02-6.33) | 3.36 s (3.00-3.61) |

- Audiobookshelf completion signal: GET /api/libraries/:id lastScan changes (set when LibraryScanner finishes) and no 'library-scan' task left in GET /api/tasks; app-reported = log timestamps of '[LibraryScanner] Starting ... library scan' -> 'Library scan ... completed in'.
- AudioSilo completion signal: GET /api/v1/admin/scan-runs: the new run has finished_at and a final status; app-reported = finished_at - started_at of that run (server clock).
- ABS initial scans ran as `(forced)`: [True] (ABS forces the first scan of a new library because its metadata precedence was never recorded; this is its out-of-box behaviour).
- AudioSilo queues a no-change scan of every library on each start (pkg/launcher); runs recorded after the cold starts: ok 4949 books, ok 4949 books, ok 4949 books. ABS does not scan on start.
- Item sanity (by library-relative folder): ABS 4947, AudioSilo 4949, in both 4947. Only in ABS: []. Only in AudioSilo: ['Charles Dickens/Seven Poor Travellers', 'Friedrich Nietzsche/Antichrist'].

## API latency from the Mac over the LAN

Sequential requests over one keep-alive connection (first-byte requests open a fresh connection each), request starts spaced at least 25 ms apart (AudioSilo limits each client IP to about 50 API requests/s; the spacing is applied to both apps and is never inside a timed sample). p50 / p95 / max in ms; size is the decoded body (wire size with gzip in the JSON files); for the two-step play flows it is the first step's body plus the 1 audio byte.

| Request | Audiobookshelf p50 / p95 / max | Audiobookshelf bytes | AudioSilo p50 / p95 / max | AudioSilo bytes |
|---|---|---|---|---|
| cover_first_request | 62.29 / 65.39 / 360.94 | 13784 | 5.7 / 7.38 / 9.0 | 9075 |
| home_shelves | 1.61 / 2.01 / 8.54 | 31835 (shelves=4, entities=34) | 1.21 / 1.45 / 1.62 | 23061 (books=48) |
| home_library_filterdata | 1.97 / 2.36 / 2.5 | 170927 | n/a |  |
| libraries | 1.86 / 3.23 / 4.68 | 872 (libraries=1) | 0.99 / 1.17 / 31.23 | 118 (libraries=1) |
| library_page1 | 2.01 / 3.35 / 4.68 | 42411 (results=36, total=4947) | 0.94 / 1.21 / 3.01 | 80512 (books=200) |
| library_deep_page | 2.42 / 5.66 / 9.76 | 41861 (results=36, total=4947) | 0.91 / 1.13 / 31.03 | 80658 (books=200) |
| search_the | 4.11 / 12.0 / 18.37 | 834151 (book=12, authors=12, genres=1) | 1.24 / 1.8 / 2.72 | 23468 (books=50) |
| search_the_typeahead | 2.7 / 7.49 / 29.0 | 259254 (book=3, authors=3, genres=1) | n/a |  |
| search_dickens | 3.26 / 11.58 / 25.75 | 290935 (book=8, authors=2) | 1.1 / 1.68 / 2.13 | 19551 (books=41) |
| search_title | 2.22 / 4.5 / 6.67 | 26572 (book=1) | 1.04 / 1.18 / 3.11 | 458 (books=1) |
| search_dickens_then_author_page | 27.8 / 34.53 / 48.23 | 335641 (libraryItems=38) | n/a |  |
| search_dickens_typeahead | 2.4 / 6.27 / 13.26 | 130641 (book=3, authors=2) | n/a |  |
| detail_mp3 | 15.67 / 19.78 / 27.3 | 62777 (audioFiles=20, chapters=20) | 1.39 / 1.66 / 2.52 | 9153 (files=20, chapters=20) |
| detail_m4b | 15.33 / 18.27 / 21.85 | 11628 (audioFiles=1, chapters=27) | 1.69 / 2.82 / 5.43 | 7083 (files=1, chapters=27) |
| play_first_byte_mp3 | 22.73 / 26.97 / 44.46 | 92530 (audioTracks=20, chapters=20) | 5.3 / 7.22 / 8.96 | 19 |
| play_first_byte_m4b | 20.86 / 24.82 / 36.82 | 18883 (audioTracks=1, chapters=27) | 5.06 / 7.09 / 16.13 | 19 |
| cover_grid | 2.77 / 6.0 / 9.09 | 17908 | 2.47 / 3.14 / 4.77 | 10915 |
| home_progress | n/a |  | 1.14 / 1.34 / 2.82 | 18 |
| home_stats | n/a |  | 1.91 / 2.47 / 12.14 | 1827 |
| home_listening | n/a |  | 1.26 / 1.53 / 5.58 | 12924 |
| home_favourites | n/a |  | 1.22 / 1.36 / 1.42 | 20 |
| server_info | n/a |  | 0.87 / 1.01 / 1.09 | 779 |
| library_all_pages | n/a |  | 28.94 / 34.1 / 78.48 | 1985662 (books=4949) |
| detail_mp3_chapters | n/a |  | 1.6 / 2.56 / 3.89 | 8860 (files=20, chapters=20) |
| detail_m4b_chapters | n/a |  | 1.68 / 3.15 / 4.03 | 6827 (files=1, chapters=27) |
| **concurrency, steady load: library page 1** | 40.0 ok req/s, p50 2.4 / p95 8.87 ms | 20 clients x 20 s, 40.0 req/s offered, status {'200': 800} | 40.0 ok req/s, p50 1.28 / p95 2.0 ms | 20 clients x 20 s, 40.0 req/s offered, status {'200': 800} |
| **concurrency, saturating: library page 1** | 2023.5 ok req/s, p50 8.16 / p95 17.02 ms | 20 clients x 20 s, back to back, status {'200': 40471} | 12130.1 ok req/s, p50 0.9 / p95 1.48 ms | 20 clients x 20 s, back to back, status {'200': 242603} |

Exact requests (tokens elided):

**Audiobookshelf** (base http://192.168.0.10:13399, page size 36, total 4947):

- `home_shelves`: GET /audiobookshelf/api/libraries/d2327b11-80c7-4b0d-8491-6a987bfbedf0/personalized?include=rssfeed,numEpisodesIncomplete,share
- `home_library_filterdata`: GET /audiobookshelf/api/libraries/d2327b11-80c7-4b0d-8491-6a987bfbedf0?include=filterdata
- `libraries`: GET /audiobookshelf/api/libraries
- `library_page1`: GET /audiobookshelf/api/libraries/d2327b11-80c7-4b0d-8491-6a987bfbedf0/items?sort=media.metadata.title&desc=0&limit=36&page=0&minified=1&include=rssfeed,numEpisodesIncomplete,share
- `library_deep_page`: GET /audiobookshelf/api/libraries/d2327b11-80c7-4b0d-8491-6a987bfbedf0/items?sort=media.metadata.title&desc=0&limit=36&page=68&minified=1&include=rssfeed,numEpisodesIncomplete,share
- `search_the`: GET /audiobookshelf/api/libraries/:id/search?q=the (search results page; server default limit 12)
- `search_the_typeahead`: GET /audiobookshelf/api/libraries/d2327b11-80c7-4b0d-8491-6a987bfbedf0/search?q=the&limit=3
- `search_dickens`: GET /audiobookshelf/api/libraries/:id/search?q=dickens (ABS matches book titles, not authors: the answer is the author entry, 'Charles Dickens', with its book count)
- `search_title`: GET /audiobookshelf/api/libraries/d2327b11-80c7-4b0d-8491-6a987bfbedf0/search?q=bleak%20house
- `search_dickens_then_author_page`: search?q=dickens, then the author page the result opens: GET /audiobookshelf/api/authors/:id?include=items,series (sequential sum; this is where ABS lists the author's books)
- `search_dickens_typeahead`: GET /audiobookshelf/api/libraries/d2327b11-80c7-4b0d-8491-6a987bfbedf0/search?q=dickens&limit=3
- `detail_mp3`: GET /audiobookshelf/api/items/0e40add2-1773-4a2e-a7b6-82e702b0fa2a?expanded=1&include=downloads,rssfeed,share
- `detail_m4b`: GET /audiobookshelf/api/items/29eea771-6d7f-46e5-bf5c-95d535bc55ac?expanded=1&include=downloads,rssfeed,share
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
| home_shelves | 1.22 / 1.38 / 1.49 | 31835 (shelves=4, entities=34) | 0.9 / 1.02 / 1.3 | 23061 (books=48) |
| home_library_filterdata | 1.71 / 1.87 / 2.16 | 170927 | n/a |  |
| libraries | 1.17 / 1.33 / 1.38 | 872 (libraries=1) | 0.81 / 0.97 / 1.28 | 118 (libraries=1) |
| library_page1 | 1.31 / 1.52 / 1.85 | 42411 (results=36, total=4947) | 0.82 / 0.98 / 1.12 | 80512 (books=200) |
| library_deep_page | 1.15 / 1.35 / 1.51 | 41861 (results=36, total=4947) | 0.85 / 1.01 / 1.14 | 80658 (books=200) |
| search_the | 2.82 / 3.08 / 4.13 | 834151 (book=12, authors=12, genres=1) | 0.9 / 1.03 / 1.08 | 23468 (books=50) |
| search_the_typeahead | 1.7 / 1.89 / 2.53 | 259254 (book=3, authors=3, genres=1) | n/a |  |
| search_dickens | 1.92 / 2.19 / 2.93 | 290935 (book=8, authors=2) | 0.96 / 1.07 / 1.26 | 19551 (books=41) |
| search_title | 1.27 / 1.4 / 1.46 | 26572 (book=1) | 0.9 / 1.03 / 1.15 | 458 (books=1) |
| search_dickens_then_author_page | 24.82 / 26.78 / 48.42 | 335641 (libraryItems=38) | n/a |  |
| search_dickens_typeahead | 1.49 / 1.7 / 7.94 | 130641 (book=3, authors=2) | n/a |  |
| detail_mp3 | 15.33 / 15.84 / 16.26 | 62777 (audioFiles=20, chapters=20) | 1.16 / 1.36 / 1.52 | 9153 (files=20, chapters=20) |
| detail_m4b | 14.54 / 15.9 / 16.55 | 11628 (audioFiles=1, chapters=27) | 1.14 / 1.28 / 1.46 | 7083 (files=1, chapters=27) |
| play_first_byte_mp3 | 19.12 / 20.52 / 39.64 | 92527 (audioTracks=20, chapters=20) | 2.82 / 3.36 / 3.64 | 19 |
| play_first_byte_m4b | 18.05 / 18.8 / 29.38 | 18880 (audioTracks=1, chapters=27) | 2.88 / 3.34 / 3.64 | 19 |
| cover_grid | 1.4 / 1.7 / 8.69 | 17908 | 2.15 / 2.5 / 2.94 | 10915 |
| home_progress | n/a |  | 0.92 / 1.1 / 1.19 | 18 |
| home_stats | n/a |  | 1.54 / 1.74 / 2.5 | 1827 |
| home_listening | n/a |  | 1.06 / 1.4 / 1.51 | 12924 |
| home_favourites | n/a |  | 1.0 / 1.12 / 1.33 | 20 |
| server_info | n/a |  | 0.72 / 0.8 / 1.16 | 779 |
| library_all_pages | n/a |  | 20.62 / 22.07 / 66.03 | 1985662 (books=4949) |
| detail_mp3_chapters | n/a |  | 1.18 / 1.41 / 1.81 | 8860 (files=20, chapters=20) |
| detail_m4b_chapters | n/a |  | 1.13 / 1.35 / 1.44 | 6827 (files=1, chapters=27) |
| **concurrency, steady load: library page 1** | 40.0 ok req/s, p50 1.31 / p95 1.56 ms | 20 clients x 20 s, 40.0 req/s offered, status {'200': 800} | 40.0 ok req/s, p50 0.85 / p95 1.05 ms | 20 clients x 20 s, 40.0 req/s offered, status {'200': 800} |
| **concurrency, saturating: library page 1** | 1593.0 ok req/s, p50 10.03 / p95 21.25 ms | 20 clients x 20 s, back to back, status {'200': 31860} | 2871.4 ok req/s, p50 3.39 / p95 8.51 ms | 20 clients x 20 s, back to back, status {'200': 57429} |

## Web UI (Playwright Chromium, 1440x900, DPR 1, from the Mac)

Medians of the runs. Times in ms from navigation start. `first cover`: first cover image inside the viewport fully loaded; `screen`: last cover inside the viewport loaded (all visible loaded, then stable 1.5 s). Bytes are transferred (compressed) bytes; cache hits count 0.

| Page | Cache | Audiobookshelf first cover / screen / LCP | Audiobookshelf req / KiB / JS KiB | AudioSilo first cover / screen / LCP | AudioSilo req / KiB / JS KiB |
|---|---|---|---|---|---|
| home | cold | 218 / 226 / 241.0 | 61 / 4284 / 2643 | 189 / 205 / 222.0 | 56 / 1957 / 1302 |
| home | warm | 206 / 206 / 240.0 | 61 / 13 / 8 | 193 / 205 / 213 | 56 / 41 / 0 |
| grid | cold | 350 / 367 / 729.0 | 72 / 4283 / 2643 | 195 / 216 / 240.0 | 98 / 4220 / 1297 |
| grid | warm | 337 / 337 / 705.0 | 72 / 13 / 8 | 189 / 189 / 221.0 | 98 / 2101 / 0 |

- Audiobookshelf: grid URL `/audiobookshelf/library/d2327b11-80c7-4b0d-8491-6a987bfbedf0/bookshelf` (ended at `audiobookshelf/library/d2327b11-80c7-4b0d-8491-6a987bfbedf0/bookshelf?sort=media.metadata.title&desc=0`), 18 covers in view; home `/audiobookshelf/library/d2327b11-80c7-4b0d-8491-6a987bfbedf0`, 14 covers in view. Screenshots: abs-admin-issues-cold.png, abs-admin-issues-warm.png, abs-grid-cold.png, abs-grid-warm.png, abs-home-cold.png, abs-home-warm.png. External requests blocked: ['https://api.github.com/repos/advplyr/audiobookshelf/releases']. Failed same-origin requests: none.
- AudioSilo: grid URL `/web/library` (ended at `web/library`), 15 covers in view; home `/web/`, 14 covers in view. Screenshots: as-admin-issues-cold.png, as-admin-issues-warm.png, as-admin-system-cold.png, as-admin-system-warm.png, as-grid-cold.png, as-grid-warm.png, as-home-cold.png, as-home-warm.png. External requests blocked: none. Failed same-origin requests: none.

## Admin health page

AudioSilo: the admin console's Health section, Issues (the default tab) and System. Audiobookshelf has no health or system-status page; its nearest equivalent to Issues is the bookshelf filtered to `issues` (items it marked missing or invalid; the sidebar shows the link only when there are any). It has nothing comparable to System, so that row is n/a.

Browser: Playwright Chromium from the Mac, medians of the runs, ms from navigation start. `ready`: the page's data has rendered (its text shows the result) and no API request is in flight; `last API`: end of the last API response.

| Page | Cache | Audiobookshelf ready / last API ms | Audiobookshelf API req / KiB | AudioSilo ready / last API ms | AudioSilo API req / KiB |
|---|---|---|---|---|---|
| issues | cold | 238 / 221 | 5 / 3672 | 147 / 147 | 8 / 611 |
| issues | warm | 223 / 206 | 5 / 13 | 141 / 141 | 8 / 105 |
| system | cold | n/a |  | 118 / 102 | 6 / 461 |
| system | warm | n/a |  | 111 / 95 | 6 / 6 |

- Audiobookshelf issues (`/audiobookshelf/library/d2327b11-80c7-4b0d-8491-6a987bfbedf0/bookshelf?filter=issues`), API requests on the first cold load: POST /audiobookshelf/api/authorize (3 ms, 2353 B); GET /audiobookshelf/api/libraries/d2327b11-80c7-4b0d-8491-6a987bfbedf0?include=filterdata (3 ms, 171225 B); GET /audiobookshelf/api/libraries (7 ms, 1165 B); GET /audiobookshelf/api/tasks?include=queue (8 ms, 341 B); GET /audiobookshelf/api/libraries/d2327b11-80c7-4b0d-8491-6a987bfbedf0/items?filter=issues&sort=media.metadata.title&desc=0&limit=36&page=0&minified=1&include=rssfeed,numEpisodesIncomplete,share (21 ms, 522 B).
- AudioSilo issues (`/admin/health`), API requests on the first cold load: GET /api/v1/me (3 ms, 443 B); GET /api/v1/admin/setup (8 ms, 439 B); GET /api/v1/server (2 ms, 1030 B); GET /api/v1/admin/libraries (10 ms, 575 B); GET /api/v1/admin/events?limit=20 (7 ms, 693 B); GET /api/v1/admin/issues (120 ms, 2053 B); GET /api/v1/admin/books?issue=scan_error&sort=added&order=desc&limit=50 (12 ms, 2129 B); POST /api/v1/admin/covers (13 ms, 99678 B).
- AudioSilo system (`/admin/health/system`), API requests on the first cold load: GET /api/v1/me (2 ms, 443 B); GET /api/v1/admin/setup (2 ms, 439 B); GET /api/v1/server (2 ms, 1030 B); GET /api/v1/admin/libraries (2 ms, 575 B); GET /api/v1/admin/events?limit=20 (1 ms, 693 B); GET /api/v1/admin/system (276 ms, 1513 B).

API replay (same method as the latency tables: 5 warm-up + timed requests, paced):

| Request | Audiobookshelf p50 / p95 / max | Audiobookshelf bytes | AudioSilo p50 / p95 / max | AudioSilo bytes |
|---|---|---|---|---|
| admin_issues | 1.37 / 1.52 / 1.57 | 195 (results=0, total=0) | 1.51 / 2.03 / 3.56 | 1801 (categories=10, categories.[].count=4971) |
| admin_issue_books | n/a |  | 0.89 / 1.02 / 1.15 | 1877 (books=2) |
| admin_system | n/a |  | 1.55 / 1.77 / 2.4 | 1261 |

- Audiobookshelf `admin_issues`: GET items?filter=issues (the bookshelf's issues filter: items missing or invalid on disk)
- AudioSilo `admin_issues`: GET /api/v1/admin/issues (every issue category with its count and sample covers)
- AudioSilo `admin_issue_books`: GET /api/v1/admin/books?issue=scan_error... (the open category's queue)
- AudioSilo `admin_system`: GET /api/v1/admin/system (ffmpeg, ffprobe, community metadata reachability, TLS, database, backups, library folders)

