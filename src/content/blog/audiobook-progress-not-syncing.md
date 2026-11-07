---
title: "Why isn't my audiobook progress syncing between devices?"
description: "Check the device you last listened on, its connection, your account and the book's edition before resetting anything. A practical guide to getting your place across."
kind: guide
published: 2026-11-07
verified: 2026-11-07
appliesTo: General advice; the AudioSilo section is server 2.6.0 with its bundled web player, app 2.6.0
tags: [audiobooks, sync, offline, troubleshooting]
covers:
  - server:listening_sync
  - app:listening_sync
  - app:downloads
  - app:account
  - docs:/users/listening/playback
  - docs:/users/listening/account
  - docs:/users/listening/offline-downloads
related:
  - listening-sync
  - server-2-6
  - listen-away-from-home
  - player-tips
---

If your audiobook opens at an old place on another device, start with the device you last listened on. Connect it, open the listening app and check that its saved place has synced before resuming elsewhere. Then check that both devices use the same account and the same edition. Avoid signing out or reinstalling while the latest listening is still only on one device.

These checks are useful whichever audiobook app you use. The exact sync controls depend on the player; the AudioSilo steps are below.

## 1. Let the last device send its listening

A downloaded book can play without an internet connection. Sending your latest place to another device needs a connection as well. Being able to hear the book doesn't tell you whether the app has uploaded anything.

Pause on the device you used last, bring it online and open the app. Look for a sync status or a manual sync control. If you listen through a server at home, check that the app can actually reach that server from the network you're on.

Then open the second device and let it check for the saved place before pressing play. For an offline journey, make a note of your chapter and position before switching devices if you can't get them connected yet.

## 2. Check the account and the sync setting

Make sure both apps are signed in as the same person. For a self-hosted library, check the server too: two servers with the same files don't necessarily share listening progress.

Some players have a separate setting for position sync. Audible's [listening guide](https://help.audible.co.uk/s/article/listen-in-the-app) puts its position sync switch in the app's player settings (**Profile > Settings > Player**); the switch's exact name varies between app versions. Check it on each device if you use Audible. A control for downloading books is a different thing from a control for syncing your place.

## 3. Check the copy of the book

Compare the narrator, edition and total running time on both devices. An abridged recording and an unabridged one aren't interchangeable places to resume, even if the cover and title match. A download made before files were replaced on a server may also differ from what's there now.

Record your chapter and position before replacing a download. If a sync error mentions a different length or missing book, resolve that mismatch rather than repeatedly trying the same upload.

## 4. Keep the device that has the latest place

Signing out, removing a server or uninstalling can remove information that hasn't reached the service yet. In AudioSilo, signing out or removing a server deletes unsynced progress and the downloads for that server, and from 2.6.0 the app warns first when listening is still waiting; uninstalling removes the app's local data. Let it finish syncing first.

If both devices have been used offline, check which place you actually want. The furthest point isn't always the right one if you deliberately went back to hear a chapter again. Keep a note of that place before choosing between them.

## In AudioSilo 2.6

These need **server 2.6.0** and a 2.6.0 player: the web player your server serves has them now, and app 2.6.0 brings them to phones and tablets once it reaches the App Store and Google Play (on Android, install it now from the APK on [its GitHub release](https://github.com/KodeStar/audiosilo-frontend/releases/tag/v2.6.0)). With an older app or server, the app saves your place as before, so steps 1 to 4 are what to check.

- **Home** shows listening waiting to reach the server.
- Your server's **account page > Listening sync** shows the waiting count and last successful sync. **Couldn't sync** lists rejected listening with a reason, such as a different-length copy or a book that's no longer on the server.
- If another device has a different place, the player offers **Jump** or **Stay** instead of silently rewinding you. Choose the place you mean to continue from.

The [Listening sync post](/blog/listening-sync/) explains those changes. The docs cover [listening between devices](https://docs.audiosilo.app/users/listening/playback#listening-on-more-than-one-device), [the account's sync card](https://docs.audiosilo.app/users/listening/account#listening-sync) and [offline downloads](https://docs.audiosilo.app/users/listening/offline-downloads). If the problem is reaching your home server, [Listen away from home](/blog/listen-away-from-home/) covers the connection; [Player tips](/blog/player-tips/) has more on keeping a useful place as you listen.
