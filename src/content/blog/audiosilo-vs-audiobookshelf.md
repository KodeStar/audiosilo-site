---
title: "AudioSilo vs Audiobookshelf: features and benchmarks compared"
description: Is AudioSilo a good Audiobookshelf alternative? What each one does that the other doesn't, and benchmarks on the same server and library that you can rerun.
kind: guide
published: 2026-10-28
updated: 2026-10-30
verified: 2026-10-30
appliesTo: Server 2.5.1 (first run 2.5.0); apps 2.5.0 (App Store and Android APK) and 2.0.0 (Google Play); Audiobookshelf 2.37.2
tags: [audiobookshelf, comparison, performance, benchmarks]
covers:
  - server:scanner
  - server:rate_limit
  - server:ebooks
  - server:import
  - server:podcasts
  - server:cast
  - server:household
  - app:stores
  - app:car
  - docs:/users/admin/libraries
  - docs:/users/admin/import
  - docs:/users/listening/reading-the-ebook
related:
  - moving-from-audiobookshelf
  - server-2-5
  - self-hosted-audiobook-server
  - audiobooks-on-unraid
hero: ../../assets/stills/player-desktop-upnext-dark.webp
heroAlt: "The AudioSilo web player in a desktop browser: the library grid with the Up next drawer open, four books queued and the series to continue"
revisions:
  - date: 2026-10-30
    note: "Benchmarks re-run with AudioSilo 2.5.1: first scans about 30 times quicker than Audiobookshelf and now lighter on CPU too; the library disk is an NVMe SSD, not a hard disk; app 2.5.0 is on the App Store."
---

