---
title: "AudioSilo player tips: 14 features worth knowing"
description: Undo an accidental jump, let the sleep timer fade out and mark where you dozed off, keep the next books downloaded, set your skip lengths, export your bookmarks and more.
kind: tip
published: 2026-10-16
updated: 2026-11-10
verified: 2026-10-24
appliesTo: App 2.0.0 (iPhone, iPad, Android); web player in server 2.0 and later
tags: [player, tips, sleep-timer, offline]
covers:
  - app:full-player
  - app:sleep-timer
  - app:downloads
  - app:settings
  - app:journal
  - app:up-next
  - app:search
  - app:year-in-listening
  - app:web-shortcuts
  - server:annotations
  - server:queue
  - server:addresses
  - docs:/users/listening/full-player
  - docs:/users/listening/sleep-timer
  - docs:/users/listening/offline-downloads
related:
  - audiosilo-2-0
  - pair-your-phone
  - m4b-vs-mp3-audiobooks
  - web-player-streams-by-default
revisions:
  - date: 2026-11-10
    note: "Rewritten to be shorter and easier to read. No facts changed."
  - date: 2026-10-30
    note: "Server 2.5.1: in the web player, Download automatically now starts at Never."
hero: ../../assets/stills/player-mobile-player-whoswho-dark.webp
heroAlt: Who's who over the AudioSilo player on a phone, two characters marked Just met, then the people met so far
---

These are the AudioSilo player features worth knowing: the ones built for listening half asleep, in the car or in ten-minute gaps. Everything is in the iPhone, iPad and Android apps (2.0.0) and the web player, unless it says otherwise. Try them in the [live demo](https://demo.audiosilo.app/web/demo).

## 1. Undo a jump

After any jump of more than a minute, a **Back to** chip appears for a few seconds. Tap it to go back.

## 2. See the time left at your speed

Home, the player and the book page show time left **at your speed** ("5h 12m left at 1.25x"). Home also shows when you'll finish at your current pace. Speed runs from 0.5x to 2x in 0.05 steps and is remembered **per book**. Set the starting speed in Settings > Playback > **Default speed**.

## 3. Use the whole-book timeline

The full player's main seek bar covers the **current chapter**, so even a 30-hour book gives fine control. A slim **timeline** under it shows the whole book, with chapters as segments and bookmarks and notes as pins.

## 4. Stop at the end of a chapter

The sleep timer stops after 5 to 60 minutes, at the end of **this chapter or a later one**, or at the end of the book.

## 5. Let the sleep timer fade out

A minutes timer **fades the volume out** over its last 30 seconds. Still awake? Tap **Keep listening**, or in the phone apps **shake the phone** during those 30 seconds (or just after) to restart it. Shake extends; it never cancels. If bumps in bed keep the book going, set **Shake sensitivity** to Low in Settings.

## 6. Jump back to where you dozed off

When the sleep timer stops a book, it leaves a **Fell asleep** bookmark. The next day the Journal offers "You drifted off around 23:41. Jump back 4 minutes?".

## 7. Turn on the automatic sleep timer

Settings > Sleep > **Auto sleep timer** starts a timer for playback that begins in a window you choose (10 PM to 6 AM by default). It's off until you turn it on.

## 8. Set your skip lengths and auto-rewind

In Settings > Playback:

| Setting | Range | Default |
|---|---|---|
| **Skip back** | 5 to 120 seconds | 15 |
| **Skip forward** | 5 to 120 seconds | 30 |
| **Auto-rewind on resume** | up to 30 seconds | 5 |

## 9. Give unchaptered books chapters

A long file with no chapter marks gets virtual chapters every 30 minutes. Set the length from 5 to 60 minutes in Settings > Playback > **Chapter length (unchaptered)**.

## 10. Keep the next books downloaded

On the Downloads page:

- **Download automatically**: Never, **On Wi-Fi** or Always. The apps start at On Wi-Fi. From server 2.5.1 the web player starts at Never, since a browser can't tell Wi-Fi from mobile data ([why](/blog/web-player-streams-by-default/)).
- **Keep the next books ready** keeps up to three of your next books (Up next first, then your series) on the device, always leaving free space.
- **Remove a download when you finish the book** clears space as you go (on by default).

The web player downloads too, over HTTPS. Offline progress syncs when you're back online.

## 11. Line up books in Up next

Up next is a queue you can drag to reorder, with suggestions to carry on a series. It's saved on your server, so it follows you between devices.

## 12. Label your bookmarks, and export them

Bookmarks can carry a label (Quote, Favourite, Re-listen, Funny, Question) and a note. Notes can be pinned to a moment. The **Journal** gathers your diary, bookmarks and notes from every book, searchable, and exports them to **Markdown** or **CSV**.

## 13. Search for a character you've met

Search finds books, authors, series, narrators and **characters you've already met**, never ahead of your place. For books with community data, the full player's **Who's who** and **Story so far** do the same while you listen. Community recaps and characters exist for a minority of books so far.

## 14. In the web player: keyboard shortcuts and quick search

Press `?` for the keyboard shortcuts. **⌘K** (Ctrl+K on Windows and Linux) opens quick search, which also runs actions like pause, sleep in 30 minutes or open the full player.

## Good to know

- **Safari on iPhone and iPad** can't fade audio from a web page, so the sleep fade isn't audible in the web player there. The apps fade everywhere.
- **Home and away:** if your server has a home and a public address, the apps switch between them on their own. Your admin sets this once; see [Listen away from home](/blog/listen-away-from-home/).

More in the [player guide](https://docs.audiosilo.app/users/listening/full-player) in the docs.
