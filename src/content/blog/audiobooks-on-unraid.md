---
title: "Audiobooks on Unraid: an audiobook server from Community Applications"
description: Install AudioSilo on Unraid from the Apps tab (the LinuxServer.io image), map your audiobooks share read-only, find the first-run password, and set up HTTPS and updates.
kind: guide
published: 2026-10-10
updated: 2026-11-10
verified: 2026-10-28
appliesTo: Server 2.3.1 (lscr.io/linuxserver/audiosilo), and 2.4.0 once the image is rebuilt for it
tags: [unraid, docker, self-hosting, getting-started]
covers:
  - server:install
  - server:tls
  - docs:/users/getting-started/install-unraid
  - docs:/users/getting-started/remote-access
related:
  - back-up-before-upgrading
  - self-hosted-audiobook-server
  - listen-away-from-home
  - organize-audiobook-folders
  - pair-your-phone
hero: ../../assets/stills/server-people-dark.webp
heroAlt: The People page in the AudioSilo admin console, every household account with what they are listening to and how many devices they use
revisions:
  - date: 2026-11-10
    note: "Rewritten to be shorter and easier to read. No facts changed."
  - date: 2026-10-28
    note: "Server 2.5.0 copies its database before an update that changes it; links the backup-before-upgrading guide."
  - date: 2026-10-24
    note: "Server 2.4.0: the first console sign-in opens Set up your server, which adds the library. The LinuxServer.io image is rebuilt after each AudioSilo release."
---

AudioSilo is in Unraid's **Community Applications** (the Apps tab) as the [LinuxServer.io](https://www.linuxserver.io) image, `lscr.io/linuxserver/audiosilo`. It bundles the AudioSilo server, its web player and ffmpeg, and is rebuilt automatically after each AudioSilo release. Installing it takes a template and a couple of paths.

## Before you start: a share for your books

If your audiobooks aren't on the array yet, create a share for them (for example `audiobooks`, at `/mnt/user/audiobooks`) and copy them in. Give each book its own folder, inside `Author/Series/` or `Author/`; [How to organise audiobook folders](/blog/organize-audiobook-folders/) explains why.

AudioSilo never writes to your books, so the template mounts the share read-only.

## 1. Install from the Apps tab

1. Open **Apps** and search for **AudioSilo**.
2. Pick the one from **linuxserver's Repository** and click **Install**.
3. Fill in the template:
   - **Audiobooks** (`/audiobooks` in the container): your share, for example `/mnt/user/audiobooks`.
   - **WebUI**: the port, `8080` unless something else uses it.
4. Under **Show more settings**:
   - **Appdata** (`/config`): where the server keeps its database, `config.yaml` and certificates. Prefer a cache or pool path such as `/mnt/cache/appdata/audiosilo`, so the database isn't on the slower user-share layer.
   - **PUID / PGID**: leave Unraid's defaults, `99` and `100` (`nobody:users`).
5. Click **Apply**.

## 2. Find the admin password in the log

On its first start the server prints a random admin password **once** in the container log. In the **Docker** tab, click the AudioSilo icon and choose **Logs**:

```text
========================================================
 AudioSilo first-run setup - store these now, shown once
========================================================
  Admin username : admin
  Admin password : <generated password>
  Auth code      : <generated code>
  Config file    : /config/config.yaml
```

Copy the password and the auth code somewhere safe now: the server keeps only hashes and can't show them again. Missed them before setting anything up? Stop the container, empty its appdata folder and start it again for a fresh banner.

## 3. Open it and add the library

Click the AudioSilo icon and choose **WebUI**. The server uses a self-signed certificate out of the box, so accept the browser's warning the first time.

| Address | What it is |
|---|---|
| `/admin` | The admin console: sign in as `admin` with the password from the log |
| `/web` | The web player |
| `/` | The connect page, where people pair their devices |

From server 2.4.0, your first console sign-in opens **Set up your server**:

1. For the books folder, type **`/audiobooks`** (the path inside the container, not the `/mnt/user/...` path) and press **Check folder**.
2. Skip or fill in the other steps; they are optional. The library is added and scanned at the end of step 3.

Books show up at once; durations, chapters and covers fill in as the scan runs. Skipped the folder, or on an image older than 2.4.0? Click **Add your first library** on the Overview and enter `/audiobooks` there.

## 4. Reaching it from outside your network

At home, a browser is fine with the self-signed certificate, and the phone apps connect over plain HTTP (from app 2.1 on iPhone and iPad, app 2.4.0 on Android); see [How to pair your phone](/blog/pair-your-phone/). Away from home, and for older apps at all, the server needs a certificate the devices trust.

On Unraid that usually means a reverse proxy such as **SWAG** or **Nginx Proxy Manager**. In the admin console under **Server > Settings**:

- **Point the proxy** at `https://<unraid-ip>:8080` as it is. Or set **HTTPS mode** to **Off**, restart the container and point the proxy at `http://<unraid-ip>:8080`.
- Set **Public address** to the address people use, for example `https://books.example.com`, so invite links and QR codes point there.
- Add the proxy's address to **Trusted proxies**, so rate limiting and sign-in lockouts see each visitor's real address.

Only turn HTTPS off behind a proxy that serves HTTPS itself. [Listen away from home](/blog/listen-away-from-home/) covers the options, including Let's Encrypt without a proxy.

## 5. Updates

When a new image is out, the Docker tab shows **update ready**. Apply it there, or let the CA Auto Update plugin do it. The image also picks up base image and ffmpeg security updates. Updates don't touch your appdata or books.

Back up the appdata folder with the rest of your Unraid appdata. The server also snapshots its database every night by default, into the same folder. From server 2.5.0 it copies the database before an update that changes it, listed as **Before an upgrade** in the console's Backups. [How to back up a self-hosted app before you upgrade it](/blog/back-up-before-upgrading/) covers rolling back.

## Good to know

- **The WebUI link after turning HTTPS off** still opens `https://`. Edit the container, switch to **Advanced View** and set its **WebUI** field to `http://[IP]:[PORT:8080]`.
- **Settings as variables:** add `AUDIOSILO_*` variables on the template (**Add another Path, Port, Variable, Label or Device**), such as `AUDIOSILO_PUBLIC_URL`. A variable wins over the console, which then shows the setting as locked.

## Already running the AudioSilo image?

If you set up `ghcr.io/kodestar/audiosilo-server` by hand earlier, you can move to the Community Applications app without losing anything. Only the paths inside the container differ: `/config` instead of `/data`, `/audiobooks` instead of `/library`.

1. Note any `AUDIOSILO_*` variables the old container sets (skip `AUDIOSILO_WEB_DIR`; this image has the web player built in).
2. Stop and remove the old container. Its data folder stays.
3. In that folder's `config.yaml`, change any path that starts with `/data/` to `/config/`, including `tls.cache_dir`.
4. Install the app with **Appdata** pointing at that folder, and add the variables back.
5. Either map your books to `/library` in the template, or keep `/audiobooks` and change the library's folder in the admin console.

Users, progress and settings carry over. The [Unraid page in the docs](https://docs.audiosilo.app/users/getting-started/install-unraid) has the same steps in more detail.

## Next

- [Pair your phone](/blog/pair-your-phone/) with the AudioSilo app.
- [Fix covers and series](/blog/fix-covers-and-series/) by matching your books to the community database.
- Invite the household from **People > Invite someone**: one dialog makes the account and shows a QR code.
