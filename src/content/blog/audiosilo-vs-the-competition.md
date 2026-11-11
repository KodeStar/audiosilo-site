---
title: "AudioSilo vs the competition: matching, first scans and everyday features"
description: "AudioSilo, Audiobookshelf, BookOrbit and Grimmory compared on first scans, matching, memory, CPU and the features that help you choose."
kind: guide
published: 2026-11-07
updated: 2026-11-10
verified: 2026-11-09
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
glance: competition
revisions:
  - date: 2026-11-10
    note: "Rewritten to be shorter and easier to read. No facts changed."
  - date: 2026-11-09
    note: "Added an at-a-glance grid at the top: the measured figures and the documented features side by side, including where AudioSilo falls short. Every cell was checked against this post and the sources it links."
  - date: 2026-11-08
    note: "iPhone app 2.6.0 and its Apple Watch app are on the App Store now; Google Play's 2.6.0 is still to follow."
  - date: 2026-11-08
    note: "Matching now uses LibraForge's independent audit of AudioSilo 2.6.0 (captured 8 November), scored like every other tool on the 3,622 books with a confirmed listing. It replaces our own harness's 2.6.0 figures and the earlier 2.5.1 row."
  - date: 2026-11-08
    note: "\"Fully correct\" is now labelled \"Same as Audible\", since it measures agreement with the Audible listing. The AudioSilo paragraph now says the run used the default \"Fill in what's missing\" setting, which keeps a file's own tags; in 469 of the 612 books with a differing field, every one is the file's own tag."
---

Choose AudioSilo if you want a small audiobook server that reads your existing folders, with a player built around listening across devices. Choose Audiobookshelf for its established audiobook and podcast tools and client ecosystem. Look at BookOrbit or Grimmory if reading ebooks, PDFs and comics matters as much as listening.

We make AudioSilo, so read this with that in mind. Below the grid are the full results, with AudioSilo's previous release, **2.5.1**, measured beside **2.6.0** (released 7 November 2026). Matching is for 2.6.0.

These figures replace those in [AudioSilo vs Audiobookshelf](/blog/audiosilo-vs-audiobookshelf/). The storage route changed, so this is a new comparison, not a measure of improvement since then.

## First scan

Each server got the same 1,000 LibriVox book folders: 12,653 MP3 and 472 M4B files, about 152 GiB of real audio. Medians of three trials, range in brackets.

| Server | First scan | Books indexed |
|---|---:|---:|
| AudioSilo 2.6.0 | 4.4 seconds (4.38-4.41) | 1,000 |
| AudioSilo 2.5.1 | 4.4 seconds (4.40-4.66) | 1,000 |
| Audiobookshelf 2.37.2 | 3 min 41 s (3 min 40 s-3 min 41 s) | 999 |
| BookOrbit 3.6.0 | 15.1 minutes (14.4-45.3) | 1,000 |
| Grimmory 3.5.0 | 54.8 seconds (54.6-54.9) | 1,000 |

- **AudioSilo's 4.4 seconds is when indexing finished.** Cover-colour work carries on to about 38 seconds, in both versions. We didn't find an equivalent "all done" signal for every other server.
- **One source M4B is damaged.** Audiobookshelf leaves it out; the others keep it without a usable duration.
- **Grimmory had 64 books without a positive duration**, including that one. In its first trial, 355 books shared with Audiobookshelf had durations differing by more than both ten seconds and 0.1%. This is a metadata difference, not a playback test.
- **BookOrbit's third trial hit a busy host** (45.3 minutes, against 14.4 and 15.1). We kept it in the range and median.

## CPU

CPU seconds are processor work across all cores: eight cores busy for one second can use eight CPU seconds. To include AudioSilo's later cover work, this counts from the scan trigger **to 120 seconds after indexing finished**. BookOrbit includes PostgreSQL; Grimmory includes MariaDB.

| Server | Scan, CPU seconds, median (range) | Loaded idle, share of one core |
|---|---:|---:|
| AudioSilo 2.6.0 | 11.6 (11.6-11.6) | under 0.02% |
| AudioSilo 2.5.1 | 13.4 (13.1-13.4) | under 0.02% |
| Audiobookshelf | 1,098 (1,097-1,102) | under 0.02% |
| BookOrbit | 1,395 (1,332-4,566) | about 0.56% |
| Grimmory | 111 (108-113) | about 2.41% |

2.6.0 used about 13% less CPU than 2.5.1 (the scan itself: 7.3 CPU seconds against 9.0). This is a fixed window, not proof every background queue had drained. Loaded idle is a five-minute average with no browser or player connected.

