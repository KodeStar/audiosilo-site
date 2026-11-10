---
title: "AudioSilo Server 2.1 and 2.2: community chapters, books in several series, covers"
description: Community chapter lists fitted onto your own audio, books that belong to more than one series, community covers in the web player, and a dismissible support card.
kind: release
published: 2026-10-09
updated: 2026-11-10
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
revisions:
  - date: 2026-11-10
    note: "Rewritten to be shorter and easier to read. No facts changed."
hero: ../../assets/stills/server-series-dark.webp
heroAlt: Series in the AudioSilo admin console, a complete shelf of seven spines and a series with books 2 to 4 missing
---

Two server releases landed on 9 October. **2.1.0** fits community chapter lists onto your own audio and lets a book be in more than one series. **2.2.0** brings community covers to the web player and a support card for admins.

Both are additive for the players, so every existing iOS, Android and web player keeps working.

## How to update

1. Back up your data folder. 2.1.0 runs five database migrations and 2.2.0 one, on first start.
2. Run `docker compose pull && docker compose up -d`, or install the new binary from [GitHub Releases](https://github.com/KodeStar/audiosilo-server/releases).

## Server 2.1.0

### Community chapters

A book matched to the community database now gets its recording's chapter list **fitted onto your own audio**. Each chapter is placed by its title and time, then snapped to the pause it starts in, so trimmed intros and drift still line up.

- A book with **no chapters of its own** (none, or one per file) gets the community's automatically.
- A book with only **broad chapters** is offered the detailed ones on its Chapters card. Health lists them under "More detailed chapters available".
- Players show "Chapters from the AudioSilo community database" under such a book's chapters.

### Books in more than one series

Guards! Guards! is Discworld #8 and City Watch #1. Edit a book's extra series under **Other series** on its Details card, and community matches fill them in. The console numbers each book by its place in each series, and the web player shows it on each series' page.

### People and sorting

- Co-credits count for each person: "Michael Kramer, Kate Reading" is two narrators.
- Library > Books sorts by **Release date** and **Author surname**. Release dates also come from the files' date tags when there's no community date.

### Series spines and clearing matches

- The admin Series shelf shows **spines in their covers' colours**, sized by each book's length.
- **Clear community matches** (Settings > Community metadata > Danger zone) undoes every community match in a library, or all of them, so books can be matched afresh. Your own edits and uploaded covers stay.

## Server 2.2.0

### Community covers in the web player

Community covers (the Series tab's rail and "Previous books" in Recaps and Characters) used to show as empty boxes in the web player. The server now fetches them and hands the player a thumbnail, so **the player only ever talks to your server**. Only covers the community data names for that book are fetched.

### A support card, dismissed on trust

After a month or so, admins see one small card on the Overview: AudioSilo is free, and you can sponsor its development. **I've donated** hides it for good, **Not now** for six months. Nothing is checked or unlocked, and it never appears in the apps or the web player.

## Fixes

- A book directly under its author's folder (`Author/Book`) no longer takes the author's name as its series. The next scan puts existing books right.
- **Year in listening** counts each finished book once, so books finished and books listened to always agree.
- **Listening now** names the chapter instead of showing raw tags like "024".
- **Match** opens with what the folders say when a book's title and author tags are swapped or junk.
- In the web player, the "Back to" chip shows after a seek-bar click, and "Just met" characters appear as the chapter starts.

## Good to know

- When a community chapter list doesn't fit (another edition, a chapter crossing two files), the Chapters card says why.
- If you had run **Match automatically** with "Fill in what's missing" on a library with `Author/Book` folders, re-match those books, or clear that library's community matches and run it again. The release notes explain why.

The full notes: [v2.1.0](https://github.com/KodeStar/audiosilo-server/releases/tag/v2.1.0) and [v2.2.0](https://github.com/KodeStar/audiosilo-server/releases/tag/v2.2.0).
