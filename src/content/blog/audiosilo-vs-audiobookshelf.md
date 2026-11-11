---
title: "AudioSilo vs Audiobookshelf: features and benchmarks compared"
description: Is AudioSilo a good Audiobookshelf alternative? What each one does that the other doesn't, and benchmarks on the same server and library that you can rerun.
kind: guide
published: 2026-10-28
updated: 2026-11-10
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
supersededBy: audiosilo-vs-the-competition
supersededNote: "There's a newer comparison: AudioSilo 2.6.0 and 2.5.1 against Audiobookshelf, BookOrbit and Grimmory, measured again on a different storage route, with published matching results. Its first-scan, CPU and memory figures replace the ones below."
glance: audiobookshelf
revisions:
  - date: 2026-11-10
    note: "Rewritten to be shorter and easier to read. No facts changed."
  - date: 2026-11-09
    note: "Added an at-a-glance grid at the top, replacing the At a glance table, with the measured figures (including the one where Audiobookshelf is quicker) beside the features. The grid describes the versions this post was checked against."
  - date: 2026-10-30
    note: "Benchmarks re-run with AudioSilo 2.5.1: first scans about 30 times quicker than Audiobookshelf and now lighter on CPU too; the library disk is an NVMe SSD, not a hard disk; app 2.5.0 is on the App Store."
---

Yes, AudioSilo is a good Audiobookshelf alternative if what you want is audiobooks. AudioSilo never writes to your folders, has released phone apps in the App Store and Google Play, and has a player built around listening to whole books. Audiobookshelf fits better if you also want an ebook library, browser uploads and tag editing, podcasts without an extra container, single sign-on, or its big ecosystem of third-party apps and tools.

