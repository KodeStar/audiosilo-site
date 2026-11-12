---
title: "AudioSilo on Apple Watch: leave the phone at home, take a book with you"
description: "AudioSilo's Apple Watch app plays books downloaded to the watch, signs in from your iPhone and syncs your listening with your server."
kind: feature
published: 2026-11-08
updated: 2026-11-10
verified: 2026-11-08
appliesTo: Server 2.6.0 with ffmpeg, iPhone app 2.6.0, watchOS 11
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
  - wear-os
  - server-2-6
  - listening-sync
  - listen-away-from-home
  - pair-your-phone
revisions:
  - date: 2026-11-10
    note: "Rewritten to be shorter and easier to read. No facts changed."
---

AudioSilo's Apple Watch app plays books downloaded to the watch, so you can run with headphones and leave the phone at home. Your iPhone signs the watch in and sends it books. What you hear on the watch goes back to your server for your place, history and stats.

## What it needs

- **An iPhone with AudioSilo 2.6.0 or later**, and an Apple Watch paired to it on **watchOS 11 or later**. The watch app comes with the iPhone app.
- **A server on 2.6.0 or later, with ffmpeg**, which makes the smaller copy of each book a watch plays. The Docker image includes ffmpeg; the [Transcoding](https://docs.audiosilo.app/users/admin/server#transcoding) settings show whether yours has it.
- Headphones, unless you want everyone nearby to hear your book.

## Setting it up

1. On your iPhone, open the **Watch** app and install AudioSilo on your watch.
2. In AudioSilo on the iPhone, open your account page for the server.
3. On the **Apple Watch** card, choose **Set up Apple Watch**.
4. Open AudioSilo on the watch to finish. There's no password to type.

The sign-in lasts ten minutes. If the watch doesn't take it in time, choose **Send again**.

The watch has its own sign-in and talks to your server directly. Setting it up on the same network as the server is the surest start.

## Put a book on the watch before you go

1. On your iPhone, choose **Send to watch** in a book's menu or under **More** on its page. Or, on the watch, open **Continue listening** and choose **Download** beside a book you've started.
2. Open AudioSilo on the watch. That's when preparing and downloading start.
3. Wait until the book shows under **On this watch**, with its size, before you set out.

The first time a watch asks for a book, the server makes the watch's copy: about 430 MB for a 20-hour book. A long one can take a while. It carries on with your wrist down, and the watch checks on it whenever the app is open. A book sent while the watch app is closed can take a few minutes to arrive.

On the iPhone, **Downloads** has an **On your Apple Watch** section. It lists the books you've sent and the ones the watch holds, with their progress. **Remove** takes a book off the watch, after asking. These rows can lag behind the watch's own screen. Finished books stay on the watch until you remove them.

## Listening, and getting your place back

The watch player has:

- the chapter and the time left in it
- back 15 and forward 30 seconds
- previous and next chapter, and a chapter list
- speed and a sleep timer

Before a book plays, the watch asks your server for your place if it can reach it. If another device is elsewhere in the book, it offers **Jump there** or **Stay here**, like the other apps.

What you hear is kept on the watch, with the time you heard it, until your server has it. So it lands on the right day in your history and stats. The watch sends it:

- when you open the app
- when you stop
- about once a minute while the app is open and anything is waiting

As you leave the app, it hands what's waiting to watchOS to send through your away address when a network appears. When that happens is up to watchOS. **Opening the app is the sure way to send it.** The watch's **Sync** page shows what's waiting, with **Sync now**.

## A small companion

The watch holds **one account on one server** and plays **books**. It lists Continue listening and the books on it.

It doesn't have:

- library browsing or podcasts
- bookmarks, notes, the ebook, read-along or casting (these stay on your other devices)
- languages other than English, for now

Kids' accounts and demos don't offer it. There's no Wear OS app.

## Good to know: connecting

- **At home with a self-signed certificate,** the watch uses the server's plain HTTP home address. That address must be an IP address, a `.local` name or a single word like `audiosilo`. A name like `nas.lan` doesn't work.
- **Away from home,** the watch needs an address with a certificate it trusts, as the phone apps do. It can't click through a certificate warning.
- **Without one,** it still plays its downloaded books anywhere, and syncs when you open it at home.

The docs explain [a self-signed server](https://docs.audiosilo.app/users/listening/apple-watch#a-self-signed-server).

## More

The [Apple Watch guide](https://docs.audiosilo.app/users/listening/apple-watch) covers every screen and message. [Listening sync](/blog/listening-sync/) explains how devices agree on your place, [Listen away from home](/blog/listen-away-from-home/) covers reaching your server outside your network, and [AudioSilo 2.6](/blog/server-2-6/) has the rest of the release.
