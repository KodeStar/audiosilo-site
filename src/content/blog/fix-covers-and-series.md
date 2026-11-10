---
title: Fix wrong covers, titles and series in your audiobook library
description: Swapped tags, missing covers, a series spelled three ways. How to match books to the community database one at a time or all at once, without touching your files.
kind: tip
published: 2026-10-14
updated: 2026-11-10
verified: 2026-10-24
appliesTo: Server 2.4.0
tags: [metadata, matching, covers, series, admin]
covers:
  - server:metadata
  - server:series_memberships
  - server:meta_covers
  - server:health
  - server:match
  - server:metadata-mirror
  - docs:/users/admin/books
  - docs:/users/admin/health
  - docs:/users/admin/server
  - docs:/users/community/meta-site
related:
  - organize-audiobook-folders
  - admin-console-tour
  - server-2-3
hero: ../../assets/stills/server-compare-dark.webp
heroAlt: Compare with community metadata, field by field, what is on your server marked File tag or Path next to the community value, with the fields to take ticked
revisions:
  - date: 2026-11-10
    note: "Rewritten to be shorter and easier to read. No facts changed."
  - date: 2026-10-24
    note: "Server 2.4.0: match review lists best matches first and opens Match by hand over it, hand matches are kept, and duplicates can span libraries."
  - date: 2026-11-07
    note: "Points to the docs for what matching sends on the newest server."
---

Fix wrong covers, titles and series from the admin console, with help from the free community database at [meta.audiosilo.app](https://meta.audiosilo.app). **None of it touches your files.** Each fix is an override in the server's database: it survives rescans and can be reverted.

## Start with Health

**Health** in the admin console turns each scan into a to-do list: missing covers, unmatched books, unreadable files, odd folders and possible duplicates (from 2.4 across libraries too, with **Include other libraries**). Each list comes with its fix, and anything can be ignored.

## Match one book

1. Open a book and click **Match with community metadata**. It searches by tags, length, ASIN or ISBN **and folder names**, so a book with swapped tags is still found if its folders are named well.
2. Under **Possible matches**, pick one (each shows its cover, score, narrators and whether the length fits) and click **Compare fields**.
3. If the book was recorded more than once, pick the right **edition**.
4. Tick the fields to **take**. Fields you've edited start unticked. The cover starts ticked only when your book has no cover art.
5. Click **Accept**.

Taken values are marked **Community** on the book's page and can be reverted one by one.

## Match the whole library at once

1. Go to **Health > Not matched** and find the **Match automatically** card.
2. Pick a library and click **Find matches**. The server looks every book up in the background.
3. Click **Review and apply**. Results are sorted:

| List | What it holds |
|---|---|
| **Confident** | A strong match, clearly ahead of the next, with an ASIN or ISBN and a length within 10% of your book's. Starts ticked. |
| **To review** | Lower scores or close calls. Tick the right ones. |
| **Not found** / **Not checked** | The rest. |

4. Choose **what to write**:
   - **ASIN and ISBN only** marks books as matched and changes nothing else.
   - **Fill in what's missing** (the default) fills empty fields, and takes a cover only for books with none.
   - **Use community values** also replaces fields that differ.
5. Click **Apply**. Nothing changes before this.

Your own edits are never replaced. From 2.4, neither is a book matched by hand or since the run, and **Match by hand** opens a book's match dialog over the review.

If you set your **Audible marketplace** (Server > Settings > Community metadata), matches take the ASIN from your store when a recording is sold in several.

## Fix a series

- **One series, many spellings.** Names differing only in capitals, accents, punctuation or spaces are already one series. **Health > Series spelled several ways** sets one spelling on every book (server 2.3).
- **Omnibus editions.** Type a range like `1-3` as the series number. "Next in series" carries on with book 4 (server 2.3).
- **Books in more than one series.** Guards! Guards! is Discworld #8 and City Watch #1. Add extra series under **Other series** on the book's Details card; community matches fill them in too (server 2.1).
- **Folders named better than tags?** Switch the library to **folder names first** (Edit library). Every book updates without a rescan.

## Fix a cover

- Drop a `cover.jpg` into the book's folder, or
- upload one on the book's page (stored by AudioSilo, not in your folder), or
- tick the community cover when you match.

Since server 2.2, community covers in the players' series rails are fetched by your server, so listeners' browsers only talk to your server.

## Undo a bulk match

**Server > Settings > Community metadata > Danger zone > Clear community matches** undoes every community match in one library, or all of them. Your own edits and uploaded covers stay (server 2.1).

## Good to know

- **Community chapters** (server 2.1): a matched book with no chapters, or one per file, gets its recording's chapters fitted onto your audio. A book with only broad chapters is offered the detailed ones.
- **What matching sends:** the player's "About this book" lookup sends only the ASIN or ISBN. Matching sends the tagged title, author and series, the length, the ASIN or ISBN, up to three folder or file names, and anything you type. Nothing about who listens, and no full file paths. That is server 2.4's list; for the newest server's, see [What matching sends](https://docs.audiosilo.app/users/admin/books#matching-with-community-metadata).
- **Send nothing:** set community metadata to **Keep a local copy** (`metadata.mode: mirror`, server 2.3). The server downloads the whole database (about 450 MB, 1.8 GB on disk) and answers every lookup from it. Or turn community metadata off with one switch.
- **A book the database doesn't know?** Add it at [meta.audiosilo.app](https://meta.audiosilo.app), and everyone benefits from the next release.

The full reference is [Books and metadata](https://docs.audiosilo.app/users/admin/books#matching-with-community-metadata) and [Library health](https://docs.audiosilo.app/users/admin/health) in the docs.
