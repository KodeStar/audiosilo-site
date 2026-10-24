---
title: "Set up your server: a guided first run in the admin console"
description: A new AudioSilo server now walks you through eight skippable steps on your first console sign-in, from the books folder and how books are named to pairing your phone.
kind: feature
published: 2026-10-21
verified: 2026-10-23
# Held for server v2.4.0, the release that completes Bridge Phase 2: /release-cut flips draft.
appliesTo: Server 2.4.0
tags: [admin, getting-started, setup, self-hosting]
covers:
  - server:setup
  - server:admin_ui
  - server:libraries
  - server:metadata
  - server:metadata-mirror
  - server:addresses
  - server:tls
  - server:import
  - server:abs-metadata-json
  - server:backups
  - server:invites
  - server:bridge
  - docs:/users/getting-started/first-run
related:
  - self-hosted-audiobook-server
  - admin-console-tour
  - moving-from-audiobookshelf
  - pair-your-phone
draft: true
---

The first time you sign in to the admin console on a new AudioSilo server, it now opens **Set up your server**: eight short steps that take you from an empty server to a named, matched library and a phone that's signed in. Every step can be skipped, and everything you choose is an ordinary setting you can change later in **Settings** or **Libraries**. A server that was already in use before this release (it has a library, or more than one account) never sees the flow.

## How the flow works

It's a page of its own, with the steps listed down the side. Each step has **Skip**, and every step after the first has **Back**. The list marks each step done or skipped, and any step is a click away. **Finish later** takes you to the console; the flow opens again in your next browser session until you finish it, and picks up at the first step you haven't answered.

A setting fixed by an `AUDIOSILO_*` environment variable is shown locked, since it can only be changed where you set it, and settings that only apply after a restart say so.

## The eight steps

1. **Where are your books?** Type the folder and press **Check folder**. The server checks it's there and readable and shows what it found: audio files, book folders and single-file books. In Docker that's the path *inside* the container, like `/audiobooks`; typing the host path is the usual first-run mistake, and this check catches it before you meet an empty library. On Linux, folders mounted into the server are offered as buttons. Libraries from your `config.yaml` show as already added.
2. **How are your books named?** Book details can come from the files' **tags** or from the **folder names**. The step reads up to eight books from across your folder and shows each one both ways, side by side, with disagreements highlighted. The side with fewer blanks is marked **Suggested**. This one decides every book's names, and changing it later re-reads the whole library, so it's worth a look on day one.
3. **Community metadata.** Turn the lookups on or off (they're the server's main traffic to the internet), pick your **Audible marketplace** so books match the right edition, and choose whether to ask the service for each book or **keep a local copy** (about 1.8 GB on disk). Then the library is created and its first scan starts, using the naming and region you just chose. Its progress shows above the steps that follow.
4. **How will people reach the server?** Invite links and pairing QR codes are built from the server's addresses, so a wrong one is the usual reason a phone can't connect. The step offers the address your browser is using as the **home** or **public** address, flags a reverse proxy the server doesn't trust yet, and shows the HTTPS mode and what it means for phones.
5. **Coming from Audiobookshelf?** A link to the import that brings everyone's listening progress across. Audiobookshelf's `metadata.json` files in your book folders are read as they are.
6. **Backups and updates.** The database backup schedule (every day at 03:00 by default, the newest 7 kept) and whether the server checks GitHub once a day for a new version.
7. **Connect a phone.** A pairing QR code that signs your phone in as you, plus **Open the web player**. It also says whether ffmpeg is ready, and reminds you that everyone can add their household members from **Me > Household** in the player.
8. **Add a Bridge.** Optional. The lines to add to your compose file and the pairing code for a **Bridge** (version 0.3.0 or later), the companion container that writes to your library folders and runs the heavy jobs, so the server itself stays read-only. Once one is paired, the step shows its setup checklist.

## Finish setting up, later

Skipped a step? The Overview shows a **Finish setting up** card listing what's left. Each item opens that step again, and **Dismiss** hides the card for every admin of the server.

## Choosing your own password

Starting the server with `--setup` still lets you choose the admin password in the browser instead of reading a generated one from the log. That page now asks only for the account, then hands you to the console, where the flow takes over.

## More

The [First run page in the docs](https://docs.audiosilo.app/users/getting-started/first-run) has every step with screenshots. New to running your own server? Start with [Self-hosted audiobook server](/blog/self-hosted-audiobook-server/), and see [How to pair your phone](/blog/pair-your-phone/) for the address the phone apps need.
