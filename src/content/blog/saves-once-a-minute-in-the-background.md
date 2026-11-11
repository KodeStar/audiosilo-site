---
title: "The player saves once a minute in the background, and stops redrawing off screen"
description: "In AudioSilo 2.7, a phone in your pocket sends your place once a minute, not every 15 seconds. In our test that used about a quarter of the mobile data."
kind: feature
published: 2026-11-11
verified: 2026-11-11
appliesTo: App 2.7.0 and the web player in server 2.7.0 (not released yet)
tags: [player, sync, battery, mobile-data, downloads]
covers:
  - app:playback
  - app:save-pace
  - app:listening_sync
  - app:downloads
  - app:web-player
  - app:household
  - server:progress
  - server:listening_sync
  - server:sessions
  - docs:/users/listening/playback
  - docs:/users/listening/in-the-house
  - docs:/users/admin/activity
  - docs:/developers/frontend/playback
  - docs:/developers/frontend/state-and-data
related:
  - listening-sync
  - audiobook-progress-not-syncing
  - one-tab-plays-at-a-time
  - player-tips
draft: true
---

When the app is in the background, or the book is downloaded, AudioSilo 2.7.0 sends your place to the server once a minute instead of every 15 seconds. The device still keeps its own record every 15 seconds, and the slower send loses no listening. And with the screen off, the player no longer redraws its seek bar and times every second.

Both changes are in the app and the web player. They need no setting and work with any server.

## When the player saves

| While a book plays | Sent to the server |
|---|---|
| App in front, streaming | every 15 seconds, as before |
| App in the background: phone locked, another app in front, or the browser tab hidden | every minute |
| A downloaded book, app in front or not | every minute |

Some moments still save at once, whatever the pace:

- a pause, a stop or the end of the book;
- a seek, a chapter skip or a speed change;
- the app leaving the front;
- in the web player, another tab taking over.

When you bring the app back, a save that is due goes straight away.

## Why once a minute

Streaming in front, the phone's radio is busy with the audio anyway. In the background, after the first part of the book is buffered, the saves are often the only traffic. At 15 seconds the radio never got more than 15 seconds of quiet.

We measured an iPhone on 4G, streaming for 15 minutes in the background, with the same build at each pace:

| | Every 15 seconds | Every minute (two runs) |
|---|---|---|
| Saves sent | 60 | 15 and 15 |
| Mobile data | 118 KB | 31 KB |
| Share of time rated high network impact | 37% | 8 to 11% |

On Wi-Fi, on a Pixel 6a, the pace made no measurable difference. We did not measure a battery percentage.

## What stays on the device

The device writes its own record of your place every 15 seconds, at every pace. That costs no network. It is what the app reads when you resume without a connection.

If the app is closed mid-book, by you or by the phone:

- On a server with listening sync, the next launch picks up the listening it left behind. You resume at most about 5 seconds of playing behind where you stopped, and that listening reaches your history, Journal and stats. In the web player, a page opened within 30 seconds of the close picks it up 30 seconds later.
- If you press play before the app has recovered it, or the server has no listening sync, you resume up to 15 seconds of playing behind.

## Other devices can be a minute behind

What waits is what the server holds. So while this phone is in the background, your other devices see your place up to a minute behind. So do the admin console's **Activity** pages and **Listening in the house**.

To pick up exactly where you stopped on another device, pause first. A pause saves at once.

## Off screen, no redraws

A player screen left open stayed mounted with the phone locked or the tab hidden. It redrew the seek bar, the times and the chapter list once a second.

Now, while the app is in the background, those ticks are not drawn. When you come back, the screen shows the live place at once. In a separate 15-minute test with the screen off, the app's JavaScript thread used 11.9 seconds of processor time, down from 49.6.

Everything that does not depend on the screen carries on as before:

- the lock screen and media controls, the car, widgets, the Live Activity, Cast and the watch;
- the next book starting on its own, the sleep timer ending on time, and stopping at the end of a chapter.

## Good to know

<!-- Remove this item if audiosilo-server#364 (a wider playing window on the server) ships in 2.7.0. -->
- The server counts a player as playing for a minute after its last save. So while a player saves once a minute, the admin console and **Listening in the house** may show it as paused for a moment before its next save arrives.
- On Android, a share sheet or a permission dialog counts as the background. The seek bar holds still behind it and catches up when you return.
- Casting a downloaded book with the app in front keeps the 15-second pace, because the Cast device streams from the server.

## More

The User Guide covers the save pace in [Your position follows you](https://docs.audiosilo.app/users/listening/playback#your-position-follows-you), and what others see in [See what others are listening to](https://docs.audiosilo.app/users/listening/in-the-house) and [See who is listening](https://docs.audiosilo.app/users/admin/activity). The developer docs explain [the periodic save's pace](https://docs.audiosilo.app/developers/frontend/playback#the-periodic-saves-pace), [what a kill leaves behind](https://docs.audiosilo.app/developers/frontend/playback#what-a-kill-leaves-behind) and [why a tick is not redrawn off screen](https://docs.audiosilo.app/developers/frontend/state-and-data#off-screen-a-tick-is-not-redrawn).
