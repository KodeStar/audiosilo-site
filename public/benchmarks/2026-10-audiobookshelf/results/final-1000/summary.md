# ABS vs AudioSilo benchmark: final-1000

Run 2026-10-28T11:34:54+0000 to 2026-10-28T12:30:36+0000, total 3334.0 s. Library `/mnt/user/librivox/tier-1000` at start: 1000 book folders, 12653 MP3 + 472 M4B files, 151.77 GiB; at end: 1000 folders.

Host: Intel(R) Core(TM) i3-N305, 8 CPUs, 16150928 kB RAM, kernel 6.1.106-Unraid, Docker 24.0.9. Load average at start 0.09/0.1/0.03, at end 1.23. Other containers running on the host (idle, untouched): 18.

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
| Idle, empty library: docker / anon / RSS | 59.5 MiB / 50.1 MiB / 117.3 MiB | 22.4 MiB / 14.4 MiB / 29.8 MiB |
| Idle timeline, anon at s after setup | 10s 79, 30s 79, 60s 80, 120s 47 MiB | 10s 13, 30s 13, 60s 14, 120s 14 MiB |
| Peak during initial scan: anon (sampled) | 445.6 MiB | 227.6 MiB |
| Peak during initial scan: docker (sampled) | 997.6 MiB | 510.6 MiB |
| memory.peak since container start (incl. page cache) | 3935.2 MiB | 2362.8 MiB |
| 60 s after scan: docker / anon / RSS | 941.2 MiB / 198.6 MiB / 265.7 MiB | 330.2 MiB / 23.4 MiB / 39.7 MiB |
| CPU time used by initial scan (user+sys) | 1113.11 s (1103.22-1120.93) | 1217.38 s (1202.14-1222.19) |
| Data dir after initial scan | 27.8 MiB | 17.0 MiB |
| End of run (after API + web tests): docker / anon | 372.2 MiB / 269.0 MiB | 132.0 MiB / 58.8 MiB |

- Audiobookshelf data dir breakdown (last initial run): `./config` 24.0 MiB, `./metadata` 3.8 MiB. Largest top-level files: `./config/absdatabase.sqlite` 23.9 MiB. 1017 files in all.
- AudioSilo data dir breakdown (last initial run): `./cache` 0.0 MiB. Largest top-level files: `./audiosilo.db` 12.7 MiB, `./audiosilo.db-wal` 4.2 MiB, `./audiosilo.db-shm` 0.0 MiB, `./config.yaml` 0.0 MiB. 4 files in all.

## Scanning

| | Audiobookshelf | AudioSilo |
|---|---|---|
| Initial full scan, wall (median, min-max) | 230.34 s (228.40-230.37) | 170.90 s (167.79-170.93) |
| Initial full scan, app-reported | 229.56 s (227.67-229.62) | 170.78 s (167.75-170.90) |
| Books found | 999, 999, 999 | 1000, 1000, 1000 |
| No-change rescan, cold cache: wall | 5.08 s (4.86-5.12) | 0.79 s (0.79-0.80) |
| No-change rescan, cold cache: CPU | 2.62 s (2.56-2.71) | 0.74 s (0.73-0.74) |
| No-change rescan, warm cache: wall | 5.38 s (5.28-5.53) | 1.62 s (1.60-1.63) |
| No-change rescan, warm cache: CPU | 2.49 s (2.42-2.49) | 0.64 s (0.64-0.65) |
| Cold start to first authenticated library response | 4.54 s (4.27-4.72) | 3.13 s (2.94-3.22) |

- Audiobookshelf completion signal: GET /api/libraries/:id lastScan changes (set when LibraryScanner finishes) and no 'library-scan' task left in GET /api/tasks; app-reported = log timestamps of '[LibraryScanner] Starting ... library scan' -> 'Library scan ... completed in'.
- AudioSilo completion signal: GET /api/v1/admin/scan-runs: the new run has finished_at and a final status; app-reported = finished_at - started_at of that run (server clock).
- ABS initial scans ran as `(forced)`: [True, True, True] (ABS forces the first scan of a new library because its metadata precedence was never recorded; this is its out-of-box behaviour).
- AudioSilo queues a no-change scan of every library on each start (pkg/launcher); runs recorded after the cold starts: ok 1000 books, ok 1000 books, ok 1000 books. ABS does not scan on start.
- Item sanity (by library-relative folder): ABS 999, AudioSilo 1000, in both 999. Only in ABS: []. Only in AudioSilo: ['Friedrich Nietzsche/Antichrist'].

