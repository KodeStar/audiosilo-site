---
title: "Why the first scan of a big audiobook library is slow, and what makes it fast"
description: Most of a first scan is spent starting a probe program once per audio file, not reading disks. Where the time goes, what doesn't help, and what does, Unraid included.
kind: guide
published: 2026-10-30
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
draft: true
---

The first scan of a big audiobook library is slow mostly because the server opens every audio file to learn its length, chapters and codec, and many servers do that by **starting an external program, usually ffprobe, once for every file**. Starting a program costs far more than reading the few hundred kilobytes it needs. With tens of thousands of files, those start-ups are the scan. Disks, network shares and the database add to it, but on a modern machine they come second. A server that reads the files itself, and writes to its database in batches, can scan the same library many times faster.

What follows is what we measured while making AudioSilo's scans faster. The numbers come from one small server, so take them as proportions, not promises.

## What a scan has to read

For each book, a server wants:

- **Tags**: title, author, narrator, series, year. In an MP3 these are an ID3 block at the start of the file; in an M4B or M4A they are in the file's index, the `moov` box.
- **The length.** An M4B states it in its index. An MP3 usually carries it in a header near the start (a Xing or VBRI frame); one without that header has to be estimated from its bitrate.
- **The chapters**, which an M4B keeps in its index or in a chapter track, and an MP3 in ID3 chapter frames, if at all.
- **The codec**, so the server knows whether a phone or browser can play the file as it is.
- **A cover**, from an image beside the files or embedded in them.

None of this needs the audio itself. A well-written reader touches a few hundred kilobytes of a 500 MB M4B. The catch is *where* those bytes are: an M4B whose index was written at the end of the file (common when a tool doesn't "fast-start" it) needs a jump to the end, which costs a seek on a hard disk.

## Where the time actually goes

We timed every stage of a first scan on an Intel Core i3-N305 (8 cores, a typical mini PC or small NAS chip) running Unraid, against a real library of 1,165 books in 9,165 files, from a cold disk cache.

- **ffprobe was about 94% of the time spent reading files.** Each run of it loaded 117 shared libraries and took about 31.5 ms before it read a single byte of the file. With all 8 cores busy, the machine managed about 80 ffprobe runs a second, 40% of it in the operating system rather than in ffprobe's own work.
- The whole scan took about 198 seconds: about 170 ms a book.
- At that rate, a 5,000-book library takes about 14 minutes and a 20,000-book one about an hour.

So the obvious suspects, the disk and the network, weren't where most of the time went. Process start-up was.

## What doesn't help

- **More parallel readers.** Going from 8 readers to 16 made each ffprobe run take twice as long and the scan no quicker (58 seconds against 53 to 58 on a 5,000-book test library). Going down to 4 made it slower (76 seconds). One reader per core was right.
- **Cheaper ffprobe options.** Asking ffprobe for fewer fields, and telling it to read less of each file, gave the same answers and saved no measurable time: the cost is in starting it, not in what it does once running.
- **Walking more folders at once.** Past 8 at a time, listing the folders got no faster, even on Unraid's `/mnt/user`.

## What makes it fast

1. **Read the files in the server's own process.** Parsing an MP3's headers or an M4B's index in code that is already running costs about 1 to 2 ms a file instead of 30-plus. The hard part is getting exactly the same answers as ffprobe (durations to the microsecond, chapter ends, odd encoders), so a careful server keeps ffprobe as the fallback for any file it isn't sure about.
2. **Write to the database in batches.** Once reading is cheap, the database becomes the floor: writing each book, one transaction at a time, took about 1.5 ms a book on the test machine, and a single writer can't go faster than that. Writing several books per transaction cut it by about 12%.
3. **Don't look at each file twice.** Taking the file's dates from the folder walk, instead of asking the filesystem for them again later, cut that step from about 15 seconds of work to under 3 on the real library.
4. **On rescans, skip what hasn't changed.** A book whose files have the same size and modification time as last time doesn't need reading again. This is why a second scan is usually quick on any server, and why the first one is the one that hurts.

## Disks, network shares and Unraid

Storage matters more on some setups than others:

- **Spinning disks** pay for every jump to a new spot on the platter, typically several milliseconds, and a disk that has spun down takes seconds to wake. A first scan over books spread across several array disks wakes each one. Keeping each book's files in one folder, on one disk, keeps the jumps short (see [How to organise audiobook folders](/blog/organize-audiobook-folders/)).
- **Network shares** (SMB, NFS) add a round trip to every file open and folder listing. Reading the files in-process helps here too: one open per file instead of a tag read and a separate ffprobe open.
- **Unraid's `/mnt/user`** is a FUSE filesystem (shfs) that merges the array disks and pools into one view. Every open, folder listing and read passes through it. On the test machine, a 20,000-book scan took 286 seconds on `/mnt/user` against 271 on the cache pool directly with ffprobe, and 32 against 29 seconds with in-process reading: a real cost, but a small one next to process start-up. (That machine's array is NVMe, so these numbers show the FUSE layer, not hard-disk seeks.)

A few Unraid habits that help any media server:

- **Keep the app's own data on the cache pool**, an SSD, in `appdata`. The database is read on every page, and a database on `/mnt/user` goes through FUSE as well.
- A share that lives wholly on one pool can be made an **exclusive share** (Unraid 6.12 and later), which skips the FUSE layer for it.
- Mount your books **read-only** in the container. A scan never needs to write to them.

## The AudioSilo way

From **server 2.5.1**, AudioSilo does all of the above. It reads MP3, M4B, M4A, MP4, FLAC, Ogg Vorbis, Opus and MKA files itself, by the rules of the FFmpeg 7.1 or 8.1 release it finds, and hands ffprobe only the files it can't be sure of (3 of 9,165 on the real library). On that library the result is identical to ffprobe's, and the first scan went from **198 seconds to 7.5**. It writes several books per database transaction, takes dates from the folder walk, and skips unchanged books on a rescan. When its database sits on Unraid's `/mnt/user`, it also maps it into memory for reading, which made the authors list about nine times quicker to load on the test machine.

[First scans many times faster in AudioSilo Server 2.5.1](/blog/faster-first-scans/) has the full numbers and what you need (FFmpeg 7.1 or 8.1, which the Docker images have). [Audiobooks on Unraid](/blog/audiobooks-on-unraid/) walks through installing it from the Apps tab, and the docs cover [scanning](https://docs.audiosilo.app/users/admin/libraries) and [checking your ffprobe version](https://docs.audiosilo.app/users/getting-started/install-binary#ffmpeg-and-ffprobe).
