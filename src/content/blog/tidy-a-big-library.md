---
title: "Tidying a big library: genres, tags, bulk edits and duplicates"
description: Server 2.4.0 gives books genres and tags you can filter by, makes selecting hundreds of books in the console quick, and finds copies of a book across libraries.
kind: feature
published: 2026-10-24
verified: 2026-10-24
appliesTo: Server 2.4.0, app 2.4.0
tags: [admin, library, metadata, player]
covers:
  - server:labels
  - server:bulk-edit
  - server:duplicates
  - server:admin_ui
  - app:library
  - app:book-page
  - docs:/users/admin/books
  - docs:/users/admin/health
  - docs:/users/listening/browsing
related:
  - fix-covers-and-series
  - admin-console-tour
  - organize-audiobook-folders
  - server-2-4
---

A library of a few dozen books looks after itself. A library of a few thousand needs tools: a way to group books beyond author and series, a way to change many at once, and a way to spot the same book in two places. Server 2.4.0 adds all three to the admin console, and the player picks up the first.

## Genres and tags

Every book now has **Genres** and **Tags**, shown as chips on its page in the console. Genres come from the audio files' *genre* tag (a genre that only says something like "Audiobook" or "Spoken Word" is left out) and from an Audiobookshelf `metadata.json`. Tags are yours: they come from a `metadata.json` or your own edits, so use them however suits your household, such as "Owned", "Read with the kids" or "Book club".

To edit them, click the chips on a book's page, type a label and press Enter or a comma (pasting "Fantasy, Epic" adds both). Capitals don't split a label: "Sci-Fi" and "sci-fi" are one tag. Books indexed before your server could read genres get them on the next scan, without a full re-index. The console's **Books** filters gain **Genre** and **Tag** groups too.

The same release adds a book's **Subtitle**, **Publisher**, **Language** and **Abridged** to its details, each marked with where the value came from like the other fields.

In the player, a book's page shows its genres and tags as chips, and tapping one opens the Library filtered to it. The Library's Books gain **Genre** and **Tag** filters, each listing how many books it would show, and search finds books by genre and tag too. That's in the **web player bundled with your server** (`/web`) and in **app 2.4.0**: until app 2.4.0 reaches your device, use the web player to browse by genre and tag. The [Server 2.4 release post](/blog/server-2-4/) has the rest of what's new.

## Changing many books at once

The console's **Books** list could already edit a selection in bulk. Getting a large selection together is quicker now:

- **Select**, in the toolbar, starts picking without ticking a first book, and **Done** ends it.
- **Shift-click** a tile or a row to select every book between it and the last one you clicked, in the cover grid and in the table.
- While picking, **Select all N books** takes every book shown (it reads **Select the N books shown** while more are still to load). When a filter matches more books than are loaded, **Select all N matching books** fetches the rest for you, up to the 1,000 books one bulk action takes.

With books selected, **Edit fields** sets the author, narrator or series on all of them, and **Add tags**, **Remove tags**, **Add genres** and **Remove genres** change each book's own list rather than replacing it. So filtering to an author, selecting all matching books and adding a "Book club" tag is a few clicks. **Add to share** puts the selection in a share.

## Duplicates across libraries

**Health > Likely duplicates** groups copies of the same book side by side and marks the one worth keeping: the better format, then a single file over several, then the higher bitrate, then the copy more people listen to. Until now it only compared books within one library.

With more than one books library, **Include other libraries** also groups copies that sit in different libraries, and each copy names its library. Those copies are often on purpose (a book kept in a kids' library as well, say), so they don't count towards the Health issue totals: switch it on when you want to clear out space, and leave it off otherwise. AudioSilo never deletes a copy for you; remove the files you don't want from the library folder and rescan, and listening progress on the deleted copy is kept.

## More

The admin guide covers [Books](https://docs.audiosilo.app/users/admin/books), including [changing many books at once](https://docs.audiosilo.app/users/admin/books#changing-many-books-at-once), and [Health](https://docs.audiosilo.app/users/admin/health) with [Duplicates](https://docs.audiosilo.app/users/admin/health#duplicates). Listeners' side: [Browsing your library](https://docs.audiosilo.app/users/listening/browsing). To fix covers and series one book at a time, see [Fix covers and series](/blog/fix-covers-and-series/), and for laying out folders so fewer books need fixing, [How to organise audiobook folders](/blog/organize-audiobook-folders/).
