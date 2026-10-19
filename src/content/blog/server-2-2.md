---
title: "AudioSilo Server 2.1 and 2.2: community chapters, books in several series, covers"
description: Community chapter lists fitted onto your own audio, books that belong to more than one series, community covers in the web player, and a dismissible support card.
kind: release
published: 2026-10-09
verified: 2026-10-19
appliesTo: Server 2.1.0 and 2.2.0
tags: [release, server, metadata, chapters]
covers:
  - server:chapters
  - server:series_memberships
  - server:meta_covers
  - server:metadata
  - server:support-card
  - docs:/users/admin/books
related:
  - server-2-3
  - fix-covers-and-series
  - m4b-vs-mp3-audiobooks
supersededBy: server-2-3
supersededNote: Server 2.3 is out, with household members, Listening in the house, Chromecast, a local copy of the community metadata and Audiobookshelf's metadata.json. Everything below still applies.
hero: ../../assets/stills/server-series-dark.webp
heroAlt: Series in the AudioSilo admin console, a complete shelf of seven spines and a series with books 2 to 4 missing
---

Two server releases landed on 9 October: **2.1.0**, with community chapters and books in more than one series, and **2.2.0**, which brings community covers to the web player and a support card for admins. Both are additive for the players, so every existing iOS, Android and web player keeps working.

Update with `docker compose pull && docker compose up -d`, or the new binary from [GitHub Releases](https://github.com/KodeStar/audiosilo-server/releases). Back up your data folder first: 2.1.0 runs five database migrations and 2.2.0 one, on first start.

## Server 2.1.0

### Community chapters

A book matched to the community database is now checked against its recording's chapter list, and the list is **fitted onto your own audio**: each chapter is placed by its title and time, then snapped to the pause it starts in, so trimmed intros, a missing preview and drift across the book still line up.

- A book with **no chapters of its own** (none, or one per file) gets the community's automatically.
- A book with only **broad chapters** is offered the detailed ones on its Chapters card, and Health lists them under "More detailed chapters available".
- When a list doesn't fit (another edition, a chapter crossing two files), the card says why.
- Players show "Chapters from the AudioSilo community database" under such a book's chapters.

### Books in more than one series

Guards! Guards! is Discworld #8 and City Watch #1. A book can now be in several series: edit the extra ones under **Other series** on the book's Details card, and community matches fill them in. The admin console numbers each book by its place in each series, and the web player shows a book on each of its series' pages.

### People and sorting

- Co-credits count for each person: "Michael Kramer, Kate Reading" is two narrators.
- Library > Books sorts by **Release date** and **Author surname**, and release dates also come from the files' date tags when there's no community date.

### Also in 2.1.0

- **Series spines in their covers' colours** on the admin Series shelf, sized by each book's length.
- **Clear community matches** (Settings > Community metadata > Danger zone) undoes every community match in a library, or all of them, so books can be matched afresh. Your own edits and uploaded covers stay.
- A book directly under its author's folder (`Author/Book`) no longer takes the author's name as its series. The next scan puts existing books right. If you had run **Match automatically** with "Fill in what's missing" on such a library, re-match those books or clear that library's community matches and run it again: the release notes explain why.

## Server 2.2.0

### Community covers in the web player

Covers from the community database (the Series tab's rail and "Previous books" in Recaps and Characters) used to show as empty boxes in the web player, blocked by its security policy. The server now fetches them and hands the player a thumbnail, so **the player only ever talks to your server** and listeners' browsers never contact the cover hosts. Only covers the community data names for that book are fetched.

### A support card, dismissed on trust

After a month or so of use, admins see one small card on the Overview: AudioSilo is free, and if it's earning its keep you can sponsor its development. **I've donated** hides it for good, **Not now** for six months. Nothing is checked and nothing is unlocked. It never appears in the apps or the web player.

### Fixes

- **Year in listening** counts each finished book once, so books finished and books listened to always agree.
- **Listening now** names the chapter instead of showing raw tags like "024".
- **Match** opens with what the folders say when a book's title and author tags are swapped or junk.
- In the web player, the "Back to" chip now shows after a seek-bar click, and "Just met" characters appear as the chapter starts.

The full notes: [v2.1.0](https://github.com/KodeStar/audiosilo-server/releases/tag/v2.1.0) and [v2.2.0](https://github.com/KodeStar/audiosilo-server/releases/tag/v2.2.0).
