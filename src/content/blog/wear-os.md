---
title: "AudioSilo on Wear OS: leave the phone at home, take a book with you"
description: "In AudioSilo 2.7, a Wear OS watch plays books downloaded to it, sets up from your Android phone with nothing to type, and syncs your listening with your server."
kind: feature
published: 2026-11-12
verified: 2026-11-12
appliesTo: Android app 2.7.0 (not released yet), Wear OS 3, server 2.6 with ffmpeg
tags: [wear-os, player, offline, downloads, sync]
covers:
  - server:renditions
  - server:listening_sync
  - server:transcode
  - server:addresses
  - app:watch
  - app:wear-os
  - app:account
  - app:downloads
  - app:stores
  - docs:/users/listening/wear-os
  - docs:/users/listening/account
  - docs:/users/listening/offline-downloads
  - docs:/users/listening/mobile-apps
  - docs:/users/getting-started/remote-access
related:
  - apple-watch
  - listening-sync
  - listen-away-from-home
draft: true
---

AudioSilo 2.7 adds a Wear OS app. It plays books downloaded to the watch, so you can go out with headphones and leave your Android phone at home. Your phone sets the watch up and sends it books. When the watch is back online, it sends what you heard to your server.

We tested the Wear OS app on the Wear OS emulator. It hasn't run on a real watch yet, so battery saving, Bluetooth headphones and download speeds may behave differently on yours.

## What it needs

- **An Android phone with AudioSilo 2.7.0 or later**, paired to a watch on **Wear OS 3 or later**.
- **A server on 2.6 or later, with ffmpeg**, which makes the smaller copy of each book a watch plays. The [Transcoding](https://docs.audiosilo.app/users/admin/server#transcoding) settings show whether yours has it.
- Headphones, or the watch speaker.

## Setting it up

To set up the watch, start on your phone.

1. In AudioSilo on the phone, open your account page for the server.
2. On the **Wear OS watch** card, tap **Install on watch**. Google Play opens on the watch at AudioSilo. Install it there.
3. Back on the card, tap **Set up your watch**.
4. Keep the watch close. It signs in by itself, with nothing to type.

The card now shows the account and how syncing is going.

The sign-in works once, for 10 minutes. If it runs out, tap **Send again** on the card.

## Put a book on the watch before you go

There are two ways to choose a book:

- **From your phone:** open a book's menu, or **More** on its page, and tap **Send to watch**. The watch starts the download in the background, without you opening the app.
- **On the watch:** **Continue listening** lists books you've started. Tap one to download it.

The watch's home screen shows each book coming under **On the way**. The server first prepares the watch's copy, which can take a while the first time for a long book. When the download is done, the book moves to **On this watch**.

The watch downloads over Wi-Fi. If it finds no Wi-Fi within 30 seconds, the book's row says **Waiting for Wi-Fi** and offers **Use the phone's connection (slow)**. That route goes through your phone over Bluetooth, and can be much slower for a large book.

On the phone, **Downloads** has an **On your watch** section. It lists the books you sent and the books the watch holds, with how far each has got. **Remove** takes a book off the watch. If it's playing, it stops, and your place is kept.

## A run without your phone

1. **Before you go**, with the watch online, check the book is in **On this watch**.
2. **Leave the phone.** Connect your headphones and play. The watch needs no connection to play a downloaded book.
3. **Come back.** The watch sends what you heard to your server, with the times you heard it.

The player has back 15 and forward 30 seconds, chapters, **Speed** and a **Sleep timer**. The book keeps playing after you leave the app.

Before a book plays, the watch asks your server for your place if it can reach it. If another device is elsewhere in the book, it offers **Jump there** or **Stay here**, like the other apps.

The watch sends your listening:

- when you open the app
- about once a minute while the app is open
- in the background, when Wear OS allows it

Background sending can take a while. **Opening the app is the sure way to send it.** The watch's **Sync** page shows how many updates are waiting, with **Sync now**.

## A small companion

The watch holds **one account on one server** and plays **books**.

It doesn't have:

- library browsing or podcasts
- bookmarks, notes, the ebook or casting (these stay on your other devices)
- languages other than English, for now

Kids' accounts and demos don't offer it.

## Good to know

- **[Install both apps from the same place.](https://docs.audiosilo.app/users/listening/wear-os#install-both-apps-from-the-same-place)** The phone and the watch only talk to each other when both apps come from Google Play, or both from GitHub. Each GitHub app release has a watch APK beside the phone's. Installing it on a watch needs a computer with `adb`.
- **At home with a [self-signed certificate](https://docs.audiosilo.app/users/listening/wear-os#a-self-signed-server),** the watch uses the server's plain HTTP home address. Set the watch up on the same network as the server.
- **Away from home,** the watch needs an address with a certificate it trusts. Without one, it still plays its books anywhere, and syncs only at home.

## More

The [Wear OS guide](https://docs.audiosilo.app/users/listening/wear-os) covers every screen and message. [AudioSilo on Apple Watch](/blog/apple-watch/) is the same idea for the iPhone, [Listening sync](/blog/listening-sync/) explains how devices agree on your place, and [Listen away from home](/blog/listen-away-from-home/) covers reaching your server outside your network.
