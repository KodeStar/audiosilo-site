---
title: "AudioSilo Server 2.5: read the ebook, a faster server, and .mka everywhere"
description: "The ebook reader in the web player and the apps, a faster server, .mka books in the apps and a database copy before upgrades. 2.5.1: much faster first scans and read-alongs."
kind: release
published: 2026-10-28
updated: 2026-11-10
verified: 2026-11-07
appliesTo: Server 2.5.0 and 2.5.1 with their bundled web player, app 2.5.0, Bridge 0.4.0 and 0.5.0
tags: [release, server, reader, ebooks, performance, bridge]
covers:
  - app:stores
  - server:ebooks
  - server:reading-progress
  - server:scanner
  - server:formats
  - server:transcode
  - server:backups
  - server:security
  - server:invites
  - server:setup
  - server:admin_ui
  - server:web_player
  - server:bridge
  - server:series
  - server:metadata
  - server:household
  - server:ffprobe
  - server:toolfetch
  - server:readalong
  - server:duplicates
  - app:reader
  - app:book-page
  - app:downloads
  - app:connect
  - app:library
  - app:podcasts
  - app:settings
  - docs:/users/listening/reading-the-ebook
  - docs:/users/listening/offline-downloads
  - docs:/users/listening/connecting
  - docs:/users/getting-started/running-a-worker
  - docs:/users/admin/server
  - docs:/users/admin/making-read-along
  - docs:/users/getting-started/install-binary
supersededBy: server-2-6
supersededNote: Server 2.6 is out, with upcoming releases in the player and your calendar, listening that syncs across devices and offline, an ebook that follows the narration, and Audible on the Bridge. Everything below still applies.
related:
  - faster-first-scans
  - web-player-streams-by-default
  - ebook-reader
  - mka-books-play-everywhere
  - asr-worker-one-command
  - back-up-before-upgrading
  - mka-audiobooks
  - server-2-4
  - organize-audiobook-folders
  - m4b-vs-mp3-audiobooks
  - bridge-recaps-and-contributions
revisions:
  - date: 2026-11-10
    note: "Rewritten to be shorter and easier to read. No facts changed."
  - date: 2026-11-07
    note: "App 2.5.0 is now on Google Play too."
  - date: 2026-10-30
    note: "v2.5.1: first scans many times faster, the web player streams by default, read-alongs made by a Bridge, plus Bridge v0.5.0. App 2.5.0 is now on the App Store."
  - date: 2026-10-28
    note: "Where to get app 2.5.0 while it is in store review (the Android APK), and links to the posts on .mka books, the ASR worker install and backing up before an upgrade."
---

AudioSilo Server **2.5.0** came out on 28 October, and **2.5.1** on 30 October. The headline is the **ebook reader**: when a book's folder also holds its EPUB, you can read it as well as listen, with your place kept on every device. The server is also much faster, `.mka` books play in the apps, and the server copies its database before an upgrade changes it.