## Memory

This is **anonymous memory**, mainly application heaps, summed across each required stack. The peak covers the scan and the next 120 seconds. Loaded idle is the end of the five-minute idle window.

| Server | Peak | Loaded idle | Loaded idle, including file cache |
|---|---:|---:|---:|
| AudioSilo 2.6.0 | 50 MiB | 28 MiB | roughly 2.9 GiB |
| AudioSilo 2.5.1 | 42 MiB | 20 MiB | roughly 2.9 GiB |
| Audiobookshelf | 489 MiB | 197 MiB | roughly 3.9 GiB |
| BookOrbit, including PostgreSQL | 502 MiB | 176 MiB | roughly 4.7 GiB |
| Grimmory, including MariaDB | 1,850 MiB | 606 MiB | roughly 3.0 GiB |

**These are not complete RAM footprints or minimum requirements.** Reading audio fills Linux's file cache, which is charged to the container and can be reclaimed (the last column, the cgroup total). PostgreSQL's shared and mapped pages aren't fully counted either.

## Matching

Indexing finds files. Matching identifies the book and recording, then fills in details such as narrator and series. These are [LibraForge's published results](https://coconautilus17.github.io/LibraForge/), captured on 8 November 2026 (build 527247d), including its own independent audit of AudioSilo 2.6.0.

It tested **4,044 books** as silent files with the original paths and tags, as long as the real book. Every tool is scored on the same **3,622 books with a confirmed listing**; the other 422 have none.

- **Wrote** splits into the next four columns.
- **Same as Audible** (LibraForge's "fully correct"): the right book, with title, every author, narrator and series and number matching the Audible listing.
- **Other recording:** the right book with another recording's details.
- **A field differs** (LibraForge's "a field off"): the right book, but a field doesn't match the listing or is missing. A value kept from the file's tags counts, so "Book 004" against Audible's "Book Four" differs.
- **Held:** a candidate waiting for you to confirm (we merged LibraForge's right and wrong picks).
- Each row adds up to 3,622.

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

*ReadMeABook's Bulk Import picks a listing per book and writes nothing, so it is judged only on whether its pick is the right book. Its scan returns no series. Books it merged into another folder count as nothing written.

†Start to finish over all 4,044 books. It depends on the matching mode, books at once, pauses and the live services each tool asks, so it isn't processor work or a scanner ranking. ReadMeABook paused 1.5 seconds between searches, BookOrbit 2 to 5 seconds between books. AudioSilo's local-copy time leaves out downloading the community database (about 530 MB compressed on 8 November 2026).

Three tools here are companions rather than playback servers, and can work alongside one: LibraForge prepares metadata and files, ReadMeABook handles requests and imports, and beets with beets-audible manages a local library ([LibraForge](https://github.com/coconautilus17/LibraForge/blob/cb6024a15538b0d274a03d2e35992d3e1023124f/README.md), [ReadMeABook](https://github.com/kikootwo/ReadMeABook/blob/75efadff6453d700db9753904d3bafa14cebc66f/README.md), [beets-audible](https://github.com/Neurrone/beets-audible/blob/d443a6ca6a9189f821bb54f9eaa371e9c1a67c3e/readme.md)).

### What the matching shows

- **LibraForge agrees with Audible most often.** It matches against Audible's own catalog, so it is scored against the same source it writes from.
- **AudioSilo found the right book almost every time.** It matches against its own community database, not Audible.
- **AudioSilo's 612 "a field differs" books mostly come down to a setting.** Bulk matching offers three choices of what to write; the run used the default, **Fill in what's missing**, which never replaces what a file already says. In 469 of the 612, every differing field is the file's own tag: "11 - War Factory" where Audible has "War Factory", or one author where the listing credits two. **Use community values** wasn't tested, so its score is unmeasured; the community's values can differ from Audible's too.
- **Books Audible's search hid:** of 122 scored books hidden where the runs were made, AudioSilo got 114 right against LibraForge's 119.
- **AudioSilo was by far the quickest**, because with a local copy, matching is a query on the same disk.
- **Coverage alone doesn't measure quality.** Audiobookshelf Quick Match wrote the most books, but 890 were the wrong book. beets was the most cautious, leaving over half unmatched.

## Features that may decide it before any benchmark

Start with the jobs you need done. These are documented capabilities, not a claim that we tested every client and integration.

| Server | Reasons to choose it | Tradeoffs to weigh |
|---|---|---|
| AudioSilo | Read-only library access, cross-platform listening and household controls | No documented OIDC; companion EPUB rather than a standalone ebook library; Bridge needed for podcast fetching |
| Audiobookshelf | Established audiobook/podcast tools, file editing and a broad client ecosystem | Its official apps are beta; some device features come from third-party clients |
| BookOrbit | Broad reading library, iPhone/Watch listening, reader-device sync, OIDC and chapter timing editing | PostgreSQL required; Android app not shipped in the cited release |
| Grimmory | Browser reading, personal shelves, OPDS/Kobo support and OIDC | MariaDB required; integrated offline audiobook playback and phone apps not established by the inspected sources |

Sources: [AudioSilo server](https://github.com/KodeStar/audiosilo-docs/blob/cfa9fc51d45132f9deeb8bbc5342c651b5fa8baf/docs-users/admin/server.md), [AudioSilo accounts](https://github.com/KodeStar/audiosilo-docs/blob/cfa9fc51d45132f9deeb8bbc5342c651b5fa8baf/docs-users/admin/users-and-invites.md), [AudioSilo podcasts](https://github.com/KodeStar/audiosilo-docs/blob/cfa9fc51d45132f9deeb8bbc5342c651b5fa8baf/docs-users/admin/podcasts.md), [Audiobookshelf](https://github.com/advplyr/audiobookshelf/blob/edb1f7efc92ecacdef51aafb4d9d5054ce10604f/readme.md), [BookOrbit](https://github.com/bookorbit/bookorbit/blob/a96ff0c85a4c25e9126dfa4c71ea87537a3baf7a/README.md), [Grimmory](https://github.com/grimmory-tools/grimmory/blob/402e89b4452f8e2b17ab95f16c1621c003516cd2/README.md). Unknown support is not a claim of absence.

More sources behind the grid:

- **Audiobookshelf:** [OIDC sign-in](https://github.com/advplyr/audiobookshelf/blob/edb1f7efc92ecacdef51aafb4d9d5054ce10604f/server/auth/OidcAuthStrategy.js). [Absorb](https://github.com/pounat/absorb) adds CarPlay and Android Auto, and [AudioBooth](https://github.com/AudioBooth/AudioBooth) offers Apple Watch listening, so AudioSilo's [CarPlay and Android Auto](https://github.com/KodeStar/audiosilo-docs/blob/cfa9fc51d45132f9deeb8bbc5342c651b5fa8baf/docs-users/listening/in-the-car.md) are not exclusive.
- **BookOrbit:** syncs with Kobo and KOReader. Its [chapter editor](https://github.com/bookorbit/bookorbit/blob/a96ff0c85a4c25e9126dfa4c71ea87537a3baf7a/server/src/modules/chapter-editor/chapter-editor.controller.ts) edits timing as well as titles; AudioSilo can [rename chapters and choose generated or community lists](https://github.com/KodeStar/audiosilo-docs/blob/cfa9fc51d45132f9deeb8bbc5342c651b5fa8baf/docs-users/admin/books.md). It also has [podcasts](https://github.com/bookorbit/bookorbit/blob/a96ff0c85a4c25e9126dfa4c71ea87537a3baf7a/server/src/modules/podcast/podcast.controller.ts) and [synchronized EPUB output using optional alignment tools](https://github.com/bookorbit/bookorbit/blob/a96ff0c85a4c25e9126dfa4c71ea87537a3baf7a/docs/READ_ALOUD.md).
- **Grimmory:** standalone ebook, PDF and comic libraries in the browser, with shelves, reading progress and e-reader access. Its [documented OIDC support](https://github.com/grimmory-tools/grimmory/blob/402e89b4452f8e2b17ab95f16c1621c003516cd2/README.md) may settle it for a household that already uses an identity provider.
- **AudioSilo:** [offline downloads](https://github.com/KodeStar/audiosilo-docs/blob/cfa9fc51d45132f9deeb8bbc5342c651b5fa8baf/docs-users/listening/offline-downloads.md), [household controls](https://github.com/KodeStar/audiosilo-docs/blob/cfa9fc51d45132f9deeb8bbc5342c651b5fa8baf/docs-users/admin/users-and-invites.md) and [spoiler-safe recaps and characters](https://github.com/KodeStar/audiosilo-docs/blob/cfa9fc51d45132f9deeb8bbc5342c651b5fa8baf/docs-users/listening/recaps-and-characters.md). The server reads your folders; the optional Bridge does the writing and heavy jobs. Server 2.6.0 lets you [follow the narration in the companion EPUB, offline too](https://github.com/KodeStar/audiosilo-docs/blob/cfa9fc51d45132f9deeb8bbc5342c651b5fa8baf/docs-users/listening/reading-the-ebook.md).

Already on Audiobookshelf? Trying AudioSilo needn't mean moving your files first. [Moving from Audiobookshelf](/blog/moving-from-audiobookshelf/) covers a gradual trial. You can also stay, and use AudioSilo Meta as [a custom metadata provider for Audiobookshelf](https://meta.audiosilo.app/audiobookshelf).

## Good to know

- **Following the narration** works in the web player bundled with the server and in app 2.6.0: on the App Store for iPhone and iPad, and on Android from [the APK on GitHub](https://docs.audiosilo.app/users/listening/mobile-apps#android-without-google-play) until it reaches Google Play. [Creating the alignment needs a Bridge that can write to the library](https://github.com/KodeStar/audiosilo-docs/blob/cfa9fc51d45132f9deeb8bbc5342c651b5fa8baf/docs-users/admin/making-read-along.md). Budget separately for alignment and any speech-recognition jobs or models.
- **[Apple Watch](https://github.com/KodeStar/audiosilo-docs/blob/cfa9fc51d45132f9deeb8bbc5342c651b5fa8baf/docs-users/listening/apple-watch.md)** comes with iPhone app 2.6.0. It excludes podcasts, and there is no Wear OS app.
- **An earlier LibraForge capture**, on 6 November, scored every tool on all 4,044 books and included AudioSilo 2.5.1, which held 966 for review. That row is no longer published and its basis differs, so we don't compare the two.

## How we measured

**Scan, CPU and memory.**

- **When and where:** 6-7 November 2026, on an Intel Core i3-N305 (eight logical CPUs, 16 GB RAM) running Unraid Linux 6.1.
- **Storage:** all four read the same read-only library straight from an XFS NVMe array disk, bypassing Unraid's user-share FUSE layer (BookOrbit documents FUSE exclusions; the older post used that route). App and database data went on the NVMe cache pool.
- **Trials:** one stack at a time, fresh app and database folders, a cold page cache, three completed trials each.
- **AudioSilo rerun:** the four-server run used a pre-release AudioSilo build. On 7 November we ran the released 2.6.0 and 2.5.1 images alone, three fresh trials each, alternating, same machine, books, settings and method. AudioSilo's figures come from that rerun. One 2.5.1 trial was rerun because the coordinating computer went to sleep during its idle measurement.
- **Images,** pinned by exact build (linux/amd64): AudioSilo 2.6.0 `sha256:9aca7db2b914`, 2.5.1 `sha256:f121180ba3c0`, Audiobookshelf `sha256:37c2057e1506`, BookOrbit `sha256:5a6b997e0e25`, Grimmory `sha256:83597bf02da4`.
- **What ran:** owner services stayed running. PostgreSQL and MariaDB are counted; AudioSilo and Audiobookshelf have SQLite inside the app. No Bridge, speech recognition, TTS or metadata mirror ran, and no external matching. Optional services need their own budget.
- **Timing** stops at each server's own "indexing succeeded" signal, not a universal definition of fully processed. Memory was sampled about every half second; CPU uses container-group counters.
- **Host noise:** every selected AudioSilo and Audiobookshelf scan, and BookOrbit's third trial, crossed the flag threshold (25% of one core outside the measured stack) in at least one window. AudioSilo's short scans are especially sensitive to this. BookOrbit's third trial stayed busy after the preflight wait (Immich, kernel reclaim and the user-share process). These flags limit precision.

**Matching** follows [LibraForge's own method](https://coconautilus17.github.io/LibraForge/#method). We didn't run or judge any of it.

- AudioSilo ran **Match automatically** against a local copy of the community database, then was timed again online. Confident matches count as written, "to review" as held.
- Audiobookshelf used Audible US, Grimmory had Audible enabled and first, and BookOrbit used its default providers. The beets-audible version is undisclosed.
- Each tool ran on its own date, 28 October to 8 November, against live services.
- The review was done with Claude, an AI model, under human supervision. A second audit of 100 random books found 20 of 700 verdicts wrong (2.9%), and a fresh 100 found 6 (0.9%), each corrected for all books. Not every book was hand-checked.
- These automatic modes don't measure manual matching, every provider choice, newer builds or player quality. Zero wrong books is an observation, not a guarantee. "Same as Audible" measures agreement with Audible, not whether a value is wrong in itself.
