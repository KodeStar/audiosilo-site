---
title: "AudioSilo vs the competition: matching, first scans and everyday features"
description: "AudioSilo, Audiobookshelf, BookOrbit and Grimmory compared on first scans, matching, memory, CPU and the features that help you choose."
kind: guide
published: 2026-11-07
updated: 2026-11-08
verified: 2026-11-08
appliesTo: "AudioSilo 2.6.0 and 2.5.1; Audiobookshelf 2.37.2 (2.35.1 in the published matching); BookOrbit 3.6.0; Grimmory 3.5.0. Published matching covers AudioSilo 2.6.0 (LibraForge, 8 November 2026)."
tags: [comparison, audiobookshelf, bookorbit, grimmory, metadata, benchmarks]
covers:
  - app:stores
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
  - date: 2026-11-08
    note: "iPhone app 2.6.0 and its Apple Watch app are on the App Store now; Google Play's 2.6.0 is still to follow."
  - date: 2026-11-08
    note: "Matching now uses LibraForge's independent audit of AudioSilo 2.6.0 (captured 8 November), scored like every other tool on the 3,622 books with a confirmed listing. It replaces our own harness's 2.6.0 figures and the earlier 2.5.1 row."
  - date: 2026-11-08
    note: "\"Fully correct\" is now labelled \"Same as Audible\", since it measures agreement with the Audible listing. The AudioSilo paragraph now says the run used the default \"Fill in what's missing\" setting, which keeps a file's own tags; in 469 of the 612 books with a differing field, every one is the file's own tag."
---

Choose AudioSilo if you want a small audiobook server that reads your existing folders, with a player built around listening across devices. Choose Audiobookshelf for its established audiobook and podcast tools and client ecosystem. BookOrbit and Grimmory deserve a look if reading ebooks, PDFs and comics matters as much as listening. Their strengths go well beyond how quickly they can index audio.

We make AudioSilo. Here we compare those four playback servers using a fresh first-scan benchmark, published metadata-matching results that now include the new release, and documented features. In the scan, CPU and memory results AudioSilo appears twice: **2.6.0, released on 7 November 2026**, and the previous release, **2.5.1**, measured the same way on the same machine. The matching results are for 2.6.0.

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