**Where it runs:** the reader and the other new listening features are in the **web player bundled with the server** (`/web`) and in **app 2.5.0** for iPhone, iPad and Android, on the App Store and Google Play. On Android you can also install the APK from [its GitHub release](https://github.com/KodeStar/audiosilo-frontend/releases/tag/v2.5.0) (see [Android without Google Play](https://docs.audiosilo.app/users/listening/mobile-apps#android-without-google-play)). Older apps keep working, without **Read the ebook**.

## How to update

1. Run `docker compose pull && docker compose up -d`, or install from [GitHub Releases](https://github.com/KodeStar/audiosilo-server/releases). Three database migrations run on first start in 2.5.0, and one in 2.5.1. The server copies your database into its backups folder before they run.
2. If you run a Bridge, update its image (`ghcr.io/kodestar/audiosilo-bridge`). Bridge 0.3.0 and later keep working; the one-command worker install needs **0.4.0**, and read-alongs need **0.5.0**.
3. If an admin console tab was open during the update, reload it.

The next scan finds your ebooks and records each book's file order, without re-reading the audio.

## Read the ebook

A book whose folder holds its ebook shows **Read the ebook** on its page. Turn pages by tapping, swiping or with the arrow keys. **Contents** opens on the chapter you're in, and **−** and **+** change the text size.

Your server keeps your reading place, separate from your listening place. If another device read further, the reader asks first: *"On Pixel 8 you were at 60%. Jump there?"* with **Jump** and **Stay**. Downloading a book takes its ebook too, so you can read offline.

It works with a folder book holding exactly one `.epub`, or a single-file book with an `.epub` of the same name (`Project Hail Mary.m4b` and `Project Hail Mary.epub`). The EPUB must have no DRM. There's nothing to switch on. See [Read the ebook](/blog/ebook-reader/) and [Reading the ebook](https://docs.audiosilo.app/users/listening/reading-the-ebook).

## .mka books play everywhere

An **MP3 inside an `.mka`** now plays in the iOS and Android apps too, including the apps you already have. With ffmpeg available, the server repackages the MP3 into a plain MP3 file without converting it. Chapters, seeking and downloads work, and your `.mka` files are never changed. See [MKA audiobooks now play in the iPhone and Android apps](/blog/mka-books-play-everywhere/).

## New book folders open before a scan

In the player's **Folders**, a book folder your server hasn't scanned yet shows as a book marked **Not scanned yet**. Open it and it plays; your server reads it on the spot. A book folder you renamed keeps its progress and bookmarks.

## One command to install an ASR worker

An ASR worker hands your Bridge's speech recognition to a faster computer: a Mac with Apple silicon, or a PC with an NVIDIA GPU. With **Bridge 0.4.0**, the Bridge's **Workers** tab gives you one line to paste into that computer's terminal. Running it again updates the worker. See [an ASR worker in one command](/blog/asr-worker-one-command/) and [Running a worker](https://docs.audiosilo.app/users/getting-started/running-a-worker).

## A copy of your database before every upgrade

When a new version changes the database, the server first copies it into the backups folder. The newest 3 copies are kept, listed as **Before an upgrade** in **Server > Settings > Backups**. See [How to back up a self-hosted app before you upgrade it](/blog/back-up-before-upgrading/).

## A faster server

2.5.0 scans several books at once (one per CPU core, up to 8; `scan.concurrency` changes it). Rescans with nothing changed are quicker, especially on network storage such as Unraid's. Lists, search, Home, the console and the web player's first screen all load sooner.

2.5.1 goes further. The server reads durations, chapters and tags itself, and asks ffprobe only about a file it isn't sure of. On an Intel N305 running Unraid:

| Measure | Before | 2.5.1 |
|---|---|---|
| First scan, 1,165 books (9,165 files) | 198 s | 7.5 s |
| Authors, data folder on a `/mnt/user` share | 79 ms | 9 ms |

The index is the same: 0 differences across 1,165 books and 56,673 chapters. JSON answers are compressed too (a page of 200 books goes from 41 kB to 10 kB). See [First scans many times faster](/blog/faster-first-scans/).

The fast scan needs **FFmpeg 7.1 or 8.1**. The Docker images (ours and LinuxServer.io's) have 8.1, and the native Linux and Windows builds swap a downloaded ffprobe for the FFmpeg 8.1 build in the background, then scan faster from the next start.

## Signed-in devices aren't throttled together

Signed-in requests are limited per sign-in, not per network address, so a household or a proxy no longer shares one budget. Sign-in, pairing and demo sessions stay limited per address, and every refusal says how long to wait.

## 2.5.1: the web player streams by default

In the web player, **Download automatically** now starts at **Never**. A browser can't tell Wi-Fi from mobile data, so starting a book used to download all of it alongside the stream. The apps still download On Wi-Fi. See [The web player no longer downloads the books you play on its own](/blog/web-player-streams-by-default/).

## 2.5.1: make read-alongs with a Bridge

A read-along lines a book's ebook up with its narration, sentence by sentence. With Bridge 0.5.0, a book with an ebook gets a **Read-along** card under **Chapters** in the console, with **Make read-along**. It uses speech recognition only, so there's no agent cost. See [Making a read-along](https://docs.audiosilo.app/users/admin/making-read-along).

## Fixes

- **Signing in** says what went wrong and what to do next, in your language. A username with a stray space signs in.
- **A link to a missing book** shows **This book isn't in the library**, instead of a Retry that can't work.
- **Removing a server** from the player asks first.
- **A server that isn't answering** is named in the offline bar, the top bar and Search.
- **Listening in the house** counts only listening from the moment someone turned sharing on.
- **Giving someone library access** no longer widens an admin's own share that happened to be named `Library: <name>`.
- **A narrator in an `.m4b`'s narrator tag** is read, and beats the composer tag.
- **A decimal series position in a folder name**, like `02.5 - Gods of Risk`, reads as book 2.5.
- In the web player, a downloaded book opened offline starts where you left off, and closing the tab while a book plays keeps that listening in History and the Journal.
- A cover replaced in a book's folder shows everywhere after the next scan.
- **Health > Duplicates** loads 50 groups at a time and reaches every group (before, it stopped at 500).
- On Bridge 0.5.0, **Generate** carries on from a transcription already done, and an idle Bridge with 2,000 finished books went from 4.45% of a CPU core to 0.14%.

## Good to know

- **A book whose files were re-ordered** (natural file order, 2.4.0) keeps your place as a time in the whole book, so that time may now fall in a different part of the book.
- **A web player on the old download default** moves to Never once, unless you had set **Keep the next books ready** above zero.
- **With any other ffprobe**, scans read every file with ffprobe as in 2.5.0.
- **An `.mka` holding another codec** (AAC, say) still plays in the web player only ([how to convert an MKA audiobook](/blog/mka-audiobooks/)). On iPhone, `.mka` books are best with app 2.5.0: the 2.4.1 app can stop with a false "End of book" on the first play.
- **Cover addresses change once** in 2.5.1, so the players and the console download each cover once more.
- **New settings:** `scan.concurrency`, `rate_limit.{address,token,media}.{rate,burst}` and `database.mmap` (`AUDIOSILO_DB_MMAP`, `auto` by default), each with an `AUDIOSILO_` environment variable. The defaults suit most servers.
- **The narrator and decimal-position fixes** reach an existing book when its files change, or with **Read the files again** on its console page.
- **`GET /libraries` no longer sends a library's folder** (`root`) to listeners and demo visitors; admins still get it. A script that reads `root` with a listener's token needs an admin's.
- `audiosilo` now stops with an error on a command-line word it doesn't know.
- A Bridge job now reports every 30 seconds, so a cancel can take up to about 30 seconds to reach it.

Apart from `root`, every change to the player API is additive. Thanks to @wtanksleyjr for the `.mka` request. The full notes: [v2.5.0](https://github.com/KodeStar/audiosilo-server/releases/tag/v2.5.0), [v2.5.1](https://github.com/KodeStar/audiosilo-server/releases/tag/v2.5.1), [Bridge v0.4.0](https://github.com/KodeStar/audiosilo-bridge/releases/tag/v0.4.0) and [Bridge v0.5.0](https://github.com/KodeStar/audiosilo-bridge/releases/tag/v0.5.0).
