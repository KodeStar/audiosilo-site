---
title: "Running AudioSilo on a NAS or behind a sign-in proxy"
description: "In AudioSilo 2.7, a folder the server can't use is named in the log with the fix, a new guide covers Synology, and the apps can send the headers a sign-in proxy checks."
kind: feature
published: 2026-11-14
verified: 2026-11-14
appliesTo: Server 2.7.0 and the iOS and Android apps 2.7.0 (not released yet)
tags: [docker, nas, synology, permissions, setup, remote-access, reverse-proxy]
covers:
  - server:install
  - server:backups
  - server:scanner
  - server:libraries
  - server:setup
  - app:connect
  - app:account
  - app:cast
  - docs:/users/getting-started/install-synology
  - docs:/users/getting-started/quickstart-docker
  - docs:/users/troubleshooting
  - docs:/users/admin/backups
  - docs:/users/getting-started/remote-access
  - docs:/users/listening/account
  - docs:/users/getting-started/first-run
related:
  - audiobooks-on-unraid
  - listen-away-from-home
  - audiosilo-with-caddy
draft: true
---

Two changes in AudioSilo 2.7 are for servers on a NAS or behind a sign-in proxy. On a NAS, a folder the server can't use is now named in the log, with the user the server runs as and how to fix it. Behind a sign-in proxy such as Cloudflare Access, Authentik or Authelia, the iOS and Android apps can now send the headers the proxy checks.

There is also a new guide, [Install on a Synology NAS](https://docs.audiosilo.app/users/getting-started/install-synology).

## On a NAS, the log names the folder and the fix

The server runs as the user and group in `PUID` and `PGID`. It needs read and write access to its data folder and read access to your books. At start, the container tries to make that user the owner of the data folder. A NAS share can refuse that.

The container's log then says what is wrong and what to set:

```text
audiosilo: WARNING: the server can't write to /data: it runs as user 1000:1000 and the folder belongs to 1026:100.
audiosilo:   Changing its owner to 1000:1000 failed (a NAS share with ACLs or a read-only mount refuses it).
audiosilo:   Fix: set PUID=1026 and PGID=100 (the folder's owner) on the container, or give user 1000:1000 read and write access to the folder on the host.
error: the data folder isn't usable: the server can't write to /data: permission denied. The server runs as user 1000:1000 and the folder belongs to 1026:100. Set PUID=1026 and PGID=100 (the folder's owner) on the container, or give user 1000:1000 read and write access to the folder.
```

The last line is the server stopping, so the container restarts and stops again. Do what the **Fix** line says. Either:

- Set `PUID` and `PGID` to the owner the log names (here `1026` and `100`), then recreate the container.
- Give the user the log names access to the folder on the host.

The same warning can name other folders. What happens then depends on the folder:

| Folder | What you see |
|---|---|
| The data folder | The server stops, as above. |
| A backups folder | The server starts, and its log warns `backups will fail`. Once a backup fails, the Backups notice in the console says why. |
| A books folder | The warning ends with `Until then, a library in that folder shows as offline.` The library shows **Folder unavailable** in the console. After the fix, press **Retry** on the library. |

Before 2.7.0, a backup into a folder the server couldn't write to was reported only as failed. A books folder the server could reach but not list was scanned as fine, with no books in it.

A share that doesn't answer is a different problem. The log then says `audiosilo: WARNING: /library didn't answer within 5 seconds: a network share that is slow, or whose server is gone.` Check that the share is mounted on the host.

## Install on a Synology NAS

The new Synology guide runs AudioSilo as a **Container Manager** project. It sets up the folder permissions first:

1. Create a data folder in the `docker` shared folder.
2. Set `PUID` and `PGID` to your own DSM user's IDs. The first user on DSM is usually `1026`, in group `100`.
3. In **Control Panel** > **Shared Folder**, give that user **Read/Write** on the `docker` share and **Read only** on your audiobooks. Tick the user itself, not only a group it belongs to.
4. Create the project, then find the first-run admin password in the container's **Log** tab.

The steps are written for Container Manager on DSM 7.2. They haven't been checked on a NAS yet, so a label can differ on yours.

Backups go to `backups` inside the data folder, so they need nothing more. To keep them on another disk, see [A backups folder on another disk](https://docs.audiosilo.app/users/admin/backups#a-backups-folder-on-another-disk).

## Behind a sign-in proxy, the apps send proxy headers

A sign-in proxy turns away requests without its sign-in. In a browser you sign in to the proxy, so the web player works as it is. The iOS and Android apps can't show that sign-in page. Instead, they now send the headers the proxy accepts, such as a Cloudflare Access service token.

To connect an app through a sign-in proxy:

1. On the app's connect screen, enter the server's `https://` address.
2. Tap **Proxy headers**. Enter each header's name, such as `CF-Access-Client-Id`, and its value. **Add a header** adds another row.
3. Tap **Continue** and sign in as usual.

The app is now signed in through the proxy, and sends the headers with its requests to that `https://` address.

The app stores the headers as securely as your sign-in. Proxy headers need an `https://` address, and the app never sends them over plain HTTP.

To change them later, open the **Proxy headers** card on the account page. It lists each header's name and the address it goes to, and never shows a saved value again. **Remove headers** stops the device sending them.

## Good to know

- **What can't send proxy headers:** Chromecast, the Apple Watch and Wear OS apps, and calendar apps. In a browser, covers, audio and requests to another server don't carry them either. Those rely on your sign-in to the proxy in that browser.
- **Some header names are the app's own**, such as `Authorization`, `Cookie` and `Host`, and the app refuses them. So a proxy that asks for basic auth can't sit in front of AudioSilo.
- **Create the data folder before the first start**, on any Docker host. Otherwise Docker creates it as root, and the container has to change its owner, which a NAS share can refuse.
- **Run the container with `user:` instead of `PUID` and `PGID`?** Then the **Fix** line says to run it as the folder's owner, for example `user: "1026:100"`.
- **Links in Set up your server now open their page.** **Open the import** and a bookmark to another console page open that page, instead of starting setup again.

## More

- [Install on a Synology NAS](https://docs.audiosilo.app/users/getting-started/install-synology)
- [Permission denied](https://docs.audiosilo.app/users/troubleshooting#permission-denied) in Troubleshooting
- [Behind a sign-in proxy](https://docs.audiosilo.app/users/getting-started/remote-access#behind-a-sign-in-proxy) in Reach your server from outside your home
- [Proxy headers](https://docs.audiosilo.app/users/listening/account#proxy-headers) on the account page