Indexing finds files. Matching identifies the book and recording, then supplies details such as narrator and series. We show [LibraForge's published benchmark](https://coconautilus17.github.io/LibraForge/) as captured on 8 November 2026 (LibraForge build 527247d), which now includes its own independent audit of AudioSilo 2.6.0.

It tested **4,044 books** using silent files carrying the original paths and tags, as long as the real book for tools that check runtime. This is a metadata test, separate from our real-audio scan test. Every tool is scored on the same **3,622 books with a confirmed listing**; the other 422 have none (not on Audible, or no listing of the file's own recording), so they aren't scored. Its seven tools include three companions: LibraForge prepares metadata and files, ReadMeABook handles requests and imports, and beets with beets-audible manages a local library. They can complement a playback server. [LibraForge's documentation](https://github.com/coconautilus17/LibraForge/blob/cb6024a15538b0d274a03d2e35992d3e1023124f/README.md), [ReadMeABook's documentation](https://github.com/kikootwo/ReadMeABook/blob/75efadff6453d700db9753904d3bafa14cebc66f/README.md), [beets-audible's documentation](https://github.com/Neurrone/beets-audible/blob/d443a6ca6a9189f821bb54f9eaa371e9c1a67c3e/readme.md).

**Wrote** counts every book a tool wrote details to, and splits four ways. **Same as Audible** (LibraForge's "fully correct") is the right book with every field it ends up with matching the book's Audible listing, which is LibraForge's reference: its title, every author, every narrator and every series with its number, as Audible records them. **Other recording** is the right book with another recording's details. **A field differs** (LibraForge's "a field off") is the right book, but the title, an author, the narrator or the series isn't what the Audible listing says, or is missing. That includes a value kept from the file's own tags, so "Book 004" against Audible's "Book Four" counts as differing. **Wrong book** means another book's details were written. **Held** means the tool found a candidate but waited for you to confirm it; LibraForge's table splits that into right and wrong picks, which we've merged into one column. **Nothing written** is the rest. Each row adds up to 3,622.

| Tested tool | Wrote | Same as Audible | Other recording | A field differs | Wrong book | Held | Nothing written | Time for all 4,044 books† |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| LibraForge build 527247d | 3,579 (98.8%) | 3,510 (96.9%) | 13 | 56 | 0 | 22 (all right picks) | 21 | 11 minutes, 5 at once |
| AudioSilo 2.6.0 | 3,526 (97.3%) | 2,910 (80.3%) | 3 | 612 | 1 | 75 (66 right, 9 wrong picks) | 21 | 30 seconds with a local copy; 2 minutes 15 seconds online; 6 at once |
| Audiobookshelf Quick Match 2.35.1 | 3,596 (99.3%) | 2,610 (72.1%) | 27 | 69 | 890 | 0 | 26 | 4 hours 44 minutes, 1 at once |
| Grimmory 3.5.0 | 3,364 (92.9%) | 1,497 (41.3%) | 55 | 1,039 | 773 | 0 | 258 | 4 hours 23 minutes, 1 at once |
| ReadMeABook 1.2.12, Bulk Import* | 2,742 (75.7%) | 2,231 (61.6%) | 44 | 0 | 467 | 0 | 880 | 1 hour 41 minutes, 1 at once |
| BookOrbit, image of 20 October 2026 | 3,344 (92.3%) | 1,235 (34.1%) | 17 | 1,591 | 501 | 0 | 278 | 15 hours 53 minutes, 1 at once |
| beets 2.14 + beets-audible | 1,665 (46.0%) | 1,541 (42.5%) | 28 | 14 | 82 | 0 | 1,957 | 50 minutes, 4 imports at once, 1 book each |

Percentages are of the 3,622 scored books.

*ReadMeABook's Bulk Import picks a listing per book and writes nothing, to files or a library, so it is judged only on whether its pick is the book; its scan returns no series. Books it merged into another folder count as nothing written.

†Time is the whole run over all 4,044 books, start to finish, including the 422 that aren't scored. It depends on the matching mode, how many books run at once, pauses between requests and the live services each tool asks, so it isn't a measure of processor work or a scanner ranking. Audiobookshelf, BookOrbit, Grimmory and ReadMeABook matched one book at a time, ReadMeABook with a 1.5-second pause between searches and BookOrbit with 2 to 5 seconds between books; beets ran four separate imports. AudioSilo's local-copy time leaves out downloading the community database (about 530 MB compressed on 8 November 2026).

Source for every row: [LibraForge benchmark and methods](https://coconautilus17.github.io/LibraForge/#method). AudioSilo ran **Match automatically** in mirror mode (a local copy of the community database) and was timed again against its online service; its confident matches count as written and "to review" as held. Audiobookshelf used Audible US; Grimmory had Audible enabled and first; BookOrbit used its default providers. The beets-audible version is undisclosed. These specific automatic modes do not measure manual matching, every provider choice, newer builds or player quality.

**LibraForge agrees with Audible's listing most often.** It wrote 3,579 of the 3,622 scored books, and 3,510 of them, 96.9%, ended up the same as Audible's listing, with no wrong book. All 22 books it held for review were the right pick. LibraForge matches against Audible's own catalog and writes what the listing says, so it is scored against the same source it writes from.

**AudioSilo 2.6.0 found the right book almost every time.** It wrote 3,526 books (97.3%) with 1 wrong book, held 75 for review (66 of them the right pick) and wrote nothing for 21. AudioSilo matches against its own community database, not Audible, and 2,910 of the books it wrote (80.3% of the scored books) ended up the same as Audible's listing. For **612 books** it found the right book but a field differs from the listing. That mostly comes down to a setting: bulk matching offers three choices of what to write when it applies its matches, and this run used the default, **Fill in what's missing**, which adds empty fields and never replaces what a file already says. LibraForge's per-book data shows that in 469 of the 612, every differing field is the file's own tag, left as it was: a title tagged "11 - War Factory" where Audible has "War Factory", or a single author where the listing credits two. The choice that replaces differing fields with the community database's values, **Use community values**, wasn't part of this test, so how it would score is unmeasured; the community's values can differ from Audible's too. Of 122 scored books Audible's search hid where these runs were made, AudioSilo got 114 right, since it reads its own database, against LibraForge's 119.

**AudioSilo was by far the quickest.** With a local copy of the community database it matched all 4,044 books in 30 seconds, as matching is then a query on the same disk; against its online service it took 2 minutes 15 seconds. LibraForge took 11 minutes, and the other tools between 50 minutes and almost 16 hours.

LibraForge's earlier capture, on 6 November, scored every tool on all 4,044 books and included AudioSilo 2.5.1, which held 966 of them for review. That row is no longer published, and its basis differs from the table above, so we don't set the two against each other.

Audiobookshelf Quick Match wrote the most books, 3,596, and 2,610 were the same as Audible's listing, but 890 were the wrong book. Grimmory and BookOrbit each wrote over 90% of the books, mostly with a field differing or the wrong book. beets was the most cautious, writing 1,665 books with 82 wrong and leaving over half the scored books unmatched. Neither caution nor coverage alone tells the whole story.

## Features that may decide it before any benchmark

The practical choice starts with the jobs you need done. These are documented capabilities, rather than a claim that we tested every client and integration.

| Server | Reasons to choose it | Tradeoffs to weigh |
|---|---|---|
| AudioSilo | Read-only library access, cross-platform listening and household controls | No documented OIDC; companion EPUB rather than a standalone ebook library; Bridge needed for podcast fetching |
| Audiobookshelf | Established audiobook/podcast tools, file editing and a broad client ecosystem | Its official apps are beta; some device features come from third-party clients |
| BookOrbit | Broad reading library, iPhone/Watch listening, reader-device sync, OIDC and chapter timing editing | PostgreSQL required; Android app not shipped in the cited release |
| Grimmory | Browser reading, personal shelves, OPDS/Kobo support and OIDC | MariaDB required; integrated offline audiobook playback and native apps not established by the inspected sources |

Sources: [AudioSilo server](https://github.com/KodeStar/audiosilo-docs/blob/cfa9fc51d45132f9deeb8bbc5342c651b5fa8baf/docs-users/admin/server.md), [AudioSilo accounts](https://github.com/KodeStar/audiosilo-docs/blob/cfa9fc51d45132f9deeb8bbc5342c651b5fa8baf/docs-users/admin/users-and-invites.md), [AudioSilo podcasts](https://github.com/KodeStar/audiosilo-docs/blob/cfa9fc51d45132f9deeb8bbc5342c651b5fa8baf/docs-users/admin/podcasts.md), [Audiobookshelf](https://github.com/advplyr/audiobookshelf/blob/edb1f7efc92ecacdef51aafb4d9d5054ce10604f/readme.md), [BookOrbit](https://github.com/bookorbit/bookorbit/blob/a96ff0c85a4c25e9126dfa4c71ea87537a3baf7a/README.md), [Grimmory](https://github.com/grimmory-tools/grimmory/blob/402e89b4452f8e2b17ab95f16c1621c003516cd2/README.md). Unknown support is not a claim of absence.

**Audiobookshelf has real breadth AudioSilo lacks:** browser uploads, tag writing, chapter timing editing, podcasts without a companion, and [OIDC sign-in](https://github.com/advplyr/audiobookshelf/blob/edb1f7efc92ecacdef51aafb4d9d5054ce10604f/server/auth/OidcAuthStrategy.js). Its official app supports Android Auto; [Absorb](https://github.com/pounat/absorb) adds CarPlay and Android Auto, while [AudioBooth](https://github.com/AudioBooth/AudioBooth) offers Apple Watch listening. AudioSilo users get CarPlay and Android Auto with [supported native app versions](https://github.com/KodeStar/audiosilo-docs/blob/cfa9fc51d45132f9deeb8bbc5342c651b5fa8baf/docs-users/listening/in-the-car.md), but those are not exclusive features.

**BookOrbit is especially interesting for a mixed reading and listening library.** Its documented iPhone/Watch pair includes offline listening and requires iOS/watchOS 26 or later; it also syncs with Kobo and KOReader. Its [chapter editor](https://github.com/bookorbit/bookorbit/blob/a96ff0c85a4c25e9126dfa4c71ea87537a3baf7a/server/src/modules/chapter-editor/chapter-editor.controller.ts) edits timing as well as titles. AudioSilo can [rename chapters and select generated or community lists](https://github.com/KodeStar/audiosilo-docs/blob/cfa9fc51d45132f9deeb8bbc5342c651b5fa8baf/docs-users/admin/books.md), but lacks a full timing editor. BookOrbit also has [podcasts](https://github.com/bookorbit/bookorbit/blob/a96ff0c85a4c25e9126dfa4c71ea87537a3baf7a/server/src/modules/podcast/podcast.controller.ts) and [synchronized EPUB output using optional alignment tools](https://github.com/bookorbit/bookorbit/blob/a96ff0c85a4c25e9126dfa4c71ea87537a3baf7a/docs/READ_ALOUD.md).

**Grimmory offers a wider browser reading experience than AudioSilo**, with standalone ebook, PDF and comic libraries, shelves, reading progress and e-reader access. Its [documented OIDC support](https://github.com/grimmory-tools/grimmory/blob/402e89b4452f8e2b17ab95f16c1621c003516cd2/README.md) may settle the choice for a household already using an identity provider.

**AudioSilo focuses on your audiobook and its context.** Alongside [offline downloads](https://github.com/KodeStar/audiosilo-docs/blob/cfa9fc51d45132f9deeb8bbc5342c651b5fa8baf/docs-users/listening/offline-downloads.md), it has [household controls](https://github.com/KodeStar/audiosilo-docs/blob/cfa9fc51d45132f9deeb8bbc5342c651b5fa8baf/docs-users/admin/users-and-invites.md) and [spoiler-safe recaps and characters](https://github.com/KodeStar/audiosilo-docs/blob/cfa9fc51d45132f9deeb8bbc5342c651b5fa8baf/docs-users/listening/recaps-and-characters.md). Its server reads your folders; the optional Bridge handles writing and heavy jobs. It reads one companion EPUB per audiobook.

Server 2.6.0 lets you [follow the narration in that EPUB, including offline in a downloaded book](https://github.com/KodeStar/audiosilo-docs/blob/cfa9fc51d45132f9deeb8bbc5342c651b5fa8baf/docs-users/listening/reading-the-ebook.md). It works in the web player bundled with the server and in app 2.6.0: on the App Store for iPhone and iPad, and on Android from [the APK on GitHub](https://docs.audiosilo.app/users/listening/mobile-apps#android-without-google-play) until it reaches Google Play. [Creating the alignment needs a Bridge that can write to the library](https://github.com/KodeStar/audiosilo-docs/blob/cfa9fc51d45132f9deeb8bbc5342c651b5fa8baf/docs-users/admin/making-read-along.md); budget separately for alignment and any speech-recognition jobs or models. [Apple Watch support](https://github.com/KodeStar/audiosilo-docs/blob/cfa9fc51d45132f9deeb8bbc5342c651b5fa8baf/docs-users/listening/apple-watch.md) comes with iPhone app 2.6.0; it needs server 2.6.0 with ffmpeg, excludes podcasts, and there is no Wear OS app.

If you already run Audiobookshelf, trying AudioSilo need not mean moving your files first. [Moving from Audiobookshelf](/blog/moving-from-audiobookshelf/) covers a gradual trial. Staying with Audiobookshelf is also compatible with using [AudioSilo's community metadata provider](https://meta.audiosilo.app/audiobookshelf).

## How we measured

The four-server scan/resource run took place on 6-7 November 2026 on an Intel Core i3-N305 with eight logical CPUs and 16 GB RAM, running Unraid Linux 6.1. All four read the same read-only library directly from an XFS NVMe array disk, bypassing Unraid's user-share FUSE layer. Writable app/database data used the local NVMe cache pool. BookOrbit documents FUSE exclusions; the older two-server post used that different storage route.

We ran one measured stack at a time, with fresh app/database directories, pinned images, a cold page cache and three selected completed trials each. That run used a pre-release AudioSilo build, so after 2.6.0 was released we ran AudioSilo again on its own on 7 November: the released 2.6.0 and 2.5.1 images, three fresh trials each, alternating between the two, on the same machine, storage, books, settings and method (run IDs `20261106T234731Z-c5dd8c` for the four servers and `20261107T174148Z-0dacf1` for the AudioSilo-only rerun). AudioSilo's figures in this post come from that rerun; the other servers' come from the four-server run. Both runs pinned every image by its exact build: AudioSilo 2.6.0 `sha256:9aca7db2b914`, 2.5.1 `sha256:f121180ba3c0`, Audiobookshelf `sha256:37c2057e1506`, BookOrbit `sha256:5a6b997e0e25` and Grimmory `sha256:83597bf02da4` (linux/amd64). One 2.5.1 trial was discarded and run again with fresh data because the computer coordinating the test went to sleep during its idle measurement. Owner services stayed running. BookOrbit's PostgreSQL and Grimmory's MariaDB are included in CPU and memory. AudioSilo and Audiobookshelf include SQLite within their app. No Bridge, ASR, TTS or metadata mirror service ran, and external metadata matching was not manually triggered. Optional services need their own resource budget.

Timing stops at each server's native successful indexing signal, not a universal definition of fully processed media. Inventory checks record paths and durations afterward. Memory was sampled about every half second; CPU uses container-group counters. The automatic cover pass and CPU observation window are disclosed above.

Host checks and counters remain part of the result. All selected AudioSilo (both versions) and Audiobookshelf scans, plus BookOrbit's third trial, exceeded the flag threshold of 25% of one core outside the measured stack in at least one scan window. AudioSilo's short scans make that residual especially sensitive to sampling and coordinator overhead. BookOrbit's third trial remained busy after the preflight wait, with activity including Immich, kernel reclaim and the user-share process. These flags limit precision; they do not identify the cause of every in-trial spike.

Matching follows [LibraForge's separate method](https://coconautilus17.github.io/LibraForge/#method), from its page captured on 8 November 2026 (build 527247d). We didn't run or judge any of it. Its book-by-book review was done with Claude, an AI model, under human supervision; a second audit of 100 random books found 20 of 700 verdicts wrong (2.9%) and a fresh 100 found 6 (0.9%), each corrected for all books, but not every book was hand-checked. Each tool ran on its own date, from 28 October to 8 November, against live services. Regional Audible restrictions also affected some inputs: 122 scored books were hidden from Audible's search where the runs were made. Zero wrong-book picks is an observation in that audit, not a universal guarantee. A right book, a right recording and details that match Audible's listing remain three different outcomes, and the last measures agreement with Audible, not whether a value is wrong in itself.
