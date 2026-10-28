---
# TODO(release v2.5.0): /blog release sets published and verified once both stores carry
# app 2.5.0 (see the TODO comment under "At a glance").
title: "AudioSilo vs Audiobookshelf: features and benchmarks compared"
description: Is AudioSilo a good Audiobookshelf alternative? What each one does that the other doesn't, and benchmarks on the same server and library that you can rerun.
kind: guide
published: 2026-10-28
verified: 2026-10-28
appliesTo: Server 2.5.0, app 2.5.0; Audiobookshelf 2.37.2
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
  - self-hosted-audiobook-server
  - audiobooks-on-unraid
hero: ../../assets/stills/player-desktop-upnext-dark.webp
heroAlt: "The AudioSilo web player in a desktop browser: the library grid with the Up next drawer open, four books queued and the series to continue"
draft: true
---

Yes, AudioSilo is a good Audiobookshelf alternative if what you want is audiobooks: a server that never writes to your folders, released phone apps in the App Store and Google Play, and a player built around listening to whole books. Audiobookshelf is the better fit if you also want an ebook library in many formats, uploads and tag editing from the browser, podcasts without an extra container, single sign-on, or a choice of third-party apps. On the same 8-core server and the same 1,000 to 5,000 LibriVox audiobooks, AudioSilo 2.5.0 finished its first scan 25 to 40% sooner, rescanned an unchanged library about 3 to 7 times faster, idled at 14 MiB of memory to Audiobookshelf's roughly 50, and answered nearly every request we timed sooner. Audiobookshelf used less CPU time to scan, served covers it had already resized faster (on the 1,000-book libraries from our Mac, and on all three from the server itself), and edged one admin request at 5,000 books.

Audiobookshelf is a great project. It's mature, it has years of releases behind it, most self-hosting guides recommend it first, and a whole family of third-party apps is built on it. We make AudioSilo, so read this with that in mind: we've tried to be fair, every number below comes from a harness [you can download and run yourself](/benchmarks/2026-10-audiobookshelf/), and we show the results where Audiobookshelf comes out ahead as well as where AudioSilo does.

## At a glance