On the same low-power home server, AudioSilo 2.5.1 was quicker and lighter on almost every measure. Audiobookshelf sent an already-resized cover a little sooner, and its one health-page query was level or slightly quicker on two of the three libraries. [The results](#the-results) have the details.

[Audiobookshelf](https://audiobookshelf.org/) is a great, mature project. We make AudioSilo, so read this with that in mind. Every number comes from [the benchmark harness](/benchmarks/2026-10-audiobookshelf/), which you can run yourself.

## What Audiobookshelf does that AudioSilo doesn't

- **Ebooks as a library of their own:** EPUB, PDF, comics, AZW3 and MOBI, ebook-only books, and sending a book to a Kindle. AudioSilo reads the EPUB beside an audiobook; e-reader support (OPDS and Send to Kindle) is on our roadmap.
- **Changing your files from the browser:** uploads, writing tags and covers, merging into one M4B and editing chapters. Uploads and retagging are on our roadmap for the Bridge, the optional companion container that is allowed to write.
- **Podcasts with nothing extra to run.** AudioSilo's need the Bridge, and episodes stream.
- **Single sign-on** with OpenID Connect (Authentik, Authelia, Keycloak and the like). On our roadmap.
- **Metadata from many sources**, plus custom providers. Audiobookshelf can also [use AudioSilo's community database](https://meta.audiosilo.app/audiobookshelf).
- **A big ecosystem:** many third-party apps and tools, a web app in over 40 languages to AudioSilo's handful, plus RSS feeds, share links, playlists and a folder watcher.

## What AudioSilo does that Audiobookshelf doesn't

- **Released phone apps in both stores**, for iPhone, iPad and Android.
- **Read-only by design.** Edits, matches and covers live in its database, and progress follows a book when you move or rename its folder.
- **Spoiler-safe recaps and characters**, only up to where you are. With the Bridge, your server can write them for a book the community hasn't covered yet.
- **A household on one server:** members without invites, profiles and kids mode on a shared device, and an opt-in "listening in the house" row.
- **A player built around the whole book:** time left at your speed, a whole-book timeline, a "Back to" chip that undoes an accidental jump, a sleep timer that fades out, an Up next queue and a Year in listening.
- **An admin console that shows what needs fixing:** Health lists unreadable files, duplicates, missing covers and unmatched books, with a bulk **Match automatically**.
- **A way in from Audiobookshelf.** AudioSilo reads its `metadata.json` files and imports everyone's listening history and bookmarks ([Moving from Audiobookshelf](/blog/moving-from-audiobookshelf/)).

## The results

Each cell reads **Audiobookshelf / AudioSilo** (Audiobookshelf 2.37.2, AudioSilo 2.5.1), with the better one in bold. Lower is better everywhere except answers per second. The columns are the [three libraries](#the-libraries).

### Scanning

| Audiobookshelf / AudioSilo | 1,000 mixed | 1,000 mostly M4B | 5,000 |
|---|---|---|---|
| First scan, wall time | 240 s / **6.8 s** | 135 s / **5.0 s** | 1,349 s / **39.9 s** |
| First scan, CPU time used | 1,145 s / **11.4 s** | 395 s / **8.3 s** | 6,352 s / **79.8 s** |
| No-change rescan, cold cache | 4.6 s / **0.8 s** | 3.0 s / **0.5 s** | 21.9 s / **3.6 s** |
| No-change rescan, warm cache | 3.7 s / **0.5 s** | 2.4 s / **0.5 s** | 19.1 s / **2.6 s** |
| Books in the library afterwards | 999 / 1,000 | 998 / 1,000 | 4,947 / 4,949 |

- **First scans were 27 to 35 times faster, using 1 to 2% of the CPU time.** This is new in 2.5.1. In the first run, 2.5.0 took only 25 to 40% less time (171 s, 79 s and 971 s) and used 9 to 37% more CPU time (1,217 s, 530 s and 6,927 s).
- **Why:** 2.5.0 started ffprobe, a separate program, for every audio file. 2.5.1 reads durations, chapters and tags itself, and hands a file to ffprobe only when unsure. That needs FFmpeg 7.1 or 8.1, which the Docker image has. With another ffprobe, 2.5.1 scans like 2.5.0.
- **2.5.1 does the same work as 2.5.0, and puts none of it off.** It ended with the same books, database size and unreadable files. At 5,000 books, durations matched Audiobookshelf's for 4,946 of the 4,947 books both listed. The odd one has a damaged header (Anna Karenina, Book 4): Audiobookshelf reads 3,510 seconds, AudioSilo 13,163, closer to what the file's size suggests ([our bug report](https://github.com/KodeStar/audiosilo-server/issues/276)).
- 2.5.1 didn't change rescans.

### Memory, disk and start-up

| Audiobookshelf / AudioSilo | 1,000 mixed | 1,000 mostly M4B | 5,000 |
|---|---|---|---|
| Idle, empty library | 49 MiB / **20 MiB** | 48 MiB / **16 MiB** | 51 MiB / **14 MiB** |
| Peak during the first scan | 398 MiB / **54 MiB** | 478 MiB / **48 MiB** | 599 MiB / **113 MiB** |
| A minute after the scan | 197 MiB / **29 MiB** | 71 MiB / **25 MiB** | 312 MiB / **30 MiB** |
| Data folder after the scan | 28 MiB / **17 MiB** | 19 MiB / **17 MiB** | 147 MiB / **66 MiB** |
| Cold start to first library answer | 4.15 s / **2.98 s** | 4.83 s / **3.41 s** | 6.02 s / **3.91 s** |

AudioSilo's scan peak fell from 228 to 343 MiB in the first run to 48 to 113 MiB with 2.5.1. Two figures got a little worse, though still ahead: idle memory on the mixed library (20 MiB, from 14) and the cold start at 5,000 books (3.91 s, from 3.36 s). The Docker images are 125 MiB (Audiobookshelf) and 65 MiB (AudioSilo) to download, 343 MiB and 172 MiB unpacked.

### API response times

Medians of 100 requests from a Mac on the home network, in milliseconds.

| Audiobookshelf / AudioSilo | 1,000 mixed | 1,000 mostly M4B | 5,000 |
|---|---|---|---|
| Book page (an M4B book) | 7.62 / **1.46** | 7.82 / **1.62** | 14.39 / **1.78** |
| Press play to first audio byte (MP3) | 14.04 / **5.36** | 14.79 / **5.13** | 21.23 / **5.17** |
| Press play to first audio byte (M4B) | 12.82 / **5.25** | 13.52 / **5.13** | 19.80 / **5.17** |
| Cover, first request | 63.03 / **6.01** | 63.36 / **6.19** | 63.47 / **5.71** |
| Cover, cached | **2.06** / 2.73 | **2.05** / 2.64 | **2.08** / 2.77 |
| Saturating load, answers per second | 1,843 / **14,409** | 1,683 / **14,608** | 1,941 / **14,571** |

Both are fast. Nobody can tell 1 ms from 2 ms. Home, library pages and search took about 1 to 3 ms for both, and AudioSilo was a little quicker every time.

- **Under full load** from the Mac, AudioSilo answered 7.5 to 8.7 times as many requests a second. From the server itself the gap was about 1.6 times (see [What the numbers don't show](#what-the-numbers-dont-show)).
- **Library size:** at 5,000 books Audiobookshelf's book page took about twice as long as at 1,000, and its play start 44 to 54% longer. AudioSilo's stayed about flat.
- **Cached covers:** Audiobookshelf was quicker, on the server itself too (1.41 to 1.52 ms, against AudioSilo's 1.94 to 2.20 ms).

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

Both put covers on screen in under three tenths of a second. AudioSilo fetches the whole library list, so in the first run it downloaded almost as much at 5,000 books (4,220 KiB). Since 2.5.1 compresses its answers, it downloads about 60% as much.

### Admin health page

| Audiobookshelf / AudioSilo | 1,000 mixed | 1,000 mostly M4B | 5,000 |
|---|---|---|---|
| Page ready, cold (ms) | 196 / **142** | 186 / **145** | 191 / **143** |
| Page ready, warm (ms) | 186 / **138** | 185 / **139** | 183 / **137** |
| Its main request, median (ms) | 1.57 / **1.45** | **1.36** / 1.38 | **1.64** / 1.74 |

This compares different things. Audiobookshelf has no health page, so we used its library filtered to items with issues: one query, empty because it leaves damaged books out. AudioSilo's page counts ten kinds of issue and makes eight requests to Audiobookshelf's five. The main-request gaps are about the run-to-run noise.

## What the numbers don't show

- **AudioSilo keeps list and search answers ready until the library changes.** The benchmark repeats the same request, so it mostly measures these saved answers. Worked out from scratch, a library page is no faster than before we added this, in our own test (a generated 5,000-book library on a Mac). Since 2.5.1, listening, bookmarks and notes don't clear them; in 2.5.0, saving progress did.
- **Where the load comes from matters.** From the server itself, where the load generator competes for the same 8 cores, AudioSilo answered 1.5 to 1.7 times as many: 1,619 / 2,482 (mixed), 1,505 / 2,489 (mostly M4B) and 1,561 / 2,481 (5,000). That's lower for AudioSilo than in the first run (2,971, 2,961 and 2,871), likely a real small step back in 2.5.1. From the Mac it went up (from about 12,000).
- **The covers flatter both apps.** The `cover.jpg` files are archive.org's 180x180 pixel thumbnails. Real art (500 to 2,400 pixels) costs both more on a first request, so treat cover numbers as a lower bound.
- **AudioSilo scans one file per CPU core, up to eight.** On a slow disk or busy network share you can set `scan.concurrency` lower ([Rescanning](https://docs.audiosilo.app/users/admin/libraries#rescanning)).
- **AudioSilo rescans every library when it starts.** The cold-start time stops at its first answer, while that rescan still runs.
- **The apps don't do identical work.** Audiobookshelf loads its library 36 books at a time as you scroll; AudioSilo loads it all and sorts it in the browser. Starting playback creates a session in Audiobookshelf and reads the saved place in AudioSilo. The harness results record what each answer contained.
- **AudioSilo's web player starts from your last visit,** which helps its warm numbers. Cold runs start from an empty browser.
- **One machine.** A two-core NAS, an ARM board, hard disks or a network share will give different numbers, and could change who wins a close row. Web timings also depend on the client.

## Good to know

- **Android app versions at the time:** Android Auto and casting needed app 2.1 or later, which meant [the APK from GitHub](https://docs.audiosilo.app/users/listening/mobile-apps#android-without-google-play), as Google Play still had 2.0.0. Reading the EPUB in the apps came with app 2.5.0, in the App Store and, on Android, in the APK.
- **Trying both:** they can run side by side on the same folders, because AudioSilo only reads them. [Moving from Audiobookshelf to AudioSilo](/blog/moving-from-audiobookshelf/) walks through it, including [importing everyone's listening history](https://docs.audiosilo.app/users/admin/import). If you stay with Audiobookshelf, its metadata can still come from [AudioSilo's community database](https://meta.audiosilo.app/audiobookshelf).

## The benchmark

Both servers ran on the same machine, against the same read-only libraries, with default settings, one at a time. The first run was on 28 October with AudioSilo 2.5.0, the second on 30 October with 2.5.1. The results above are from the second run.

### What we measured on

- **Server:** an Intel Core i3-N305 (8 cores, 16 GB RAM), a low-power 15 W chip, running Unraid (Linux 6.1, Docker 24).
- **Storage:** one XFS array disk, reached through Unraid's `/mnt/user` FUSE layer (shfs). It's an NVMe SSD (a 4 TB WD Blue SN5000), as is the rest of the array; the first version of this post wrongly called it a hard disk. App data went on the NVMe cache pool.
- **Client:** a Mac on the same home network. API timings were repeated on the server over loopback.
- **Software:** Audiobookshelf 2.37.2 (`ghcr.io/advplyr/audiobookshelf`) and AudioSilo 2.5.1 (`ghcr.io/kodestar/audiosilo-server:2.5.1`, commit `62c9aac`). The first run used AudioSilo's `:edge` image of 28 October 2026, commit `e465ccb`, tagged 2.5.0 later that day. Images were pinned by digest (in each tier's `meta.json`).
- **Settings:** defaults, except serving AudioSilo over plain HTTP like Audiobookshelf (`AUDIOSILO_TLS_MODE=off`).
- **Quiet host:** one app at a time, a wiped data folder before every first scan, the page cache dropped before every cold measurement. The second run also checked the host was idle before each library, which it was every time. Our other containers (18, then 19) were running but idle.
- **Harness fixes:** two slips the first version disclosed (about a second in every warm rescan, half a second in every Audiobookshelf scan) were fixed before the harness was published. That's why warm rescans are a second or more quicker here than first reported.

### The libraries

Public-domain LibriVox recordings, so anyone can build the same ones.

| Library | Books | Audio files | Size |
|---|---|---|---|
| 1,000 books, mixed | 1,000 | 12,653 MP3 and 472 M4B | 152 GiB |
| 1,000 books, mostly M4B | 1,000 (750 as M4B, 250 as MP3) | 4,588 MP3 and 1,046 M4B | 153 GiB |
| 5,000 books | 4,949 | 67,497 MP3 and 2,290 M4B | 799 GiB |

All come from the first 5,000 English LibriVox titles by catalogue number, every third one as M4B where offered. The mostly-M4B library looks more like M4Bs ripped from Audible. The 5,000-book library lacks 51 failed archive.org downloads. Folders are `Author/Title/`, each with a `cover.jpg`. The list is published with the harness.

### How each measure is taken

| Measure | How |
|---|---|
| First scan | Fresh data folder, first-run setup, add the library, drop the page cache, time from the request until the app's own "scan finished" signal. Three times per app (once on the 5,000-book library); median. |
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

### Rerun it yourself

The harness and every result file are at [benchmarks/2026-10-audiobookshelf](/benchmarks/2026-10-audiobookshelf/). The second run is in the `v251-*` folders (`v251-summary.md` sets 2.5.0, 2.5.1 and Audiobookshelf side by side); the first is in `final-*`. It needs Python and Node with Playwright on the client, and Docker and SSH on the server. Each tier's `summary.md` has every number, including Docker's memory figures. If you run it on your own hardware, we'd like to hear what you get.
