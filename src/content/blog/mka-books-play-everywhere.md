---
title: "MKA audiobooks now play in the iPhone and Android apps"
description: From server 2.5.0, an .mka audiobook with MP3 inside plays in every AudioSilo player, downloads included. The server repackages it as MP3 losslessly; your files stay as they are.
kind: feature
published: 2026-10-28
updated: 2026-11-10
verified: 2026-11-07
appliesTo: Server 2.5.0 (any app); app 2.5.0 for iPhone downloads
tags: [formats, mka, playback, downloads, ffmpeg]
covers:
  - app:stores
  - server:formats
  - server:remux
  - server:transcode
  - app:playback
  - app:downloads
  - docs:/users/getting-started/organizing-your-library
  - docs:/users/listening/playback
  - docs:/users/listening/offline-downloads
  - docs:/users/admin/server
related:
  - mka-audiobooks
  - server-2-5
  - m4b-vs-mp3-audiobooks
  - server-2-4
draft: false
revisions:
  - date: 2026-11-10
    note: "Rewritten to be shorter and easier to read. No facts changed."
  - date: 2026-11-07
    note: "App 2.5.0 is now on the App Store."
---

From **server 2.5.0**, an `.mka` book with **MP3 inside**, the usual kind, plays everywhere: the web player, the iOS and Android apps, and offline downloads. The server repackages the MP3 into a plain MP3 file without converting the audio. Your `.mka` files are never changed.

In server 2.4, only the web player could play these books, because the server converted them as they streamed.

## What it needs

- **Server 2.5.0 or later, with ffmpeg.** The Docker image includes it. The program on its own finds a copy on your system or downloads one into its data folder. **Server > Settings > Transcoding** in the admin console shows whether it was found.
- **No new app.** The server sends these books as MP3 at the address they always had, so your current apps play them. The reporter who asked for this confirmed it on Android the day 2.5.0 came out.
- **On iPhone or iPad, app 2.5.0 is best.** It came out on 28 October and is on the App Store. App 2.4.1 streams these books but can stop with a false "End of book" about ten seconds into the first play (a second play works). A book it downloads only plays offline once you update.

There's nothing to switch on. Books already in your library work after the upgrade.

## How it works

A Matroska file is a wrapper around audio in another format. Phones and browsers mostly can't open the wrapper, even when they can play what's inside. So the server copies the MP3 stream into an ordinary MP3 file, chapters included, and serves it at the book's usual address. Nothing is re-encoded: the audio is bit for bit what was in your file.

- **Each file is done once.** Copies live in the server's data folder under `cache/remux`, up to 8 GiB. Past that, the copies played longest ago are removed and made again when needed. The folder is safe to delete and needs no backup.
- **Copies start early.** Opening a book in the player starts its copies in the background, so they're usually ready when you press play.
- **Seeking and the chapter list work** as in any MP3 book.

## Downloads

Downloading one of these books saves the MP3 copy, so it plays offline in the apps and the web player. iPhone app 2.5.0 saves it as `.mp3`.

## Good to know

- **The very first play of a large book** can start while the copy is still being made, through the live conversion. Until it's ready, a jump in that first stream may not land quite where you asked.
- **An older iPhone app on a 2.5.0 server** saves the MP3 under an `.mka` name the iPhone won't play. App 2.5.0 renames it when it starts, and it plays.
- **A download made before** your server sent MP3 (an older server, or one without ffmpeg) holds the Matroska file, which an iPhone can't play. Remove it and download the book again.
- **Other audio inside** (AAC, Opus or FLAC) is unchanged from 2.4. The web player plays it, converted as it streams, and an Android phone plays it only if it can decode it. An iPhone can't. [What is an MKA audiobook?](/blog/mka-audiobooks/) shows how to check and convert a file, losslessly where possible.
- **An `.mka` beside a same-named audio file** (`Book.m4b` and `Book.mka`) is left out of the library as that file's source or copy, as in 2.4.

## Also in this release

Podcast episodes the server converts as they play now seek faster in the web player: the server no longer reads from the start to get there. And `.m4a` episodes with their index at the end now play.

The docs have the details: [Supported formats](https://docs.audiosilo.app/users/getting-started/organizing-your-library#supported-formats), [Books in MKA files](https://docs.audiosilo.app/users/listening/offline-downloads#books-in-mka-files) for downloads, and [Server > Transcoding](https://docs.audiosilo.app/users/admin/server#transcoding) for the cache.

Thanks to @wtanksleyjr for asking for this.