## API latency from the Mac over the LAN

Sequential requests over one keep-alive connection (first-byte requests open a fresh connection each), request starts spaced at least 25 ms apart (AudioSilo limits each client IP to about 50 API requests/s; the spacing is applied to both apps and is never inside a timed sample). p50 / p95 / max in ms; size is the decoded body (wire size with gzip in the JSON files); for the two-step play flows it is the first step's body plus the 1 audio byte.

| Request | Audiobookshelf p50 / p95 / max | Audiobookshelf bytes | AudioSilo p50 / p95 / max | AudioSilo bytes |
|---|---|---|---|---|
| cover_first_request | 63.5 / 70.93 / 355.53 | 16180 | 6.15 / 7.48 / 8.99 | 10725 |
| home_shelves | 1.9 / 2.41 / 2.63 | 28125 (shelves=4, entities=32) | 1.6 / 1.92 / 2.61 | 23034 (books=48) |
| home_library_filterdata | 1.99 / 2.88 / 3.59 | 43996 | n/a |  |
| libraries | 1.78 / 2.29 / 2.56 | 872 (libraries=1) | 1.32 / 1.68 / 3.09 | 118 (libraries=1) |
| library_page1 | 2.07 / 2.69 / 3.27 | 43006 (results=36, total=999) | 1.3 / 1.56 / 1.82 | 80512 (books=200) |
| library_deep_page | 2.02 / 2.68 / 3.38 | 41295 (results=36, total=999) | 1.29 / 1.71 / 2.42 | 79738 (books=200) |
| search_the | 2.38 / 2.94 / 3.23 | 307350 (book=12, authors=12) | 1.38 / 1.73 / 2.25 | 23922 (books=50) |
| search_the_typeahead | 1.81 / 2.2 / 3.88 | 62365 (book=3, authors=3) | n/a |  |
| search_dickens | 1.53 / 1.98 / 3.23 | 306 (authors=1) | 1.47 / 1.89 / 10.02 | 6436 (books=14) |
| search_title | 1.83 / 2.48 / 3.13 | 26572 (book=1) | 1.38 / 1.68 / 2.55 | 457 (books=1) |
| search_dickens_then_author_page | 16.27 / 18.18 / 18.66 | 16323 (libraryItems=14) | n/a |  |
| search_dickens_typeahead | 1.56 / 2.03 / 3.35 | 306 (authors=1) | n/a |  |
| detail_mp3 | 8.45 / 11.37 / 14.18 | 52772 (audioFiles=20, chapters=20) | 1.71 / 2.09 / 2.2 | 8616 (files=20, chapters=20) |
| detail_m4b | 7.22 / 8.35 / 11.22 | 4396 (audioFiles=1, chapters=1) | 1.52 / 2.05 / 29.6 | 799 (files=1, chapters=1) |
| play_first_byte_mp3 | 14.05 / 15.58 / 18.68 | 77570 (audioTracks=20, chapters=20) | 5.28 / 6.15 / 7.38 | 19 |
| play_first_byte_m4b | 12.03 / 14.33 / 17.84 | 6879 (audioTracks=1, chapters=1) | 5.29 / 6.24 / 10.3 | 19 |
| cover_grid | 2.01 / 4.64 / 6.88 | 10332 | 2.81 / 3.17 / 3.73 | 7548 |
| home_progress | n/a |  | 1.42 / 1.7 / 1.79 | 18 |
| home_stats | n/a |  | 2.04 / 2.36 / 3.03 | 1827 |
| home_listening | n/a |  | 1.67 / 2.0 / 2.74 | 12924 |
| home_favourites | n/a |  | 1.52 / 1.78 / 2.6 | 20 |
| server_info | n/a |  | 1.19 / 1.4 / 1.71 | 779 |
| library_all_pages | n/a |  | 6.51 / 7.17 / 7.9 | 398202 (books=1000) |
| detail_mp3_chapters | n/a |  | 1.76 / 2.17 / 7.36 | 8341 (files=20, chapters=20) |
| detail_m4b_chapters | n/a |  | 1.48 / 1.8 / 2.7 | 506 (files=1, chapters=1) |
| **concurrency, steady load: library page 1** | 40.0 ok req/s, p50 1.84 / p95 2.75 ms | 20 clients x 20 s, 40.0 req/s offered, status {'200': 800} | 40.0 ok req/s, p50 1.35 / p95 1.83 ms | 20 clients x 20 s, 40.0 req/s offered, status {'200': 800} |
| **concurrency, saturating: library page 1** | 1841.0 ok req/s, p50 8.87 / p95 18.61 ms | 20 clients x 20 s, back to back, status {'200': 36819} | 12543.5 ok req/s, p50 0.87 / p95 1.39 ms | 20 clients x 20 s, back to back, status {'200': 250871} |

