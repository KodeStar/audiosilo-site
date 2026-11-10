---
title: "M4B vs MP3 for audiobooks: chapters, size and what plays where"
description: M4B keeps a whole audiobook in one file with its chapters and cover; MP3 plays on anything. How they differ, when to convert, and how a server handles both.
kind: guide
published: 2026-10-11
updated: 2026-11-10
verified: 2026-10-28
appliesTo: Server 2.5.0, app 2.0.0 and later
tags: [formats, m4b, mp3, chapters]
covers:
  - bridge:audible
  - server:formats
  - server:transcode
  - server:chapters
  - app:playback
  - docs:/users/faq
  - docs:/users/getting-started/organizing-your-library
related:
  - organize-audiobook-folders
  - back-up-your-audible-library
  - player-tips
hero: ../../assets/stills/player-ipad-player-dark.webp
heroAlt: The AudioSilo full player on an iPad, with the chapter seek bar, the whole-book timeline and bookmark pins under it
revisions:
  - date: 2026-11-10
    note: "Rewritten to be shorter and easier to read. No facts changed."
  - date: 2026-10-28
    note: "Server 2.5.0: an MP3 inside an .mka now plays in the apps too, repackaged by the server without converting."
  - date: 2026-10-24
    note: "Server 2.4.0: files play in natural order, so parts no longer need leading zeros, and .mka is indexed for the web player."
---

**M4B** is made for audiobooks: one file holds the whole book, its chapter marks and its cover. **MP3** plays on everything, but an MP3 audiobook usually comes as a folder of files, one per chapter or disc track. For an audiobook app or server, M4B is tidier; for an old car stereo, MP3 is safer.

## Side by side

| | M4B | MP3 |
|---|---|---|
| Files per book | One | Usually many |
| Chapters | Inside the file, with names | Usually one file per chapter or track |
| Cover and tags | Inside the file | Inside each file, or a `cover.jpg` |
| Quality for size | Better (AAC) | Fine, a little larger |
| Plays on | Phones, computers, audiobook apps and servers | Practically everything, including old car stereos |
| Editing | Needs audiobook-aware tools | Any audio tool |

An M4B is an MPEG-4 audio file, almost always AAC inside: the same format as an `.m4a`, with an extension that tells players it's a book. AAC generally sounds better than MP3 at the same bitrate, so an M4B is often smaller for the same quality.

MP3 can store chapters (ID3 chapter frames), but players support them unevenly. In practice the files act as the chapters.

## Does it matter to an audiobook server?

Much less than you might think. AudioSilo shows a single M4B and a folder of MP3s the same way: **one book with one continuous timeline and a chapter list**. Seeking, progress, bookmarks and the sleep timer work across the files.

It indexes `.m4b`, `.m4a`, `.mp4`, `.mp3`, `.flac`, `.ogg` and `.opus`. It also indexes `.mka`, which needs ffmpeg: from server 2.5 an MP3 inside one plays everywhere, repackaged by the server without converting, while another codec inside plays in the web player only.

There's no need to convert a working MP3 library for AudioSilo. Keep each book's files in their own folder, numbered in order. From server 2.4, files play in natural order, so `1`, `2` ... `10` works as well as `01`, `02` ... `10`. Padding still helps players that sort letter by letter. [How to organise audiobook folders](/blog/organize-audiobook-folders/) has the layout.

## When converting MP3 to M4B is worth it

- You want named chapters inside the file for other players too.
- You carry books around as files, and one file per book is easier.
- You want a smaller library and are happy to re-encode once.

Converting means re-encoding to AAC, which loses a little quality each time. Pick a bitrate at or above the source's, and keep the originals until you're happy.

### Tools that do it

- **[m4b-tool](https://github.com/sandreas/m4b-tool)**: command line. Merges, splits and adds chapters to MP3, OGG, FLAC, M4A or M4B files. Good for batches.
- **[AudioBookConverter](https://github.com/yermak/AudioBookConverter)**: a desktop app that turns MP3s into one M4B with chapters and artwork. The Windows build is the main one; Mac and Linux builds are marked experimental.
- **ffmpeg** on its own, for a quick merge without chapters:

  ```bash
  # in the book's folder: list the parts in order, then join and encode them
  printf "file '%s'\n" *.mp3 > parts.txt
  ffmpeg -f concat -safe 0 -i parts.txt -map 0:a -c:a aac -b:a 64k book.m4b
  ```

  The shell lists names letter by letter, so `10` comes before `2`. Pad the numbers first (`01`, `02`) or check `parts.txt` is in order. The result has no chapter marks; use a tool above for a chapter per original file.

## Good to know

- **A long file with no chapters** gets virtual chapters in the player, every 30 minutes by default. Change it under Settings > Playback > **Chapter length (unchaptered)**, from 5 to 60 minutes.
- **Community chapters** (server 2.1 and later): a matched book with no chapters, or only one per file, can take its recording's real chapter list, fitted onto your audio.
- **Codecs a browser can't play** are converted on the fly for the web player when the server has ffmpeg (the Docker image includes it). The phone apps play files directly, where the phone can decode them.
- **FLAC** is lossless and large: fine for archiving a CD rip, more than speech needs.
- **OGG and Opus** are efficient open formats. AudioSilo indexes them, and the web player has ffmpeg convert them where a browser can't play them.
- **AAX and AAXC** are Audible's locked formats. They contain AAC, so they convert to M4B without re-encoding; see [How to back up your Audible library](/blog/back-up-your-audible-library/).
