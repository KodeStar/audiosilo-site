---
title: "How to back up a self-hosted app before you upgrade it"
description: An upgrade can change a database in a way the old version can't read. What to copy before you pull a new Docker image, how to copy a SQLite database safely, and how to roll back.
kind: guide
published: 2026-10-28
updated: 2026-11-10
verified: 2026-10-28
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
  - server-2-5
draft: false
revisions:
  - date: 2026-11-10
    note: "Rewritten to be shorter and easier to read. No facts changed."
---

**Note the version you're on, stop the app, copy its data folder, then upgrade.** It takes a minute. If something goes wrong, stop the app, put the copy back and run the old version.

Why bother: a new version may **migrate its database** as it starts, adding tables, changing columns or rewriting data. After that, the old version may not read it any more. Going back means restoring a copy from before the upgrade.

## What to copy

A container is disposable: pulling a new image throws the old one away. What matters is the **data you mounted into it**, the volume or folder in your compose file's `volumes:` section. That usually holds the database and the settings file. Copy that.

Your media (music, films, audiobooks) usually sits in a separate mount the app only reads. An upgrade doesn't touch it. It needs its own backup, but not before every update.

## Note the version you're on

Rolling back needs the old image. If your compose file says `:latest`, check the app's about page, or ask Docker:

```bash
docker image inspect --format '{{index .RepoDigests 0}}' ghcr.io/kodestar/audiosilo-server:latest
```

The digest it prints (`...@sha256:...`) names that exact image. Put it in `image:` to get it back. Many projects also publish a tag per release (`:2.4.1`), which is easier to read.

Pinning the version in your compose file makes every upgrade a deliberate edit. That's also the moment to read the release notes.

## Copy the data, the safe way

The simplest safe copy is with the app stopped:

```bash
docker compose stop
cp -a ./data ./data-before-upgrade
docker compose pull
docker compose up -d
```

`cp -a` keeps owners, permissions and times, which matters when a container runs as a particular user.

Stopping first matters most for **SQLite**, the database in a great many self-hosted apps. A database in use can be spread over three files (`app.db`, `app.db-wal` and `app.db-shm`). Copying them one at a time while the app writes can give you a copy that doesn't open.

If you can't stop the app, SQLite's own backup command makes a consistent copy of a live database:

```bash
sqlite3 ./data/app.db ".backup './app-before-upgrade.db'"
```

Copy the settings file next to it, since it isn't in the database.

## Rolling back

1. Stop the new version: `docker compose down`.
2. Move the upgraded folder aside and copy your backup into its place.
3. Set `image:` to the version you noted, then `docker compose up -d`.

Unless the project's docs say otherwise, don't run the old version on the upgraded data to see if it copes. It may refuse to start, or worse, start and lose what the new version added.

## Keep a copy somewhere else

A copy on the same disk is lost with that disk. The before-upgrade copy is for undoing a bad update. Also keep a regular backup on another drive or machine, and now and then check it restores.

## How AudioSilo does it for you

AudioSilo keeps accounts, listening progress, bookmarks, shares and metadata edits in one SQLite database in its data folder. Your audiobooks stay as files in your own folders, which the server never changes, so they aren't part of it.

- **Scheduled backups.** **Server > Settings > Backups** in the admin console backs up the database every day at 03:00 and keeps the newest 7. It has **Back up now**, plus **Download** and **Restore...** for each backup. A restore happens at the next start, and the server keeps a copy of the database it replaced.
- **A copy before every upgrade.** From **server 2.5.0**, a new version that needs to change the database copies it into the backups folder first, and says so in one line in its log. The copy is listed as **Before an upgrade**, and the newest three are kept apart from the scheduled ones. A fresh install, or an update with no database changes, makes no copy.

To go back, run the version you had. It starts, with a log warning that a newer version used the database. Then restore the newest **Before an upgrade** backup from the console; an older server lists it as **Manual**.

## Good to know

- The database backup doesn't include the settings file, `config.yaml`. Keep a copy of that with your backups.
- If the disk is nearly full, the before-upgrade copy can't be made. The server warns in its log and starts anyway, so with little room left, back up yourself first.

The docs cover it all in [Backups and restoring](https://docs.audiosilo.app/users/admin/backups#before-an-upgrade), and the Docker update steps are in the [Docker quick start](https://docs.audiosilo.app/users/getting-started/quickstart-docker).
