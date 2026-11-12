---
title: "Download podcast episodes and listen offline"
description: "In AudioSilo 2.7, you can download a podcast episode to your phone, tablet or browser, like a book. It plays with no connection to your server."
kind: feature
published: 2026-11-12
verified: 2026-11-12
appliesTo: App 2.7.0 and the web player in server 2.7.0 (not released yet)
tags: [podcasts, downloads, offline, player]
covers:
  - app:podcasts
  - app:downloads
  - app:offline
  - app:settings
  - server:podcasts
  - server:podcast_fetch
  - docs:/users/listening/podcasts
  - docs:/users/listening/offline-downloads
  - docs:/users/listening/settings
  - docs:/users/admin/podcasts
  - docs:/users/troubleshooting
  - docs:/developers/frontend/podcasts
  - docs:/developers/frontend/offline
related:
  - podcasts
  - move-podcasts-with-opml
draft: true
---

You can now download a podcast episode for offline listening, the same way as a book. A downloaded episode plays from your device with no connection to your server. This works in the iOS and Android apps and in the web player.

Until 2.7.0, episodes could only stream from your server.

## Download an episode

To download an episode:

1. Open the episode's page, or the **...** menu on its row in the show.
2. Tap **Download for offline**.

When it's done, the line under the episode reads **On this device**.

If you download an episode while it's playing, the player moves onto the downloaded copy.

## An episode that isn't on your server yet

Some episodes say **Plays on demand**. Your server hasn't downloaded them yet. You can still download one to your device.

Your server fetches the episode first. Meanwhile the download reads **Getting it on your server**. When the server has it, the download to your device starts by itself.

Keep the app open on screen until it moves on. If you download several, a few are fetched at a time and the rest wait their turn. Book downloads carry on while an episode waits.

If the server can't get the episode, the download says why. Tap **Retry download** on the episode's page, or **Retry** on the Downloads page, to ask again.

## Find and remove your episodes

The **Downloads** page has a new **Podcast episodes** section. It lists the episodes on this device, each with its show.

To free the space, choose **Remove download**. You often won't need to. **Remove a download when you finish the book** now removes finished episodes too. It's on unless you turned it off, and your place is kept.

## Download every episode you start

A new setting, **Download podcast episodes when you start them**, downloads each episode as you start it. It's in [Settings](https://docs.audiosilo.app/users/listening/settings#up-next-and-downloads) and in the **Automatic downloads** card on the Downloads page.

- **Default**: off.
- **Network rule**: the same as for books, from the **Automatic downloads** picker (**On Wi-Fi** or **Always**).
- **With Automatic downloads at Never**: it does nothing.

The apps start **Automatic downloads** at **On Wi-Fi** and the web player at **Never**. So in the web player, turn on both. A browser can't tell Wi-Fi from mobile data, so there **On Wi-Fi** downloads on any connection.

**Keep the next books ready** still never downloads episodes.

## Good to know

- **Downloads belong to each device.** An episode on your phone isn't on your tablet.
- **In the car**, the **Downloads** tab lists your downloaded episodes beside your books.
- **The server's copy is separate.** If your admin's retention rules delete an episode from the server, your downloaded copy stays on your device.
- **Still no casting, Apple Watch or kids mode** for episodes, downloaded or not.
- **No automatic copies of new episodes yet.** AudioSilo doesn't keep the latest episodes of the shows you follow on your device. Download each one by hand, or turn on the setting above.

## More

The User Guide covers this in [Download an episode](https://docs.audiosilo.app/users/listening/podcasts#download-an-episode) and [Listen offline](https://docs.audiosilo.app/users/listening/offline-downloads). If a download stops, see [An episode download says the server couldn't get it](https://docs.audiosilo.app/users/troubleshooting#an-episode-download-says-the-server-couldnt-get-it). For podcasts in general, read [Podcasts in AudioSilo](/blog/podcasts/), and to bring your shows over from another app, see [How to move your podcast subscriptions with OPML](/blog/move-podcasts-with-opml/).
