---
title: "Listening sync: your place and offline listening across devices"
description: "AudioSilo 2.6 keeps offline listening until it syncs, counts it when it happened, and lets you choose between places from different devices."
kind: feature
published: 2026-11-07
updated: 2026-11-08
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
  - date: 2026-11-08
    note: "App 2.6.0 is on the App Store now; on Android, the APK until 2.6.0 reaches Google Play."
---

Listen on your phone without a connection, then carry on at your desk. In AudioSilo 2.6.0, each device sends **what you listened to and when**, so the server can join up listening from different devices. Offline listening waits on the device until the server is reachable. When two devices have different places, the player gives you a choice about where to carry on.

This is **Sync v2**, new in AudioSilo 2.6.0 ([what else is in 2.6](/blog/server-2-6/)).

## What you need

Use **server 2.6.0** with the web player it serves, which has Sync v2 today, or **app 2.6.0** on a phone or tablet: from the App Store on iPhone and iPad, and on Android from the APK on [its GitHub release](https://github.com/KodeStar/audiosilo-frontend/releases/tag/v2.6.0) until 2.6.0 reaches Google Play (see [Android without Google Play](https://docs.audiosilo.app/users/listening/mobile-apps#android-without-google-play)). Sign each device in to the same account on the same server. There's no new switch to turn on and no Bridge to install for listening between AudioSilo devices.

Older apps keep saving their place through the existing progress route. A new player connected to an older server also keeps the previous way of saving your place. The changes below need the new player and server together.

## Offline listening arrives on the day you heard it

A downloaded book still plays without a connection. What you hear waits on that device, then goes to the server when it can connect again. Your book's history, Journal and stats put that listening at the time it happened, rather than the day you got home. Sending the same listening update again doesn't count it twice.

For books split into several audio files, the player records the file and your place inside it too. That lets the server reconcile listening from a download whose files are still in an older order.

## Two devices, two places

Suppose your phone was offline while another device played further into the book. Neither device knew about the other's listening. The server keeps the place further on and remembers the other one, rather than letting an old place silently rewind the book.

When another device's place is more than 30 seconds from yours, the player can offer it by name, with **Jump** and **Stay**:

- **Jump** moves to that place.
- **Stay** keeps where you are and makes that choice count for the listening that follows.

The book's page also offers the other place with **Play from there**. The name comes from the device's sign-in; if the server doesn't know it, the player says **another device**.

A device starting before it hears back from the server can't overwrite a newer place with its old starting point. A book you've finished stays finished when an unaware device sends more listening; deliberately starting the book again still works.

## See what's waiting

Home shows a line such as **3 listens waiting to sync** while listening is still on this device. Open your account page for that server and look for **Listening sync** to see how many are waiting and when it last synced.

If the server couldn't accept an update, **Couldn't sync** lists the book and the reason. For example, the downloaded copy may be a different length from the book now on the server, or the book may no longer be there. These entries stay for 30 days unless you discard them. Discarding an entry clears the notice; it doesn't apply that listening.

Before signing out, removing a server or uninstalling the app, let the device reconnect and finish syncing. Listening that hasn't reached the server still needs that device. Signing out or removing the server warns when listening is waiting and would be lost.

## More

The docs explain [listening on more than one device](https://docs.audiosilo.app/users/listening/playback#listening-on-more-than-one-device), the [Listening sync card](https://docs.audiosilo.app/users/listening/account#listening-sync) and [offline downloads](https://docs.audiosilo.app/users/listening/offline-downloads). If a device won't catch up, work through [Why isn't my audiobook progress syncing?](/blog/audiobook-progress-not-syncing/). For reaching your own server outside the house, see [Listen away from home](/blog/listen-away-from-home/).
