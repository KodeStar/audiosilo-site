---
title: LibriVox joins AudioSilo's community metadata
description: LibriVox recordings, readers and sections now join AudioSilo's community catalogue. What server owners can use today, and which player features are planned.
kind: feature
published: 2026-11-07
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
---

LibriVox recordings are now in AudioSilo's community metadata database at [meta.audiosilo.app](https://meta.audiosilo.app). As checked on 7 November, the catalogue holds **21,851 LibriVox recordings**. If you already have LibriVox books on your server, their readings can appear when you search for community metadata in the admin console, ready to compare with your files.

[LibriVox](https://librivox.org/pages/about-librivox/) is a volunteer project that records books and makes the audio available for free. Its readers record in many languages, and the Internet Archive hosts the audio. LibriVox uses US public-domain rules for its texts and recordings; its [public-domain page](https://librivox.org/pages/public-domain/) explains what that means for listeners elsewhere.

## What is in the catalogue

The import brings the facts about each recording: title, authors, reader credits, language, running time, translators where recorded, and links to the LibriVox project and its audio files. Different readings of the same book stay separate recordings, so you can tell which readers and running time belong to yours.

The current data includes **14,692 reader records** and **496,659 sections stored as chapters**. A LibriVox section might be a chapter, a poem or a story in a collection. The chapter entries hold their titles and timings, with audio links where supplied. When the source has unusable timings, a recording can be present without a chapter list.

This started with a snapshot of **22,449 projects**, fetched on 27 October and imported in eleven reviewed batches. The first completed pass, checked on 30 October, held **21,566 recordings**. The remaining projects were accounted for: 581 still in progress, 283 held for a decision about their match, 12 without a reader, five with an unrecognised language and two without an author. Later reviewed imports and matching decisions brought the total to 21,851. That is a count of the imported snapshot, not a claim that every new LibriVox project is already here.

## Using it with books on your server

On the 2.6.0 server, with **Look up community metadata** on, open a book in the admin console and choose **Match with community metadata**. Search for its title and author, choose the candidate and reading that fit, then **Compare fields**. You can take the title, author, narrator and other offered details, and the cover where one is available. Check the readers and running time before accepting, especially for a classic with several recordings.

The same search works in online mode and with **Keep a local copy**, once that copy has updated to include the LibriVox data. With a ready local copy, the server answers the search itself. While the copy is unavailable or a local request fails, it can fall back to the online service.

Server 2.6.0 also remembers which community work and recording you matched a book to, even when it has no ASIN or ISBN. With nothing ticked, **Match to this work** records just the match, so the book counts as matched and later match runs skip it ([how 2.6 matches](/blog/smarter-bulk-matching/)).

There is a limit to this first step. The player's About panel and the community chapter check still look a recording up by its ASIN or ISBN. So for a LibriVox book without one, the match doesn't yet bring its community details or its section list into the player. The [matching guide](/blog/fix-covers-and-series/) covers the field comparison, and [Community metadata](https://docs.audiosilo.app/users/admin/server#community-metadata) explains the online and local-copy settings.

## Facts, with a separate licence from the audio

AudioSilo normally keeps catalogue imports bounded. Its [licensing policy](https://github.com/KodeStar/audiosilo-meta/blob/main/LICENSING.md#the-public-domain-exception-librivox) makes a named public-domain exception for the LibriVox catalogue, across all languages. That exception applies to LibriVox alone.

The imported factual metadata is **CC0-1.0**. Project descriptions are left out under the facts-only policy, since they can contain text quoted from other sources. Audio and cover art stay on archive.org; the database keeps links. The separately written community characters and recaps remain **CC BY-SA 4.0**.

Developers can search the metadata API for works with LibriVox recordings, look up a project number, or use its LibriVox-shaped feed. The [API reference](https://docs.audiosilo.app/developers/meta/api) documents the fields, differences from LibriVox's feed and request limits. For a whole-database copy, use the [published data download](https://github.com/KodeStar/audiosilo-meta/releases) rather than paging through the API.

## What is planned next

Daily LibriVox updates are still **planned**. The catalogue described here comes from the October snapshot and reviewed follow-up imports.

The server and player work planned for **v2.7.0** includes an **Also free on LibriVox** link on a book and an **Add from LibriVox** action, with the Bridge downloading the files into a library. Listening to LibriVox in a standalone player without an AudioSilo server is planned later, subject to the standalone player's validation work. These are plans, with no promised delivery date.

The recordings exist because LibriVox's volunteers give their time to reading, checking and coordinating them. Thank you to everyone who makes that library possible. You can [listen and find out about volunteering at LibriVox](https://librivox.org/pages/about-librivox/). If you already keep its downloads in your library, [organising audiobook folders](/blog/organize-audiobook-folders/) and [M4B vs MP3](/blog/m4b-vs-mp3-audiobooks/) cover how to store and play them.
