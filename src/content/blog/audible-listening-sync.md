---
title: "Audible and AudioSilo keep your listening place in step, both ways"
description: With a Bridge signed in to your Audible account, your place in a book moves between the Audible app and AudioSilo, so you can switch between them mid-book.
kind: feature
published: 2026-11-07
verified: 2026-11-07
updated: 2026-11-10
revisions:
  - date: 2026-11-10
    note: "Rewritten to be shorter and easier to read. No facts changed."
appliesTo: Server 2.6.0 with Bridge 0.6.0
tags: [audible, bridge, sync, player, admin]
covers:
  - server:audible
  - server:bridge
  - server:modules
  - server:sync
  - app:playback
  - app:book-page
  - bridge:audible
  - bridge:audible-sync
  - docs:/users/admin/audible
  - docs:/users/admin/bridge
  - docs:/users/getting-started/bridge-accounts
  - docs:/users/listening/playback
related:
  - server-2-6
  - audible-backup
  - back-up-your-audible-library
  - bridge-recaps-and-contributions
  - player-tips
---

From version 2.6.0, your server's **Bridge** can keep your place in step between the Audible app and AudioSilo, both ways. Listen on Audible and your AudioSilo place moves on; listen in AudioSilo and the Audible app picks up where you stopped.

It's off until an admin turns it on for an Audible account. It moves places only: listening on Audible never shows up in your AudioSilo history, stats or the server's activity.

## What it needs

- **Server 2.6.0 or later** with a [Bridge](https://docs.audiosilo.app/users/getting-started/running-a-bridge) paired and online, on **Bridge 0.6.0** or later. Update the two together.
- **Your Audible account signed in on the Bridge**, on its own page: see [Bridge accounts](https://docs.audiosilo.app/users/getting-started/bridge-accounts#audible). Your server never sees your Amazon password.
- **The Audible module turned on** in the console's **Server > Settings > Modules**. It starts off.
- **Sync turned on for the account**, as below. It's off for every account until you do.

To turn sync on:

1. Open **Server > Settings > Bridge**.
2. On the **Audible accounts** card, open **Account settings...** for the account.
3. Tick **Sync listening places with Audible** and press **Save**.

Each account syncs for the person it belongs to, and only for that account's books on your server, whether backed up by the Bridge or already in your library.

## How places move

| | From Audible to AudioSilo | From AudioSilo to Audible |
|---|---|---|
| When | Every 15 minutes, and straight away when you turn sync on | About 3 to 4 minutes after you stop (your place must stay put for 3 minutes) |
| What wins | Only a place **further on** than yours comes across | Sent as it is, even if you went back a chapter, unless Audible has a newer place further on |

A place from Audible **never moves yours back**. One from before you finished the book or restarted it in AudioSilo is ignored too. Your playback speed stays as it is, and a place at the very end on Audible marks the book finished.

The player offers an Audible place like any other device's: *"On Audible (Chris (US)) you were at ... Jump there?"*. The device is named after the account, such as **Audible (Chris (US))**.

When sync first starts, only places you changed in the last 10 minutes go to Audible. The rest go the next time you listen to those books.

## Leaving a book out

**Don't sync** on a title in **Server > Settings > Audible** keeps that book out of the sync, both ways. The title shows **Not synced**, and **Sync again** undoes it. The book stays on your server as before.

A book whose length on Audible is quite different from yours (usually a different recording matched by title) doesn't sync either, and nor does a place past the end of the book.

## When it stops

The account's **Sync** row on the Audible accounts card says when it last synced, or why it stopped:

| It says | What to do |
|---|---|
| **Audible refused the account** | Press **Sign in again** on the Bridge's Accounts tab |
| **The account was given to someone else** | Sync turns off; turn it on again for the new person |
| **The account's library was deleted** | Choose another library for the account on the Bridge |

## Good to know

- **Known limitation in Bridge 0.6.0:** the Audible app can still resume at an older place after the Bridge reported sending yours. The Bridge doesn't yet re-send your place when Audible overwrites it.
- **When Audible is busy**, sync waits as long as Audible asks and retries by itself.
- **A disabled or kid account** gets no sync until you choose someone else for the account on the Bridge.
- The Bridge's setup checklist says when an account isn't syncing, and its Jobs list shows each run as **Syncing places with Audible**.
- **No backup needed.** A book you already had, matched to the Audible title, syncs too. To back up the books themselves, see [Back up your Audible books straight into your AudioSilo library](/blog/audible-backup/) or [How to back up your Audible library](/blog/back-up-your-audible-library/).

## More

[Syncing listening places](https://docs.audiosilo.app/users/admin/audible#syncing-listening-places) in the docs covers it in full, with [Don't sync this book](https://docs.audiosilo.app/users/admin/audible#dont-sync-this-book) and [When it stops](https://docs.audiosilo.app/users/admin/audible#when-it-stops). For listeners, [Playback](https://docs.audiosilo.app/users/listening/playback) explains how a place from another device reaches the player.
