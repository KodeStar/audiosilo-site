---
title: "The web player no longer downloads the books you play on its own"
description: From server 2.5.1, the web player streams a book you start instead of also saving all of it to the browser. Automatic downloads are one setting away if you want them.
kind: feature
published: 2026-10-30
updated: 2026-11-10
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
draft: false
revisions:
  - date: 2026-11-10
    note: "Rewritten to be shorter and easier to read. No facts changed."
---

From **server 2.5.1**, the web player streams the book you play and stops there. **Download automatically** now starts at **Never** in the web player. The iPhone, iPad and Android apps are unchanged.

## Why it changed

Before, starting a book in a browser also downloaded all of it, alongside the stream. The default was **On Wi-Fi**, the same as the apps.

A phone knows whether it's on Wi-Fi. A browser can't tell, so On Wi-Fi meant every connection. For one LibriVox book we tried, pressing play downloaded 190 MB while you listened to chapter one. On a tethered laptop or a slow line, that's data you didn't ask to spend.

Streaming needs none of it. The book plays from your server, and your place is saved the same way.

## What happens to your setting

| Your setting before | After 2.5.1 |
|---|---|
| **On Wi-Fi** (the old default) | Switched to **Never**, once |
| **Always** | Stays Always |
| On Wi-Fi with **Keep the next books ready** at 1, 2 or 3 | Stays On Wi-Fi |
| The apps | Unchanged: they still start at On Wi-Fi |

Settings are per device, so each browser makes this change the first time it opens the 2.5.1 web player.

## Turning automatic downloads back on

1. Open the **Downloads** page.
2. Under **Automatic downloads**, choose **On Wi-Fi** or **Always**.

The same setting is in **Settings > Up next and downloads**. In a browser both choices download on any connection, and the card says so.

## Good to know

- You can still download one book by hand with the download button on its page.
- Downloads in a browser need a secure (`https://`) connection to your server.
- Downloads are also lighter on the browser now: only the progress ring and the size redraw as a download runs.

The docs have the details: [Automatic downloads](https://docs.audiosilo.app/users/listening/offline-downloads#automatic-downloads), [Downloads in a web browser](https://docs.audiosilo.app/users/listening/offline-downloads#downloads-in-a-web-browser) and [Up next and downloads](https://docs.audiosilo.app/users/listening/settings#up-next-and-downloads).
