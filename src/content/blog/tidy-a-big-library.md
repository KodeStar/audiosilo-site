---
title: "Tidying a big library: genres, tags, bulk edits and duplicates"
description: Server 2.4.0 gives books genres and tags you can filter by, makes selecting hundreds of books in the console quick, and finds copies of a book across libraries.
kind: feature
published: 2026-10-24
updated: 2026-11-10
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
revisions:
  - date: 2026-11-10
    note: "Rewritten to be shorter and easier to read. No facts changed."
---

Server 2.4.0 adds three tools for big libraries to the admin console: **genres and tags**, **quicker bulk selection**, and **duplicates across libraries**. The player picks up genres and tags too.

## Genres and tags

Every book now has **Genres** and **Tags**, shown as chips on its console page.

- **Genres** come from the audio files' *genre* tag and from an Audiobookshelf `metadata.json`. A genre that only says something like "Audiobook" or "Spoken Word" is left out.
- **Tags** are yours. They come from a `metadata.json` or your own edits: "Owned", "Read with the kids", "Book club", whatever suits you.

To edit them, click the chips, type a label and press Enter or a comma. Pasting "Fantasy, Epic" adds both. Capitals don't matter: "Sci-Fi" and "sci-fi" are one tag.

Books indexed before your server could read genres get them on the next scan, without a full re-index. The console's **Books** filters gain **Genre** and **Tag** groups.

A book's details also gain **Subtitle**, **Publisher**, **Language** and **Abridged**, each marked with where the value came from.

### In the player

- A book's page shows its genres and tags as chips. Tap one to open the Library filtered to it.
- The Library's Books gain **Genre** and **Tag** filters, each showing how many books it would list.
- Search finds books by genre and tag.

That's in the **web player bundled with your server** (`/web`) and **app 2.4.0**. Until app 2.4.0 reaches your device, use the web player. The [Server 2.4 release post](/blog/server-2-4/) has the rest of what's new.

## Changing many books at once

The console's **Books** list could already bulk-edit a selection. Building a big selection is quicker now:

- **Select**, in the toolbar, starts picking without ticking a first book. **Done** ends it.
- **Shift-click** a tile or row to select every book between it and the last one you clicked.
- **Select all N books** takes every book shown. It reads **Select the N books shown** while more are still loading.
- **Select all N matching books** fetches the rest when a filter matches more than are loaded, up to the 1,000 books one bulk action takes.

With books selected:

- **Edit fields** sets the author, narrator or series on all of them.
- **Add tags**, **Remove tags**, **Add genres** and **Remove genres** change each book's own list rather than replacing it.
- **Add to share** puts the selection in a share.

So filtering to an author, selecting all matching books and adding a "Book club" tag takes a few clicks.

## Duplicates across libraries

**Health > Likely duplicates** groups copies of the same book and marks the one worth keeping. It prefers, in order:

1. The better format.
2. A single file over several.
3. The higher bitrate.
4. The copy more people listen to.

It used to compare books within one library only. With more than one books library, **Include other libraries** also groups copies in different libraries, and names each copy's library.

Those copies are often on purpose, such as a book kept in a kids' library as well. So they don't count towards the Health issue totals. Switch it on when you want to clear space.

AudioSilo never deletes a copy for you. Remove the files you don't want from the library folder and rescan. Listening progress on the deleted copy is kept.

## More

- Admin guide: [Books](https://docs.audiosilo.app/users/admin/books), including [changing many books at once](https://docs.audiosilo.app/users/admin/books#changing-many-books-at-once), and [Health](https://docs.audiosilo.app/users/admin/health) with [Duplicates](https://docs.audiosilo.app/users/admin/health#duplicates).
- For listeners: [Browsing your library](https://docs.audiosilo.app/users/listening/browsing).
- One book at a time: [Fix covers and series](/blog/fix-covers-and-series/). Fewer fixes needed: [How to organise audiobook folders](/blog/organize-audiobook-folders/).