Yes, AudioSilo is a good Audiobookshelf alternative if what you want is audiobooks: a server that never writes to your folders, released phone apps in the App Store and Google Play, and a player built around listening to whole books. Audiobookshelf is the better fit if you also want an ebook library, uploads and tag editing from the browser, podcasts without an extra container, single sign-on, or its big ecosystem of third-party apps and tools. On the same low-power home server and the same libraries of 1,000 to 5,000 audiobooks, AudioSilo 2.5.1 finished its first scan 27 to 35 times sooner using 1 to 2% of the CPU time, rescanned an unchanged library five to seven times faster, idled at under half the memory and handled one and a half to nearly nine times the load. Audiobookshelf sent an already-resized cover a little sooner, and the one query behind its nearest thing to a health page was level or a hair quicker on two of the three libraries. [The benchmark](#the-benchmark) has the details.

[Audiobookshelf](https://audiobookshelf.org/) is a great project. It's mature, it has years of releases behind it, most self-hosting guides recommend it first, and a whole family of third-party apps and tools is built on it. We make AudioSilo, so read this with that in mind: we've tried to be fair, every number below comes from a harness [you can download and run yourself](/benchmarks/2026-10-audiobookshelf/), and we show the results where Audiobookshelf comes out ahead as well as where AudioSilo does.

## At a glance

| | Audiobookshelf | AudioSilo |
|---|---|---|
| Licence | GPL-3.0 | AGPLv3 |
| Built with | Node.js and SQLite | Go and SQLite |
| What it serves | Audiobooks, podcasts and ebooks | Audiobooks, podcasts (with the Bridge) and an audiobook's EPUB |
| Your files | Uploading, merging, metadata editing and embedding | Read-only: edits stay in its database |
| Phone apps | Android and iOS apps in beta (the iOS beta is full) | iPhone, iPad and Android apps in the App Store and Google Play |
| In the car | Android Auto | CarPlay and Android Auto |
| Third-party apps and tools | [A big ecosystem](https://audiobookshelf.org/) | None yet; the [API is documented](https://docs.audiosilo.app/developers/server/api) |
| Web player | PWA | PWA with offline downloads |
| Casting | Chromecast: web, Android | Chromecast: iOS, Android, web |
| Sign-in | Accounts, single sign-on (OpenID Connect), API keys | Accounts, QR-code invites, API keys |
| Metadata | Audible, Google Books, Open Library and more, plus custom providers | Its [community database](https://meta.audiosilo.app), with spoiler-safe recaps and characters |

On Android, Android Auto and casting need app 2.1 or later, which today means [the APK from GitHub](https://docs.audiosilo.app/users/listening/mobile-apps#android-without-google-play): Google Play still has 2.0.0. Reading the EPUB in the apps comes with app 2.5.0, which is in the App Store; on Android it's in the APK for now.

## What Audiobookshelf does that AudioSilo doesn't

- **Ebooks as a library of their own.** EPUB, PDF, comics, AZW3 and MOBI, ebook-only books, and sending a book to a Kindle. AudioSilo reads the EPUB that sits beside an audiobook and keeps your place; ebooks on e-readers (OPDS and Send to Kindle) are on our roadmap.
- **Changing your files from the browser.** Uploading books, writing tags and covers into the files, merging into one M4B and editing chapters. AudioSilo never writes to your library, by design. Uploads and retagging are on our roadmap for the Bridge, the optional companion container that is allowed to write.
- **Podcasts with nothing extra to run.** Audiobookshelf fetches feeds itself and its app downloads episodes. AudioSilo's podcasts need the Bridge, and episodes stream.
- **Single sign-on** with OpenID Connect (Authentik, Authelia, Keycloak and the like). On our roadmap.
- **Metadata from many sources**, plus custom providers. AudioSilo matches against its own community database, which Audiobookshelf can [use as a provider](https://meta.audiosilo.app/audiobookshelf) too.
- **A big ecosystem.** Many third-party apps and tools work with an Audiobookshelf server, and its web app is translated into over 40 languages, to AudioSilo's handful. It also has RSS feeds, share links, playlists and a folder watcher that AudioSilo doesn't.

## What AudioSilo does that Audiobookshelf doesn't

- **Released phone apps in both stores**, for iPhone, iPad and Android, with CarPlay and Android Auto.
- **Read-only by design.** Your folders are the source of truth, so you can mount the library read-only. Edits, matches and covers live in its database, and progress follows a book when you move or rename its folder.
- **Spoiler-safe recaps and characters.** For books in the community database, the player shows who's who and the story so far, only up to where you are. With the Bridge, your server can write them for a book the community hasn't covered yet.
- **A household on one server.** Household members without invites, profiles and kids mode on a shared device, and an opt-in "listening in the house" row.
- **A player built around the whole book.** Time left at your speed, a whole-book timeline with chapters and bookmarks, a "Back to" chip that undoes an accidental jump, a sleep timer that fades out, an Up next queue and a Year in listening.
- **An admin console that shows what needs fixing.** Health lists unreadable files, duplicates, missing covers and unmatched books, with a bulk **Match automatically**, plus listening activity, an audit log and notifications.
- **A way in from Audiobookshelf.** AudioSilo reads Audiobookshelf's `metadata.json` files and imports everyone's listening history and bookmarks. [Moving from Audiobookshelf](/blog/moving-from-audiobookshelf/) has the steps.
- **A smaller footprint**, which brings us to the numbers.

## The benchmark

We ran both servers on the same machine, against the same read-only libraries, with each one's out-of-the-box settings, one at a time. We ran it first on 28 October with AudioSilo 2.5.0, and again on 30 October with AudioSilo 2.5.1, whose first scans are much quicker. The results below are from the second run; both runs' files are published.

### What we measured on

- **Server:** an Intel Core i3-N305 (8 cores) with 16 GB of RAM: a low-power 15 W chip of the kind found in mini PCs and small NAS boxes, not a desktop or a data-centre machine. It runs Unraid (Linux 6.1, Docker 24). The libraries sit on the Unraid array, the usual place for media on Unraid: one XFS data disk, reached through Unraid's array driver and its `/mnt/user` FUSE layer (shfs). That disk is an NVMe SSD (a 4 TB WD Blue SN5000), as is the rest of the array, parity included; the first version of this post called it a hard disk, which was wrong. Each app's own data went on the cache pool, also an NVMe SSD.
- **Client:** a Mac on the same home network, for the API and web timings. The API timings were also repeated on the server itself, over loopback, to take the network out.
- **Software:** Audiobookshelf 2.37.2 (`ghcr.io/advplyr/audiobookshelf`, the current release; the same image in both runs) and AudioSilo 2.5.1 (`ghcr.io/kodestar/audiosilo-server:2.5.1`, commit `62c9aac`). The first run measured AudioSilo from its `:edge` image of 28 October 2026, commit `e465ccb`, the commit tagged as AudioSilo 2.5.0 later that day (the `:edge` build reports its version as `dev-e465ccb`). The images were pinned by digest for each run; the digests are in each tier's `meta.json`.
- **Settings:** each app's defaults, as a new user would get them. The only change was serving AudioSilo over plain HTTP like Audiobookshelf (`AUDIOSILO_TLS_MODE=off`). Both containers mounted the library read-only.
- **Quiet host:** the harness ran one app at a time (Audiobookshelf first, then AudioSilo, never both at once), wiped the app's data folder before every first scan, dropped the Linux page cache before every cold measurement, checked that the library wasn't changing, and recorded the load average around every phase. For the second run it also checked, before each library, that the host was idle (low load, no busy container, the library's disk under 10% busy), which it was every time. Our other containers on that server (18 of them, 19 for the second run) were running but idle.

### The libraries

Three libraries of LibriVox recordings, which are public domain, so anyone can build the same ones. None of them changed during the runs.

| Library | Books | Audio files | Size |
|---|---|---|---|
| 1,000 books, mixed | 1,000 | 12,653 MP3 and 472 M4B | 152 GiB |
| 1,000 books, mostly M4B | 1,000 (750 as M4B, 250 as MP3) | 4,588 MP3 and 1,046 M4B | 153 GiB |
| 5,000 books | 4,949 | 67,497 MP3 and 2,290 M4B | 799 GiB |

The books come from one list: the first 5,000 English LibriVox titles by catalogue number, one recording per title, every third one as M4B where LibriVox offers it. The mixed library is the first 1,000 books of that list that downloaded; the mostly-M4B library takes 750 M4B books and 250 MP3 books from the start of it, to look more like a library of M4Bs ripped from Audible; the 5,000-book library is the whole list, less 51 books whose download from archive.org failed. Folders are laid out `Author/Title/`, each with a `cover.jpg`: archive.org's thumbnail of the LibriVox cover. The list and every library's exact folders are published with the harness.

### How each measure is taken

| Measure | How |
|---|---|
| Initial scan | Fresh data folder, first-run setup, add the library, drop the page cache, time from the request until the app's own "scan finished" signal. Three times per app (once on the 5,000-book library); median. |
| Scan CPU time | User plus system CPU seconds the container used during that scan. |
| No-change rescan | Rescan with nothing changed, three times with a cold page cache and three times warm; median. |
| Memory | The container's anonymous memory (the app's own heap, without the page cache that reading audio files charges to it), sampled every half second. Idle is two minutes after setup with an empty library. |
| Data folder | Size of each app's data folder after the scan. |
| Cold start | Stop the container, drop the page cache, start it, and time until a signed-in request for the first library page answers. Three times; median. |
| API response | The exact requests each app's own web client makes (read from their code and from a real browser session): 5 warm-up requests, then 100 timed ones in a row on one connection. We report the median (p50). |
| First-time cover | The first request for each of 30 covers nothing has asked for yet. |
| Steady and saturating load | 20 clients on library page 1 for 20 seconds: at a steady 40 requests a second in all, and as fast as they can go. |
| Web player | Chromium (Playwright) at 1440x900: time until the first cover in view has loaded, and until every cover in view has. Five runs in a fresh browser (nothing cached, no service worker) and five warm; median. |
| Admin health page | AudioSilo's Health page and Audiobookshelf's nearest equivalent, its bookshelf filtered to items with issues. Five cold and five warm loads; median. |

## The results

Each cell reads **Audiobookshelf / AudioSilo**, from the second run (Audiobookshelf 2.37.2, AudioSilo 2.5.1), and the better of the two is in bold. Lower is better everywhere except the requests answered per second. The three columns are the three libraries above. Where 2.5.1 changed a result from the first run, the text says so.

### Scanning

| Audiobookshelf / AudioSilo | 1,000 mixed | 1,000 mostly M4B | 5,000 |
|---|---|---|---|
| First scan, wall time | 240 s / **6.8 s** | 135 s / **5.0 s** | 1,349 s / **39.9 s** |
| First scan, CPU time used | 1,145 s / **11.4 s** | 395 s / **8.3 s** | 6,352 s / **79.8 s** |
| No-change rescan, cold cache | 4.6 s / **0.8 s** | 3.0 s / **0.5 s** | 21.9 s / **3.6 s** |
| No-change rescan, warm cache | 3.7 s / **0.5 s** | 2.4 s / **0.5 s** | 19.1 s / **2.6 s** |
| Books in the library afterwards | 999 / 1,000 | 998 / 1,000 | 4,947 / 4,949 |

AudioSilo 2.5.1 finished its first scan 27 to 35 times sooner than Audiobookshelf and used 1 to 2% of its CPU time. On the 5,000-book library that's 40 seconds against 22 minutes. This is new in 2.5.1. In the first run, AudioSilo 2.5.0 was only 25 to 40% sooner (171 s, 79 s and 971 s) and used 9 to 37% more CPU time than Audiobookshelf (1,217 s, 530 s and 6,927 s), so Audiobookshelf was the more frugal scanner then. 2.5.0 started ffprobe, a separate program, for every audio file, up to eight at a time, and starting it was most of the work. 2.5.1 reads durations, chapters and tags itself, inside the server, and hands a file to ffprobe only when it isn't sure of it (an unusual MP3 or an odd MP4 layout, say). That needs FFmpeg 7.1 or 8.1, which the Docker image has; with another ffprobe, 2.5.1 reads every file with ffprobe and scans like 2.5.0.

It's the same work, not work put off for later: the same books, the same database size and the same unreadable files as 2.5.0. On the 5,000-book library the per-book durations matched Audiobookshelf's (which come from ffprobe) for 4,946 of the 4,947 books both apps listed. The odd one out is an M4B with a damaged header (Anna Karenina, Book 4): ffprobe and Audiobookshelf read it as 3,510 seconds, AudioSilo as 13,163, closer to what the file's size suggests, and neither app flags the file ([audiosilo-server#276](https://github.com/KodeStar/audiosilo-server/issues/276)).

A rescan with nothing changed took AudioSilo 0.5 to 0.8 seconds on the 1,000-book libraries, against 2.4 to 4.6 seconds for Audiobookshelf; 2.5.1 didn't change rescans. The first version of this post disclosed two harness slips in its times: every warm-cache rescan included about a second the harness spent reading CPU time before it stopped the clock, for both apps, and every Audiobookshelf scan time about half a second spent reading Audiobookshelf's log. Both were fixed in the harness before it was published, and the second run used that harness: neither slip shows in its times, which is why both apps' warm-cache rescans are a second or more quicker here than first reported.

### Memory, disk and start-up

| Audiobookshelf / AudioSilo | 1,000 mixed | 1,000 mostly M4B | 5,000 |
|---|---|---|---|
| Idle, empty library | 49 MiB / **20 MiB** | 48 MiB / **16 MiB** | 51 MiB / **14 MiB** |
| Peak during the first scan | 398 MiB / **54 MiB** | 478 MiB / **48 MiB** | 599 MiB / **113 MiB** |
| A minute after the scan | 197 MiB / **29 MiB** | 71 MiB / **25 MiB** | 312 MiB / **30 MiB** |
| Data folder after the scan | 28 MiB / **17 MiB** | 19 MiB / **17 MiB** | 147 MiB / **66 MiB** |
| Cold start to first library answer | 4.15 s / **2.98 s** | 4.83 s / **3.41 s** | 6.02 s / **3.91 s** |

Memory is the app's own (anonymous) memory. Docker's own figure is higher for both, because reading audio files fills the page cache, which Linux charges to the container; both are in each tier's `summary.md`. AudioSilo's peak during a first scan fell from 228 to 343 MiB in the first run to 48 to 113 MiB with 2.5.1. Two of its figures are a little worse than in the first run, though still ahead: idle memory on the 1,000-book mixed library (20 MiB, from 14; 14 to 16 MiB on the others) and the cold start at 5,000 books (3.91 s, from 3.36 s, in all three tries). The Docker images measured 125 MiB (Audiobookshelf) and 65 MiB (AudioSilo) to download, 343 MiB and 172 MiB unpacked.

### API response times

Medians of 100 requests from the Mac over the home network, in milliseconds.

| Audiobookshelf / AudioSilo | 1,000 mixed | 1,000 mostly M4B | 5,000 |
|---|---|---|---|
| Book page (an M4B book) | 7.62 / **1.46** | 7.82 / **1.62** | 14.39 / **1.78** |
| Press play to first audio byte (MP3) | 14.04 / **5.36** | 14.79 / **5.13** | 21.23 / **5.17** |
| Press play to first audio byte (M4B) | 12.82 / **5.25** | 13.52 / **5.13** | 19.80 / **5.17** |
| Cover, first request | 63.03 / **6.01** | 63.36 / **6.19** | 63.47 / **5.71** |
| Cover, cached | **2.06** / 2.73 | **2.05** / 2.64 | **2.08** / 2.77 |
| Saturating load, answers per second | 1,843 / **14,409** | 1,683 / **14,608** | 1,941 / **14,571** |

Everything here is fast for both: a person can't tell 1 ms from 2 ms. Home, the library pages and search came back in about 1 to 3 ms for both (AudioSilo a little sooner every time), so we've left those rows to each tier's `summary.md`. The biggest gap is under full load: with 20 clients asking for the library's first page as fast as they could from the Mac, AudioSilo answered 7.5 to 8.7 times as many requests a second as Audiobookshelf on every library, on the same low-power server. Two things temper that: AudioSilo answers a repeated request from a saved copy, and run from the server itself the gap was about 1.6 times (see [What the numbers don't show](#what-the-numbers-dont-show)). What also shows is how the gap grows with the size of the library: at 5,000 books Audiobookshelf's book page took about twice as long as at 1,000 and its play start 44 to 54% longer, while AudioSilo's stayed about flat. Audiobookshelf was quicker to send a cover it had already resized on all three libraries, from the Mac and timed on the server itself (1.41 to 1.52 ms there, against AudioSilo's 1.94 to 2.20 ms). AudioSilo's web player doesn't page through the library as Audiobookshelf's does: it loads it all, in pages of 200, which took 6.5 to 6.6 ms for 1,000 books and 33 ms for 4,949.

### Web player

Milliseconds from opening the page in Chromium.

| Audiobookshelf / AudioSilo | 1,000 mixed | 1,000 mostly M4B | 5,000 |
|---|---|---|---|
| Home, cold: first cover | 201 / **179** | 206 / **179** | 213 / **181** |
| Home, cold: every cover in view | 209 / **200** | 212 / **194** | 231 / **197** |
| Library, cold: first cover | 223 / **191** | 223 / **190** | 274 / **191** |
| Library, cold: every cover in view | 239 / **209** | 240 / **203** | 286 / **206** |
| Library, warm: every cover in view | 212 / **188** | 222 / **186** | 268 / **187** |
| Library, cold: downloaded | 4,148 KiB / **2,232 KiB** | 4,150 KiB / **2,246 KiB** | 4,283 KiB / **2,641 KiB** |
| Library, cold: of which JavaScript | 2,643 KiB / **1,300 KiB** | 2,643 KiB / **1,300 KiB** | 2,643 KiB / **1,300 KiB** |

Both web apps put covers on screen in under three tenths of a second. AudioSilo was 9 to 37 ms sooner on every page, and about 80 ms sooner on the 5,000-book library page (Audiobookshelf's took 0.27 seconds this time, 0.35 in the first run). AudioSilo fetches the whole library list where Audiobookshelf fetches only what's on screen, so in the first run it downloaded almost as much as Audiobookshelf on the 5,000-book library (4,220 KiB). Since 2.5.1 compresses its answers, it downloads about 60% as much there.

### Admin health page

| Audiobookshelf / AudioSilo | 1,000 mixed | 1,000 mostly M4B | 5,000 |
|---|---|---|---|
| Page ready, cold (ms) | 196 / **142** | 186 / **145** | 191 / **143** |
| Page ready, warm (ms) | 186 / **138** | 185 / **139** | 183 / **137** |
| Its main request, median (ms) | 1.57 / **1.45** | **1.36** / 1.38 | **1.64** / 1.74 |

This one compares different things. Audiobookshelf has no health page, so the nearest equivalent is its library filtered to items with issues: one query, which came back empty because Audiobookshelf leaves the damaged books out. AudioSilo's Health page counts ten kinds of issue over the whole library (unreadable files, duplicates, missing covers, unmatched books and more) and makes eight requests to Audiobookshelf's five. Audiobookshelf's one query was a little quicker at 5,000 books, as in the first run, and the two were level on the mostly-M4B library; these gaps are a tenth of a millisecond or so, about the run-to-run noise. AudioSilo's answer comes from a cache that is dropped at the next change to the library (see below).

## What the numbers don't show

- **AudioSilo scans several files at once.** It reads one audio file per CPU core at a time, up to eight, and since 2.5.1 it reads them inside the server, so a scan is light on CPU as well as quick (the few files it hands to ffprobe go one at a time). On a NAS with two cores it will use two; on a slow disk or a busy network share you can set `scan.concurrency` lower ([Rescanning](https://docs.audiosilo.app/users/admin/libraries#rescanning) in the docs).
- **AudioSilo keeps list and search answers ready until the library changes.** Book lists, the recent shelf and search answers are saved until the next change to the library. Since 2.5.1, listening, bookmarks and notes leave them alone; in 2.5.0, saving someone's progress threw them away. The benchmark repeats the same request, the saturating-load test included, so it mostly measures these saved answers. After a change to the library they are worked out from scratch, and worked out from scratch, a library page is no faster than before we added this, in our own test of the server code (a generated 5,000-book library on a Mac, not the benchmark server). The console's Health summary is saved the same way.
- **Where the load comes from changes the saturating result.** From the Mac, AudioSilo answered 7.5 to 8.7 times as many requests a second. Run from the server itself, where the load generator competes with the app for the same 8 cores, it was 1.5 to 1.7 times as many: 1,619 / 2,482 on the 1,000-book mixed library, 1,505 / 2,489 on mostly M4B and 1,561 / 2,481 at 5,000. That's lower for AudioSilo than in the first run (2,971, 2,961 and 2,871), by about the same on every library, so it's likely a real small step back in 2.5.1, while from the Mac it went up (from about 12,000).
- **The covers flatter both apps.** The `cover.jpg` files our download script fetched are archive.org's 180x180 pixel thumbnails, smaller than either app's thumbnails, so there's almost no resizing to do. Real audiobook art (500 to 2,400 pixels) costs both apps more on a first request. Treat the cover numbers as a lower bound.
- **AudioSilo rescans every library when it starts.** The cold-start time stops at its first answer, which comes while that rescan is still running in the background.
- **The two apps don't do identical work.** Audiobookshelf loads its library 36 books at a time as you scroll; AudioSilo's web player loads all of it and sorts it in the browser. Audiobookshelf's home is one request; AudioSilo's is several in parallel. Searching for an author's name gives Audiobookshelf an author entry and AudioSilo that author's books. Starting playback creates a session in Audiobookshelf and reads the saved place in AudioSilo. Each row in the harness results records what the answer contained.
- **A few LibriVox files are damaged at the source.** Audiobookshelf leaves those books out of the library; AudioSilo lists them, with a note in Health that their files couldn't be read. Neither can play them, so the book counts differ by one or two.
- **AudioSilo's web player starts from your last visit.** It shows Home and the library as you last saw them, then refreshes them, which helps its warm numbers. The cold runs start from an empty browser, so they get no such help.
- **Web timings depend on the client.** JavaScript runs on the Mac, so a slower laptop or a phone takes longer in both.
- **One machine.** This is one 8-core server with the library on an NVMe SSD. A two-core NAS, an ARM board, a library on hard disks or on a network share will give different numbers, and could change who wins a close row.

## Rerun it yourself

The harness and every result file are on this site: [benchmarks/2026-10-audiobookshelf](/benchmarks/2026-10-audiobookshelf/), for both runs. The second run (AudioSilo 2.5.1) is in the `v251-*` folders, with `v251-summary.md` setting 2.5.0, 2.5.1 and Audiobookshelf side by side; the first run (AudioSilo 2.5.0) stays in the `final-*` folders. It's Python (standard library only) and Node with Playwright on the client, and Docker and SSH on the server. The README there has the protocol and every caveat in full, and each tier's `summary.md` has all the numbers, including the ones too detailed for this post (p95 and maximum times, response sizes, the requests from the server's own loopback, and the exact URLs). If you run it on your own hardware, we'd like to hear what you get.

## Which should you choose?

**Choose Audiobookshelf** if you want one server for audiobooks, podcasts and an ebook library in many formats, if you want to upload books and edit their tags and chapters from the browser, if you need single sign-on today, or if you want its big ecosystem of third-party apps and tools.

**Choose AudioSilo** if you want your folders left exactly as they are, released phone apps with CarPlay and Android Auto, a player and console built around a household listening to whole books, spoiler-safe recaps, or a server that stays small and quick on low-power hardware like ours.

You don't have to decide in one go. Both can run side by side on the same folders, because AudioSilo only reads them: [Moving from Audiobookshelf to AudioSilo](/blog/moving-from-audiobookshelf/) walks through it, from reading Audiobookshelf's `metadata.json` to [importing everyone's listening history](https://docs.audiosilo.app/users/admin/import). If you'd rather stay with Audiobookshelf, its metadata can still come from [AudioSilo's community database](https://meta.audiosilo.app/audiobookshelf).
