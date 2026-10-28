---
title: "AudioSilo Server 2.5: read the ebook, a faster server, and .mka everywhere"
description: Read a book's EPUB beside its audio in the web player and the apps, quicker scans, lists and web player start-up, .mka books in the apps, and a database copy before every upgrade.
kind: release
published: 2026-10-28
updated: 2026-10-28
verified: 2026-10-28
appliesTo: Server 2.5.0 with its bundled web player, app 2.5.0, Bridge 0.4.0
tags: [release, server, reader, ebooks, performance, bridge]
covers:
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
  - app:reader
  - app:book-page
  - app:downloads
  - app:connect
  - app:library
  - app:podcasts
  - docs:/users/listening/reading-the-ebook
  - docs:/users/listening/offline-downloads
  - docs:/users/listening/connecting
  - docs:/users/getting-started/running-a-worker
  - docs:/users/admin/server
related:
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
  - date: 2026-10-28
    note: "Where to get app 2.5.0 while it is in store review (the Android APK), and links to the posts on .mka books, the ASR worker install and backing up before an upgrade."
---

AudioSilo Server **2.5.0** came out on 28 October. The headline is the **ebook reader**: when a book's folder also holds its EPUB, you can read it as well as listen, in the web player and in the iPhone, iPad and Android apps, with your place kept on every device and offline reading for downloaded books. Around it, the server is quicker almost everywhere, `.mka` books play in the apps too, a book folder opens before it's scanned, and the server copies its database before an upgrade changes it. **Bridge 0.4.0** came out alongside, with a one-line install for an ASR worker.

