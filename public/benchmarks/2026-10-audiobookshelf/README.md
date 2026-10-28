# AudioSilo vs Audiobookshelf: the benchmark harness and results (October 2026)

This folder is the harness behind the blog post
[AudioSilo vs Audiobookshelf: features and benchmarks compared](https://audiosilo.app/blog/audiosilo-vs-audiobookshelf/),
and every result file of the run the post reports. Run it on your own hardware and
compare.

## What's here

```
harness/    the code: run.sh (one tier, both apps), clean-rerun.sh (all three tiers),
            bench.py (the protocol), apps.py (how each app is set up and asked),
            hostctl.py (SSH to the server), latency.py, webui.mjs, admin.mjs,
            summarize.py (summary.md from the JSON), compare.py (tiers side by side)
corpus/     how the LibriVox library was built: catalog.py (the LibriVox catalogue),
            select.py (writes map.txt: 5,000 English titles), fetch.py (downloads them),
            map.txt (<archive.org id>|<Author/Title>|<mp3|m4b>|<LibriVox id>|<seconds>)
results/    one folder per tier (final-1000, final-1000-m4b, final-5000): summary.md (every number), meta.json
            (host, images and digests, library facts), run.log, and per app (abs/, as/)
            the raw JSON; compare.md has the three tiers side by side
```

The run was `harness/clean-rerun.sh final` on 2026-10-28, against Audiobookshelf 2.37.2
and AudioSilo from its `:edge` image of 28 October 2026 (commit `e465ccb`, reported as `dev-e465ccb`), the code that became AudioSilo 2.5.0.

## What was left out, and what was changed

- **Credentials.** The harness signs in to throwaway containers; every token was replaced
  with `<token>` and the files that only held sign-in state or the replayed requests
  with their tokens (`*_session.json`, `*_spec*.json`, `webprobe.json`) are not included.
  Each tier's `summary.md` lists the exact requests, tokens elided. In `harness/apps.py`
  the fixed Audiobookshelf root password the harness set on its throwaway container is
  now read from `BENCH_ABS_PASSWORD`.
- **Screenshots** of each measured page are not included (size). `webui.json` still
  records every request each page made.
- The JSON files are minified; the data is unchanged.
- `BENCH_HOST` defaults to the address of our server on our home network; set it to
  yours. The harness assumes an Unraid-style host (`/mnt/cache/appdata/bench` for app
  data; `BENCH_DATA` changes it).

## Notes on the measured AudioSilo build

The harness notes below were first written against AudioSilo 2.4.1. The measured build
differs in two ways that matter, and the caveats below say so:

- It **scans up to 8 audio files at once** (`scan.concurrency`, default one per CPU up to
  8), where 2.4.1 read one at a time.
- Signed-in API requests are **rate limited per sign-in**, not per client address, with a
  default far above anything the harness sends, so the saturating load test measures the
  server, not a limit. `summary.md` still prints the old one-line note ("AudioSilo limits
  each client IP to about 50 API requests/s") above the latency tables: it describes why
  the 25 ms pacing exists, and the pacing was kept so the runs stay comparable.

---

# How the harness works

Run every command below from `harness/`.

A reproducible comparison of Audiobookshelf (ABS) and AudioSilo on the same host, the
same read-only library and each app's out-of-box defaults. One entry point runs
everything for both apps, one app at a time, and writes JSON plus a `summary.md`.

```sh
./run.sh <tier-label> <library-path-on-host> [options]
./run.sh 1000 /mnt/user/librivox/tier-1000 --host-latency
./run.sh smoke /mnt/user/librivox/books --initial 1 --rescan 1 --startup 1 --latency-n 10 --conc-seconds 3 --web-runs 1
./run.sh 5000 /mnt/user/librivox/tier-5000 --initial 1 --host-latency --require-stable
python3 summarize.py results/<tier>      # rebuild summary.md from the JSON
python3 compare.py results/1000 results/1000-m4b results/5000 > results/compare.md   # tiers side by side
# only the admin health page, on the data a tier's main run left behind:
BENCH_LIBRARY=/mnt/user/librivox/tier-1000-m4b python3 bench.py --tier 1000-m4b-admin --phases admin
```

Options (all optional): `--apps abs,as`, `--initial 3`, `--rescan 3`, `--startup 3`,
`--latency-n 100`, `--latency-warmup 5`, `--conc-clients 20`, `--conc-seconds 20`,
`--web-runs 5`, `--no-latency`, `--no-web`, `--host-latency`,
`--phases scan,rescan,startup,latency,web,admin` (a subset; without `scan` the bench
container and data left by the last run are reused),
`--as-metadata default|off` (`off` sets `AUDIOSILO_METADATA_ENABLED=false`; see
"AudioSilo and network metadata" below; default is the out-of-box setting).

Environment overrides: `BENCH_HOST` (`root@192.168.0.10`), `BENCH_HOST_IP`,
`BENCH_DATA` (`/mnt/cache/appdata/bench`), `BENCH_ABS_PORT` (13399), `BENCH_AS_PORT` (8199),
`BENCH_ABS_IMAGE`, `BENCH_AS_IMAGE` (default `:latest` of each; set an
`image@sha256:...` to repeat a run on exactly the same builds), `PLAYWRIGHT_MODULE`.

## Requirements

- Mac (the client): Python 3 (stdlib only), Node 18+, Playwright with Chromium.
  `webui.mjs` looks for `./node_modules/playwright`, then `$PLAYWRIGHT_MODULE`, then the
  workspace copy in `audiosilo-docs/screenshots/node_modules`. To install a local one:
  `npm i playwright@1.61.1 && npx playwright install chromium`.
- SSH key access to the host as root. The host needs only Docker and curl (no Python;
  `--host-latency` runs `latency.py` in a throwaway `python:3-alpine` container named
  `bench-client`).

## What it touches

Only the containers `bench-abs` (host port 13399) and `bench-as` (8199), the data dir
`/mnt/cache/appdata/bench/{abs,as}` (wiped before each initial scan) and `/tmp/bench-client`
on the host (with `--host-latency`). The library is mounted read-only (`:ro`) into both.
`echo 3 > /proc/sys/vm/drop_caches` is run before every cold measurement (it drops the
host's page cache for everything, harmless but host-wide). Both containers are left
stopped at the end.

## What one run does (per app; ABS first, then AudioSilo; never both at once)

1. Pull `:latest` (or the given digest), record the digest, the version label, the
   compressed size from the registry manifest (linux/amd64 layers) and the uncompressed
   size from `docker image inspect`, then run every container of the run by digest.
2. Initial scan, `--initial` times: stop, remove, wipe the data dir, start fresh, do the
   headless first-run setup, read idle memory with an empty library at 10, 30, 60 and
   120 s (`--idle-settle-s`; the last is reported), create
   the library at `/audiobooks`, drop caches, start a 0.5 s memory sampler, trigger the
   scan, wait for the app's own completion signal, read CPU time, the item count, memory
   60 s later and the data dir size (broken down).
3. No-change rescans: `--rescan` with a cache drop before each (cold), then `--rescan`
   back to back (warm).
4. Cold starts, `--startup` times: stop, drop caches, `docker start`, poll every 50 ms
   on the host (curl, loopback) until an authenticated library page-1 request returns 200.
5. API latency from the Mac: first the first-request time of 30 distinct covers (nothing
   cached server side), then a one-off probe of the real web UI to read the exact
   library request it makes, then for each request 5 warm-ups and 100 timed sequential
   requests on a keep-alive connection, then the concurrency test (20 processes, each
   with its own keep-alive connection, hammering library page 1 for 20 s).
   `--host-latency` repeats the same set on the host over loopback.
6. Web UI: Playwright Chromium at 1440x900, DPR 1. Home and library grid, 5 cold runs
   (fresh browser context each: empty HTTP cache, no service worker) and 5 warm runs
   (one context, primed once, then 5 loads). Screenshots of the first cold and warm load
   of each page land in `results/<tier>/<app>/shots/`.
7. Admin health page: AudioSilo's admin console Health > Issues (`/admin/health`, the
   default tab) and Health > System, 5 cold and 5 warm loads in Playwright, timed until
   the page's data has rendered (its text shows the result: "could be better" / "All
   clear", "AudioSilo version") and no API request is in flight; every API request the
   page makes is recorded. Then each page's main requests are replayed like step 5. The
   harness first marks AudioSilo's first-run setup finished (`PUT /api/v1/admin/setup
   {"finished":true}`), as an admin who completed the setup flow would have; otherwise
   the console sends the admin to `/admin/setup`. ABS has no health or system page: its
   nearest equivalent to Issues is the bookshelf filtered to `issues`
   (`/library/:id/bookshelf?filter=issues`, missing or invalid items; ready when it shows
   "No Issues" or its book count), and System is n/a.
8. Host load average is recorded around every phase (`load_before`/`load_after`).

## How each app is set up and measured

| | Audiobookshelf | AudioSilo |
|---|---|---|
| Container | `-p 13399:80`, `/config`, `/metadata`, library at `/audiobooks:ro` | `-p 8199:8080`, `/data`, library at `/audiobooks:ro`, `AUDIOSILO_TLS_MODE=off` (plain HTTP like ABS) |
| First run | `POST /init {"newRoot":{username,password}}`, `POST /login` with `x-return-tokens: true` (access token) | the server creates `admin` and prints a one-time password in its log; the harness reads it from its own container's log, then `POST /api/v1/auth/login` |
| Library | `POST /api/libraries` with the web UI's defaults (`mediaType: book`, `provider: google`, default settings). Does not scan. | `POST /api/v1/admin/libraries {"name","root"}`. Queues the first scan itself. |
| Scan trigger | `POST /api/libraries/:id/scan?force=0` | the library create call (initial) / `POST /api/v1/admin/libraries/:id/scan` (rescans) |
| Completion signal | `GET /api/libraries/:id` `lastScan` changes (set when LibraryScanner finishes) and no `library-scan` task in `GET /api/tasks` | `GET /api/v1/admin/scan-runs`: the new run has `finished_at` |
| App-reported time | log timestamps of `[LibraryScanner] Starting ... library scan` to `Library scan ... completed in` | `finished_at - started_at` of the scan run |

Wall time is measured on the Mac from just before the trigger request to the poll that
first sees completion (poll interval 0.25 s, so up to about 0.3 s of overshoot on either
app). The app-reported time is the app's own clock, without HTTP and polling.

### The requests (what each web client sends)

Each app's own web client was read to get these (ABS v2.37.2 `client/`, AudioSilo
`audiosilo-frontend/src/api`). `latency_spec.json` in the results has the exact URLs.

| Purpose | Audiobookshelf web client | AudioSilo web player |
|---|---|---|
| Home shelves | `GET /audiobookshelf/api/libraries/:id/personalized?include=rssfeed,numEpisodesIncomplete,share` (one call returns every shelf) | `GET /api/v1/books/recent?limit=48`, plus `/me/progress`, `/me/stats?range=30d`, `/me/listening?range=1y`, `/me/favourites`, ... in parallel (each measured) |
| Library page 1 | `GET .../libraries/:id/items?sort=media.metadata.title&desc=0&limit=36&page=0&minified=1&include=rssfeed,numEpisodesIncomplete,share` (36 = what the bookshelf computes at 1440x900; read from the real UI each run) | `GET /api/v1/libraries/:id/books?sort=recent&limit=200` (keyset cursor pagination) |
| Deep page | same with `page=<half the library / 36>` | same with the cursor of the page holding the middle of the library |
| Whole library | (not loaded: the bookshelf fetches pages as you scroll) | `library_all_pages`: the grid loads every page of 200 one after another and sorts in the browser; measured as one sequential flow |
| Search | `GET .../libraries/:id/search?q=the` (results page, server default limit 12); `&limit=3` is the typeahead | `GET /api/v1/search?q=the&limit=50` |
| Book detail | `GET /audiobookshelf/api/items/:id?expanded=1&include=downloads,rssfeed,share` | `GET /api/v1/libraries/:id/item?path=...` (and `/chapters?path=...`, measured separately) |
| Start playback, time to first audio byte | `POST .../api/items/:id/play` (direct play, `deviceInfo {clientName:"Abs Web", deviceId}`, the browser's MIME list) then `GET /audiobookshelf/public/session/:sid/track/:index` with `Range: bytes=0-`, timed to the first body byte | `GET /api/v1/libraries/:id/progress?path=<book>` then `GET /api/v1/libraries/:id/stream?path=<first file>&token=...` with `Range: bytes=0-`, timed to the first body byte |
| Grid cover | `GET /audiobookshelf/api/items/:id/cover?ts=<updatedAt>` (no auth; the server answers 400 px webp for a browser `Accept`) | `GET /api/v1/libraries/:id/cover?path=...&size=320&v=<cover_version>&token=...` (a 158-190 px tile at DPR 1) |

The same books are used for both apps, picked from the library on disk by folder path
(an MP3 book with about 20 tracks, a middle M4B book, 30 books from the second half for
first-request covers). JSON requests send `Accept-Encoding: gzip, deflate` (browsers also
offer `br`, which Python's stdlib can't decode); images send Chrome's image `Accept`.

## Fairness notes and caveats

Things one app does that the other does not, or that could not be measured identically:

- **ABS's first scan of a library is always forced** (`Starting (forced) library scan`)
  because the library's metadata precedence was never recorded. That is its out-of-box
  behaviour and it is what is measured; a no-change rescan is not forced.
- **Scan parallelism.** Both apps probe files in parallel, so their CPU time is several
  times their wall time on this 8-core host. The measured
  AudioSilo build reads up to 8 audio files at once (`scan.concurrency`, default one per
  CPU up to 8; AudioSilo 2.4.1 and earlier read one at a time). CPU seconds are reported
  next to wall time for that reason.
- **Work done during a scan.** Both probe every audio file with ffprobe and read tags
  and folder covers. ABS writes item records with many denormalised fields and keeps
  covers in place (`cover.jpg` exists in every LibriVox folder, so it extracts no embedded
  art here). AudioSilo also reads a fingerprint of each book's primary file (move
  detection) and builds a chapter timeline across all files of a multi-file book. Neither
  fetches network metadata during a scan.
- **AudioSilo and network metadata.** Its scan makes no network calls (the community
  metadata lookup happens per request, on the book page, only for books with an ASIN or
  ISBN; LibriVox books have neither). So the out-of-box default is what runs. `--as-metadata
  off` exists for a run with all outbound metadata calls disabled.
- **AudioSilo rescans every library on each start.** The cold-start figure is the time to
  the first authenticated answer, which it gives while that rescan runs in the background.
  The harness waits for that rescan before the next measurement and records it.
- **ABS watches the library folder** (`disableWatcher: false` by default) and AudioSilo
  does not. With a static library this costs ABS nothing measurable; if files change
  during a run ABS rescans them on its own.
- **The library grid loads differently.** ABS fetches 36 items per page as you scroll;
  AudioSilo fetches the whole library in pages of 200 and sorts it in the browser. Page 1
  is compared as each client asks for it, and `library_all_pages` shows what AudioSilo's
  full load costs. Response sizes differ for that reason (they are reported).
- **Search works differently.** ABS matches book titles (plus subtitle, ASIN, ISBN) and
  returns authors, series, narrators, tags and genres as separate groups; AudioSilo's
  full-text search covers title, author, narrator and series and returns books. So
  `q=dickens` gives ABS one author entry ("Charles Dickens", 14 books) and AudioSilo the
  14 books. To compare like with like, ABS also has `search_dickens_then_author_page`
  (the search, then the author page the result opens, where ABS lists the books), and
  both apps have `search_title` (`q=bleak house`, one book each). Result sizes also differ
  (ABS results page: 12 per group; AudioSilo: up to 50 books). Every latency row records
  what its answer contained (`result_counts`: books, shelves, tracks, chapters, author
  entries) and the summary prints it, so an empty or non-comparable answer is visible.
- **Home is one call in ABS and several parallel calls in AudioSilo.** The API table
  lists each; the web UI timing is the real combined effect.
- **Playback start is not the same work.** ABS creates a playback session (DB write) then
  serves the track through an unauthenticated session URL; AudioSilo reads the saved
  position and streams the file with a token. Each is what its own player does before
  the first audio byte. The first-byte request opens a fresh TCP connection on both.
- **Covers.** ABS resizes on first request (to 400 px webp for a browser) and keeps the
  result on disk under `/metadata/cache`; AudioSilo makes a JPEG thumbnail of the
  requested size on first request and keeps it in a 48 MB in-memory cache (gone on
  restart). `cover_first_request` is the uncached case, `cover_grid` the cached one.
  **The LibriVox `cover.jpg` files are only 180x180 px**, smaller than either app's
  thumbnail size, so this library barely exercises image resizing; real audiobook art
  (500-2400 px) would cost both apps more on first request. Treat the cover rows as a
  lower bound, or use a library with full-size art for a cover-focused claim.
- **AudioSilo reads every cover once after a scan** (a background pass that records each
  cover's colour for the UI). It is not part of the scan time; it can show up in the
  "60 s after scan" memory and in host load right after a scan. ABS has no equivalent.
- **API rate limiting.** ABS only limits `/login`. The measured AudioSilo build limits
  sign-in, pairing and unauthenticated requests per client address, and signed-in API
  requests per sign-in (`rate_limit.token`, 50,000 requests/s with a burst of 100,000 by
  default), so one signed-in client is not held back. The sequential latency runs still
  space request starts 25 ms apart for both apps (`--pace-ms`, outside the timed window),
  as in the earlier runs against AudioSilo 2.4.1, whose limit was about 50 requests/s per
  address. The concurrency test runs twice: a steady load (20 clients x 2 req/s = 40
  req/s offered) and a saturating closed loop; every status code is reported.
- **Damaged files count differently.** A few LibriVox M4B files are broken at the source
  (tier 1000: `Friedrich Nietzsche/Antichrist`, an extra leading byte; tier 1000-m4b also
  `Charles Dickens/Seven Poor Travellers`, the first 4 bytes missing; ffprobe: "moov atom
  not found"). ABS logs "Invalid data found" and leaves the book out of the library.
  AudioSilo keeps the book (duration 0) and lists it under Health > Issues as "Files that
  couldn't be read". Neither app can play it, so "books found" differs by those books.
  The ABS issues filter shows "No Issues" because ABS never created the items.
- **The admin health pages do different work.** AudioSilo's `/admin/issues` computes ten
  issue categories over the whole library (scan errors, duplicates, unmatched, missing
  covers, ...); the ABS issues filter is one filtered item query. AudioSilo's System tab
  checks community-metadata reachability from the server (one outbound request to
  meta.audiosilo.app, then cached), so its first load includes a network round trip.
- **Memory.** Reading audio files charges page cache to the container's cgroup, so
  `memory.current` and `memory.peak` rise during a scan for both apps without being the
  app's own memory. The anon figure (sampled every 0.5 s) is the comparable one; the
  kernel's `memory.peak` can't be reset on this kernel (6.1), so it covers start-up too.
- **Web UI blocking.** Chromium resolves only the host's IP, so nothing leaves the LAN:
  ABS's release check against api.github.com fails fast (it is listed as blocked).
  Playwright's request interception is deliberately not used because it disables the
  HTTP cache.
- **Web UI timings depend on the client machine** (JS parse and render happen on the
  Mac). Both apps are measured from the same machine, browser and viewport.
- **Other I/O on the same disk.** The tier libraries are hard links on one array disk
  (`/mnt/disk2`). The download that built them was stopped before this run
  (`clean-rerun.sh` stops it), the harness checks the library is not changing, and the
  host load average is recorded around every phase.
- **The library lives on the Unraid array** (`/mnt/user` FUSE over an XFS data disk), so
  cold scans are disk bound for both. A spun-down disk adds seconds to the first access:
  the cache drop does not spin disks down, but a long idle gap before a run can.
- **The host is not otherwise empty**: the owner's other containers (Immich, Nextcloud,
  another AudioSilo, ...) are running but idle; load averages are recorded around every
  phase so a disturbed run can be spotted.

## Results layout

```
results/<tier>/
  run.log, summary.md
  meta.json                 host, other containers, library facts (before/after each app),
                            images (digest, version, sizes), picked books, timings
  <app>/scan_initial_N.json  wall + app-reported time, CPU, sampled memory, idle and
                            settled memory, data dir breakdown, scan log excerpt
  <app>/scan_rescan.json     cold and warm no-change rescans
  <app>/startup.json         cold starts (and AudioSilo's start-up rescan)
  <app>/items.json           every indexed book's folder path (for the sanity diff)
  <app>/latency_spec.json    the exact requests replayed (with tokens)
  <app>/latency_mac.json     per request: every sample, p50/p95/p99/max, sizes, statuses;
                            concurrency_paced and concurrency
  <app>/latency_host.json    the same from the host (--host-latency)
  <app>/latency_cold_covers.json  first request of 30 distinct covers
  <app>/webprobe.json        the grid request and cover URL the real UI sent
  <app>/webui.json           per page and cache state: summary medians, every run with its
                            full request log (start, duration, bytes, cache hit)
  <app>/shots/*.png          what each measured page showed
  <app>/admin_web.json       admin health page loads (every run with its API requests)
  <app>/admin_latency.json   the health page's API requests replayed
  <app>/final_memory.json    memory after all tests
results/<tier>-admin/       admin health measurement added after a tier's main run
results/compare.md          tiers side by side (compare.py; picks up <tier>-admin)
```

Before a run that will be published, make sure the library has stopped changing (the
harness checks for 60 s and warns, `--require-stable` makes it abort), the disk holding it
is spun up, and nothing else heavy is scheduled on the host (parity checks, backups,
mover).
