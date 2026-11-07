---
title: "AudioSilo on Apple Watch: leave the phone at home, take a book with you"
description: "A preview of AudioSilo's Apple Watch companion: downloaded books, setup from your iPhone and listening sync. App Store availability is still pending."
kind: feature
published: 2026-11-05
updated: 2026-11-07
verified: 2026-11-07
appliesTo: Server 2.6.0, iPhone app 2.6.0, watchOS 11 (unreleased companion)
tags: [apple-watch, player, offline, downloads, sync]
covers:
  - server:renditions
  - server:listening_sync
  - server:transcode
  - server:addresses
  - app:watch
  - app:account
  - app:downloads
  - docs:/users/listening/apple-watch
  - docs:/users/listening/account
  - docs:/users/listening/offline-downloads
  - docs:/users/getting-started/remote-access
related:
  - listening-sync
  - pair-your-phone
  - listen-away-from-home
revisions:
  - date: 2026-11-07
    note: "Rechecked the implementation for the release draft; clarified pending App Store availability and production watch checks."
draft: true
---

A phone is a lot to carry for the sake of a book. AudioSilo's Apple Watch companion is built to play books downloaded to the watch, with its own sign-in and a direct connection to your server for listening sync. Your iPhone sets it up and sends books to it; playback uses the watch's own copy.

**This is a preview of the companion planned for the 2.6.0 iPhone update. It isn't available in the App Store build checked for this draft on 7 November 2026:** the [US listing](https://apps.apple.com/us/app/audiosilo/id6783431375) still shows 2.5.0. Production checks for phone-off playback, interruptions and background sync remain release gates. A server update alone doesn't install the watch app.

## What it needs

- **An iPhone with AudioSilo 2.6.0**, once that update is available, and a paired Apple Watch on **watchOS 11 or later**.
- **Server 2.6.0 with ffmpeg**, which prepares the smaller audio copies the watch downloads.
- A connection from the watch to the server for setup, downloads and syncing. Downloaded playback is designed to work without that connection.

## Setting it up

Once the companion is available, install AudioSilo through the iPhone's **Watch** app. In AudioSilo on the iPhone, open your account page for the server and choose **Set up Apple Watch** on the **Apple Watch** card. Open AudioSilo on the watch to finish signing in, without typing a password there. **Send again** sends a fresh sign-in if the first expires.

The watch reaches your server itself. At home, a server with a self-signed certificate can use its home HTTP address. Away, the watch needs an address with a certificate it trusts; it can't click through a certificate warning. Without an away address it can still play downloaded books, then sync when it can reach home again. The docs explain [self-signed servers](https://docs.audiosilo.app/users/listening/apple-watch#a-self-signed-server).

## Put a book on the watch before you go

Choose **Send to watch** in a book's menu or under **More** on its page on your iPhone. Or open **Continue listening** on the watch and choose **Download** beside a book you've started.

Open AudioSilo on the watch to start preparing and downloading. A message sent while the watch app is closed may take a few minutes to arrive. The server keeps preparing the audio with your wrist down, but the watch checks readiness while its app is open. Wait until the book appears under **On this watch** before setting out.

The iPhone's **Downloads** page has an **On your Apple Watch** section for delivery, preparation and download status. It includes books downloaded from the watch itself. Its **Remove** action asks first, then requests removal from the watch. Status can lag until the watch reports back. Finished books stay on the watch until you remove them.

## Listening and getting your place back

The watch player has chapter navigation, back and forward skips, speed controls and a sleep timer. It keeps listening updates on the watch until the server accepts them, for your place, history and stats.

With the app open, it tries to send listening when you open it and when you stop. The implementation also hands pending listening to watchOS for background upload through a trusted away address. **Background timing is up to watchOS and still needs the production checks above.** If you only have a home address, open AudioSilo when you're home to sync. The watch's **Sync** page shows waiting updates and offers **Sync now**.

## A small companion

The watch holds **one account on one server** and plays **books**. It lists Continue listening and the books sent from your iPhone, with no full library browser or podcasts. Kids' accounts and demos don't offer watch setup. Bookmarks, notes, ebooks, read-along and casting stay on your other devices. The watch interface is English for now; there's no Wear OS app in this release.

The [Apple Watch guide](https://docs.audiosilo.app/users/listening/apple-watch) covers the implemented screens and their messages. [Listening sync](/blog/listening-sync/) explains how devices reconcile places, and [Listen away from home](/blog/listen-away-from-home/) covers reaching your server outside your network.
