---
title: How to back up your Audible library to M4B and listen on your own server
description: Download the Audible books you bought as plain M4B files with Libation, OpenAudible or audible-cli, keep them in a folder that scans cleanly, and play them anywhere.
kind: guide
published: 2026-10-17
updated: 2026-11-10
verified: 2026-10-24
appliesTo: Server 2.4.0, app 2.0.0; Libation 14.2.2, OpenAudible 5.0.3, audible-cli 0.6.0; Bridge 0.6.0 with server 2.6.0
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
  - audible-backup
  - organize-audiobook-folders
  - m4b-vs-mp3-audiobooks
  - self-hosted-audiobook-server
hero: ../../assets/stills/player-ipad-series-dark.webp
heroAlt: The Stormlight Archive on an iPad, the books you own as spines in reading order, the ones you are missing as dashed ghost spines
revisions:
  - date: 2026-11-10
    note: "Rewritten to be shorter and easier to read. No facts changed."
  - date: 2026-11-07
    note: "Server 2.6.0: the AudioSilo Bridge can back up your Audible books into your library; added to the tools table."
  - date: 2026-10-24
    note: "Server 2.4.0: a new server's first console sign-in opens Set up your server, which adds the library."
---

Use a tool that signs in to **your own Audible account**, downloads the books you bought and saves them as plain **M4B** (or MP3) files. The standalone choices are **Libation** (free), **OpenAudible** (paid, free to try) and **audible-cli** (free, command line). From server 2.6.0, an AudioSilo server's [Bridge](/blog/audible-backup/) can also back them up straight into your library.

Once the files are on your own disk, any audiobook player can play them, and a self-hosted server streams them to your phone with your place in sync.

## Why back up Audible books

Audible's files are locked to your account, so they only play in Audible's apps. A plain M4B copy on your own disk:

- plays in any player that understands M4B, with its chapters and cover;
- sits in the same library as your other audiobooks (CD rips, DRM-free purchases, LibriVox);
- doesn't depend on one app, account or company staying as it is.

## AAX and AAXC

Audible's downloads come in two DRM-protected formats:

- **AAX**, the older one, is tied to your account by a short key (often called "activation bytes").
- **AAXC**, the newer one, has its own key for each book.

Inside both is ordinary AAC audio with chapters, which is what an M4B file is. So converting is quick and lossless when the tool only unlocks the audio without re-encoding it.

A self-hosted server can't stream AAX or AAXC, as they need your account's keys. AudioSilo deliberately doesn't index them, so a stray `.aax` stays out of the way until you convert it.

## A note on the law

These tools are for **personal backup copies of books you bought**, with your own account. Laws on removing DRM, even from your own purchases, differ by country, and in some places it is not allowed at all. Check what applies where you live. Keep the copies for yourself. This is not legal advice.

## The tools maintained in 2026

All are in active use; Libation and audible-cli both released new versions in September 2026. Audible changes its sign-in from time to time, so update your tool before a big download and check its issue tracker if signing in fails.

| Tool | Cost and licence | How you use it | Systems | Output | Latest release checked |
|---|---|---|---|---|---|
| [Libation](#libation) | Free, open source (GPL-3.0) | Desktop app, plus a command line | Windows, macOS, Linux | M4B by default, MP3 as an option | 14.2.2 (September 2026) |
| [OpenAudible](#openaudible) | Paid one-time licence, free to try | Desktop app, also a Docker image | Windows, macOS, Linux, Docker | M4B or MP3 | 5.0.3 |
| [audible-cli](#audible-cli) | Free, open source (AGPL-3.0) | Command line (Python, or a prebuilt binary) | Windows, macOS, Linux | AAX or AAXC with chapters and metadata; converting is a separate step | 0.6.0 (September 2026) |
| [AudioSilo Bridge](/blog/audible-backup/) | Free, open source (AGPL-3.0) | A container beside your AudioSilo server; you choose the books in the admin console | Docker | M4B, a lossless copy with chapters, placed in your library and scanned | Bridge 0.6.0 with server 2.6.0 |

### Libation

[Libation](https://github.com/rmcrackan/Libation) is where most people start. It imports your Audible library, then downloads each book and removes the DRM in one step ("liberating"), without needing ffmpeg. It supports the US, UK, Canada, Germany, France, Australia, Japan, India and Spain stores. Its [naming templates](https://getlibation.com/docs/features/naming-templates) set the folder and file names.

Since version 13.1.3, Libation can't download Dolby Atmos or spatial audio versions. Its FAQ suggests the Widevine and xHE-AAC options for the best stereo quality instead.

### OpenAudible

[OpenAudible](https://openaudible.org) is a commercial app with a polished interface. Downloading is free to try; converting to MP3 or M4B and splitting by chapter need its one-time licence (no subscription). It can export your library list to a spreadsheet, CSV or JSON, and runs in Docker.

### audible-cli

[audible-cli](https://github.com/mkb79/audible-cli) is for people who like scripts. `audible quickstart` sets up your account, `audible library list` shows your books and `audible download --all --aax` (or `--aaxc`) fetches them with their chapter and metadata files. Converting to M4B is a separate step with other tools, so it suits people who know ffmpeg.

## A folder layout that scans cleanly

Put the converted files in **one folder per book**, inside a folder for its series, inside a folder for its author.

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

- A book not in a series goes straight under its author: `Author/Title/`.
- Number series books at the start of the folder name (`01 - Title`) so they sort in order.
- Keep each book in its own folder, even a single M4B.

In Libation, a folder template like `<first author>/<if series-><first series>/<series#> - <-if series><title short> [<id>]` gets close (Settings > Download/Decrypt). Libation recommends keeping `<id>`, the ASIN, so it can recognise books it already downloaded. That's fine, because AudioSilo takes the title from the file's tags first by default.

More rules, including disc folders and short-story collections, are in [How to organise audiobook folders](/blog/organize-audiobook-folders/).

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

   Then run `docker compose up -d`, and `docker compose logs` for the admin password, which is printed once. See the [Docker quick start](https://docs.audiosilo.app/users/getting-started/quickstart-docker) and [Self-hosted audiobook server](/blog/self-hosted-audiobook-server/).

2. **Add the library.** Your first sign-in to the admin console at `/admin` opens **Set up your server**. Type `/library` and press **Check folder**. The first scan starts when you finish the setup's third step, **Community metadata**. (Skipped it? Use **Add your first library** on the Overview.)

3. **Match the books.** Open **Health > Not matched** and run **Match automatically**. It looks every book up in the free community database on [AudioSilo Meta](https://meta.audiosilo.app) and changes nothing until you apply. Matched books get descriptions, series order and, where the community wrote them, spoiler-safe recaps and character lists. See [Fix covers and series](/blog/fix-covers-and-series/).

4. **Listen.** Open the web player at `/web`, or pair the app with a QR code ([how to pair your phone](/blog/pair-your-phone/)).

## Keep a second copy

A copy on one disk is lost with that disk. Copy the folder to a second drive now and then, and keep one copy away from home if you can. AudioSilo doesn't change your files, so any ordinary backup tool works.

## Common questions

### Can AudioSilo play AAX files directly?

No. AAX and AAXC need your Audible account's keys. Convert them to M4B first.

### M4B or MP3?

M4B, unless a device you own can't play it. It keeps the book in one file with chapters and cover, and converting from Audible needs no re-encoding. See [M4B vs MP3](/blog/m4b-vs-mp3-audiobooks/).

### Do I need to redownload when a tool updates?

No. A converted M4B stays playable. You only need the tool again for new purchases.
