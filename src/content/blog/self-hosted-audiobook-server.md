---
title: "Self-hosted audiobook server: what it is and how to run one with Docker"
description: A self-hosted audiobook server streams the audiobooks you own to every device and keeps your place in sync. What you need, the options, and a Docker setup in a few steps.
kind: guide
published: 2026-10-13
updated: 2026-11-10
verified: 2026-10-28
appliesTo: Server 2.5.0 and 2.6.0, app 2.0.0 and later
tags: [self-hosting, docker, getting-started]
covers:
  - bridge:audible
  - server:install
  - server:web_player
  - server:tls
  - app:connect
  - docs:/users/getting-started/quickstart-docker
  - docs:/users/getting-started/install-binary
  - docs:/users/getting-started/first-run
  - docs:/users/getting-started/remote-access
related:
  - organize-audiobook-folders
  - listen-away-from-home
  - pair-your-phone
  - audiobooks-on-unraid
hero: ../../assets/stills/server-overview-dark.webp
heroAlt: The AudioSilo admin console overview, with three people listening now, their book and chapter, totals and recent listening
revisions:
  - date: 2026-11-10
    note: "Rewritten to be shorter and easier to read. No facts changed."
  - date: 2026-11-07
    note: "Server 2.6.0: Docker needs 20.10.10 or newer for the image."
  - date: 2026-10-28
    note: "Server 2.5.0: MP3-in-MKA plays in the apps too, and an EPUB beside a book opens in the reader."
  - date: 2026-10-24
    note: "Server 2.4.0: the Set up your server flow adds the library, MKA is indexed, and AudioSilo now has podcasts with a Bridge."
---

A **self-hosted audiobook server** is a program you run on your own computer, NAS or home server that turns a folder of audiobook files into your own private audiobook service. It streams to a browser and phone apps, keeps your place in sync across devices, and gives everyone in the house their own account.

Your files stay where they are, and nobody else holds your library. This guide sets one up with Docker, using AudioSilo.

## Why run your own

If your audiobooks are files (CD rips, DRM-free purchases, public-domain recordings, backups), a server built for audiobooks adds:

- **One place in every book, on every device.** Pause on your phone, carry on at your desk.
- **Streaming from anywhere**, plus downloads for offline listening.
- **Separate accounts**, each with their own progress, bookmarks and stats.
- **A player made for books**: sleep timer, speed control, chapters and bookmarks.

If you stop using the server, your library is still just a folder.

## What you need

- **A machine that stays on.** A NAS, a mini PC, an old laptop or a Raspberry Pi with a 64-bit OS all work. AudioSilo is a single Go program with a built-in database, so it doesn't need much.
- **Your audiobooks as files**, in a folder that machine can read. M4B, M4A, MP4, MP3, FLAC, OGG, Opus and MKA are indexed. A tidy layout helps: see [How to organise audiobook folders](/blog/organize-audiobook-folders/).
- **Docker**, ideally (20.10.10 or newer from server 2.6; `docker version` shows yours). A plain binary works too (below).

## The main options

| Option | What it's like |
|---|---|
| **Audiobookshelf** | The best-known open-source audiobook server. Also handles ebooks, can upload books and write metadata into files; its mobile apps are in beta. [Moving from Audiobookshelf](/blog/moving-from-audiobookshelf/) compares the two. |
| **Plex, Jellyfin** | Built around music and video, so per-book progress and chapters depend on workarounds or third-party apps. |
| **AudioSilo** | Built for audiobooks, with podcasts when you add its optional companion container, the Bridge. Open source (AGPLv3), never writes to your files, with a built-in web player and free apps for iPhone, iPad and Android. |

## Install AudioSilo with Docker

The image `ghcr.io/kodestar/audiosilo-server` holds the server, the web player and ffmpeg, so one container is a complete setup. It runs on amd64 and arm64.

### 1. Create a compose file

