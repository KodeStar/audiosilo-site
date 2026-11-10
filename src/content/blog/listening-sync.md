---
title: "Listening sync: your place and offline listening across devices"
description: "AudioSilo 2.6 keeps offline listening until it syncs, counts it when it happened, and lets you choose between places from different devices."
kind: feature
published: 2026-11-07
updated: 2026-11-10
verified: 2026-11-08
appliesTo: Server 2.6.0 with its bundled web player, app 2.6.0
tags: [player, sync, offline, history, downloads]
covers:
  - app:stores
  - server:listening_sync
  - server:progress
  - server:stats
  - app:listening_sync
  - app:playback
  - app:downloads
  - app:account
  - app:journal
  - docs:/users/listening/playback
  - docs:/users/listening/account
  - docs:/users/listening/offline-downloads
related:
  - server-2-6
  - audiobook-progress-not-syncing
  - listen-away-from-home
  - player-tips
revisions:
  - date: 2026-11-10
    note: "Rewritten to be shorter and easier to read. No facts changed."
  - date: 2026-11-08
    note: "App 2.6.0 is on the App Store now; on Android, the APK until 2.6.0 reaches Google Play."
---

Listen on your phone without a connection, then carry on at your desk. In AudioSilo 2.6.0, each device sends **what you listened to and when**, and offline listening waits on the device until the server is reachable. When two devices disagree about your place, the player lets you choose.

This is **Sync v2**, new in AudioSilo 2.6.0 ([what else is in 2.6](/blog/server-2-6/)).

## What you need

- **Server 2.6.0**, with the web player it serves, or
- **App 2.6.0** on a phone or tablet: from the App Store on iPhone and iPad. On Android, use the APK on [its GitHub release](https://github.com/KodeStar/audiosilo-frontend/releases/tag/v2.6.0) until 2.6.0 reaches Google Play (see [Android without Google Play](https://docs.audiosilo.app/users/listening/mobile-apps#android-without-google-play)).
- Each device signed in to the same account on the same server.

There's no switch to turn on and no Bridge to install. Older apps, or a new player on an older server, keep saving your place the previous way. The changes below need the new player and server together.

## Offline listening lands on the day you heard it

A downloaded book still plays without a connection. What you hear waits on the device and goes to the server when it can connect.

Your history, Journal and stats put that listening at the time it happened, not the day you got home. Sending the same update twice doesn't count it twice.

For books split into several files, the player also records the file and your place in it. That lets the server match listening from a download whose files are in an older order.

## Two devices, two places

Say your phone was offline while another device played further on. The server keeps the place further on and remembers the other one. An old place can't silently rewind the book.

When another device's place is more than 30 seconds from yours, the player offers it by name:

- **Jump** moves to that place.
- **Stay** keeps your place and makes that choice count for the listening that follows.

The book's page also offers the other place with **Play from there**. The name comes from the device's sign-in, or **another device** if the server doesn't know it.

## See what's waiting

- **Home** shows a line such as **3 listens waiting to sync**.
- Your account page for that server has a **Listening sync** card: how many are waiting and when it last synced.
- **Couldn't sync** lists any update the server refused, with the book and the reason. For example, the downloaded copy is a different length from the server's, or the book is gone.

Couldn't sync entries stay for 30 days unless you discard them. Discarding clears the notice; it doesn't apply that listening.

## Good to know

- Before signing out, removing a server or uninstalling, let the device reconnect and finish syncing. Listening that hasn't reached the server is only on that device. Signing out or removing the server warns you first.
- A device that starts before hearing from the server can't overwrite a newer place with its old one.
- A finished book stays finished when an unaware device sends more listening. Starting it again on purpose still works.

## More

The docs explain [listening on more than one device](https://docs.audiosilo.app/users/listening/playback#listening-on-more-than-one-device), the [Listening sync card](https://docs.audiosilo.app/users/listening/account#listening-sync) and [offline downloads](https://docs.audiosilo.app/users/listening/offline-downloads). If a device won't catch up, see [Why isn't my audiobook progress syncing?](/blog/audiobook-progress-not-syncing/). To reach your server outside the house, see [Listen away from home](/blog/listen-away-from-home/).
