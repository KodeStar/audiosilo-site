---
title: How to organise audiobook folders so every player gets them right
description: One folder per book, inside its series, inside its author. The layout, naming rules, tags, covers and the awkward cases (disc folders, short stories) that trip scanners up.
kind: guide
published: 2026-10-18
updated: 2026-11-10
verified: 2026-11-07
appliesTo: Server 2.5.0 and 2.6.0
tags: [library, folders, metadata, getting-started]
covers:
  - bridge:audible
  - server:scanner
  - server:formats
  - server:metadata
  - docs:/users/getting-started/organizing-your-library
  - docs:/users/admin/libraries
  - docs:/users/admin/books
related:
  - ebook-reader
  - m4b-vs-mp3-audiobooks
  - fix-covers-and-series
  - moving-from-audiobookshelf
  - back-up-your-audible-library
  - audiobook-files-out-of-order
hero: ../../assets/stills/server-series-dark.webp
heroAlt: Series in the AudioSilo admin console, a complete shelf of seven spines and a series with books 2 to 4 missing
revisions:
  - date: 2026-11-10
    note: "Rewritten to be shorter and easier to read. No facts changed."
  - date: 2026-11-07
    note: "Server 2.6.0: a name like Author; Series; Book 04; Title gives the series and number, and an album tag that is only the series name no longer becomes the title."
  - date: 2026-10-28
    note: "Server 2.5.0: a decimal position like 02.5 works in a folder name, an .m4b's narrator tag beats composer, and an EPUB beside the audio opens in the reader."
  - date: 2026-10-24
    note: "Server 2.4.0 plays a book's files in natural order (2 before 10), so leading zeros are no longer needed; metadata.json now also gives genres, tags and more."
  - date: 2026-10-24
    note: "Links the new guide to fixing audiobook files that play out of order."
---

Give **every book its own folder**, inside a folder for its **series** (if it has one), inside a folder for its **author**. Start the book folder with its number in the series. That layout works in AudioSilo, Audiobookshelf and most other audiobook players:

```text
Audiobooks/
├── Terry Pratchett/
│   └── Discworld/
│       ├── 01 - The Colour of Magic/
│       │   └── The Colour of Magic.m4b
│       └── 02 - The Light Fantastic/
│           ├── Part 01.mp3
│           ├── Part 02.mp3
│           └── cover.jpg
└── Andy Weir/
    └── Project Hail Mary/
        └── Project Hail Mary.m4b
```

## One folder, one book

**A folder that directly holds audio files is one book.** Every audio file in it is a part, played in name order. One M4B or fifty MP3s, it's the same.

- **Never put two books' files in one folder.** They'd be read as one long book.
- **Number multi-file parts in order.** AudioSilo 2.4.0 and later plays `Part 2.mp3` before `Part 10.mp3`. Some other players don't, so leading zeros (`01`, `02` ... `10`) are still safest if more than one player reads the library. [Why audiobook files play out of order](/blog/audiobook-files-out-of-order/) shows how to rename a whole folder.

A loose audio file in the library's top folder is a book of its own. A flat folder of M4Bs works, but you lose the author and series that folder names give.

## Authors, series and numbers

When tags don't say otherwise:

| Folder | Read as |
|---|---|
| `Author/Series/03 - Title/` | Book 3 of *Series* by *Author* |
| `Author/Title/` | A standalone by *Author* |
| `02.5 - Gods of Risk` (server 2.5.0+) | Book 2.5 |

A leading number with a separator (`03 - Title`, `Book 3 - Title`, `Vol 3 - Title`) is the place in the series. A number that's part of the title, like `20,000 Leagues Under the Sea` or `1984`, is left alone. For an omnibus, set a range like `1-3` in the admin console.

## Covers

Drop a `cover.jpg` (or `cover.png`, `folder.jpg`, `folder.png`) into the book's folder. Otherwise AudioSilo uses another image there, then the art embedded in the audio. Most M4Bs carry their own.

For one M4B against a folder of MP3s, see [M4B vs MP3](/blog/m4b-vs-mp3-audiobooks/). Both play as one book.

## Tags

By default, meaningful tags win over folder names:

| What | Where it usually lives |
|---|---|
| Title | The *album* tag (or *title*, when that holds the fuller "Series: Book" name; from 2.6.0, an album that is only the series name gives way to the title tag or the name on disk) |
| Author | *album artist* or *artist* |
| Narrator | a *narrator* tag, or *composer* (from 2.5.0 an `.m4b`'s narrator tag wins over composer) |
| Series | a series tag, where the file has one; from 2.6.0, also a folder or file name like `Author; Series; Book 04; Title` |

Junk tags like "Track 01" are ignored. If your folders are good and your tags a mess, set the library to take details from **folder names first** (Edit library in the admin console).

You don't need to retag files: corrections in the admin console live in its database. If you want to, [Mp3tag](https://www.mp3tag.de/en/) (Windows and macOS) or the command-line [tone](https://github.com/sandreas/tone) handle MP3 and M4B.

## The awkward cases

| Case | What to do |
|---|---|
| A book split into `CD1`, `CD2` subfolders | Set its folder to **Always one book** (Folder detection, in the library's menu). Discs join in order. Health points these out. |
| A folder of unrelated short stories | Set it to **Separate books** so each file is its own book. |
| `.aax` or `.aaxc` files | Locked to your Audible account, so not indexed. Convert to M4B: [How to back up your Audible library](/blog/back-up-your-audible-library/). |

Both folder overrides survive rescans.

**Coming from Audiobookshelf?** AudioSilo 2.3.1 and later reads the `metadata.json` its **Store metadata with item** setting leaves in each folder, and never writes to it. See [Moving from Audiobookshelf](/blog/moving-from-audiobookshelf/).

**An ebook beside the audio:** from server 2.5.0, a DRM-free `.epub` in a book's folder (exactly one), or beside a single-file book with the same name, adds **Read the ebook**. See [Read the ebook](/blog/ebook-reader/).

## Reorganise freely

Progress, bookmarks and notes are attached to the book, not a database row. Retagging changes nothing. Move or rename a book and the server recognises each file by its fingerprint, so progress and bookmarks follow it.

## Good to know

- **Network shares:** mount the share on the server and point the library at the mounted path. If it drops, AudioSilo won't treat the missing books as deleted; they come back with the share.
- **Upgrading from before 2.4.0:** older servers sorted `10` before `2`. A book whose files now sort differently is re-read at its next scan, and a listener partway through may find their place moved. A phone download keeps its old order until the book is next started online with app 2.4.0.

## A checklist

- Each book in its own folder, inside `Author/Series/` or `Author/`.
- Series book folders start with a whole number: `01 - Title`.
- Multi-file parts numbered in order.
- A `cover.jpg` where the files don't carry art.
- No `.aax` files.
- Fix stragglers in the console: [Fix covers and series](/blog/fix-covers-and-series/).

The full reference is [Organizing your library](https://docs.audiosilo.app/users/getting-started/organizing-your-library) in the docs.
