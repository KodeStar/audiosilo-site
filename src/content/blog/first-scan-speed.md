---
title: "Why the first scan of a big audiobook library is slow, and what makes it fast"
description: Most of a first scan is spent starting a probe program once per audio file, not reading disks. Where the time goes, what doesn't help, and what does, Unraid included.
kind: guide
published: 2026-10-30
updated: 2026-11-10
verified: 2026-10-30
appliesTo: Any audiobook server; the AudioSilo figures are server 2.5.1
tags: [performance, library, unraid, self-hosting, ffmpeg]
covers:
  - server:scanner
  - server:ffprobe
  - server:database
  - docs:/users/admin/libraries
  - docs:/users/getting-started/install-binary
  - docs:/users/getting-started/install-unraid
related:
  - faster-first-scans
  - audiobooks-on-unraid
  - organize-audiobook-folders
  - m4b-vs-mp3-audiobooks
draft: false
revisions:
  - date: 2026-11-10
    note: "Rewritten to be shorter and easier to read. No facts changed."
---

A first scan is slow mostly because many servers **start an external program, usually ffprobe, once for every audio file** to learn its length, chapters and codec. Starting a program costs far more than reading the few hundred kilobytes it needs. With tens of thousands of files, starting the program takes up most of the scan.

A server that reads the files itself, and writes to its database in batches, can scan the same library many times faster. The numbers below come from one small server. Your own times will differ, so read them as proportions.

## What a scan has to read

For each book, a server wants the tags, the length, the chapters, the codec (can a phone or browser play it as it is?) and a cover. In an MP3 most of this sits near the start (an ID3 block, a Xing or VBRI header). In an M4B or M4A it's in the file's index, the `moov` box.

None of this needs the audio itself. A well-written parser touches a few hundred kilobytes of a 500 MB M4B. But an M4B whose index is at the end of the file (common when a tool doesn't "fast-start" it) needs a jump to the end, which costs a seek on a hard disk.

## Where the time actually goes

| Measure | Result |
|---|---|
| Share of file-reading time spent in ffprobe | About 94% |
| Start-up per ffprobe run | About 31.5 ms (117 shared libraries loaded) before reading a byte |
| ffprobe runs a second, all 8 cores busy | About 80, 40% of it in the operating system |
| Whole first scan | About 198 seconds, about 170 ms a book |
| At that rate: 5,000 books | About 14 minutes |
| At that rate: 20,000 books | About an hour |

So most of the time went on starting ffprobe, not on the disk or the network.

## What doesn't help

- **More parallel probes.** Going from 8 at a time to 16 made each ffprobe run take twice as long and the scan no quicker (58 seconds against 53 to 58 on a 5,000-book test library). Going down to 4 made it slower (76 seconds). One probe per core was right.
- **Cheaper ffprobe options.** Asking for fewer fields, or less of each file, saved no measurable time, because the cost is in starting it.
- **Walking more folders at once.** Past 8 at a time, listing got no faster, even on Unraid's `/mnt/user`.

## What makes it fast

1. **Read the files in the server's own process.** Parsing an MP3's headers or an M4B's index in running code costs about 1 to 2 ms a file instead of 30-plus. The hard part is matching ffprobe exactly (durations to the microsecond, chapter ends, odd encoders), so a careful server keeps ffprobe as the fallback for any file it isn't sure about.
2. **Write to the database in batches.** Once reading is cheap, writing to the database is what limits the scan. One transaction per book took about 1.5 ms a book. Writing several books per transaction cut that by about 12%.
3. **Don't look at each file twice.** Taking file dates from the folder walk, instead of asking again later, cut that step from about 15 seconds of work to under 3.
4. **On rescans, skip what hasn't changed.** A book whose files have the same size and modification time needs no reading. This is why a second scan is usually quick on any server, and the first one is the slow one.

## Disks, network shares and Unraid

- **Spinning disks** pay several milliseconds per jump, and a spun-down disk takes seconds to wake. Keep each book's files in one folder, on one disk (see [How to organise audiobook folders](/blog/organize-audiobook-folders/)).
- **Network shares** (SMB, NFS) add a round trip to every open and listing. In-process reading needs one open per file instead of two.
- **Unraid's `/mnt/user`** is a FUSE filesystem (shfs) that every open, listing and read passes through. Its cost is real but small next to process start-up:

| 20,000-book scan | `/mnt/user` | Cache pool directly |
|---|---|---|
| With ffprobe | 286 s | 271 s |
| In-process reading | 32 s | 29 s |

That machine's array is NVMe, so these numbers show the FUSE layer, not hard-disk seeks.

Unraid habits that help any media server:

- **Keep the app's own data on the cache pool**, an SSD, in `appdata`. The database is read on every page, and on `/mnt/user` it goes through FUSE too.
- Make a share that lives wholly on one pool an **exclusive share** (Unraid 6.12 and later), which skips FUSE for it.
- Mount your books **read-only** in the container. A scan never writes to them.

## The AudioSilo way

From **server 2.5.1**, AudioSilo does all of the above:

- It reads MP3, M4B, M4A, MP4, FLAC, Ogg Vorbis, Opus and MKA itself, by the rules of the FFmpeg 7.1 or 8.1 release it finds. Only files it can't be sure of go to ffprobe (3 of 9,165 on the real library).
- On that library the result is identical to ffprobe's, and the first scan went from **198 seconds to 7.5**.
- It writes several books per transaction, takes dates from the folder walk, and skips unchanged books on a rescan.
- With its database on Unraid's `/mnt/user`, it maps it into memory for reading, which made the authors list about nine times quicker to load on the test machine.

[First scans many times faster in AudioSilo Server 2.5.1](/blog/faster-first-scans/) has the full numbers and what you need (FFmpeg 7.1 or 8.1, which the Docker images have). [Audiobooks on Unraid](/blog/audiobooks-on-unraid/) walks through installing it from the Apps tab, and the docs cover [scanning](https://docs.audiosilo.app/users/admin/libraries) and [checking your ffprobe version](https://docs.audiosilo.app/users/getting-started/install-binary#ffmpeg-and-ffprobe).

## How we measured

Every stage of a first scan was timed on an Intel Core i3-N305 (8 cores, a typical mini PC or small NAS chip) running Unraid, against a real library of 1,165 books in 9,165 files, from a cold disk cache.