| | Audiobookshelf 2.37.2 | AudioSilo 2.5.0 |
|---|---|---|
| Licence | GPL-3.0 | AGPLv3 (server and player) |
| Built with | Node.js and SQLite | Go and SQLite |
| What it serves | Audiobooks, podcasts and ebooks (EPUB, PDF, CBR, CBZ, AZW3, MOBI) | Audiobooks, an audiobook's EPUB, and podcasts with the optional Bridge container |
| Your files | Can upload books, write tags and covers into files, merge files into an M4B and edit chapters | Never writes to your library: edits live in its database |
| Phone apps | Android app in beta on Google Play; iOS app in beta on TestFlight (its beta is full) | iPhone, iPad and Android apps in the App Store and Google Play |
| In the car | Android Auto | CarPlay and Android Auto |
| Third-party apps | Many (Absorb, ShelfPlayer, Lissen, Prologue and more) | None: AudioSilo's own apps only |
| Web player | Yes, installable | Yes, installable, with offline downloads |
| Casting | Chromecast from the web app and the Android app | Chromecast from the apps, and from the web player in Chromium browsers over HTTPS |
| Sign-in | Accounts, OpenID Connect single sign-on, API keys | Accounts, invites by QR code, API keys |
| Metadata | Audible, Google Books, iTunes, Open Library and more, plus custom providers | Its community database at [meta.audiosilo.app](https://meta.audiosilo.app), with spoiler-safe recaps and characters |
| Docker image (measured, amd64) | 125 MiB to download, 343 MiB unpacked | 65 MiB to download, 171 MiB unpacked |

<!-- TODO(release v2.5.0): publish only once both stores carry app 2.5.0 (the reader in the apps, Android Auto and casting on Android). Checked 2026-10-28: the App Store had 2.4.1 (CarPlay and casting, no reader) and Google Play still had 2.0.0 (no Android Auto, no casting, no reader); app 2.5.0 was out only as the APK on its GitHub release. If Play is still behind, say Android Auto and casting need the GitHub APK. -->

## What Audiobookshelf does that AudioSilo doesn't

- **Ebooks as a library of their own.** Audiobookshelf reads EPUB, PDF, comics (CBR and CBZ), AZW3 and MOBI, holds ebook-only books, and can email a book to a Kindle or another e-reader. AudioSilo 2.5.0 reads one EPUB that sits beside an audiobook, in the web player and the apps, and keeps your place across devices; a folder with only an ebook in it isn't a book to AudioSilo, and PDFs and comics aren't read at all. Getting ebooks onto e-readers (an OPDS catalogue and Send to Kindle) is on our roadmap.
- **Changing your files from the browser.** Audiobookshelf can upload books, write metadata and covers into the audio files, merge a book's files into one M4B and edit chapter times. AudioSilo never writes to your library, by design. Uploads, an inbox folder and renaming and retagging files are on our roadmap for the Bridge, the optional companion container that is allowed to write. A chapter-time editor is on our roadmap too. Merging into M4B isn't: a book made of many files already plays as one timeline in AudioSilo.
- **Podcasts with nothing extra to run.** Audiobookshelf downloads podcasts itself, its app downloads episodes for offline listening, and it can notify you about new episodes and failing feeds. AudioSilo's podcasts need its Bridge container to fetch the feeds, and episodes stream from your server; downloading episodes in the apps and podcast notifications are both on our roadmap.
- **Single sign-on.** Audiobookshelf signs in with OpenID Connect (Authentik, Authelia, Keycloak and the like). That's on our roadmap.
- **Metadata from many sources.** Audiobookshelf matches against Audible, Google Books, iTunes, Open Library and others, and takes custom metadata providers. AudioSilo matches against its own community database only; custom providers are on our roadmap. (AudioSilo's database is one of Audiobookshelf's [community providers](https://meta.audiosilo.app/audiobookshelf), so you can use it there today.)
- **Sharing outward.** Audiobookshelf can open an RSS feed for a book, series or podcast, and make a public share link for a book that expires. AudioSilo has neither; a time-limited guest link for one book is on our roadmap.
- **Playlists.** Audiobookshelf has per-person playlists that mix books and podcast episodes. AudioSilo has collections and an Up next queue, but no playlists.
- **Noticing new files on its own.** Audiobookshelf watches the library folder. AudioSilo rescans when it starts, on a schedule you set, when you ask, and opens a new book folder someone browses to before it has been scanned.
- **Third-party apps and languages.** Many apps talk to an Audiobookshelf server, so if you don't like the official one you can pick another. AudioSilo works only with its own apps. Audiobookshelf's web app is also translated into over 40 languages; AudioSilo's player into a handful, and not every screen yet.

## What AudioSilo does that Audiobookshelf doesn't

- **Phone apps in both stores.** The AudioSilo apps for iPhone, iPad and Android are released apps in the App Store and Google Play, not betas, with CarPlay on the iPhone and Android Auto on Android. Audiobookshelf's own iOS app is a TestFlight beta that is currently full, and has no CarPlay (some third-party Audiobookshelf apps do).
- **Read-only by design.** AudioSilo treats your folders as the source of truth and never writes to them, so you can mount the library read-only. Your edits, matches and custom covers live in its database, and progress and bookmarks follow a book when you move or rename its folder.
- **Spoiler-safe recaps and characters.** For books in the community database, the player shows who's who and the story so far, only up to where you are in the book. With the optional Bridge, your server can write them for a book the community hasn't covered yet.
- **A household on one server.** Household members (add a child or a partner without an invite), profiles and kids mode on a shared device with an optional PIN, and an opt-in "listening in the house" row.
- **A player built around the whole book.** Time left at your speed and when you'll finish, a timeline of the whole book with its chapters and bookmarks, a "Back to" chip that undoes an accidental jump, a sleep timer that fades out and marks where you dozed off, an Up next queue, a journal of bookmarks and notes you can export, and a shareable Year in listening.
- **An admin console that shows what needs fixing.** Health lists unreadable files, duplicates, missing covers and unmatched books, with a bulk **Match automatically**; Activity shows who listened, when and to what; and there's an audit log, notifications (webhook, ntfy, Discord) and a guided first-run setup.
- **A way in from Audiobookshelf.** AudioSilo reads the `metadata.json` files Audiobookshelf leaves beside your books and imports everyone's listening history, progress, finished dates and bookmarks. [Moving from Audiobookshelf](/blog/moving-from-audiobookshelf/) has the steps.
- **A smaller footprint**, which brings us to the numbers.

## The benchmark

We ran both servers on the same machine, against the same read-only libraries, with each one's out-of-the-box settings, one at a time.

### What we measured on

- **Server:** an Intel Core i3-N305 (8 cores) with 16 GB of RAM, running Unraid (Linux 6.1, Docker 24). The libraries sit on the Unraid array, a hard disk reached through Unraid's `/mnt/user` FUSE layer (shfs), the usual place for media on Unraid. Each app's own data went on the cache pool.
- **Client:** a Mac on the same home network, for the API and web timings. The API timings were also repeated on the server itself, over loopback, to take the network out.
- **Software:** Audiobookshelf 2.37.2 (`ghcr.io/advplyr/audiobookshelf`, the current release) and AudioSilo from its `:edge` image of 28 October 2026, commit `e465ccb`, the commit tagged as AudioSilo 2.5.0 later that day (the `:edge` build reports its version as `dev-e465ccb`). Both images were pinned by digest for the whole run; the digests are in each tier's `meta.json`.
- **Settings:** each app's defaults, as a new user would get them. The only change was serving AudioSilo over plain HTTP like Audiobookshelf (`AUDIOSILO_TLS_MODE=off`). Both containers mounted the library read-only.
- **Quiet host:** the harness ran one app at a time (Audiobookshelf first, then AudioSilo, never both at once), wiped the app's data folder before every first scan, dropped the Linux page cache before every cold measurement, checked that the library wasn't changing, and recorded the load average around every phase. Our other containers on that server were running but idle; their names are in `meta.json`.

### The libraries

Three libraries of LibriVox recordings, which are public domain, so anyone can build the same corpus. Each tier is a frozen set of hard links that never changed during the runs.

| Library | Books | Audio files | Size |
|---|---|---|---|
| 1,000 books, mixed | 1,000 | 12,653 MP3 and 472 M4B | 152 GiB |
| 1,000 books, mostly M4B | 1,000 (750 as M4B, 250 as MP3) | 4,588 MP3 and 1,046 M4B | 153 GiB |
| 5,000 books | 4,949 | 67,497 MP3 and 2,290 M4B | 799 GiB |

The books come from one list: the first 5,000 English LibriVox titles by catalogue number, one recording per title, every third one as M4B where LibriVox offers it. The mixed tier is the first 1,000 books of that list that downloaded; the mostly-M4B tier takes 750 M4B books and 250 MP3 books from the start of it, closer to a library of M4Bs ripped from Audible; the 5,000 tier is the whole list, less 51 books whose download from archive.org failed. Folders are laid out `Author/Title/`, each with LibriVox's `cover.jpg`. The list and every tier's exact folders are published with the harness.

### How each measure is taken

| Measure | How |
|---|---|
| Initial scan | Fresh data folder, first-run setup, add the library, drop the page cache, time from the request until the app's own "scan finished" signal. Three times per app (once on the 5,000 tier); median. |
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

Each cell reads **Audiobookshelf / AudioSilo**, and the better of the two is in bold. Lower is better everywhere except the requests answered per second. The three columns are the three libraries above.

### Scanning

| Audiobookshelf / AudioSilo | 1,000 mixed | 1,000 mostly M4B | 5,000 |
|---|---|---|---|
| First scan, wall time | 230 s / **171 s** | 132 s / **79 s** | 1,298 s / **971 s** |
| First scan, CPU time used | **1,113 s** / 1,217 s | **387 s** / 530 s | **6,280 s** / 6,927 s |
| No-change rescan, cold cache | 5.1 s / **0.8 s** | 3.6 s / **0.5 s** | 21.8 s / **3.4 s** |
| No-change rescan, warm cache | 5.4 s / **1.6 s** | 4.0 s / **1.4 s** | 20.5 s / **3.5 s** |
| Books in the library afterwards | 999 / 1,000 | 998 / 1,000 | 4,947 / 4,949 |

AudioSilo finished its first scan 25 to 40% sooner, but used 9 to 37% more CPU time doing it: it reads up to eight files at once, which finishes sooner but costs more CPU time in all. Audiobookshelf is the more frugal scanner. On the 1,000-book libraries the difference was about a minute; on the 5,000-book library AudioSilo's first scan took 16 minutes and Audiobookshelf's 22. A rescan with nothing changed took AudioSilo 0.5 to 1.6 seconds on the 1,000-book libraries, against 3.6 to 5.4 seconds for Audiobookshelf.

### Memory, disk and start-up

| Audiobookshelf / AudioSilo | 1,000 mixed | 1,000 mostly M4B | 5,000 |
|---|---|---|---|
| Idle, empty library | 50 MiB / **14 MiB** | 48 MiB / **14 MiB** | 51 MiB / **14 MiB** |
| Peak during the first scan | 446 MiB / **228 MiB** | 440 MiB / **302 MiB** | 609 MiB / **343 MiB** |
| A minute after the scan | 199 MiB / **23 MiB** | 125 MiB / **25 MiB** | 315 MiB / **31 MiB** |
| Data folder after the scan | 28 MiB / **17 MiB** | 19 MiB / **17 MiB** | 147 MiB / **66 MiB** |
| Cold start to first library answer | 4.54 s / **3.13 s** | 4.41 s / **3.32 s** | 6.11 s / **3.36 s** |

Memory is the app's own (anonymous) memory. Docker's own figure is higher for both, because reading audio files fills the page cache, which Linux charges to the container; both are in each tier's `summary.md`. The Docker images measured 125 MiB (Audiobookshelf) and 65 MiB (AudioSilo) to download, 343 MiB and 171 MiB unpacked.

### API response times

Medians of 100 requests from the Mac over the home network, in milliseconds.

| Audiobookshelf / AudioSilo | 1,000 mixed | 1,000 mostly M4B | 5,000 |
|---|---|---|---|
| Home | 1.90 / **1.60** | 2.17 / **1.56** | 1.61 / **1.21** |
| Library, first page | 2.07 / **1.30** | 2.22 / **1.44** | 2.01 / **0.94** |
| Library, a page deep in | 2.02 / **1.29** | 2.22 / **1.45** | 2.42 / **0.91** |
| Search "the" | 2.38 / **1.38** | 2.08 / **1.54** | 4.11 / **1.24** |
| Search "bleak house" | 1.83 / **1.38** | 1.98 / **1.45** | 2.22 / **1.04** |
| Book page (an M4B book) | 7.22 / **1.52** | 8.11 / **1.71** | 15.33 / **1.69** |
| Press play to first audio byte (MP3) | 14.05 / **5.28** | 15.09 / **5.47** | 22.73 / **5.30** |
| Press play to first audio byte (M4B) | 12.03 / **5.29** | 13.80 / **5.34** | 20.86 / **5.06** |
| Cover, first request | 63.50 / **6.15** | 63.44 / **6.08** | 62.29 / **5.70** |
| Cover, cached | **2.01** / 2.81 | **1.85** / 2.80 | 2.77 / **2.47** |
| Steady 40 requests a second, p95 | 2.75 / **1.83** | 3.49 / **3.01** | 8.87 / **2.00** |
| Saturating load, answers per second | 1,841 / **12,544** | 1,716 / **12,086** | 2,024 / **12,130** |

Everything here is fast for both: a person can't tell 1 ms from 2 ms. What shows is how the gaps grow with the library: at 5,000 books Audiobookshelf's book page took about twice as long as at 1,000 and its play start 50 to 75% longer, while AudioSilo's stayed flat. Audiobookshelf served a cover it had already resized sooner on both 1,000-book libraries, and on all three in the runs from the server itself. AudioSilo's web player doesn't page through the library as Audiobookshelf's does: it loads it all, in pages of 200, which took 6.5 to 7.6 ms for 1,000 books and 29 ms for 4,949.

### Web player

Milliseconds from opening the page in Chromium.

| Audiobookshelf / AudioSilo | 1,000 mixed | 1,000 mostly M4B | 5,000 |
|---|---|---|---|
| Home, cold: first cover | 205 / **177** | 211 / **188** | 218 / **189** |
| Home, cold: every cover in view | 214 / **195** | 217 / **205** | 226 / **205** |
| Library, cold: first cover | 219 / **190** | 231 / **203** | 350 / **195** |
| Library, cold: every cover in view | 237 / **205** | 246 / **222** | 367 / **216** |
| Library, warm: every cover in view | 221 / **184** | 221 / **197** | 337 / **189** |
| Library, cold: downloaded | 4,148 KiB / **2,552 KiB** | 4,150 KiB / **2,564 KiB** | 4,283 KiB / **4,220 KiB** |
| Library, cold: of which JavaScript | 2,643 KiB / **1,297 KiB** | 2,643 KiB / **1,297 KiB** | 2,643 KiB / **1,297 KiB** |

Both web apps put covers on screen in about a quarter of a second or less, apart from Audiobookshelf's library at 5,000 books (about 0.35 seconds). AudioSilo was a few tens of milliseconds sooner on every page, and about 150 ms sooner on that 5,000-book library. On the 5,000-book library AudioSilo downloads almost as much as Audiobookshelf, because it fetches the whole library list where Audiobookshelf fetches only what's on screen.

### Admin health page

| Audiobookshelf / AudioSilo | 1,000 mixed | 1,000 mostly M4B | 5,000 |
|---|---|---|---|
| Page ready, cold (ms) | 187 / **138** | 196 / **145** | 238 / **147** |
| Page ready, warm (ms) | 181 / **137** | 188 / **144** | 223 / **141** |
| Its main request, median (ms) | 1.54 / **1.48** | 1.70 / **1.55** | **1.37** / 1.51 |

This one compares different things. Audiobookshelf has no health page, so the nearest equivalent is its library filtered to items with issues: one query, which came back empty because Audiobookshelf leaves the damaged books out. AudioSilo's Health page counts ten kinds of issue over the whole library (unreadable files, duplicates, missing covers, unmatched books and more) and makes eight requests to Audiobookshelf's five. Audiobookshelf's one query was a little quicker at 5,000 books; AudioSilo's answer comes from a cache that is dropped at the next change (see below).

## What the numbers don't show

- **AudioSilo scans several files at once.** It probes up to eight audio files at a time (one per CPU core, up to 8), which is why its scans finish sooner but use more CPU time in total. On a NAS with two cores it will use two; on a slow disk or a busy network share you can set `scan.concurrency` lower ([Rescanning](https://docs.audiosilo.app/users/admin/libraries#rescanning) in the docs).
- **AudioSilo keeps list and search answers ready until something changes.** Book lists, the recent shelf and search answers are cached until the next write to its database, and a progress save is a write. The benchmark repeats the same request, so it mostly measures the cached answer; in a household where people are listening, the cache is dropped often and many requests take the uncached path. The first request after each write is the uncached one, and for a library page that path is no faster than before the cache was added: about 2 to 2.5 ms against 1.7 to 1.9 ms in our own in-process test of the server code (a generated 5,000-book library, on a Mac, not on the benchmark server). The console's Health summary is cached the same way. The saturating-load test repeats one library page, so AudioSilo's numbers there are cached answers too.
- **Where the load comes from changes the saturating result.** From the Mac, AudioSilo answered six to seven times as many requests a second. Run from the server itself, where the load generator competes with the app for the same 8 cores, it was about twice as many: 1,592 / 2,971 on the 1,000-book mixed library, 1,448 / 2,961 on mostly M4B and 1,593 / 2,871 at 5,000.
- **The covers flatter both apps.** LibriVox's `cover.jpg` files are only 180x180 pixels, smaller than either app's thumbnails, so there's almost no resizing to do. Real audiobook art (500 to 2,400 pixels) costs both apps more on a first request. Treat the cover numbers as a lower bound.
- **AudioSilo rescans every library when it starts.** The cold-start time is until it answers, which it does while that rescan runs in the background.
- **The two apps don't do identical work.** Audiobookshelf loads its library 36 books at a time as you scroll; AudioSilo's web player loads the whole library in pages of 200 and sorts it in the browser. Audiobookshelf's home is one request; AudioSilo's is several in parallel. Searching for an author's name gives Audiobookshelf an author entry and AudioSilo that author's books. Starting playback creates a session in Audiobookshelf and reads the saved place in AudioSilo. Each row in the harness results records what the answer contained.
- **A few LibriVox files are damaged at the source.** Audiobookshelf leaves those books out of the library; AudioSilo lists them, with a note in Health that their files couldn't be read. Neither can play them, so the book counts differ by one or two.
- **AudioSilo's web player paints from your last visit.** It shows Home and the library as you last saw them, then refreshes them, so its warm numbers include that saved first paint. The cold runs start from an empty browser and have none.
- **Web timings depend on the client.** JavaScript runs on the Mac, so a slower laptop or a phone takes longer in both.
- **One machine.** This is one 8-core server with the library on a hard disk. A two-core NAS, an ARM board or a library on a network share will give different numbers, and could change who wins a close row.

## Rerun it yourself

The harness and every result file are on this site: [benchmarks/2026-10-audiobookshelf](/benchmarks/2026-10-audiobookshelf/). It's Python (standard library only) and Node with Playwright on the client, and Docker and SSH on the server. The README there has the protocol and every caveat in full, and each tier's `summary.md` has all the numbers, including the ones too detailed for this post (p95 and maximum times, response sizes, the requests from the server's own loopback, and the exact URLs). If you run it on your own hardware, we'd like to hear what you get.

## Which should you choose?

**Choose Audiobookshelf** if you want one server for audiobooks, podcasts and an ebook library in many formats, if you want to upload books and edit their tags and chapters from the browser, if you need single sign-on today, or if you'd like to pick from the many third-party apps.

**Choose AudioSilo** if you want your folders left exactly as they are, released phone apps with CarPlay and Android Auto, a player and console built around a household listening to whole books, spoiler-safe recaps, or a server that stays small and quick on low-power hardware like ours.

You don't have to decide in one go. Both can run side by side on the same folders, because AudioSilo only reads them: [Moving from Audiobookshelf to AudioSilo](/blog/moving-from-audiobookshelf/) walks through it, from reading Audiobookshelf's `metadata.json` to [importing everyone's listening history](https://docs.audiosilo.app/users/admin/import). If you'd rather stay with Audiobookshelf, its metadata can still come from [AudioSilo's community database](https://meta.audiosilo.app/audiobookshelf).
