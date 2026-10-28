---
title: "MKA audiobooks now play in the iPhone and Android apps"
description: From server 2.5.0, an .mka audiobook with MP3 inside plays in every AudioSilo player, downloads included. The server repackages it as MP3 losslessly; your files stay as they are.
kind: feature
published: 2026-10-28
verified: 2026-10-28
appliesTo: Server 2.5.0 (any app); app 2.5.0 for iPhone downloads
tags: [formats, mka, playback, downloads, ffmpeg]
covers:
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
---

Server 2.4 indexed `.mka` (Matroska audio) books, but only the web player could play them, because the server had to convert them as they streamed. From **server 2.5.0**, an `.mka` book with **MP3 inside**, which is the usual kind, plays everywhere: in the web player, in the iOS and Android apps, and offline from a download. Your server repackages the MP3 inside into a plain MP3 file, without converting the audio, and sends that instead. Your `.mka` files themselves are never changed.

## What it needs

- **Server 2.5.0 or later, with ffmpeg.** The Docker image includes ffmpeg, and the program on its own finds a copy on your system or downloads one into its data folder. The admin console's **Server > Transcoding** card shows whether it was found.
- **No new app.** The server sends these books as MP3 at the address they always had, so the apps you already have play them. The reporter who asked for this confirmed it on Android the day 2.5.0 came out.
- **On an iPhone or iPad, app 2.5.0 is best.** The 2.4.1 app streams these books, but it can stop with a false "End of book" about ten seconds into the first play of one (a second play works), and a book it downloads only plays offline once you update. App 2.5.0 fixes both. It came out on 28 October and is in review at the App Store, so update when it reaches you.

There is nothing to switch on. Books that were already in your library start working with the upgrade.

## How it works

A Matroska file is a container: a wrapper around audio in some other format. Phones and browsers mostly can't open the wrapper, even when they can play what's inside it. When an `.mka` holds an MP3 stream, your server copies that stream into an ordinary MP3 file, chapters included, and serves it at the same address the book always had. Nothing is re-encoded, so the audio is bit for bit what was in your file.

- **Each file is done once.** The MP3 copies are kept in the server's data folder, under `cache/remux`, up to 8 GiB; past that, the copies played longest ago are removed and made again if someone plays them. Opening a book in the player starts its copies in the background, so they're usually ready by the time you press play. The folder is safe to delete and needs no backup.
- **Seeking works** like in any MP3 book, and so does the chapter list.
- **The very first play of a large book** can start while the server is still making its copy, through the live conversion. Until the copy is ready, a jump in that first stream may not land quite where you asked. After that, the book seeks normally.

## Downloads

Downloading one of these books saves the MP3 copy, so it plays with no connection, in the apps and in the web player. The iPhone app 2.5.0 saves it as `.mp3`. A download an older iPhone app made from a 2.5.0 server holds the MP3 too, under an `.mka` name the iPhone won't play; app 2.5.0 renames it when it starts, and it plays.

A copy downloaded **before** your server sent these books as MP3 (from an older server, or one without ffmpeg) holds the Matroska file itself, which an iPhone can't play. Remove that download and download the book again.

## What still plays in the web player only

An `.mka` with **other audio inside** (AAC, Opus or FLAC) is unchanged from 2.4: the web player plays it, converted to MP3 as it streams, and an Android phone plays it only if it can decode the audio inside. An iPhone can't. To listen to one of those in the apps, convert it to `.m4b` or `.mp3`. [What is an MKA audiobook?](/blog/mka-audiobooks/) shows how to check what's inside a file and convert it without losing quality where that's possible.

An `.mka` with the same name as another audio file beside it (`Book.m4b` and `Book.mka`) is left out of the library, as that file's source or copy, just as in 2.4.

## Also in this release

The same work makes **podcast episodes** the server converts as they play quicker to seek in the web player: the server no longer reads the episode from the start to get there. And `.m4a` episodes laid out with their index at the end now play.

The docs have the details: [Supported formats](https://docs.audiosilo.app/users/getting-started/organizing-your-library#supported-formats), [Books in MKA files](https://docs.audiosilo.app/users/listening/offline-downloads#books-in-mka-files) for downloads, and [Server > Transcoding](https://docs.audiosilo.app/users/admin/server#transcoding) for the cache.

Thanks to @wtanksleyjr for asking for this.
