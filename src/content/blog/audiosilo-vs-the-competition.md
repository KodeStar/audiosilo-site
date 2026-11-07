---
title: "AudioSilo vs the competition: matching, first scans and everyday features"
description: "AudioSilo, Audiobookshelf, BookOrbit and Grimmory compared on first scans, matching, memory, CPU and the features that help you choose."
kind: guide
published: 2026-11-07
updated: 2026-11-07
verified: 2026-11-07
appliesTo: "AudioSilo 2.6.0 and 2.5.1; Audiobookshelf 2.37.2; BookOrbit 3.6.0; Grimmory 3.5.0. Published matching covers AudioSilo 2.5.1; the 2.6.0 matching figures are from our own harness."
tags: [comparison, audiobookshelf, bookorbit, grimmory, metadata, benchmarks]
covers:
  - server:scanner
  - server:metadata
  - server:ebooks
  - server:podcasts
  - server:household
  - app:offline
  - app:car
  - app:watch
  - docs:/users/admin/libraries
related:
  - audiosilo-vs-audiobookshelf
  - moving-from-audiobookshelf
  - self-hosted-audiobook-server
revisions:
  - date: 2026-11-07
    note: "Added the completed Phase E local matching result and distinguished it from LibraForge's published audit."
  - date: 2026-11-07
    note: "Updated for the 2.6.0 release: released 2.6.0 and 2.5.1 measured side by side on the same host, and matching times plus a 2.6.0 row added to the matching table."
draft: true
---

Choose AudioSilo if you want a small audiobook server that reads your existing folders, with a player built around listening across devices. Choose Audiobookshelf for its established audiobook and podcast tools and client ecosystem. BookOrbit and Grimmory deserve a look if reading ebooks, PDFs and comics matters as much as listening. Their strengths go well beyond how quickly they can index audio.

We make AudioSilo. Here we compare those four playback servers using a fresh first-scan benchmark, published metadata-matching results, our own matching test of the new release, and documented features. AudioSilo appears twice: **2.6.0, released on 7 November 2026**, and the previous release, **2.5.1**, measured the same way on the same machine.

