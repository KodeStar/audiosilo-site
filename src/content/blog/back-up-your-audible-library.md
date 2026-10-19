---
title: How to back up your Audible library to M4B and listen on your own server
description: Download the Audible books you bought as plain M4B files with Libation, OpenAudible or audible-cli, keep them in a folder that scans cleanly, and play them anywhere.
kind: guide
published: 2026-10-17
verified: 2026-10-19
appliesTo: Server 2.3.1, app 2.0.0; Libation 14.2.2, OpenAudible 5.0.3, audible-cli 0.6.0
tags: [audible, backup, m4b, self-hosting]
covers:
  - bridge:audible
  - server:formats
  - server:metadata
  - server:scanner
  - docs:/users/getting-started/organizing-your-library
  - docs:/users/getting-started/quickstart-docker
  - docs:/users/admin/health
related:
  - organize-audiobook-folders
  - m4b-vs-mp3-audiobooks
  - self-hosted-audiobook-server
hero: ../../assets/stills/player-ipad-series-dark.webp
heroAlt: The Stormlight Archive on an iPad, the books you own as spines in reading order, the ones you are missing as dashed ghost spines
---

To back up your Audible library, you use a tool that signs in to **your own Audible account**, downloads the books you bought and saves them as ordinary **M4B** (or MP3) files. The three tools people use today are **Libation** (free), **OpenAudible** (paid, free to try) and **audible-cli** (free, command line). Once the files are on your own disk, any audiobook player can play them, and a self-hosted server lets you stream them to your phone with your place kept in sync.

This guide covers why the files need converting, which tools are maintained right now, a plain note on the law, a folder layout that works in any audiobook server, and how to listen to the result with AudioSilo.

## Why back up Audible books at all

The books you buy on Audible play in Audible's own apps. The files it hands out are locked to your account, so you can't open them in another player, keep them with the rest of your audiobooks, or play them on a device Audible doesn't support.

A plain M4B copy on your own disk changes that:

- it plays in any player that understands M4B, with its chapters and cover;
- it sits in the same library as your other audiobooks (CD rips, DRM-free purchases, LibriVox);
- it doesn't depend on one app, one account or one company staying as it is today.

## AAX and AAXC: what Audible actually gives you

Audible's downloads come in two DRM-protected formats:

- **AAX**, the older format, is tied to your account by a short key Audible gives your account (often called "activation bytes").
- **AAXC**, the newer format, comes with its own key for each book.

Inside both is ordinary AAC audio with chapters, which is exactly what an M4B file is. Converting is therefore quick and lossless when the tool simply unlocks the audio and puts it in an M4B container, without re-encoding it.

Playing AAX or AAXC needs your account's keys, so a self-hosted server can't stream them as they are. AudioSilo deliberately doesn't index them: it only lists files it can actually play, so a stray `.aax` stays out of the way until you convert it.

## A note on the law

These tools are for making **personal backup copies of books you bought**, with your own account. Laws on removing DRM, even from your own purchases, differ from country to country: in some places it is not allowed at all, whatever the reason. Check what applies where you live before you start. Keep the copies for yourself and don't share them. This is not legal advice.

## The tools that are maintained in 2026

All three are in active use; Libation and audible-cli both released new versions in September 2026. Audible changes its sign-in from time to time, so whichever you choose, update it before a big download and look at its issue tracker if signing in fails.

