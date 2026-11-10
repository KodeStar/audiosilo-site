---
title: "AudioSilo 2.6: less database work, native SQLite on Linux"
description: "Server 2.6 reuses prepared database queries, and its Docker image and Linux downloads use native SQLite. What changes for an admin, and how to choose the fallback."
kind: feature
published: 2026-11-07
updated: 2026-11-10
verified: 2026-11-07
appliesTo: Server 2.6.0
tags: [server, performance, docker, linux, upgrades]
covers:
  - server:database
  - server:sqlite
  - server:performance
  - docs:/users/getting-started/quickstart-docker
  - docs:/users/getting-started/install-binary
  - docs:/users/troubleshooting
related:
  - server-2-6
  - back-up-before-upgrading
  - faster-first-scans
  - self-hosted-audiobook-server
revisions:
  - date: 2026-11-10
    note: "Rewritten to be shorter and easier to read. No facts changed."
---

Server 2.6.0 does less repeated database work, and its Docker image and Linux downloads switch to native SQLite. There's no new service to install and no database to convert. Back up, then update as usual.

## Reuse work the database already did

Before SQLite runs a query, it parses it and plans how to answer it. AudioSilo now keeps those prepared queries on each connection and reuses them, with fresh values each time. Nothing old is cached as an answer.

This works with either database engine, including on macOS and Windows. You don't need to change your library or rematch books.

## Linux uses native SQLite

| Build | Engine |
|---|---|
| Docker image | Native SQLite |
| Linux binaries (**amd64 and arm64**) | Native SQLite |
| macOS and Windows binaries | Pure-Go (as before) |

Both engines use the same database file format. There's no separate SQLite container.

- **Docker:** keep your existing data mount.
- **Linux binary:** replace the server program and keep its data folder.

[Back up before upgrading](/blog/back-up-before-upgrading/) shows how to make a consistent copy first.

## Check Docker before updating

The new image needs **Docker 20.10.10 or newer**. Run `docker version` on the host to check.

An older Docker can block a system call the new binary needs, and the container stops at startup. Update Docker first if yours is older. The [Docker quick start](https://docs.audiosilo.app/users/getting-started/quickstart-docker) lists the requirement, and [Troubleshooting](https://docs.audiosilo.app/users/troubleshooting#the-container-stops-at-start-up-with-pthread_create-failed) describes the failure.

## The pure-Go fallback is still there

Linux builds keep the previous engine too. To choose it, add this to the server's Compose service and recreate the container:

```yaml
environment:
  AUDIOSILO_SQLITE: modernc
```

On a native Linux install, set `AUDIOSILO_SQLITE=modernc` in the server's environment and restart it.

The engine is chosen at startup. It uses the same database, with no export or import. The startup log names the engine in its **database: sqlite** line, which helps when reporting a problem. The developer docs describe [the engine setting](https://docs.audiosilo.app/developers/server/configuration#the-sqlite-engine-audiosilo_sqlite).

## More

- [Install the native binary](https://docs.audiosilo.app/users/getting-started/install-binary) covers updating without Docker.
- [Faster first scans](/blog/faster-first-scans/) covers the separate file-reading changes from 2.5.1.
- [AudioSilo 2.6](/blog/server-2-6/) covers the rest of the release.