The scan and resource measurements here supersede the older figures in [AudioSilo vs Audiobookshelf](/blog/audiosilo-vs-audiobookshelf/). The storage route has also changed, so this is a new comparison rather than a direct measure of improvement since that post. [How we measured](#how-we-measured) explains the boundaries and caveats.

## First scan: getting your library into the server

We gave each server the same 1,000 LibriVox book folders: 12,653 MP3 files and 472 M4B files, about 152 GiB of real audio. Each started with fresh application data and a cold filesystem cache. These are medians of three completed trials; parentheses show the observed range.

| Server | First scan | Books indexed |
|---|---:|---:|
| AudioSilo 2.6.0 | 4.4 seconds (4.38-4.41) | 1,000 |
| AudioSilo 2.5.1 | 4.4 seconds (4.40-4.66) | 1,000 |
| Audiobookshelf 2.37.2 | 3 min 41 s (3 min 40 s-3 min 41 s) | 999 |
| BookOrbit 3.6.0 | 15.1 minutes (14.4-45.3) | 1,000 |
| Grimmory 3.5.0 | 54.8 seconds (54.6-54.9) | 1,000 |

AudioSilo's 4.4 seconds is its **indexing completion**, with automatic cover-colour work continuing until about **38 seconds from the scan's start** in both versions. It would be misleading to call 4.4 seconds the end of all its background work. We did not establish an equivalent final background-work signal for every other server.

The contents of those indexes differ too. One source M4B is damaged. Audiobookshelf omits it; AudioSilo, BookOrbit and Grimmory keep an entry without a usable duration. Grimmory had **64 books without positive duration metadata**, including that damaged book. Its first trial also had 355 common books whose indexed durations differed from Audiobookshelf's by more than both ten seconds and 0.1%. Those are metadata differences, not a playback test, but they matter when comparing scan completion.

Grimmory finished its native indexing much sooner than Audiobookshelf and BookOrbit here. BookOrbit's third trial encountered a busy host and took 45.3 minutes, compared with 14.4 and 15.1 minutes for the other two. We retain it in the range and median rather than quietly discard it. AudioSilo and Audiobookshelf scans also carry host-noise flags, discussed in [the methods](#how-we-measured).

For this library, AudioSilo's indexing was quick even after allowing for its cover pass. 2.6.0 and 2.5.1 took the same time to the nearest tenth of a second, so the release doesn't change how long a first scan takes here. That result describes one corpus on one NAS, with the completion and coverage differences above.

## CPU: how much work the scan consumed

Wall time tells you how long you wait. CPU seconds tell you how much processor work was consumed across all cores. Eight cores working for one second can use eight CPU seconds.

To include AudioSilo's later cover work, this table counts CPU from the scan trigger **through 120 seconds after each server's indexing finished**. BookOrbit includes PostgreSQL; Grimmory includes MariaDB.

| Server | CPU seconds, median (range) |
|---|---:|
| AudioSilo 2.6.0 | 11.6 (11.6-11.6) |
| AudioSilo 2.5.1 | 13.4 (13.1-13.4) |
| Audiobookshelf | 1,098 (1,097-1,102) |
| BookOrbit | 1,395 (1,332-4,566) |
| Grimmory | 111 (108-113) |

AudioSilo consumed the least CPU in this observation window, and 2.6.0 used about 13% less than 2.5.1 (the scan itself took 7.3 CPU seconds against 9.0). Grimmory also used substantially less than Audiobookshelf or BookOrbit, subject to its duration-metadata gaps. This is a fixed observation window around each scan, not proof that every background queue in every server had drained.

Once settled, all four used little CPU without a browser or playback client connected. Over a five-minute loaded-idle window, both AudioSilo versions and Audiobookshelf averaged under 0.02% of one core, BookOrbit about 0.56%, and Grimmory about 2.41%. These figures exclude listening, conversion, speech recognition and other companion jobs.

## Memory: a small application is only part of the picture

These figures measure **anonymous memory**, mainly application heaps, summed across each required stack. Loaded idle is the end of the five-minute idle window after the scan and settling period. The peak includes the scan and its next 120 seconds.

| Server | Peak anonymous memory | Loaded-idle anonymous memory |
|---|---:|---:|
| AudioSilo 2.6.0 | 50 MiB | 28 MiB |
| AudioSilo 2.5.1 | 42 MiB | 20 MiB |
| Audiobookshelf | 489 MiB | 197 MiB |
| BookOrbit, including PostgreSQL | 502 MiB | 176 MiB |
| Grimmory, including MariaDB | 1,850 MiB | 606 MiB |

AudioSilo had the smallest anonymous-memory footprint here. 2.6.0 used a little more than 2.5.1: about 8 MiB more at its peak and at loaded idle. BookOrbit settled below Audiobookshelf on this measure despite its higher peak. Grimmory used more memory, while providing a broader reading library than AudioSilo.

**These are not complete RAM footprints or minimum RAM requirements.** Reading audio fills Linux's file cache, which is charged to the containers and can later be reclaimed. PostgreSQL's shared and mapped pages are also not fully represented by anonymous memory. At the end of loaded idle, cache-inclusive cgroup totals were roughly 2.9 GiB for either AudioSilo version, 3.9 GiB for Audiobookshelf, 4.7 GiB for BookOrbit and 3.0 GiB for Grimmory. Different memory measures answer different questions; the small anonymous figure does not mean a container only touches that much RAM.

## Matching: the right book and the right details

Indexing finds files. Matching identifies the book and recording, then supplies details such as narrator and series. We show [LibraForge's published benchmark](https://coconautilus17.github.io/LibraForge/), captured on 6 November 2026, displaying a benchmark date of 4 November, followed by our newer local test on its book set.

It tested **4,044 books** using silent surrogate files with the original paths, tags and runtimes. This is a metadata test, separate from our real-audio scan test. Its seven tools include three companions: LibraForge prepares metadata and files, ReadMeABook handles requests and imports, and beets with beets-audible manages a local library. They can complement a playback server. [LibraForge's documentation](https://github.com/coconautilus17/LibraForge/blob/cb6024a15538b0d274a03d2e35992d3e1023124f/README.md), [ReadMeABook's documentation](https://github.com/kikootwo/ReadMeABook/blob/75efadff6453d700db9753904d3bafa14cebc66f/README.md), [beets-audible's documentation](https://github.com/Neurrone/beets-audible/blob/d443a6ca6a9189f821bb54f9eaa371e9c1a67c3e/README.md).

An **accepted right-book** result identifies the right work, but may still have the wrong recording or an incorrect field. **Held** means a candidate was left for review rather than applied. **None** means no result was written; for ReadMeABook's Bulk Import test, it means no listing was returned.

| Tested tool | Accepted right book | Fully correct* | Accepted wrong book | Held | None | Time taken for 4,044 books† |
|---|---:|---:|---:|---:|---:|---|
| LibraForge build 527247d | 3,942 | 3,831 | 0 | 34 | 68 | 11 minutes, 5 search workers |
| AudioSilo 2.6.0, our harness‡ | 3,806 | Not audited‡ | 4 | 148 | 85 | 24 seconds, local copy; online not re-timed‡ |
| AudioSilo 2.5.1 | 2,987 | 2,571 | 27 | 966 | 64 | About 1 minute with a local copy; 13 minutes online |
| Audiobookshelf Quick Match 2.35.1 | 2,808 | 2,657 | 1,167 | 0 | 69 | 4 hours 44 minutes |
| BookOrbit, build undisclosed | 2,917 | 1,431 | 820 | 0 | 307 | 15 hours 53 minutes |
| Grimmory 3.5.0 | 2,693 | 1,564 | 1,010 | 0 | 341 | 4 hours 23 minutes |
| ReadMeABook 1.2.12, Bulk Import | 2,355 | 2,296 | 506 | 0 | 1,183 | 1 hour 41 minutes |
| beets 2.14 + beets-audible | 1,622 | 1,537 | 89 | 0 | 2,333 | 50 minutes |

*Fully correct is a subset of accepted right-book picks, not an additional outcome bucket. It requires all audited final fields to be correct.

†Time depends on the matching mode, how many books run at once, pauses between requests and the live services each tool asks, so it isn't a measure of processor work or a scanner ranking. Audiobookshelf, BookOrbit, Grimmory and ReadMeABook matched one book at a time, some with deliberate pauses; beets ran four separate imports, each looking up one book at a time. AudioSilo 2.5.1's times are LibraForge's, with two books at a time; its local-copy time leaves out downloading the roughly 2 GB community database.

‡The 2.6.0 row is not from LibraForge's audit. It comes from our own test harness on the same 4,044 books, judged by whether each pick is the right work, so it has no fully-correct count and its columns aren't directly comparable with the audited rows. It accepted one more book that the harness couldn't judge either way, so the row adds up to 4,043. Details below the table.

Source for every other row: [LibraForge benchmark and methods](https://coconautilus17.github.io/LibraForge/#method). The beets-audible version is undisclosed. Audiobookshelf used Audible US; Grimmory had Audible enabled and first. These specific automatic modes do not measure manual matching, every provider choice, newer builds or player quality.

Published AudioSilo 2.5.1 accepted 3,014 books, or 74.5% of the corpus. Of those accepted picks, 99.1% identified the right book, but only **2,571, or 85.3%, were fully correct across the audited fields**. Its caution also leaves work for the owner: 966 held candidates to review.

**LibraForge leads AudioSilo's published entry on coverage and final-field correctness.** It accepted 3,942 books with no wrong-work picks in the captured audit, and 3,831 of those were fully correct. Audiobookshelf Quick Match produced more fully correct results than AudioSilo 2.5.1 in total, alongside many more wrong-work picks. beets was another cautious option, leaving over half the corpus unmatched. Neither caution nor coverage alone tells the whole story.

**AudioSilo 2.6.0, released on 7 November, changes bulk matching a good deal** ([what changed](/blog/smarter-bulk-matching/)). LibraForge hasn't audited it, so its row comes from our own test harness, run on the released 2.6.0 code over the same 4,044 books with their original tags. It automatically accepted 3,806 books as the right work and 4 as the wrong work, plus 1 pick our harness could not judge. It held 148 for review (105 of them the right work) and wrote nothing for 85. Of the 3,806, 3,546 also chose the reference recording.

Our harness only checks whether each pick is the right work: against the benchmark's reference ASIN, else LibraForge's hand-checked pick, else the audited 2.5.1 pick, else title and author. It doesn't check every final field, so a right work can still carry another recording or an incorrect detail, and there is no fully-correct figure for 2.6.0. It also uses LibraForge's earlier reference data, a local copy of the community database and the US region. So please don't set 3,806 against LibraForge's 3,942 or 3,831, or against 2.5.1's audited 2,987 and 2,571, as a measured gain or lead; only a fresh independent audit could settle that.

The 2.6.0 time is our harness matching all 4,044 books with six at a time, as a real run does, against a local copy of the community database on a Mac. It covers the matching only, not a scan or writing the results, so treat it as a rough guide rather than a like-for-like with the published times. A run against the online service wasn't timed on the release build. On 5 November a full run of these books against meta.audiosilo.app took 1 minute 32 seconds on a 2.6 development build with the same request path (one request per book, six books at a time), before the last matching changes.

## Features that may decide it before any benchmark

The practical choice starts with the jobs you need done. These are documented capabilities, rather than a claim that we tested every client and integration.

| Server | Reasons to choose it | Tradeoffs to weigh |
|---|---|---|
| AudioSilo | Read-only library access, cross-platform listening and household controls | No documented OIDC; companion EPUB rather than a standalone ebook library; Bridge needed for podcast fetching |
| Audiobookshelf | Established audiobook/podcast tools, file editing and a broad client ecosystem | Its official apps are beta; some device features come from third-party clients |
| BookOrbit | Broad reading library, iPhone/Watch listening, reader-device sync, OIDC and chapter timing editing | PostgreSQL required; Android app not shipped in the cited release |
| Grimmory | Browser reading, personal shelves, OPDS/Kobo support and OIDC | MariaDB required; integrated offline audiobook playback and native apps not established by the inspected sources |

Sources: [AudioSilo server](https://github.com/KodeStar/audiosilo-docs/blob/cfa9fc51d45132f9deeb8bbc5342c651b5fa8baf/docs-users/admin/server.md), [AudioSilo accounts](https://github.com/KodeStar/audiosilo-docs/blob/cfa9fc51d45132f9deeb8bbc5342c651b5fa8baf/docs-users/admin/users-and-invites.md), [AudioSilo podcasts](https://github.com/KodeStar/audiosilo-docs/blob/cfa9fc51d45132f9deeb8bbc5342c651b5fa8baf/docs-users/admin/podcasts.md), [Audiobookshelf](https://github.com/advplyr/audiobookshelf/blob/edb1f7efc92ecacdef51aafb4d9d5054ce10604f/README.md), [BookOrbit](https://github.com/bookorbit/bookorbit/blob/a96ff0c85a4c25e9126dfa4c71ea87537a3baf7a/README.md), [Grimmory](https://github.com/grimmory-tools/grimmory/blob/402e89b4452f8e2b17ab95f16c1621c003516cd2/README.md). Unknown support is not a claim of absence.

**Audiobookshelf has real breadth AudioSilo lacks:** browser uploads, tag writing, chapter timing editing, podcasts without a companion, and [OIDC sign-in](https://github.com/advplyr/audiobookshelf/blob/edb1f7efc92ecacdef51aafb4d9d5054ce10604f/server/auth/OidcAuthStrategy.js). Its official app supports Android Auto; [Absorb](https://github.com/pounat/absorb) adds CarPlay and Android Auto, while [AudioBooth](https://github.com/AudioBooth/AudioBooth) offers Apple Watch listening. AudioSilo users get CarPlay and Android Auto with [supported native app versions](https://github.com/KodeStar/audiosilo-docs/blob/cfa9fc51d45132f9deeb8bbc5342c651b5fa8baf/docs-users/listening/in-the-car.md), but those are not exclusive features.

**BookOrbit is especially interesting for a mixed reading and listening library.** Its documented iPhone/Watch pair includes offline listening and requires iOS/watchOS 26 or later; it also syncs with Kobo and KOReader. Its [chapter editor](https://github.com/bookorbit/bookorbit/blob/a96ff0c85a4c25e9126dfa4c71ea87537a3baf7a/server/src/modules/chapter-editor/chapter-editor.controller.ts) edits timing as well as titles. AudioSilo can [rename chapters and select generated or community lists](https://github.com/KodeStar/audiosilo-docs/blob/cfa9fc51d45132f9deeb8bbc5342c651b5fa8baf/docs-users/admin/books.md), but lacks a full timing editor. BookOrbit also has [podcasts](https://github.com/bookorbit/bookorbit/blob/a96ff0c85a4c25e9126dfa4c71ea87537a3baf7a/server/src/modules/podcast/podcast.controller.ts) and [synchronized EPUB output using optional alignment tools](https://github.com/bookorbit/bookorbit/blob/a96ff0c85a4c25e9126dfa4c71ea87537a3baf7a/docs/READ_ALOUD.md).

**Grimmory offers a wider browser reading experience than AudioSilo**, with standalone ebook, PDF and comic libraries, shelves, reading progress and e-reader access. Its [documented OIDC support](https://github.com/grimmory-tools/grimmory/blob/402e89b4452f8e2b17ab95f16c1621c003516cd2/README.md) may settle the choice for a household already using an identity provider.

**AudioSilo focuses on your audiobook and its context.** Alongside [offline downloads](https://github.com/KodeStar/audiosilo-docs/blob/cfa9fc51d45132f9deeb8bbc5342c651b5fa8baf/docs-users/listening/offline-downloads.md), it has [household controls](https://github.com/KodeStar/audiosilo-docs/blob/cfa9fc51d45132f9deeb8bbc5342c651b5fa8baf/docs-users/admin/users-and-invites.md) and [spoiler-safe recaps and characters](https://github.com/KodeStar/audiosilo-docs/blob/cfa9fc51d45132f9deeb8bbc5342c651b5fa8baf/docs-users/listening/recaps-and-characters.md). Its server reads your folders; the optional Bridge handles writing and heavy jobs. It reads one companion EPUB per audiobook.

Server 2.6.0 lets you [follow the narration in that EPUB, including offline in a downloaded book](https://github.com/KodeStar/audiosilo-docs/blob/cfa9fc51d45132f9deeb8bbc5342c651b5fa8baf/docs-users/listening/reading-the-ebook.md). It works today in the web player bundled with the server; the iOS and Android apps need app 2.6.0, which follows once it reaches the App Store and Google Play. [Creating the alignment needs a Bridge that can write to the library](https://github.com/KodeStar/audiosilo-docs/blob/cfa9fc51d45132f9deeb8bbc5342c651b5fa8baf/docs-users/admin/making-read-along.md); budget separately for alignment and any speech-recognition jobs or models. [Apple Watch support](https://github.com/KodeStar/audiosilo-docs/blob/cfa9fc51d45132f9deeb8bbc5342c651b5fa8baf/docs-users/listening/apple-watch.md) is built for the 2.6.0 iPhone app with server 2.6.0 and ffmpeg, but isn't available to install yet; it excludes podcasts, and there is no Wear OS app.

If you already run Audiobookshelf, trying AudioSilo need not mean moving your files first. [Moving from Audiobookshelf](/blog/moving-from-audiobookshelf/) covers a gradual trial. Staying with Audiobookshelf is also compatible with using [AudioSilo's community metadata provider](https://meta.audiosilo.app/audiobookshelf).

## How we measured

The four-server scan/resource run took place on 6-7 November 2026 on an Intel Core i3-N305 with eight logical CPUs and 16 GB RAM, running Unraid Linux 6.1. All four read the same read-only library directly from an XFS NVMe array disk, bypassing Unraid's user-share FUSE layer. Writable app/database data used the local NVMe cache pool. BookOrbit documents FUSE exclusions; the older two-server post used that different storage route.

We ran one measured stack at a time, with fresh app/database directories, pinned images, a cold page cache and three selected completed trials each. That run used a pre-release AudioSilo build, so after 2.6.0 was released we ran AudioSilo again on its own on 7 November: the released 2.6.0 and 2.5.1 images, three fresh trials each, alternating between the two, on the same machine, storage, books, settings and method (run IDs `20261106T234731Z-c5dd8c` for the four servers and `20261107T174148Z-0dacf1` for the AudioSilo-only rerun). Its figures replace the pre-release ones above; the other servers' figures come from the four-server run. Both runs pinned every image by its exact build: AudioSilo 2.6.0 `sha256:9aca7db2b914`, 2.5.1 `sha256:f121180ba3c0`, Audiobookshelf `sha256:37c2057e1506`, BookOrbit `sha256:5a6b997e0e25` and Grimmory `sha256:83597bf02da4` (linux/amd64). One 2.5.1 trial was discarded and run again with fresh data because the computer coordinating the test went to sleep during its idle measurement. Owner services stayed running. BookOrbit's PostgreSQL and Grimmory's MariaDB are included in CPU and memory. AudioSilo and Audiobookshelf include SQLite within their app. No Bridge, ASR, TTS or metadata mirror service ran, and external metadata matching was not manually triggered. Optional services need their own resource budget.

Timing stops at each server's native successful indexing signal, not a universal definition of fully processed media. Inventory checks record paths and durations afterward. Memory was sampled about every half second; CPU uses container-group counters. The automatic cover pass and CPU observation window are disclosed above.

Host checks and counters remain part of the result. All selected AudioSilo (both versions) and Audiobookshelf scans, plus BookOrbit's third trial, exceeded the flag threshold of 25% of one core outside the measured stack in at least one scan window. AudioSilo's short scans make that residual especially sensitive to sampling and coordinator overhead. BookOrbit's third trial remained busy after the preflight wait, with activity including Immich, kernel reclaim and the user-share process. These flags limit precision; they do not identify the cause of every in-trial spike.

Matching follows [LibraForge's separate method](https://coconautilus17.github.io/LibraForge/#method). Its automated audit had human supervision, with spot-check errors corrected; not all 4,044 books were hand-audited. Regional Audible restrictions also affected some inputs. Zero wrong-book picks is an observation in that captured audit, not a universal guarantee. Our newer local identity harness uses older references and different judging, so its results cannot be substituted for an independent final-field audit. A right work, a right recording and fully correct metadata remain three different outcomes.
