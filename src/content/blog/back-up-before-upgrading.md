---
title: "How to back up a self-hosted app before you upgrade it"
description: An upgrade can change a database in a way the old version can't read. What to copy before you pull a new Docker image, how to copy a SQLite database safely, and how to roll back.
kind: guide
published: 2026-10-27
verified: 2026-10-27
appliesTo: Server 2.5.0
tags: [backups, docker, upgrades, self-hosting]
covers:
  - server:backups
  - server:migrations
  - server:update-check
  - docs:/users/admin/backups
  - docs:/users/getting-started/quickstart-docker
related:
  - self-hosted-audiobook-server
  - audiobooks-on-unraid
  - first-run-setup
draft: true
---

Back up before you upgrade, because an upgrade is often a one-way door. A new version of a self-hosted app may **migrate its database** as it starts: add tables, change columns, rewrite data. Once it has, the old version may not be able to read that database any more, so if the new version misbehaves, going back means putting back a copy of the data from before the upgrade. The routine takes a minute: **note the version you're on, stop the app, copy its data folder, then upgrade**. If something goes wrong, stop it, put the copy back and run the old version.

## What to copy

A container is disposable: pulling a new image throws the old one away, and that's fine. What matters is the **data you mounted into it**, the volume or folder in your compose file's `volumes:` section, usually holding the database and the app's settings file. Copy that. Your media (music, films, audiobooks) usually lives in a separate mount that the app only reads, and isn't affected by an upgrade; it needs a backup of its own, but not before every update.

## Note the version you're on

Rolling back needs the old version's image, so know which one you had. If your compose file says `:latest`, find the version in the app's own about page, or ask Docker:

```bash
docker image inspect --format '{{index .RepoDigests 0}}' ghcr.io/kodestar/audiosilo-server:latest
```

The digest it prints (`...@sha256:...`) names that exact image, and you can put it in `image:` to get it back. Many projects also publish a tag per release (`:2.4.1`), which is easier to read. Pinning the version in your compose file makes every upgrade a deliberate edit, which is also the moment to read the release notes for anything that needs doing by hand.

## Copy the data, the safe way

The simplest safe copy is with the app stopped:

```bash
docker compose stop
cp -a ./data ./data-before-upgrade
docker compose pull
docker compose up -d
```

`cp -a` keeps owners, permissions and times, which matters when a container runs as a particular user. Stopping first matters most for **SQLite**, the database inside a great many self-hosted apps. A SQLite database that's in use can be spread over three files (`app.db`, `app.db-wal` and `app.db-shm`), and copying them one at a time while the app writes can give you a copy that doesn't open. If you can't stop the app, SQLite's own backup command makes a consistent copy of a live database:

```bash
sqlite3 ./data/app.db ".backup './app-before-upgrade.db'"
```

Copy the settings file next to it, since that isn't in the database.

## Rolling back

1. Stop the new version: `docker compose down`.
2. Put the data back: move the upgraded folder aside and copy your backup into its place.
3. Set `image:` to the version you noted, then `docker compose up -d`.

Unless the project's docs say otherwise, don't leave the old version running on the upgraded data to see if it copes: if the new version migrated the database, the old one may refuse to start, or worse, start and lose what the new version added.

## Keep a copy somewhere else

A copy on the same disk as the app is lost with that disk. The before-upgrade copy is for undoing a bad update; for everything else, keep a regular backup on another drive or machine too, and now and then check that a backup actually restores.

## How AudioSilo does it for you

AudioSilo keeps its accounts, everyone's listening progress, bookmarks, shares and metadata edits in one SQLite database in its data folder. Your audiobooks stay as files in your own folders, which the server never changes, so they aren't part of it.

- **Scheduled backups.** The admin console's **Server > Settings > Backups** backs up the database every day at 03:00 out of the box and keeps the newest 7, with **Back up now**, **Download** and **Restore...** for each backup. A restore happens at the next start, and the server keeps a copy of the database it replaced.
- **A copy before every upgrade.** From **server 2.5.0**, a new version that needs to change the database copies it into the backups folder first, before it changes anything, and says so in one line in its log. The copy is listed as **Before an upgrade**, and the newest three are kept apart from the scheduled ones. A fresh install, or an update with no database changes, makes no copy. To go back, run the version you had (it starts, with a warning in its log that a newer version used the database) and restore the newest **Before an upgrade** backup from the console, which an older server lists as **Manual**.

The database backup doesn't include the settings file, `config.yaml`, so keep a copy of that with your backups. If the disk is nearly full, the before-upgrade copy can't be made (the server warns in its log and starts anyway), so with little room left, back up yourself first. The docs cover it all in [Backups and restoring](https://docs.audiosilo.app/users/admin/backups#before-an-upgrade), and the Docker update steps are in the [Docker quick start](https://docs.audiosilo.app/users/getting-started/quickstart-docker).