| Tool | Cost and licence | How you use it | Systems | Output | Latest release checked |
|---|---|---|---|---|---|
| [Libation](#libation) | Free, open source (GPL-3.0) | Desktop app, plus a command line | Windows, macOS, Linux | M4B by default, MP3 as an option | 14.2.2 (September 2026) |
| [OpenAudible](#openaudible) | Paid one-time licence, free to try | Desktop app, also a Docker image | Windows, macOS, Linux, Docker | M4B or MP3 | 5.0.3 |
| [audible-cli](#audible-cli) | Free, open source (AGPL-3.0) | Command line (Python, or a prebuilt binary) | Windows, macOS, Linux | AAX or AAXC with chapters and metadata; converting is a separate step | 0.6.0 (September 2026) |

### Libation

[Libation](https://github.com/rmcrackan/Libation) is the free, open-source choice most people start with. It imports your whole Audible library, downloads each book and removes the DRM in one step it calls "liberating", without needing ffmpeg. It supports the US, UK, Canada, Germany, France, Australia, Japan, India and Spain stores. Its [naming templates](https://getlibation.com/docs/features/naming-templates) let you decide the folder and file names, which matters for the layout below.

One limit worth knowing: since version 13.1.3, Libation can't download Dolby Atmos or spatial audio versions. Its FAQ suggests the Widevine and xHE-AAC options for the best stereo quality instead.

### OpenAudible

[OpenAudible](https://openaudible.org) is a commercial app with a polished interface. Downloading is free to try; converting to MP3 or M4B and splitting books by chapter need its one-time licence (no subscription). It can also export your library list to a spreadsheet, CSV or JSON, and runs in Docker if you want it on a server.

### audible-cli

[audible-cli](https://github.com/mkb79/audible-cli) is a command-line tool for people who like scripts. `audible quickstart` sets up your account, `audible library list` shows your books and `audible download --all --aax` (or `--aaxc`) fetches them with their chapter and metadata files. Turning those into M4B is a separate step with other tools, so it suits people who already know their way around ffmpeg.

## Give the books a folder layout that scans cleanly

However you download them, put the converted files in a layout every audiobook server understands: **one folder per book**, inside a folder for its series, inside a folder for its author.

```text
Audiobooks/
├── Brandon Sanderson/
│   └── The Stormlight Archive/
│       ├── 01 - The Way of Kings/
│       │   └── The Way of Kings.m4b
│       └── 02 - Words of Radiance/
│           └── Words of Radiance.m4b
└── Andy Weir/
    └── Project Hail Mary/
        └── Project Hail Mary.m4b
```

- A book that isn't in a series goes straight under its author: `Author/Title/`.
- Number books in a series with whole numbers at the start of the folder name (`01 - Title`), so they sort in order.
- Keep each book in its own folder, even when it is a single M4B.

In Libation you can get close to this with a folder template along the lines of `<first author>/<if series-><first series>/<series#> - <-if series><title short> [<id>]` (Settings > Download/Decrypt; its naming templates page explains each tag). Libation recommends keeping `<id>`, the ASIN, in the path so it can recognise books it has already downloaded. That's fine: AudioSilo takes a book's title from the file's tags first by default, and the files these tools produce usually carry the title, author, narrator and cover inside them.

The full set of rules, including disc folders and collections of short stories, is in [How to organise audiobook folders](/blog/organize-audiobook-folders/).

## Listen to them with AudioSilo

AudioSilo is a self-hosted audiobook server with a web player and apps for iPhone, iPad and Android. It reads your folder as it is and never writes to it.

1. **Run the server.** With Docker, mount your audiobooks folder read-only:

   ```yaml
   services:
     audiosilo:
       image: ghcr.io/kodestar/audiosilo-server:latest
       restart: unless-stopped
       ports:
         - "8080:8080"
       volumes:
         - ./data:/data                  # database, config, certificates
         - /srv/audiobooks:/library:ro   # your books, mounted read-only
       environment:
         PUID: "1000"
         PGID: "1000"
         AUDIOSILO_WEB_DIR: /app/web
   ```

   Then `docker compose up -d` and `docker compose logs` for the admin password, which is printed once. The [Docker quick start](https://docs.audiosilo.app/users/getting-started/quickstart-docker) walks through it, and [Self-hosted audiobook server](/blog/self-hosted-audiobook-server/) explains the choices.

2. **Add the library.** In the admin console at `/admin`, click **Add your first library** and point it at `/library`. The first scan starts straight away, and books and their covers appear as it finds them.

3. **Match the books.** Open **Health > Not matched** and run **Match automatically**. It looks every book up in the free community database at [meta.audiosilo.app](https://meta.audiosilo.app), sorts the results into confident matches and ones to review, and changes nothing until you apply them. Matched books get descriptions, series order and, for books the community has written them for, spoiler-safe recaps and character lists. See [Fix covers and series](/blog/fix-covers-and-series/).

4. **Listen.** Open the web player at `/web`, or pair the iPhone, iPad or Android app with a QR code ([how to pair your phone](/blog/pair-your-phone/)).

## Keep a second copy

A backup that lives on one disk isn't really a backup. Copy the folder to a second drive or another machine now and then, and keep one copy somewhere other than your house if you can. AudioSilo doesn't change your files, so any ordinary file backup tool works on the library folder as it is.

## Common questions

### Can AudioSilo play AAX files directly?

No. AAX and AAXC need your Audible account's keys, so the server leaves them out of the library. Convert them to M4B first with one of the tools above.

### M4B or MP3?

M4B, unless a device you own can't play it. It keeps the book in one file with its chapters and cover, and converting to it from Audible doesn't need re-encoding. [M4B vs MP3](/blog/m4b-vs-mp3-audiobooks/) goes into the details.

### Do I need to redownload when a tool updates?

No. Once a book is an M4B on your disk, it stays playable. You only need the tool again for new purchases.
