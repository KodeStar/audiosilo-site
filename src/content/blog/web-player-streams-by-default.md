---
title: "The web player no longer downloads the books you play on its own"
description: From server 2.5.1, the web player streams a book you start instead of also saving all of it to the browser. Automatic downloads are one setting away if you want them.
kind: feature
published: 2026-10-30
verified: 2026-10-30
appliesTo: Server 2.5.1 with its bundled web player
tags: [player, downloads, offline, performance]
covers:
  - app:downloads
  - app:settings
  - server:web_player
  - docs:/users/listening/offline-downloads
  - docs:/users/listening/settings
related:
  - player-tips
  - listen-away-from-home
  - server-2-5
draft: true
---

From **server 2.5.1**, the web player streams the book you play and leaves it at that. Before, starting a book in a browser also downloaded the whole of it into the browser's storage, alongside the stream, unless you had changed a setting. Now **Download automatically** starts at **Never** in the web player. The iPhone, iPad and Android apps are unchanged.

## Why it changed

The web player had the same default as the apps: **On Wi-Fi**. In an app that does what it says, because a phone knows whether it is on Wi-Fi or mobile data. A browser can't tell, so in the web player On Wi-Fi meant every connection. Pressing play on a book downloaded all of it, which for one LibriVox book we tried was 190 MB, while you were only listening to the first chapter. On a laptop tethered to a phone, or on a slow line, that is data and bandwidth you didn't ask to spend.

Streaming needs none of it: the book plays from your server as you listen, and your place is saved to the server the same way.

## What happens to your setting

- **A browser that was on the old default, On Wi-Fi,** is switched to **Never** once, the first time it opens the 2.5.1 web player.
- **If you had chosen Always,** it stays Always.
- **If you had set Keep the next books ready** to 1, 2 or 3, your On Wi-Fi stays: that says you meant to keep books offline in that browser.
- **The apps keep their own setting.** They still start at On Wi-Fi, and nothing about them changes.

Settings are kept per device, so each browser you use makes this change on its own.

## Turning automatic downloads back on

If you want the web player to keep the books you play, open the **Downloads** page and choose **On Wi-Fi** or **Always** under **Automatic downloads**. The same setting is in **Settings > Up next and downloads**. In a browser both choices download on any connection, and the card says so.

You can still download a single book by hand with the download button on its page, whatever this setting says. Downloads in a browser need a secure (`https://`) connection to your server.

## Smoother while a download runs

The same change makes a download less work for the browser. A book's menu and download button used to redraw several times a second while its progress ticked; now only the progress ring and bar move.

The docs have the details: [Automatic downloads](https://docs.audiosilo.app/users/listening/offline-downloads#automatic-downloads), [Downloads in a web browser](https://docs.audiosilo.app/users/listening/offline-downloads#downloads-in-a-web-browser) and [Up next and downloads](https://docs.audiosilo.app/users/listening/settings#up-next-and-downloads) in Settings.
