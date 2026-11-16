---
title: "Two recordings of one audiobook, kept together"
description: "In AudioSilo 2.7, two narrators of one book, or an abridged and an unabridged recording, show as one book with two recordings. Each keeps its own progress."
kind: feature
published: 2026-11-16
verified: 2026-11-16
appliesTo: Server 2.7.0 and app 2.7.0 (not released yet)
tags: [library, series, metadata, player]
covers:
  - server:other_recordings
  - server:metadata
  - server:match
  - server:series
  - app:other-recordings
  - app:book-page
  - app:series
  - app:up-next
  - docs:/users/listening/book-page
  - docs:/users/listening/browsing
  - docs:/users/listening/end-of-book
  - docs:/users/admin/books
  - docs:/users/getting-started/organizing-your-library
related:
  - organize-audiobook-folders
  - fix-covers-and-series
draft: true
---

When your server holds one book in more than one recording, AudioSilo now shows them together. A series page has one spine for the book, with a **2 recordings** chip to choose between them. The book's page lists the other recordings in an **Other recordings in your library** card.

This is new in AudioSilo 2.7.0. It needs community metadata switched on.

## What counts as another recording

A recording is one reading of a book. Two narrators of *The Hobbit* are two recordings. So are an abridged and an unabridged one, or a dramatisation.

Each recording is still a book of its own on your server, in its own folder or library. Before 2.7.0, nothing linked them. Now the players show them as one book. Nothing changes in your files.

## Where you see it

| Where | What you see |
|---|---|
| A book's page | An **Other recordings in your library** card. Tap a recording to open its page. |
| A series page | One spine for the book. A **2 recordings** chip beside it opens a list with each recording's narrator, length and your progress. |
| The end of a book | The next book in the series comes in one recording, picked in the order below. |

On a series page, the spine shows the recording you're on. If you're on neither, it shows the one you finished last, else the one your server picks.

Each recording keeps its own place, bookmarks and notes. Starting the second narrator does not move your place in the first.

## Which recording plays next

When a book ends and the next book in the series is on your server in more than one recording, AudioSilo picks one in this order:

1. The recording read by the same narrator as the book you just finished.
2. Otherwise, a recording you've started.
3. Otherwise, one in the same library.
4. Otherwise, an unabridged one.

So if you've been listening to one narrator, the series carries on with that narrator when your server has their recording of the next book. The others stay one tap away on that book's page.

## How the server knows two recordings are one book

The server matches each recording to a book in the community database. Two recordings that lead to the same book are kept together. It goes by:

- **A match you made in the console.** This counts first. Use it for a recording with no ASIN or ISBN, or one whose identifier leads to the wrong book.
- **Otherwise, the book's ASIN or ISBN.** The server looks up new and changed books once a day, and shortly after a scan finds some.

This works with **Check for upcoming releases** switched off. The server still looks up which book each recording is, and nothing else.

To match a recording by hand, open its page in the console and click **Match with community metadata** (see [Matching with community metadata](https://docs.audiosilo.app/users/admin/books#matching-with-community-metadata)). The admin guide covers the rest under [Recordings of the same book](https://docs.audiosilo.app/users/admin/books#recordings-of-the-same-book).

## Good to know

- **Copies are not recordings.** Two books with the same ASIN are copies of one recording, for example the same audiobook in two libraries. They are listed once, never once per copy. When a book has no ASIN, the ISBN decides.
- **Listeners only see what they can open.** Someone whose share holds one recording sees no card, no chip and no sign of the other.
- **The Library's Series card counts by recording.** A series of four books with one held twice reads "5 books". The series page counts that book once.
- **Without community metadata**, or on an older server, each recording stays a book of its own, as before.
- **Keeping recordings apart on disk.** Give each its own folder, such as `The Hobbit (Rob Inglis)/` and `The Hobbit (Andy Serkis)/`. See [Organizing your library](https://docs.audiosilo.app/users/getting-started/organizing-your-library#more-than-one-recording-of-a-book).

## More

The User Guide covers this under [More than one recording of a book](https://docs.audiosilo.app/users/listening/book-page#more-than-one-recording-of-a-book), [Series pages](https://docs.audiosilo.app/users/listening/browsing#series-pages) and [What plays next](https://docs.audiosilo.app/users/listening/end-of-book#what-plays-next).