**Where it runs:** the reader and the other new listening features are in the **web player bundled with the server** (`/web`) and in **app 2.5.0** for iPhone, iPad and Android. App 2.5.0 came out on 28 October and is in review at the App Store and Google Play; on Android you can install it now from the APK on [its GitHub release](https://github.com/KodeStar/audiosilo-frontend/releases/tag/v2.5.0) (see [Android without Google Play](https://docs.audiosilo.app/users/listening/mobile-apps#android-without-google-play)). Older apps keep working with 2.5 as before, without **Read the ebook**.

## How to update

Update with `docker compose pull && docker compose up -d`, or from [GitHub Releases](https://github.com/KodeStar/audiosilo-server/releases). Three database migrations (0055 to 0057) run on first start, and before they run the server now copies your database into its backups folder for you (more below). The next scan finds your ebooks and records each book's file order, without re-reading the audio.

If you run a Bridge, update its image (`ghcr.io/kodestar/audiosilo-bridge`) to **0.4.0**. Bridge 0.3.0 and later keep working with this server; only the one-command worker install needs 0.4.0.

## Read the ebook

- **Read as well as listen.** A book whose folder holds its ebook shows **Read the ebook** on its page. The reader shows the text a page at a time: tap or click the page edges, swipe, or use the arrow keys (a right-to-left book turns the other way). **Contents** opens on the chapter you're in, **−** and **+** change the text size, and the reader follows the app's light or dark look.
- **Which books.** A folder book with exactly one `.epub` beside its audio, or a single-file book with an `.epub` of the same name next to it (`Project Hail Mary.m4b` and `Project Hail Mary.epub`). It must be an EPUB without DRM. Your server finds them at its next scan; there's nothing to switch on.
- **Your place on every device.** Your server keeps your reading place for your account, separate from your listening place. If another device read further, the reader never moves you back or jumps you forward without asking: it offers *"On Pixel 8 you were at 60%. Jump there?"* with **Jump** and **Stay**.
- **Read offline.** Downloading a book now takes its ebook too, in the apps and the web player. Pages you read offline are saved on the device and sent to your server when it's back.
- **Safe by design.** An ebook's own scripts never run, the reader sends nothing out of the page it runs in, and in the apps it never sees your sign-in token.

The whole tour is in [Read the ebook: your EPUBs in the AudioSilo player](/blog/ebook-reader/), and every screen is in the docs' [Reading the ebook](https://docs.audiosilo.app/users/listening/reading-the-ebook).

## Faster

- **Scanning a new library is much quicker.** The server reads several books at once (one per CPU core, up to 8; `scan.concurrency` changes it) and reads MP3 tags in blocks instead of byte by byte. The index it builds is the same as before. **Rescans with nothing changed are quicker too**, especially on network and FUSE storage such as Unraid's, and a file ffprobe can't read isn't probed again until it changes.
- **Lists, search and Home answer sooner**, and grid covers are smaller and served faster.
- **Many devices behind one address are no longer throttled.** Signed-in requests are limited per sign-in, not per network address, so a household or a proxy no longer shares one budget. Sign-in, pairing and demo sessions stay limited per address, and every refusal now says how long to wait.
- **The admin console opens its sections sooner** on large libraries, Health included, and the server uses less memory at idle.
- **The web player paints its first screen sooner.** It shows Home and the library from your last visit at once, then refreshes them, and loads the covers you can see first.

## `.mka` books play everywhere

In 2.4, a Matroska (`.mka`) book played only in the web player. Now an **MP3 inside an `.mka`** plays in the iOS and Android apps too, including the apps you already have. With ffmpeg available (as for transcoding), the server repackages the MP3 inside into a plain MP3 file, without converting it, and serves that at the same address. Chapters come along, seeking works, and the result is kept in a cache in the data folder (up to 8 GB), so each file is done once. Your `.mka` files are never changed, and downloads of these books work too, offline included.

An `.mka` holding another codec (AAC, say) still plays in the web player only, as in 2.4. On iPhone these books are best with app 2.5.0: the 2.4.1 app can stop with a false "End of book" about ten seconds into the first play of one (a second play works). Thanks to @wtanksleyjr for the request. More in [MKA audiobooks now play in the iPhone and Android apps](/blog/mka-books-play-everywhere/), and for books with other audio inside, [how to convert an MKA audiobook](/blog/mka-audiobooks/).

## New book folders open before a scan

In the player's **Folders**, a book folder your server hasn't scanned yet now shows as a book marked **Not scanned yet**, rather than as a folder that looks unplayable. Open it and it plays; your server reads it on the spot. In the admin console, **Folders** says such a folder is **Not in the library yet**, with **Rescan** next to it. A book folder you renamed and open before the next scan keeps its progress, bookmarks and the rest.

## One command to install an ASR worker

An ASR worker hands your Bridge's speech recognition to a faster computer (a Mac with Apple silicon, or a PC with an NVIDIA GPU). With **Bridge 0.4.0**, the Bridge's **Workers** tab gives you one line to paste into that computer's terminal, for macOS or Linux: it downloads the worker for that computer from your Bridge and installs it as a service. Running the same line again updates it and keeps its settings. The walkthrough is in [Faster transcription for your Bridge: an ASR worker in one command](/blog/asr-worker-one-command/), and the docs have [Running a worker](https://docs.audiosilo.app/users/getting-started/running-a-worker).

Bridge 0.4.0 also makes copy buttons work over plain http on a LAN address, and pairing now says what actually went wrong: a server it couldn't reach (with the address to use instead), a server that answered with an error, or a pairing that wasn't saved and needs a new code.

## A copy of your database before every upgrade

When a new version has database changes to make, the server now copies your database into the backups folder first, and writes one line in the log naming the changes and the copy. The newest 3 of these copies are kept, and **Server > Settings > Backups** lists them as **Before an upgrade**. A fresh install, or a start with nothing to change, makes no copy. [How to back up a self-hosted app before you upgrade it](/blog/back-up-before-upgrading/) covers the copy, rolling back, and what to back up yourself.

## Polish

- **Signing in** says what went wrong and what to do next, in your language: a wrong name or password, an invite code that's used up or expired, or too many tries, with how many minutes to wait. A username with a stray space signs in.
- **First run:** an admin signing in to a server with no library yet sees **Add your first library**, linking to the console's setup.
- **A link to a missing book** shows **This book isn't in the library** with Back and Home, instead of a Retry that can't work.
- **Removing a server** from the player now asks first, and says what goes with it.
- **A server that isn't answering** is named in the offline bar, the top bar and Search, not just "Some servers offline".
- In the web player, closing the tab while a book plays keeps that listening in History and the Journal.
- **Check for new episodes** stays busy until the server has checked the show, then shows what it found.

## Fixes worth knowing

- **Listening in the house** could show listening someone did while their sharing was off. It now counts only listening from the moment they turned sharing on.
- **Giving someone library access** could widen an admin's own share that happened to be named `Library: <name>`. A share is now reused only when it really is that library's whole-library share.
- **A narrator in an `.m4b`'s narrator tag** is now read, and beats the composer tag.
- **A decimal series position in a folder name**, like `02.5 - Gods of Risk`, now reads as book 2.5.
- Listening progress saved against one of a book's audio files is kept on the book itself, so it isn't lost.
- "2 days ago" and the like now follow the app's language in the iOS and Android apps.

## After updating

- **The database copy** from the migrations above is in the backups folder, listed as **Before an upgrade**.
- **A book whose files were put in a new order** (natural file order, 2.4.0) keeps your place as a time in the whole book, so if it was re-ordered on this upgrade, that time may now fall in a different part of the book.
- **New settings:** `scan.concurrency` and `rate_limit.{address,token,media}.{rate,burst}`, each with an `AUDIOSILO_` environment variable. The defaults suit most servers; nothing to change.
- **The narrator and decimal-position fixes** reach an existing book when its files change, or with **Read the files again** on the book's console page.
- **`GET /libraries` no longer sends a library's folder on the server** to listeners and demo visitors; admins still get it. The apps and the web player never used it, but a script that reads `root` with a listener's token needs an admin's.
- `audiosilo` now stops with an error when given a word on the command line it doesn't know, instead of ignoring it.

Apart from `root`, every change to the player API is additive, so existing iOS, Android and web players keep working. The full notes: [v2.5.0](https://github.com/KodeStar/audiosilo-server/releases/tag/v2.5.0) and [Bridge v0.4.0](https://github.com/KodeStar/audiosilo-bridge/releases/tag/v0.4.0).
