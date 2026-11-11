---
title: "First scans many times faster in AudioSilo Server 2.5.1"
description: Server 2.5.1 reads most audio files itself during a scan instead of starting ffprobe for each one. A 1,165-book library went from 198 seconds to 7.5.
kind: feature
published: 2026-10-30
updated: 2026-11-10
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
revisions:
  - date: 2026-11-10
    note: "Rewritten to be shorter and easier to read. No facts changed."
---

From **server 2.5.1**, the first scan of a library is 7 to 26 times quicker on our test server. A real library of 1,165 books and 9,165 files went from **198 seconds** to **7.5 seconds**. The server now reads each file's details itself instead of starting ffprobe for every file.

## What changed

A scan needs every file's length, chapters and audio encoding. Until now the server asked ffprobe, part of FFmpeg, once per file. Starting a program costs far more than reading the few hundred kilobytes it needs. On a big library, that was nearly the whole scan.

In 2.5.1 the server reads these files itself: **MP3, M4B, M4A, MP4, FLAC, Ogg Vorbis, Opus and MKA**. It still hands ffprobe any file it isn't sure about, such as an MP3 joined from several files or an unusual MP4. On the test library, that was 3 files out of 9,165.

Two smaller changes help too:

- The scan writes several books to the database at a time instead of one.
- It works out each book's added date while walking the folders, from the same source as before, instead of checking every file a second time.

## The index is the same

The goal was the same answers as ffprobe, not close ones. The server follows the rules of your FFmpeg release.

On the test library, every duration, chapter start and end, title and tag matched ffprobe exactly: 0 differences across 1,165 books and 56,673 chapters. The server's tests compare it with FFmpeg 7.1 and 8.1 on about a hundred sample files. A weekly check runs it against the ffprobe in the Docker image.

## What you need

- **FFmpeg 7.1 or 8.1.** The official Docker image and the [LinuxServer.io image](/blog/audiobooks-on-unraid/) have 8.1, so there's nothing to do. The next scan is the fast one.
- **Running the program directly?** If the server downloads FFmpeg for you (no ffmpeg next to it or on your `PATH`), it now fetches an 8.1 release build on Linux and Windows. Older servers downloaded a development build the fast reader doesn't recognise. 2.5.1 fetches 8.1 in the background and uses it from the next start.
- **Any other version** (Ubuntu 24.04's 6.1, for example) still works, with ffprobe reading every file as before.

To check your version, run `ffprobe -version` or look at the ffprobe row on **Health > System** in the admin console. The server's start-up log also says whether the faster reading is on ("in-process probe on") or off.

ffprobe is still needed either way, for the files the server leaves to it.

## The numbers

| Library | Before | 2.5.1 | Faster |
|---|---|---|---|
| Real library, 1,165 books, 9,165 files | 198 s | 7.5 s | 26x |
| 5,000 books on the NVMe cache pool | 55 s | 7 s | 7.7x |
| 5,000 books on `/mnt/user` | 57 s | 8.0 s | 7.2x |
| 20,000 books on the NVMe cache pool | 270 s | 29 s | 9.4x |
| 20,000 books on `/mnt/user` | 286 s | 32 s | 8.8x |

The real library's speed-up is closer to what you'll see. Scaled by the same per-book times (an estimate, not a measurement):

| Library like the real one | Before | 2.5.1 |
|---|---|---|
| 20,000 books | about 57 minutes | about 2 minutes |
| 50,000 books | about 2.4 hours | about 5 minutes |

## When you'll notice it

Rescans were already quick when little had changed, because the server skips books whose files have the same size and modification time. The new reader matters when files are new to the server:

- the first scan of a library
- a big batch of books added at once
- a rebuild of the index from scratch

## How we measured

An Intel Core i3-N305 (8 cores) running Unraid, from a cold disk cache, two runs of each, the scan before this change against 2.5.1.

The 5,000 and 20,000 book libraries are generated test libraries, with one small MP3 and a cover per book. That gave ffprobe less to do per book than the real library, which averages about 8 files a book.

The docs have the details: [Libraries](https://docs.audiosilo.app/users/admin/libraries) for scanning, and [ffmpeg and ffprobe](https://docs.audiosilo.app/users/getting-started/install-binary#ffmpeg-and-ffprobe) for checking your version.
