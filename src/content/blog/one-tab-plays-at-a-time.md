---
title: "The web player: one tab plays at a time, and every tab keeps one place"
description: "In AudioSilo 2.7, starting a book in a second browser tab pauses the first. Your listening counts once, and the tab you go back to carries on where the other stopped."
kind: feature
published: 2026-11-11
verified: 2026-11-11
appliesTo: Server 2.7.0 with its bundled web player (not released yet)
tags: [player, web, sync, history]
covers:
  - server:web_player
  - app:web-player
  - app:playback
  - app:listening_sync
  - app:mark-finished
  - docs:/users/listening/playback
  - docs:/users/listening/full-player
  - docs:/developers/frontend/playback
  - docs:/developers/frontend/offline
related:
  - listening-sync
  - audiobook-progress-not-syncing
  - player-tips
draft: true
---

In the web player, only one tab plays at a time. Press play in a second tab and the first one pauses and says **Playing in another tab**. When you go back to the first tab, it carries on from where the second one got to.

This is new in the web player that comes with AudioSilo 2.7.0.

## Why it changed

Two tabs of the web player are one device to your server. Before 2.7.0, both could play at once. That caused two problems:

- Both tabs recorded the same minutes, so your history and stats counted them twice.
- Each tab saved its own place, so the place the server kept went back and forth between them.

Now one tab plays, its listening is recorded once, and the saved place no longer jumps between tabs.

## What you see

1. Start a book in one tab, then press play in another tab.
2. The first tab pauses. When you look at it, it shows **Playing in another tab**.
3. Press play in the first tab to take it back. The second tab pauses in turn.

The newest play wins. If you press play in two tabs at the same moment, exactly one of them keeps playing.

The rule is per account on a server, not per book. A second tab playing a different book from the same server still pauses the first.

## The tabs share one place

With the same book in two tabs, the tab you return to does not play from where it was left. It moves to where the other tab stopped:

- A paused tab you bring to the front shows the other tab's place straight away.
- When you press play, it starts at once and settles on the other tab's exact stop as soon as that tab reports it.
- If the move is more than a minute, the **Back to** button appears for a few seconds, the same one that follows any long jump.
- A seek you make yourself in the paused tab stands. The tab plays from your choice, not the other tab's place.

Your history shows one unbroken run of listening across both tabs, with nothing counted twice.

## Mark as finished and Undo with two tabs open

Tabs also share what is waiting to reach the server. So another tab may be sending a finish when you press **Undo** after **Mark as finished**.

Undo now waits for that send, then takes the finish back. The book ends up not finished, as you asked.

## What is not paused

- **Your other devices and the apps.** A phone or another computer keeps playing. Your place between devices works as before (see [Listening sync](/blog/listening-sync/)).
- **Another server or another account.** Tabs signed in to different servers, or different accounts, can play at once.
- **Another browser, a private window, or the same server at another address.** Each of these counts as another device, so its tab is not paused.

## Good to know

- A tab left open from before the update doesn't follow the new rule. Reload it once after your server moves to 2.7.0.
- Two windows side by side, both in view, behave the same way. The paused one shows the place it stopped at until you press play, then it moves to the other window's place.
- The apps on iPhone, iPad and Android have no tabs, so nothing changes there.

## More

The User Guide covers this under [Play a book: Good to know](https://docs.audiosilo.app/users/listening/playback#good-to-know), and the **Back to** button under [Undo a jump](https://docs.audiosilo.app/users/listening/full-player#undo-a-jump). For how the tabs agree, see [One tab plays at a time](https://docs.audiosilo.app/developers/frontend/playback#one-tab-plays-at-a-time-web) in the developer docs.
