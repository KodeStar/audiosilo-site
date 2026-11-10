---
title: "Set up your server: a guided first run in the admin console"
description: A new AudioSilo server now walks you through eight skippable steps on your first console sign-in, from the books folder and how books are named to pairing your phone.
kind: feature
published: 2026-10-24
updated: 2026-11-10
verified: 2026-10-28
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
  - server-2-5
  - self-hosted-audiobook-server
  - admin-console-tour
  - moving-from-audiobookshelf
  - pair-your-phone
  - server-2-4
revisions:
  - date: 2026-11-10
    note: "Rewritten to be shorter and easier to read. No facts changed."
  - date: 2026-10-28
    note: "Server 2.5.0: the library name follows the folder check, the phone step leads with the address when the QR can't work, and the player links an admin to setup."
---

The first time you sign in to the admin console on a new AudioSilo server, it opens **Set up your server**. Eight short steps take you from an empty server to a named, matched library and a signed-in phone. Every step can be skipped, and every choice is an ordinary setting you can change later.

A server already in use before this release (it has a library, or more than one account) never sees the flow.

## How the flow works

- The steps are listed down the side, each marked done or skipped. Any step is a click away.
- Each step has **Skip**; every step after the first has **Back**.
- **Finish later** takes you to the console. The flow opens again in your next browser session and picks up at the first unanswered step.
- A setting fixed by an `AUDIOSILO_*` environment variable is shown locked. Settings that apply only after a restart say so.

## The eight steps

1. **Where are your books?** Type the folder and press **Check folder**. The server checks it's readable and shows the audio files, book folders and single-file books it found. In Docker, use the path *inside* the container, like `/audiobooks`: typing the host path is the usual first-run mistake. On Linux, mounted folders are offered as buttons. From server 2.5.0, the library name is asked for once the folder is found, and defaults to the folder's name.
2. **How are your books named?** Details come from the files' **tags** or the **folder names**. The step shows up to eight books both ways, with disagreements highlighted, and marks the side with fewer blanks **Suggested**. Changing this later re-reads the whole library, so it's worth a look now.
3. **Community metadata.** Turn lookups on or off (they're the server's main internet traffic), pick your **Audible marketplace**, and choose to ask the service per book or **keep a local copy** (about 1.8 GB on disk). The library is then created and its first scan starts.
4. **How will people reach the server?** Invite links and pairing QR codes are built from the server's addresses. The step offers your browser's address as the **home** or **public** address, flags a reverse proxy the server doesn't trust yet, and explains the HTTPS mode for phones.
5. **Coming from Audiobookshelf?** A link to the import that brings everyone's listening progress across. Audiobookshelf `metadata.json` files are read as they are.
6. **Backups and updates.** The database backup schedule (daily at 03:00 by default, newest 7 kept), and whether the server checks GitHub daily for a new version.
7. **Connect a phone.** A pairing QR code that signs your phone in as you, plus **Open the web player**. It also says whether ffmpeg is ready.
8. **Add a Bridge.** Optional. The compose lines and pairing code for a **Bridge** (version 0.3.0 or later), the companion container that writes to your library folders and runs the heavy jobs, so the server stays read-only. Once paired, the step shows its setup checklist.

## Finish setting up, later

Skipped a step? The Overview shows a **Finish setting up** card listing what's left. Each item reopens its step, and **Dismiss** hides the card for every admin.

## Good to know

- **Step 7 on `localhost`:** from server 2.5.0, if you opened the console at an address a phone can't use and the server has no home or public address yet, the step leads with **Set the server's address** and dims the code until there is one.
- **Household members:** step 7 reminds you that everyone can add theirs from **Me > Household** in the player.
- **No library yet:** from server 2.5.0, an admin signing in to the web player (or app 2.5.0) on a server with no library sees **Add your first library**, linking to the flow.
- **Choosing your own password:** starting the server with `--setup` still lets you set the admin password in the browser. That page now asks only for the account, then hands you to the flow.
- **Libraries from `config.yaml`** show as already added in step 1.

The [First run page in the docs](https://docs.audiosilo.app/users/getting-started/first-run) has every step with screenshots. New to self-hosting? Start with [Self-hosted audiobook server](/blog/self-hosted-audiobook-server/), and see [How to pair your phone](/blog/pair-your-phone/) for the address the phone apps need.