Make a folder (say `~/audiosilo`) and save this as `docker-compose.yml` in it, changing `/srv/audiobooks` to wherever your books are:

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
      PUID: "1000"                    # owner of /data (Unraid: 99)
      PGID: "1000"                    # group of /data (Unraid: 100)
      # AUDIOSILO_PUBLIC_URL: "https://books.example.com"  # used in QR/invite links
      # AUDIOSILO_TLS_MODE: "off"     # only behind a TLS-terminating reverse proxy
      AUDIOSILO_WEB_DIR: /app/web
```

`/data` holds everything the server creates: keep it and back it up. `/library` is your books, mounted **read-only**, since the server never writes to them.

### 2. Start it and save the credentials

```bash
docker compose up -d
docker compose logs
```

On the first start the server prints an admin password **once**:

```text
========================================================
 AudioSilo first-run setup - store these now, shown once
========================================================
  Admin username : admin
  Admin password : <generated password>
  Auth code      : <generated code>
  Config file    : /data/config.yaml
```

Save the password and the auth code now. The server only keeps hashes, so it can't show them again. There is never a default password.

### 3. Open it

Browse to `https://your-server:8080`. The certificate is self-signed out of the box, so your browser warns you the first time; accept it.

| Address | What it is |
|---|---|
| `/` | The connect page, where a listener pairs a device |
| `/admin` | The admin console. Sign in as `admin` with the printed password |
| `/web` | The web player |

### 4. Add your library

Your first sign-in to the admin console opens **Set up your server**: eight short, skippable steps.

1. For your books folder, type `/library` (the path inside the container).
2. Press **Check folder**.
3. Carry on through the steps. The library is added at the end of step 3.

Books are browsable straight away while the scan fills in the details. More in [Set up your server](/blog/first-run-setup/).

## Without Docker: the single binary

[GitHub Releases](https://github.com/KodeStar/audiosilo-server/releases) has builds for Linux (also as `.deb` and `.rpm` with a systemd unit), macOS and Windows, for amd64 and arm64:

```bash
./audiosilo --data ./data
```

It finds ffmpeg on your system or downloads it on first use. `./audiosilo --setup --data ./data` lets you choose the admin password in your browser instead. See [Install the binary](https://docs.audiosilo.app/users/getting-started/install-binary).

## Start listening

- **In a browser**: open `/web` on your server. It can be added to a phone's home screen.
- **On iPhone, iPad and Android**: install AudioSilo from the [App Store](https://apps.apple.com/us/app/audiosilo/id6783431375) or [Google Play](https://play.google.com/store/apps/details?id=app.audiosilo) and pair it with a QR code.
- **Everyone else in the house**: in the admin console, **Invite someone** creates their account and shows a QR code and link. No password needed.

## Keeping it updated

```bash
docker compose pull && docker compose up -d
```

Updates leave your data folder and books alone. Back up the `data` folder before a big upgrade; the server also snapshots its own database every night by default.

## Good to know

- **Apps and self-signed certificates:** the apps can't accept one the way a browser can. From app 2.1 on iPhone and iPad (app 2.4.0 on Android) they connect over plain HTTP on your home network instead. Away from home (or with an older app) they need an address with a trusted certificate: see [How to pair your phone](/blog/pair-your-phone/) and [Listen away from home](/blog/listen-away-from-home/).
- **MKA files:** with ffmpeg, an MP3 inside one plays everywhere; another codec inside plays in the web player only.
- **Ebooks:** from server 2.5, a DRM-free EPUB beside a book's audio opens in the player's reader. See [Read the ebook](/blog/ebook-reader/).

## Next steps

- [Listen away from home](/blog/listen-away-from-home/): HTTPS, a reverse proxy and the apps' home and away addresses.
- [Fix covers and series](/blog/fix-covers-and-series/): match your books to the community database.
- [A tour of the admin console](/blog/admin-console-tour/), in four and a half minutes.
- Or try the player first in the [live demo](https://demo.audiosilo.app/web/demo), with public-domain books and nothing to install.
