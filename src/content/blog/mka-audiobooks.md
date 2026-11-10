---
title: "What is an MKA audiobook, and how do you play or convert one?"
description: An .mka file is Matroska, a container around audio in another format. How to see what's inside, which players open it, and how to turn it into MP3 or M4B without losing quality.
kind: guide
published: 2026-10-28
updated: 2026-11-10
verified: 2026-10-28
appliesTo: Server 2.5.0, app 2.5.0
tags: [formats, mka, ffmpeg, m4b, mp3]
covers:
  - server:formats
  - server:remux
  - server:transcode
  - docs:/users/getting-started/organizing-your-library
  - docs:/users/admin/server
related:
  - mka-books-play-everywhere
  - m4b-vs-mp3-audiobooks
  - audiobook-files-out-of-order
  - server-2-5
draft: false
revisions:
  - date: 2026-11-10
    note: "Rewritten to be shorter and easier to read. No facts changed."
---

An `.mka` file is **Matroska audio**, the audio-only sibling of `.mkv` video. It's a wrapper around audio in another format, usually **MP3** for audiobooks. The fix is usually quick and lossless: copy the audio out into **MP3 for MP3 inside, M4B for AAC inside**, without re-encoding.

## Who can play it

| Player | Opens `.mka`? |
|---|---|
| [VLC](https://www.videolan.org/vlc/), [mpv](https://mpv.io/) on the desktop | Yes |
| Many Android players | Yes |
| iPhone, iPad, Safari | No |
| Other browsers | Not reliably |

The audio inside is sometimes AAC, Opus or FLAC rather than MP3. The wrapper can also carry chapter marks and cover art.

## Step 1: find out what's inside

The file name doesn't tell you; the codec inside decides what you can do. With [ffmpeg](https://ffmpeg.org/) installed (it includes `ffprobe`):

```bash
ffprobe -v error -select_streams a:0 -show_entries stream=codec_name -of csv=p=0 "Book.mka"
```

It prints one word: `mp3`, `aac`, `opus`, `flac` and so on. [MediaInfo](https://mediaarea.net/en/MediaInfo) shows the same as the audio track's **Format**, if you'd rather click. To see the chapters:

```bash
ffprobe -v error -show_chapters "Book.mka"
```

## Step 2: copy the audio out

**MP3 inside: make an MP3.** This copies the stream bit for bit and writes the chapters as ID3 chapter frames:

```bash
ffmpeg -i "Book.mka" -map 0:a:0 -c:a copy -map_chapters 0 -id3v2_version 3 "Book.mp3"
```

The audio plays everywhere, though not every player reads MP3 chapter frames.

**AAC inside: make an M4B**, the usual audiobook file:

```bash
ffmpeg -i "Book.mka" -map 0:a:0 -c:a copy -map_chapters 0 "Book.m4b"
```

**Opus, FLAC or anything else: re-encode, or keep it.** These can't go into an MP3 as they are, and most audiobook players won't play them in an M4B. Converting loses a little quality. For a spoken voice, AAC at 64 to 96 kbit/s is plenty:

```bash
ffmpeg -i "Book.mka" -map 0:a:0 -c:a aac -b:a 96k -map_chapters 0 "Book.m4b"
```

Or keep the `.mka` and use a player that opens it.

`-map 0:a:0` takes only the first audio track, so it leaves out cover art stored as an attachment. A `cover.jpg` in the book's folder covers that for most players. Keep the original until the new file plays through with chapters in the right places.

## A whole folder at once

Run this inside the folder. It checks each `.mka` and makes the lossless copy where there is one (`-n` never overwrites an existing file):

```bash
for f in *.mka; do
  codec=$(ffprobe -v error -select_streams a:0 -show_entries stream=codec_name -of csv=p=0 "$f")
  case "$codec" in
    mp3) ffmpeg -nostdin -n -i "$f" -map 0:a:0 -c:a copy -map_chapters 0 -id3v2_version 3 "${f%.mka}.mp3" ;;
    aac) ffmpeg -nostdin -n -i "$f" -map 0:a:0 -c:a copy -map_chapters 0 "${f%.mka}.m4b" ;;
    *)   echo "Skipped $f ($codec): needs re-encoding" ;;
  esac
done
```

For a book in many parts, [M4B vs MP3](/blog/m4b-vs-mp3-audiobooks/) compares the two results, and [Why audiobook files play out of order](/blog/audiobook-files-out-of-order/) covers numbering the parts.

## How AudioSilo handles MKA

AudioSilo indexes `.mka` books. Its server uses ffmpeg (included in the Docker image) to make them play:

- **MP3 inside** plays everywhere from **server 2.5.0**: web player and the iOS and Android apps, downloads included, with the apps you already have. On an iPhone, app 2.5.0 plays them best and is needed for downloads. The server makes the copy above once per file, keeps it in its data folder and serves it in place of the `.mka`. Your files are never changed. [MKA audiobooks now play in the iPhone and Android apps](/blog/mka-books-play-everywhere/) has the details.
- **Other audio inside** plays in the **web player**, converted to MP3 as it streams, and on an Android phone that can decode it. For the iPhone app, convert it as above.

If you convert in place, you needn't delete the `.mka` straight away. AudioSilo leaves out an `.mka` with the same name as another audio file beside it (`Book.mka` next to `Book.m4b`), treating it as that file's source. The docs list every format under [Supported formats](https://docs.audiosilo.app/users/getting-started/organizing-your-library#supported-formats).