Exact requests (tokens elided):

**Audiobookshelf** (base http://192.168.0.10:13399, page size 36, total 999):

- `home_shelves`: GET /audiobookshelf/api/libraries/4fe030ed-7f60-40b9-8c2b-812104f6d405/personalized?include=rssfeed,numEpisodesIncomplete,share
- `home_library_filterdata`: GET /audiobookshelf/api/libraries/4fe030ed-7f60-40b9-8c2b-812104f6d405?include=filterdata
- `libraries`: GET /audiobookshelf/api/libraries
- `library_page1`: GET /audiobookshelf/api/libraries/4fe030ed-7f60-40b9-8c2b-812104f6d405/items?sort=media.metadata.title&desc=0&limit=36&page=0&minified=1&include=rssfeed,numEpisodesIncomplete,share
- `library_deep_page`: GET /audiobookshelf/api/libraries/4fe030ed-7f60-40b9-8c2b-812104f6d405/items?sort=media.metadata.title&desc=0&limit=36&page=13&minified=1&include=rssfeed,numEpisodesIncomplete,share
- `search_the`: GET /audiobookshelf/api/libraries/:id/search?q=the (search results page; server default limit 12)
- `search_the_typeahead`: GET /audiobookshelf/api/libraries/4fe030ed-7f60-40b9-8c2b-812104f6d405/search?q=the&limit=3
- `search_dickens`: GET /audiobookshelf/api/libraries/:id/search?q=dickens (ABS matches book titles, not authors: the answer is the author entry, 'Charles Dickens', with its book count)
- `search_title`: GET /audiobookshelf/api/libraries/4fe030ed-7f60-40b9-8c2b-812104f6d405/search?q=bleak%20house
- `search_dickens_then_author_page`: search?q=dickens, then the author page the result opens: GET /audiobookshelf/api/authors/:id?include=items,series (sequential sum; this is where ABS lists the author's books)
- `search_dickens_typeahead`: GET /audiobookshelf/api/libraries/4fe030ed-7f60-40b9-8c2b-812104f6d405/search?q=dickens&limit=3
- `detail_mp3`: GET /audiobookshelf/api/items/8e741578-8c38-4095-a010-f0c7fc0a3687?expanded=1&include=downloads,rssfeed,share
- `detail_m4b`: GET /audiobookshelf/api/items/50daee3d-21ee-4665-afe8-61dc49197264?expanded=1&include=downloads,rssfeed,share
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
| home_shelves | 1.25 / 1.4 / 1.94 | 28125 (shelves=4, entities=32) | 0.89 / 1.04 / 1.27 | 23034 (books=48) |
| home_library_filterdata | 1.33 / 1.49 / 1.7 | 43996 | n/a |  |
| libraries | 1.18 / 1.33 / 1.46 | 872 (libraries=1) | 0.79 / 0.91 / 1.13 | 118 (libraries=1) |
| library_page1 | 1.35 / 1.52 / 2.01 | 43006 (results=36, total=999) | 0.79 / 0.94 / 1.37 | 80512 (books=200) |
| library_deep_page | 1.37 / 1.51 / 1.67 | 41295 (results=36, total=999) | 0.86 / 0.97 / 1.44 | 79738 (books=200) |
| search_the | 1.84 / 2.03 / 2.15 | 307350 (book=12, authors=12) | 0.95 / 1.09 / 1.25 | 23922 (books=50) |
| search_the_typeahead | 1.34 / 1.47 / 1.89 | 62365 (book=3, authors=3) | n/a |  |
| search_dickens | 1.16 / 1.36 / 1.58 | 306 (authors=1) | 0.89 / 1.06 / 1.15 | 6436 (books=14) |
| search_title | 1.28 / 1.63 / 1.75 | 26572 (book=1) | 0.85 / 0.95 / 1.4 | 457 (books=1) |
| search_dickens_then_author_page | 15.15 / 16.49 / 18.4 | 16323 (libraryItems=14) | n/a |  |
| search_dickens_typeahead | 1.22 / 1.37 / 1.65 | 306 (authors=1) | n/a |  |
| detail_mp3 | 8.0 / 8.69 / 9.75 | 52772 (audioFiles=20, chapters=20) | 1.15 / 1.27 / 2.0 | 8616 (files=20, chapters=20) |
| detail_m4b | 7.33 / 7.77 / 9.05 | 4396 (audioFiles=1, chapters=1) | 1.02 / 1.17 / 1.26 | 799 (files=1, chapters=1) |
| play_first_byte_mp3 | 11.76 / 12.85 / 16.84 | 77567 (audioTracks=20, chapters=20) | 2.94 / 3.34 / 6.1 | 19 |
| play_first_byte_m4b | 10.36 / 11.3 / 11.66 | 6876 (audioTracks=1, chapters=1) | 2.93 / 3.37 / 3.51 | 19 |
| cover_grid | 1.53 / 1.72 / 2.45 | 10332 | 2.1 / 2.35 / 2.49 | 7548 |
| home_progress | n/a |  | 0.89 / 1.01 / 1.12 | 18 |
| home_stats | n/a |  | 1.55 / 1.68 / 1.95 | 1827 |
| home_listening | n/a |  | 1.04 / 1.17 / 1.57 | 12924 |
| home_favourites | n/a |  | 1.03 / 1.26 / 1.38 | 20 |
| server_info | n/a |  | 0.68 / 0.78 / 0.83 | 779 |
| library_all_pages | n/a |  | 4.09 / 4.49 / 4.75 | 398202 (books=1000) |
| detail_mp3_chapters | n/a |  | 1.14 / 1.31 / 3.52 | 8341 (files=20, chapters=20) |
| detail_m4b_chapters | n/a |  | 1.02 / 1.19 / 1.63 | 506 (files=1, chapters=1) |
| **concurrency, steady load: library page 1** | 40.0 ok req/s, p50 1.35 / p95 1.56 ms | 20 clients x 20 s, 40.0 req/s offered, status {'200': 800} | 40.0 ok req/s, p50 0.86 / p95 1.04 ms | 20 clients x 20 s, 40.0 req/s offered, status {'200': 800} |
| **concurrency, saturating: library page 1** | 1592.0 ok req/s, p50 10.05 / p95 20.85 ms | 20 clients x 20 s, back to back, status {'200': 31839} | 2971.2 ok req/s, p50 3.22 / p95 7.7 ms | 20 clients x 20 s, back to back, status {'200': 59424} |

## Web UI (Playwright Chromium, 1440x900, DPR 1, from the Mac)

Medians of the runs. Times in ms from navigation start. `first cover`: first cover image inside the viewport fully loaded; `screen`: last cover inside the viewport loaded (all visible loaded, then stable 1.5 s). Bytes are transferred (compressed) bytes; cache hits count 0.

| Page | Cache | Audiobookshelf first cover / screen / LCP | Audiobookshelf req / KiB / JS KiB | AudioSilo first cover / screen / LCP | AudioSilo req / KiB / JS KiB |
|---|---|---|---|---|---|
| home | cold | 205 / 214 / 225 | 59 / 4163 / 2643 | 177 / 195 / 217.0 | 56 / 1955 / 1302 |
| home | warm | 197 / 198 / 221.0 | 59 / 13 / 8 | 173 / 186 / 192.0 | 56 / 41 / 0 |
| grid | cold | 219 / 237 / 557.0 | 72 / 4148 / 2643 | 190 / 205 / 228.0 | 78 / 2552 / 1297 |
| grid | warm | 221 / 221 / 549.0 | 72 / 13 / 8 | 184 / 184 / 217.0 | 78 / 432 / 0 |

- Audiobookshelf: grid URL `/audiobookshelf/library/4fe030ed-7f60-40b9-8c2b-812104f6d405/bookshelf` (ended at `audiobookshelf/library/4fe030ed-7f60-40b9-8c2b-812104f6d405/bookshelf?sort=media.metadata.title&desc=0`), 18 covers in view; home `/audiobookshelf/library/4fe030ed-7f60-40b9-8c2b-812104f6d405`, 14 covers in view. Screenshots: abs-admin-issues-cold.png, abs-admin-issues-warm.png, abs-grid-cold.png, abs-grid-warm.png, abs-home-cold.png, abs-home-warm.png. External requests blocked: ['https://api.github.com/repos/advplyr/audiobookshelf/releases']. Failed same-origin requests: none.
- AudioSilo: grid URL `/web/library` (ended at `web/library`), 15 covers in view; home `/web/`, 14 covers in view. Screenshots: as-admin-issues-cold.png, as-admin-issues-warm.png, as-admin-system-cold.png, as-admin-system-warm.png, as-grid-cold.png, as-grid-warm.png, as-home-cold.png, as-home-warm.png. External requests blocked: none. Failed same-origin requests: none.

## Admin health page

AudioSilo: the admin console's Health section, Issues (the default tab) and System. Audiobookshelf has no health or system-status page; its nearest equivalent to Issues is the bookshelf filtered to `issues` (items it marked missing or invalid; the sidebar shows the link only when there are any). It has nothing comparable to System, so that row is n/a.

Browser: Playwright Chromium from the Mac, medians of the runs, ms from navigation start. `ready`: the page's data has rendered (its text shows the result) and no API request is in flight; `last API`: end of the last API response.

| Page | Cache | Audiobookshelf ready / last API ms | Audiobookshelf API req / KiB | AudioSilo ready / last API ms | AudioSilo API req / KiB |
|---|---|---|---|---|---|
| issues | cold | 187 / 174 | 5 / 3548 | 138 / 138 | 8 / 591 |
| issues | warm | 181 / 170 | 5 / 13 | 137 / 137 | 8 / 86 |
| system | cold | n/a |  | 113 / 96 | 6 / 461 |
| system | warm | n/a |  | 106 / 90 | 6 / 6 |

- Audiobookshelf issues (`/audiobookshelf/library/4fe030ed-7f60-40b9-8c2b-812104f6d405/bookshelf?filter=issues`), API requests on the first cold load: POST /audiobookshelf/api/authorize (3 ms, 2353 B); GET /audiobookshelf/api/libraries/4fe030ed-7f60-40b9-8c2b-812104f6d405?include=filterdata (2 ms, 44292 B); GET /audiobookshelf/api/libraries (2 ms, 1165 B); GET /audiobookshelf/api/tasks?include=queue (2 ms, 341 B); GET /audiobookshelf/api/libraries/4fe030ed-7f60-40b9-8c2b-812104f6d405/items?filter=issues&sort=media.metadata.title&desc=0&limit=36&page=0&minified=1&include=rssfeed,numEpisodesIncomplete,share (12 ms, 522 B).
- AudioSilo issues (`/admin/health`), API requests on the first cold load: GET /api/v1/me (3 ms, 443 B); GET /api/v1/admin/setup (2 ms, 439 B); GET /api/v1/server (1 ms, 1030 B); GET /api/v1/admin/libraries (3 ms, 575 B); GET /api/v1/admin/events?limit=20 (1 ms, 682 B); GET /api/v1/admin/issues (24 ms, 1796 B); GET /api/v1/admin/books?issue=scan_error&sort=added&order=desc&limit=50 (4 ms, 1164 B); POST /api/v1/admin/covers (11 ms, 80465 B).
- AudioSilo system (`/admin/health/system`), API requests on the first cold load: GET /api/v1/me (2 ms, 443 B); GET /api/v1/admin/setup (2 ms, 439 B); GET /api/v1/server (1 ms, 1030 B); GET /api/v1/admin/libraries (2 ms, 575 B); GET /api/v1/admin/events?limit=20 (1 ms, 682 B); GET /api/v1/admin/system (283 ms, 1513 B).

API replay (same method as the latency tables: 5 warm-up + timed requests, paced):

| Request | Audiobookshelf p50 / p95 / max | Audiobookshelf bytes | AudioSilo p50 / p95 / max | AudioSilo bytes |
|---|---|---|---|---|
| admin_issues | 1.54 / 1.88 / 4.42 | 195 (results=0, total=0) | 1.48 / 1.75 / 3.47 | 1544 (categories=10, categories.[].count=1006) |
| admin_issue_books | n/a |  | 1.12 / 1.39 / 1.91 | 913 (books=1) |
| admin_system | n/a |  | 1.54 / 1.83 / 7.57 | 1261 |

- Audiobookshelf `admin_issues`: GET items?filter=issues (the bookshelf's issues filter: items missing or invalid on disk)
- AudioSilo `admin_issues`: GET /api/v1/admin/issues (every issue category with its count and sample covers)
- AudioSilo `admin_issue_books`: GET /api/v1/admin/books?issue=scan_error... (the open category's queue)
- AudioSilo `admin_system`: GET /api/v1/admin/system (ffmpeg, ffprobe, community metadata reachability, TLS, database, backups, library folders)

