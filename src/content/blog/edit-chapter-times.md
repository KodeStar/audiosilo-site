---
title: "Edit a book's chapter times and titles in the admin console"
description: "In AudioSilo 2.7, an admin can move, add, delete and rename a book's chapters, with a player to hear each start. The audio files are not changed."
kind: feature
published: 2026-11-16
verified: 2026-11-16
appliesTo: Server 2.7.0 and app 2.7.0 (not released yet)
tags: [admin, chapters, console, metadata]
covers:
  - server:chapters
  - server:admin_ui
  - app:book-page
  - docs:/users/admin/books
  - docs:/users/listening/book-page
related:
  - fix-covers-and-series
  - bridge-recaps-and-contributions
  - admin-console-tour
draft: true
---

An admin can now fix a book's chapters in the admin console. On the book's page, **Edit chapters** lets you move a chapter's start, add or delete chapters, shift them all and rename them. The server keeps your list and every player uses it. The audio files are not changed.

This is new in AudioSilo 2.7.0.

## Why it is there

Most books get good chapters from their files, the community database or your Bridge. Some lists are slightly off. A chapter starts a few seconds early, an intro is missing, or the titles are numbers only. Before 2.7.0 you could rename chapters and choose which source to use, but not change where they start. Now you can correct the whole list.

## Edit the chapters

To edit a book's chapters:

1. Open the book's page in the admin console.
2. On the **Chapters** card, click **Edit chapters**.
3. Change the rows. Each row is a chapter's start time and title, counted from the start of the book, like `1:02:03` or `12:34.5`.
4. Click **Save chapters**.

Players use the new chapters straight away. The Chapters card says **Chapters edited on this server.**, with who saved them and when.

In the editor you can also:

| To | Do this |
|---|---|
| Add a chapter | Click **+** on a row to add one after it, or **Add at playhead** |
| Delete a chapter | Click the bin on its row |
| Move every chapter | Enter seconds in **Shift all by** (negative for earlier) and click **Shift** |
| Load a list from elsewhere | Click **Paste timestamps**, paste one chapter a line and check the preview |

A row with a lock starts one of the book's files. You can rename it, but its time is fixed and it can't be deleted. That way no chapter runs from one file into the next.

## Find the start by ear

Click a row's number to load its file in the editor's player. Step back or forward by a second or a tenth of a second. Click **Play 5 s** to hear the chapter's start. When it sounds right, **Set to playhead** moves the chapter there.

## What listeners see

The book page in the web player and the apps lists the edited chapters. A line at the end of the list says **Chapters edited on this server**.

## Undo an edit

**Revert edit** deletes your list after you confirm. The book goes back to the chapters it had before: the community's, the ones your Bridge found in the narration, or the files' own.

## Good to know

- Your list belongs to the files as they were when you saved it. If a file is replaced, re-encoded, renamed, added or removed, the card says **Your edited chapters are set aside** and listeners get the book's other chapters. Put the files back to use your list again, or revert it.
- Moving the book's folder keeps your edit. So does renaming a book that is a single audio file loose in the library.
- While your list is in use, rename its chapters in the editor, not by clicking a title on the card.
- A save needs chapters at least a second apart, inside the book, with one-line titles. The editor marks a row that breaks a rule, and Save works once it is fixed.
- Older apps play the edited chapters but do not show the line saying where they came from.

## More

The User Guide covers every step under [Edit chapter times and titles](https://docs.audiosilo.app/users/admin/books#edit-chapter-times-and-titles), including the rules for pasted timestamps.
