---
title: "Why isn't my audiobook progress syncing between devices?"
description: "Check the device you last listened on, its connection, your account and the book's edition before resetting anything. A practical guide to getting your place across."
kind: guide
published: 2026-11-07
updated: 2026-11-10
verified: 2026-11-08
appliesTo: General advice; the AudioSilo section is server 2.6.0 with its bundled web player, app 2.6.0
tags: [audiobooks, sync, offline, troubleshooting]
covers:
  - app:stores
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
revisions:
  - date: 2026-11-10
    note: "Rewritten to be shorter and easier to read. No facts changed."
  - date: 2026-11-08
    note: "App 2.6.0 is on the App Store now; on Android, the APK until 2.6.0 reaches Google Play."
---

Start with the device you last listened on. Connect it, open the app and let its place sync before resuming elsewhere. Then check both devices use the same account and the same edition, and don't sign out or reinstall while the latest listening is only on one device.

These checks work for any audiobook app. The AudioSilo specifics are at the end.

## 1. Let the last device send its listening

A downloaded book plays offline, but sending your place needs a connection. Hearing the book doesn't mean anything has uploaded.

1. Pause on the device you used last.
2. Bring it online and open the app.
3. Look for a sync status or a manual sync control.
4. Open the second device and let it check for the saved place before pressing play.

If you listen through a server at home, check the app can reach it from the network you're on. If you can't connect yet, note your chapter and position before switching.

## 2. Check the account and the sync setting

Make sure both apps are signed in as the same person. For a self-hosted library, check the server too: two servers with the same files don't necessarily share progress.

Some players have a separate position sync setting. Audible's [listening guide](https://help.audible.co.uk/s/article/listen-in-the-app) puts it in **Profile > Settings > Player**; the switch's name varies between versions. Check it on each device. A download setting is not the same as a sync setting.

## 3. Check the copy of the book

Compare the narrator, edition and total running time on both devices. An abridged and an unabridged recording aren't interchangeable places to resume, even with the same cover. A download made before the server's files were replaced may differ too.

Note your chapter and position before replacing a download. If a sync error mentions a different length or a missing book, fix that mismatch rather than retrying the same upload.

## 4. Keep the device that has the latest place

Signing out, removing a server or uninstalling can lose listening that hasn't reached the service.

In AudioSilo, signing out or removing a server deletes unsynced progress and that server's downloads. From 2.6.0 the app warns first when listening is still waiting. Uninstalling removes the app's local data. Let it finish syncing first.

If both devices were used offline, decide which place you want. The furthest point isn't always right if you went back to hear a chapter again.

## In AudioSilo 2.6

These need **server 2.6.0** and a 2.6.0 player: the web player your server serves, or app 2.6.0. The app is on the App Store for iPhone and iPad. On Android, install the APK from [its GitHub release](https://github.com/KodeStar/audiosilo-frontend/releases/tag/v2.6.0) until 2.6.0 reaches Google Play. With an older app or server, your place saves as before, so steps 1 to 4 are what to check.

- **Home** shows listening waiting to reach the server.
- Your server's **account page > Listening sync** shows the waiting count and last successful sync.
- **Couldn't sync** lists refused listening with a reason, such as a different-length copy or a book no longer on the server.
- If another device has a different place, the player offers **Jump** or **Stay** instead of silently rewinding you.

## More

- [Listening sync](/blog/listening-sync/) explains those changes.
- The docs cover [listening between devices](https://docs.audiosilo.app/users/listening/playback#listening-on-more-than-one-device), [the account's sync card](https://docs.audiosilo.app/users/listening/account#listening-sync) and [offline downloads](https://docs.audiosilo.app/users/listening/offline-downloads).
- Can't reach your home server? See [Listen away from home](/blog/listen-away-from-home/).
- [Player tips](/blog/player-tips/) has more on keeping a useful place as you listen.
