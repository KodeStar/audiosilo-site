---
title: "A tour of the AudioSilo admin console"
description: Four and a half minutes on a real household server - fixing a badly tagged book, the library and series shelves, Health, people and invites, activity and settings.
kind: tutorial
published: 2026-10-09
updated: 2026-11-10
verified: 2026-10-28
appliesTo: Server 2.0 and later (recorded on 2.0)
tags: [admin, video, tour, metadata]
covers:
  - server:admin_ui
  - server:health
  - server:match
  - server:activity
  - server:import
  - server:backups
  - server:notifications
  - server:addresses
  - docs:/users/admin/console-tour
related:
  - server-2-5
  - server-2-2
  - fix-covers-and-series
  - self-hosted-audiobook-server
  - pair-your-phone
hero: ../../assets/stills/server-overview-dark.webp
heroAlt: The AudioSilo admin console overview, with three people listening now, their book and chapter, totals and recent listening
video:
  tour: server
  duration: "4:35"
  chapters:
    - "0:00 Overview and Health"
    - "0:20 Fixing a badly tagged book with Match"
    - "1:18 The library and its filters"
    - "1:47 Series shelves and gaps"
    - "2:01 Folder detection"
    - "2:13 Health and Match automatically"
    - "2:56 People, devices and invites"
    - "3:28 Activity and Year in listening"
    - "3:54 Settings, import, backups and logs"
revisions:
  - date: 2026-11-10
    note: "Rewritten to be shorter and easier to read. No facts changed."
  - date: 2026-10-28
    note: "Added what server 2.5 changed since the recording."
  - date: 2026-10-24
    note: "Added what server 2.3 and 2.4 changed since the recording, and corrected how an invite QR is scanned."
---

The admin console is where you run an AudioSilo server: add libraries, fix books, invite people and see how the household listens. It's built into the server at `/admin`, installs like an app from the browser, and comes in light and dark. The video above tours it on a real household server in about four and a half minutes, with captions.

## The overview (0:00)

The console opens on who's listening **right now**, with book, chapter and progress, then totals and what needs attention. Health checks run on every scan. Press **⌘K** (Ctrl+K) to search from anywhere.

## Fixing a badly tagged book (0:20)

The tour's book has swapped tags: its title says *Bernard Cornwell*, its author *Sharpe's Eagle*, and it has no cover. Its folders say `Bernard Cornwell / Richard Sharpe / Sharpe - 08 - Sharpe's Eagle`.

**Match** looks it up in the community database, folder names and all. The right book comes first, and each edition's length is checked against your files. You tick what to take, field by field.

The fix is stored as overrides in the server's database. Your files aren't touched, and a rescan won't undo it. More: [Fix wrong covers, titles and series](/blog/fix-covers-and-series/).

## The library (1:18)

What's new, books that need attention, and filters for everything the server knows: format, codec, cover, chapters, matched or not. A library can take book details from **folder names first**.

## Series (1:47)

Community data puts each series in order. Books you don't have yet show as **gaps**.

## One folder, one book (2:01)

One folder is one book unless you say otherwise. The tour splits a folder of Narnia files into seven books, and rescans remember it.

## Health and Match automatically (2:13)

Health turns scan results into a to-do list. **Match automatically** looks up every unmatched book in the background. Nothing changes until you've reviewed it, and you choose what gets written: just the IDs, what's missing, or the community's values. Scans run in a queue, on a schedule per library, with a log for each run.

## People (2:56)

Everyone on the server, what they're in the middle of, their Year in listening and every device they've signed in on. Adding someone is an **invite**: a link, or a QR code they scan with their phone's camera (app 2.4.0 can also scan it from its own scanner). No password needed. See [How to pair your phone](/blog/pair-your-phone/).

## Activity (3:28)

Hours, sessions and books finished, kept on your server with no third-party analytics. Also when the household listens, which apps they use, what needed converting, and a Year in listening for the whole server.

## Settings (3:54)

- **Home address** and public address, which the apps switch between on their own.
- **Import** of everyone's listening history from Audiobookshelf.
- Scheduled database backups.
- Alerts to a webhook, ntfy or Discord.
- Live logs, and an audit log of every admin change.

## Since the recording

The tour was recorded on server 2.0.

| Server | What it adds | Post |
|---|---|---|
| 2.1 and 2.2 | **Community chapters**, books in more than one series, **Clear community matches**, a support card you can dismiss for good | [Server 2.1 and 2.2](/blog/server-2-2/) |
| 2.3 | Household members on the People page | [Server 2.3](/blog/server-2-3/) |
| 2.4 | **Set up your server** on first sign-in, genre and tag filters, duplicates across libraries in Health, selecting many books at once, podcast libraries | [Server 2.4](/blog/server-2-4/) |
| 2.5 | Unscanned book folders listed in **Folders** as **Not in the library yet** with **Rescan**, **Before an upgrade** copies in **Backups**, sections open sooner on a large library | [Server 2.5](/blog/server-2-5/) |

## Try it yourself

The public demo is a listener's account, so it doesn't include the admin console. To run your own, see [Self-hosted audiobook server](/blog/self-hosted-audiobook-server/) or the [console tour in the docs](https://docs.audiosilo.app/users/admin/console-tour).
