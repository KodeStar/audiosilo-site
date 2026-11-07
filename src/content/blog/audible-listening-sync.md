---
title: "Audible and AudioSilo keep your listening place in step, both ways"
description: With a Bridge signed in to your Audible account, your place in a book moves between the Audible app and AudioSilo, so you can switch between them mid-book.
kind: feature
published: 2026-11-04
verified: 2026-11-04
appliesTo: Server 2.6.0 with a Bridge
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
  - audible-backup
  - back-up-your-audible-library
  - bridge-recaps-and-contributions
  - player-tips
draft: true
---

If some of your books live in both the Audible app and AudioSilo, you've probably had to find your place twice: a chapter in the car on Audible, then the rest at home on AudioSilo, scrubbing to where you left off. From version 2.6.0, your server's **Bridge** can keep the two in step. Listen on Audible and your place in AudioSilo moves on; listen in AudioSilo and the Audible app picks up where you stopped.

It's off until an admin turns it on for an Audible account, and it moves places only: listening on Audible never shows up in your AudioSilo history or stats.

## What it needs

- **Server 2.6.0 or later** with a [Bridge](https://docs.audiosilo.app/users/getting-started/running-a-bridge) paired and online, in a version that supports Audible.
- **Your Audible account signed in on the Bridge.** You sign in, and choose who the account is for and which library it belongs to, on the Bridge's own page: see [Bridge accounts](https://docs.audiosilo.app/users/getting-started/bridge-accounts#audible). Your server never sees your Amazon password.
- **The Audible module turned on** in the console's **Server > Settings > Modules**. It starts off.
- **Sync turned on for the account.** On **Server > Settings > Bridge**, the **Audible accounts** card has **Account settings...** for each account: tick **Sync listening places with Audible** and **Save**. It's off for every account until you do.

Each account syncs for the person it belongs to, and only for the books of that account that are on your server, whether they came from a backup or were already in your library.

## From Audible to AudioSilo

Every 15 minutes, and straight away when you turn sync on, the Bridge reads the account's places on Audible. A place that is **further on** than yours in AudioSilo comes across, and the player moves to it or offers it, naming the account the way it names your other devices: *"On Audible (Chris (US)) you were at ... Jump there?"*.

A place from Audible **never moves yours back**. One that's behind your place in AudioSilo is left alone, and so is one from before you finished the book or started it again in AudioSilo. Your playback speed stays as it is, and a place at the very end of the book on Audible marks it finished.

## From AudioSilo to Audible

When you stop listening in AudioSilo, the Bridge waits until your place has stayed put for 3 minutes, then sends it to Audible, so the Audible app has it about 3 to 4 minutes after you stop. It's sent as it is: if you went back a chapter in AudioSilo, Audible goes back too.

It never overwrites a newer place on Audible. If you listened further on in the Audible app in the meantime, your AudioSilo place isn't sent; the place further on wins, and the next sync brings it to AudioSilo. When sync first starts, only places you changed in the last 10 minutes are sent; the rest reach Audible the next time you listen to those books.

## Only places

Listening on Audible adds nothing to your AudioSilo history, your stats or the server's activity. Only the place moves, under a device named after the account, such as **Audible (Chris (US))**.

## Leaving a book out

**Don't sync** on a title in the console's **Server > Settings > Audible** page keeps that one book out of the sync, both ways: Audible's place never moves it, and your AudioSilo place on it is never sent to Audible. The title shows **Not synced**, and **Sync again** undoes it. Nothing else changes: the book stays on your server as before.

Some books leave themselves out. When a title's length on Audible is quite different from the book on your server (usually a different recording that was matched by its title), its place doesn't sync either way, and neither does a place past the end of the book.

## When it stops

The account's **Sync** row on the Audible accounts card says whether it's on and when it last synced, or why it has stopped:

- **Audible refused the account**: press **Sign in again** on the Bridge's Accounts tab, and syncing starts again after it.
- **The account was given to someone else** on the Bridge: sync turns off, since it was turned on for another person. Turn it on again for the new one.
- **The account's library was deleted**: sync is paused with the account until you choose another library for it on the Bridge.

When Audible is busy, sync doesn't stop: the Bridge waits as long as Audible asks and tries again by itself. If the account's person is disabled or made a kid account, nothing syncs until you choose someone else for the account on the Bridge. The Bridge's setup checklist also says when an account's places aren't syncing, and why. Each sync shows in the Bridge's Jobs list as **Syncing places with Audible**.

## Backing up the books themselves

The same Audible module can also back up the books an account owns into your library, so they play in AudioSilo like any other book. Those backups are for **a personal backup of books you bought**, with your own account: [Back up your Audible books straight into your AudioSilo library](/blog/audible-backup/) covers them, and what to check about your local law first. Syncing places doesn't need a backup: a book you already had in your library, matched to the Audible title, syncs too. For the other ways to keep a copy of your Audible books, see [How to back up your Audible library](/blog/back-up-your-audible-library/).

## More

[Syncing listening places](https://docs.audiosilo.app/users/admin/audible#syncing-listening-places) in the docs covers the switch, both directions and what counts as the same book, with [Don't sync this book](https://docs.audiosilo.app/users/admin/audible#dont-sync-this-book) and [When it stops](https://docs.audiosilo.app/users/admin/audible#when-it-stops) below it. For listeners, [Playback](https://docs.audiosilo.app/users/listening/playback) explains how a place from another device, Audible included, reaches the player.
