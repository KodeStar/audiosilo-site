---
title: Why audiobook files play out of order, and how to fix the file names
description: Part 10 plays after part 1 because many players sort names letter by letter. How to number audiobook files so every player gets them right, and how to rename a folder in one go.
kind: guide
published: 2026-10-24
updated: 2026-11-10
verified: 2026-10-24
appliesTo: Server 2.4.0
tags: [library, folders, files, getting-started]
covers:
  - server:scanner
  - server:file-order
  - server:formats
  - docs:/users/getting-started/organizing-your-library
related:
  - organize-audiobook-folders
  - m4b-vs-mp3-audiobooks
  - fix-covers-and-series
  - server-2-4
revisions:
  - date: 2026-11-10
    note: "Rewritten to be shorter and easier to read. No facts changed."
---

Audiobook files play out of order because many players, car stereos and tools sort names **character by character**, like a dictionary. They see that `1` comes before `2` and put `10 - Part.mp3` ahead of `2 - Part.mp3`. The fix is to **number the files with leading zeros**, so every name has the same number of digits.

| Sorted letter by letter | Sorted by number |
|---|---|
| `1 - Part.mp3` | `1 - Part.mp3` |
| `10 - Part.mp3` | `2 - Part.mp3` |
| `11 - Part.mp3` | `3 - Part.mp3` |
| `2 - Part.mp3` | ... |
| `3 - Part.mp3` | `10 - Part.mp3` |
| ... | `11 - Part.mp3` |

Use `01`, `02` ... `10` for up to 99 parts, and `001` ... `100` beyond that. Then letter order and number order agree in every player and file manager.

## Other things that scramble the order

- **Files with no number.** `Prologue.mp3` usually sorts after the chapters. Number it `00 - Prologue.mp3`, and give the epilogue the number after the last chapter.
- **Numbers as words.** `Part One`, `Part Two`, `Part Three` sorts as One, Three, Two. Rename them with digits.
- **Mixed naming.** `Chapter 01.mp3` and `Track 02.mp3` in one folder sort every "Chapter" before every "Track". Use one pattern.
- **Disc folders.** `CD1` ... `CD10` has the same problem one level up. Pad them (`CD01`), or join the discs into one book.
- **Track-number tags.** Some players order by the track number in the tags, not the name. A tag editor such as [Mp3tag](https://www.mp3tag.de/en/) can number tracks in file-name order in one go.

## Rename a whole folder at once

- **macOS**: select the files in Finder, right-click, **Rename**, and choose **Format** with a name and an index. Check the order first. Finder numbers them in the order they're selected and sorted.
- **Windows**: **PowerRename** in [PowerToys](https://learn.microsoft.com/windows/powertoys/) does batch renaming with numbering, from the right-click menu.
- **Any OS**: Mp3tag can rename files from their tags (for example track number and title).
- **The command line**: inside the book's folder, this bash loop pads the leading number to three digits. Run it with `echo` in front of `mv` first to see what it would do.

```bash
for f in [0-9]*.mp3; do
  num=${f%%[!0-9]*}             # the leading digits
  new=$(printf '%03d%s' "$((10#$num))" "${f#"$num"}")
  [ "$f" = "$new" ] || mv -n -- "$f" "$new"
done
```

Change `.mp3` to your extension, and `%03d` to `%02d` for two digits. `mv -n` never overwrites an existing file.

An **M4B** avoids the problem. It holds the whole book in one file, so there's nothing to sort. [M4B vs MP3](/blog/m4b-vs-mp3-audiobooks/) shows how to join a folder of parts into one.

## How AudioSilo handles it

From **server 2.4.0**, AudioSilo plays a book's files in **natural order**. It reads each run of digits as a number, so `2- Part` plays before `10- Part` and `02` counts the same as `2`. That holds for a folder of files and for each disc of a book whose disc folders are joined into one. The discs themselves were already in natural order (`CD2` before `CD10`).

AudioSilo goes by file names, not track-number tags. Natural order can't help files with no digits: unnumbered prologues and epilogues, and numbers spelt as words.

Leading zeros are still worth adding, because other players, file managers and backup tools don't all sort naturally.

## Good to know

- The next library scan puts right a book that played out of order before 2.4.0. Anyone partway through it may find their place has moved.
- Chapters a Bridge found for the book move with their files, so they don't need finding again.
- A downloaded copy takes the new order the next time the book is started online in app 2.4.0. Until then, and in older apps, it plays in its download order.

The [Server 2.4 release post](/blog/server-2-4/) has the rest of what changed. For the full layout, see [How to organise audiobook folders](/blog/organize-audiobook-folders/) and the docs' [Organizing your library](https://docs.audiosilo.app/users/getting-started/organizing-your-library), which also covers joining disc folders into one book.
