---
title: LibriVox joins AudioSilo's community metadata
description: LibriVox recordings, readers and sections now join AudioSilo's community catalogue. What server owners can use today, and which player features are planned.
kind: feature
published: 2026-11-07
updated: 2026-11-10
verified: 2026-11-07
appliesTo: Community metadata; Server 2.6.0
tags: [librivox, metadata, matching, community]
covers:
  - meta:librivox
  - server:metadata
  - server:match
  - server:metadata-mirror
  - docs:/users/admin/books
  - docs:/users/admin/server
  - docs:/developers/meta/api
related:
  - smarter-bulk-matching
  - fix-covers-and-series
  - m4b-vs-mp3-audiobooks
  - organize-audiobook-folders
revisions:
  - date: 2026-11-10
    note: "Rewritten to be shorter and easier to read. No facts changed."
---

LibriVox recordings are now in AudioSilo's community metadata database at [meta.audiosilo.app](https://meta.audiosilo.app). As checked on 7 November, it holds **21,851 LibriVox recordings**. If you have LibriVox books on your server, you can match them in the admin console today.

[LibriVox](https://librivox.org/pages/about-librivox/) is a volunteer project that records books and gives the audio away free. Its readers record in many languages, and the Internet Archive hosts the audio. LibriVox follows US public-domain rules; its [public-domain page](https://librivox.org/pages/public-domain/) explains what that means elsewhere.

## What is in the catalogue

Each recording brings its facts: title, authors, reader credits, language, running time, translators where recorded, and links to the LibriVox project and audio files. Different readings of the same book stay separate, so you can tell which readers and running time are yours.

| The current data | Count |
|---|---|
| Reader records | 14,692 |
| Sections stored as chapters | 496,659 |

A section might be a chapter, a poem or a story in a collection. Each holds its title and timings, with audio links where supplied. When the source has unusable timings, a recording can be present without a chapter list.

### Where the numbers come from

The import started from a snapshot of **22,449 projects**, fetched on 27 October and imported in eleven reviewed batches. The first completed pass, checked on 30 October, held **21,566 recordings**. The rest were accounted for:

| Not imported in the first pass | Projects |
|---|---|
| Still in progress | 581 |
| Held for a decision about their match | 283 |
| Without a reader | 12 |
| Unrecognised language | 5 |
| Without an author | 2 |

Later reviewed imports and matching decisions brought the total to 21,851. That counts the snapshot; it doesn't claim every new LibriVox project is here.

## Using it with books on your server

On server 2.6.0, with **Look up community metadata** on:

1. Open a book in the admin console and choose **Match with community metadata**.
2. Search for its title and author.
3. Choose the candidate and reading that fit, then **Compare fields**.
4. Take the title, author, narrator and other offered details, and the cover where there is one.

Check the readers and running time before accepting, especially for a classic with several recordings.

The search works online and with **Keep a local copy**, once that copy includes the LibriVox data. With a ready local copy, the server answers itself. If the copy is unavailable or a local request fails, it can fall back to the online service.

Server 2.6.0 also remembers which work and recording you matched, even without an ASIN or ISBN. With nothing ticked, **Match to this work** just records the match, so later match runs skip the book ([how 2.6 matches](/blog/smarter-bulk-matching/)).

### The limit, for now

The player's About panel and the community chapter check still look a recording up by its ASIN or ISBN. So for a LibriVox book without one, the match doesn't yet bring community details or the section list into the player.

The [matching guide](/blog/fix-covers-and-series/) covers the field comparison. [Community metadata](https://docs.audiosilo.app/users/admin/server#community-metadata) explains the online and local-copy settings.

## Licensing

AudioSilo normally keeps catalogue imports bounded. Its [licensing policy](https://github.com/KodeStar/audiosilo-meta/blob/main/LICENSING.md#the-public-domain-exception-librivox) makes a public-domain exception for the LibriVox catalogue alone, in every language.

- The imported facts are **CC0-1.0**.
- Project descriptions are left out, since they can quote other sources.
- Audio and cover art stay on archive.org; the database keeps links.
- Community characters and recaps remain **CC BY-SA 4.0**.

## For developers

The metadata API can search for works with LibriVox recordings, look up a project number, or serve a LibriVox-shaped feed. The [API reference](https://docs.audiosilo.app/developers/meta/api) documents the fields, the differences from LibriVox's feed and the request limits. For a whole copy, use the [published data download](https://github.com/KodeStar/audiosilo-meta/releases) rather than paging through the API.

## What is planned next

These are plans, with no promised delivery date:

- **Daily LibriVox updates.** Today's catalogue comes from the October snapshot and reviewed follow-up imports.
- **In v2.7.0:** an **Also free on LibriVox** link on a book, and an **Add from LibriVox** action, with the Bridge downloading the files into a library.
- **Later:** listening to LibriVox in a standalone player without an AudioSilo server, subject to that player's validation work.

The recordings exist because LibriVox's volunteers give their time to reading, checking and coordinating them. Thank you to all of them. You can [listen and find out about volunteering at LibriVox](https://librivox.org/pages/about-librivox/). To store and play its downloads, see [organising audiobook folders](/blog/organize-audiobook-folders/) and [M4B vs MP3](/blog/m4b-vs-mp3-audiobooks/).
