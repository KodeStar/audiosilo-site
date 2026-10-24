---
title: Why audiobook files play out of order, and how to fix the file names
description: Part 10 plays after part 1 because many players sort names letter by letter. How to number audiobook files so every player gets them right, and how to rename a folder in one go.
kind: guide
published: 2026-10-24
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
---

An audiobook split into many files plays out of order because many players, car stereos and tools sort file names **character by character**, the way a dictionary sorts words. They compare the first characters of `10 - Part.mp3` and `2 - Part.mp3`, see that `1` comes before `2`, and put part 10 first without looking any further. The fix is to **number the files with leading zeros**, so every name has the same number of digits: `01`, `02` ... `10` for up to 99 parts, `001` ... `100` beyond that. Then letter-by-letter order and number order agree, in every player and file manager.

Here's the problem in one folder:

| Sorted letter by letter | Sorted by number |
|---|---|
| `1 - Part.mp3` | `1 - Part.mp3` |
| `10 - Part.mp3` | `2 - Part.mp3` |
| `11 - Part.mp3` | `3 - Part.mp3` |
| `2 - Part.mp3` | ... |
| `3 - Part.mp3` | `10 - Part.mp3` |
| ... | `11 - Part.mp3` |

## Other things that scramble the order

Leading zeros fix the common case. A few others are worth checking when a book still jumps around:

- **Files with no number.** `Prologue.mp3` and `Epilogue.mp3` sort by their letters, so a prologue usually lands after the chapters. Give them numbers too: `00 - Prologue.mp3` at the start, and the next number after the last chapter for the epilogue.
- **Numbers written as words.** `Part One`, `Part Two`, `Part Three` sorts as One, Three, Two. No sorting rule can fix that: rename them with digits.
- **Mixed naming.** A folder with `Chapter 01.mp3` and `Track 02.mp3`, often from two rips put together, sorts every "Chapter" before every "Track". Use one pattern for the whole folder.
- **Disc folders.** A rip that keeps `CD1` ... `CD10` subfolders has the same problem one level up. Pad those too (`CD01`), or join the discs into one book (below).
- **Track-number tags.** Some players order a book by the *track number* in each file's tags rather than by its name, so missing or duplicated track numbers scramble it there even when the names are right. A tag editor such as [Mp3tag](https://www.mp3tag.de/en/) can number the tracks in file-name order in one go.

## Renaming a whole folder at once

You don't have to rename files one by one:

- **macOS**: select the files in Finder, right-click, **Rename**, and choose **Format** with a name and an index. Finder numbers them in the order they're selected and sorted, so check the order first.
- **Windows**: [PowerToys](https://learn.microsoft.com/windows/powertoys/) includes **PowerRename**, a batch renamer with search and replace and numbering, from the right-click menu.
- **Any OS**: Mp3tag can rename files from their tags (for example from the track number and title).
- **The command line**: in a terminal, inside the book's folder, this bash loop pads the number at the start of each file name to three digits. Run it with `echo` in front of `mv` first to see what it would do.

```bash
for f in [0-9]*.mp3; do
  num=${f%%[!0-9]*}             # the leading digits
  new=$(printf '%03d%s' "$((10#$num))" "${f#"$num"}")
  [ "$f" = "$new" ] || mv -n -- "$f" "$new"
done
```

Change `.mp3` to your files' extension, and `%03d` to `%02d` for two digits. `mv -n` never overwrites a file that already has the new name.

## Or use one file

Single-file formats sidestep the question entirely: an **M4B** holds the whole book with its chapters inside, so there is nothing to sort. [M4B vs MP3](/blog/m4b-vs-mp3-audiobooks/) compares the two and shows how to join a folder of parts into one M4B, which is also the moment to make sure the parts are in the right order.

## How AudioSilo handles it

From **server 2.4.0**, AudioSilo plays a book's files in **natural order**: it reads each run of digits in a name as a number, so `2- Part` plays before `10- Part` whatever the punctuation around it, and `02` counts the same as `2`. That holds for a folder of files and for each disc of a book whose disc folders are joined into one (the discs themselves were already in natural order, `CD2` before `CD10`). So a folder numbered without leading zeros now plays in the order you'd expect, with nothing to rename.

AudioSilo goes by the file names, not the track-number tags, so the name is what to fix when a book is still out of order. Natural order can't help with the cases above that have no digits to go on: unnumbered prologues and epilogues, and numbers spelt as words.

If a book on your server played out of order before 2.4.0, it is put right at the next library scan. Anyone partway through that book may find their place in it has moved, since the files are now in a different order. Chapters a Bridge found for the book move with their files, so they don't need finding again. A copy downloaded to a phone takes the new order the next time the book is started online in app 2.4.0. Until then, and in older apps until 2.4.0 reaches your device, it plays in its download order. The [Server 2.4 release post](/blog/server-2-4/) has the rest of what changed.

Leading zeros are still worth adding: other players, file managers and backup tools don't all sort naturally, and padded names work everywhere. For the rest of the layout (one folder per book, inside its series and author), see [How to organise audiobook folders](/blog/organize-audiobook-folders/), and the docs' [Organizing your library](https://docs.audiosilo.app/users/getting-started/organizing-your-library) for the full reference, including joining disc folders into one book.
