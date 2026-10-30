---
title: "First scans many times faster in AudioSilo Server 2.5.1"
description: Server 2.5.1 reads most audio files itself during a scan instead of starting ffprobe for each one. A 1,165-book library went from 198 seconds to 7.5.
kind: feature
published: 2026-10-30
verified: 2026-10-30
appliesTo: Server 2.5.1 with FFmpeg 7.1 or 8.1
tags: [performance, library, self-hosting, ffmpeg]
covers:
  - server:scanner
  - server:ffprobe
  - server:toolfetch
  - docs:/users/admin/libraries
  - docs:/users/admin/server
  - docs:/users/getting-started/install-binary
related:
  - audiobooks-on-unraid
  - server-2-5
  - organize-audiobook-folders
draft: false
---

From **server 2.5.1**, the first scan of a library is many times quicker. For each audio file, the server now reads its length, chapters, codec and tags itself, instead of starting a separate program (ffprobe) to do it. On our test server, a real library of 1,165 books and 9,165 files used to take **198 seconds** to index from scratch. With 2.5.1 it takes **7.5 seconds**.

## What changed

A scan has to know every file's length, its chapters and how its audio is encoded. Until now the server asked ffprobe, part of FFmpeg, about each file: one program start per file. Starting a program costs far more than reading the few hundred kilobytes it needs, so on a big library that was nearly all of the scan.

In 2.5.1 the server reads those details itself for **MP3, M4B, M4A, MP4, FLAC, Ogg Vorbis, Opus and MKA** files. It still uses ffprobe for any file it can't be sure about, such as an MP3 made by joining several files together or an unusual MP4. On the test library that was 3 files out of 9,165.

Two smaller changes help as well: the scan now writes several books to the database at a time instead of one, and it works out each book's added date while it walks the folders, from the same place as before, instead of looking at every file a second time.

## The index is the same

The goal was the same answers as ffprobe, not close ones. The server follows the rules of the FFmpeg release you have, and on the test library every duration, chapter start and end, title and tag came out identical to what ffprobe gave, value for value: 0 differences across 1,165 books and 56,673 chapters. The server's tests compare it with FFmpeg 7.1 and 8.1 on about a hundred sample files, and a weekly check runs it against the ffprobe in the Docker image.

## What you need

- **FFmpeg 7.1 or 8.1.** The official Docker image and the [LinuxServer.io image](/blog/audiobooks-on-unraid/) have 8.1, so there is nothing to do: the next scan is the fast one.
- **Running the program directly?** If the server downloads FFmpeg for you (no ffmpeg next to it or on your `PATH`), it now fetches an 8.1 release build on Linux and Windows. An older server's download was a development build that the fast reader doesn't recognise; 2.5.1 fetches the 8.1 build in the background and uses it from the next start, without holding up this one.
- **Any other version** (Ubuntu 24.04's 6.1, for example) still works: ffprobe reads every file, as before. Run `ffprobe -version` to see which one you have, or look at the ffprobe row on **Health > System** in the admin console. At start, the server's log also says whether the faster reading is on ("in-process probe on") or off.

ffprobe is still needed either way, for the files the server leaves to it.

## The numbers

Measured on an Intel Core i3-N305 (8 cores) running Unraid, from a cold disk cache, two runs of each, with the scan before this change against 2.5.1:

| Library | Before | 2.5.1 | Faster |
|---|---|---|---|
| Real library, 1,165 books, 9,165 files | 198 s | 7.5 s | 26x |
| 5,000 books on the NVMe cache pool | 55 s | 7 s | 7.7x |
| 5,000 books on `/mnt/user` | 57 s | 8.0 s | 7.2x |
| 20,000 books on the NVMe cache pool | 270 s | 29 s | 9.4x |
| 20,000 books on `/mnt/user` | 286 s | 32 s | 8.8x |

The 5,000 and 20,000 book libraries are generated test libraries with one small MP3 and a cover per book, so ffprobe had less to do per book there than in the real library, which averages about 8 files a book. The real library's speed-up is the one closer to what you'll see.

Scaled up by the same per-book times (an estimate, not a measurement), a 20,000-book library like the real one would go from about 57 minutes to about 2 minutes, and a 50,000-book one from about 2.4 hours to about 5 minutes.

## When you'll notice it

Rescans were already quick when little had changed, because the server skips books whose files have the same size and modification time as last time. The new reader matters whenever files are new to the server: the first scan of a library, a big batch of books added at once, or a rebuild of the index from scratch.

The docs have the details: [Libraries](https://docs.audiosilo.app/users/admin/libraries) for scanning, and [ffmpeg and ffprobe](https://docs.audiosilo.app/users/getting-started/install-binary#ffmpeg-and-ffprobe) for checking your version.
