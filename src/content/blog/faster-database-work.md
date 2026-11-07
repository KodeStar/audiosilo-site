---
title: "AudioSilo 2.6: less database work, native SQLite on Linux"
description: "Server 2.6 reuses prepared database queries, and its Docker image and Linux downloads use native SQLite. What changes for an admin, and how to choose the fallback."
kind: feature
published: 2026-11-07
verified: 2026-11-07
appliesTo: Server 2.6.0 (release draft)
tags: [server, performance, docker, linux, upgrades]
covers:
  - server:database
  - server:sqlite
  - server:performance
  - docs:/users/getting-started/quickstart-docker
  - docs:/users/getting-started/install-binary
  - docs:/users/troubleshooting
related:
  - back-up-before-upgrading
  - faster-first-scans
  - self-hosted-audiobook-server
draft: true
---

Server 2.6.0 reduces repeated database work and changes the SQLite engine used by its standard Docker image and Linux downloads. For an admin, there isn't another service to install or a database to convert: the server still uses SQLite in its data folder. Update the server in the usual way, with a backup first.

This is a draft for the 2.6.0 release. It describes the merged implementation and build recipes, ahead of publication of the release artifacts.

## Reuse work the database already did

Before a database query runs, SQLite parses it and plans how to answer it. AudioSilo now keeps prepared statements on each database connection and reuses them for repeated queries, binding fresh values each time. That removes repeated preparation for queries the server keeps making, without caching an old answer.

This applies with either database engine, including the macOS and Windows builds. It doesn't depend on changing your library layout or rematching your books.

## Linux uses native SQLite

The standard Docker build and the Linux release binaries for **amd64 and arm64** now include the native SQLite engine. The macOS and Windows release binaries continue using the pure-Go engine. Both use the same database file format.

There's no separate SQLite container to run. If you use Docker, keep your existing persistent data mount. If you use a Linux binary, replace the server program as usual and keep its data folder. [Back up before upgrading](/blog/back-up-before-upgrading/) explains how to make a consistent copy before changing versions.

## Check Docker before updating

The new Docker image needs **Docker 20.10.10 or newer**. Run `docker version` on the host to check. An older Docker installation can block a system call the new binary needs and stop the container at startup.

The [Docker quick start](https://docs.audiosilo.app/users/getting-started/quickstart-docker) lists the requirement, and [Troubleshooting](https://docs.audiosilo.app/users/troubleshooting#the-container-stops-at-start-up-with-pthread_create-failed) describes that startup failure. Update Docker before starting the new image if your host is older.

## The pure-Go fallback is still there

Linux builds also retain the previous engine. To choose it, add this environment variable to the server's Compose service and recreate the container:

```yaml
environment:
  AUDIOSILO_SQLITE: modernc
```

For a native Linux installation, set `AUDIOSILO_SQLITE=modernc` in the environment used to start the server and restart it. The choice happens when the process starts. The same database is used, with no export or import between engines.

The startup log names the selected engine in its **database: sqlite** line. That is also useful when reporting a database problem.

## More

See [Install the native binary](https://docs.audiosilo.app/users/getting-started/install-binary) for updating without Docker. [Faster first scans](/blog/faster-first-scans/) describes the separate file-probing changes from 2.5.1; this release's database changes work alongside those.
