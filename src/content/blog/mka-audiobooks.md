---
title: "What is an MKA audiobook, and how do you play or convert one?"
description: An .mka file is Matroska, a container around audio in another format. How to see what's inside, which players open it, and how to turn it into MP3 or M4B without losing quality.
kind: guide
published: 2026-10-27
verified: 2026-10-27
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
draft: true
---

An `.mka` file is **Matroska audio**: an open container format, the audio-only sibling of `.mkv` video. The container is a wrapper. The sound inside it is in some other format, most often **MP3** for audiobooks, sometimes AAC, Opus or FLAC, and the wrapper can carry chapter marks and cover art alongside it. Desktop players such as [VLC](https://www.videolan.org/vlc/) and [mpv](https://mpv.io/) open `.mka` files without fuss, and so do many Android players. iPhones, iPads and Safari don't open Matroska at all, and other browsers don't reliably either. The fix is usually quick and lossless: copy the audio out of the wrapper into a format every player knows, **MP3 for MP3 inside, M4B for AAC inside**, without re-encoding it.

## Step 1: find out what's inside

The file name doesn't tell you; the codec inside decides what you can do. With [ffmpeg](https://ffmpeg.org/) installed (it includes `ffprobe`):

```bash
ffprobe -v error -select_streams a:0 -show_entries stream=codec_name -of csv=p=0 "Book.mka"
```

It prints one word: `mp3`, `aac`, `opus`, `flac` and so on. If you'd rather click than type, [MediaInfo](https://mediaarea.net/en/MediaInfo) shows the same thing as the **Format** of the audio track. To see the chapters:

```bash
ffprobe -v error -show_chapters "Book.mka"
```

## Step 2: copy the audio out

**MP3 inside: make an MP3.** This copies the MP3 stream bit for bit and writes the chapters as ID3 chapter frames:

```bash
ffmpeg -i "Book.mka" -map 0:a:0 -c:a copy -map_chapters 0 -id3v2_version 3 "Book.mp3"
```

Not every player reads chapter frames in an MP3, but the audio plays everywhere.

**AAC inside: make an M4B.** M4B is the usual audiobook file, AAC audio with chapters, and the same copy works:

```bash
ffmpeg -i "Book.mka" -map 0:a:0 -c:a copy -map_chapters 0 "Book.m4b"
```

**Opus, FLAC or anything else inside: re-encode, or keep it.** Those don't go into an M4B or MP3 without converting the audio, which loses a little quality. For a spoken voice, AAC at 64 to 96 kbit/s is plenty:

```bash
ffmpeg -i "Book.mka" -map 0:a:0 -c:a aac -b:a 96k -map_chapters 0 "Book.m4b"
```

Keep the `.mka` if you'd rather not convert, and play it in a player that opens it.

`-map 0:a:0` takes just the first audio track, which leaves out cover art stored as a Matroska attachment. A `cover.jpg` in the book's folder covers that for most audiobook players. Either way, keep the original until you've checked the new file plays through and its chapters land where they should.

## A whole folder at once

In a terminal, inside the folder, this loop checks each `.mka` and makes the lossless copy where there is one (`-n` never overwrites a file that's already there):

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

If you're choosing between the two results for a book in many parts, [M4B vs MP3](/blog/m4b-vs-mp3-audiobooks/) compares them, and [Why audiobook files play out of order](/blog/audiobook-files-out-of-order/) covers numbering the parts.

## How AudioSilo handles MKA

AudioSilo indexes `.mka` books, and its server uses ffmpeg (included in the Docker image) to make them play:

- **MP3 inside** plays everywhere from **server 2.5.0**: in the web player and the iOS and Android apps, downloads included. The server does the copy above for you, once per file, keeps it in its data folder and serves it in place of the `.mka`. Your files are never changed. [MKA audiobooks now play in the iPhone and Android apps](/blog/mka-books-play-everywhere/) has the details.
- **Other audio inside** plays in the **web player**, converted to MP3 as it streams, and on an Android phone that can decode it. For the iPhone app, convert it as above.

If you convert a book in place, there's no need to delete the `.mka` straight away: AudioSilo leaves out an `.mka` that has the same name as another audio file beside it (`Book.mka` next to `Book.m4b`), treating it as that file's source. The docs list every format AudioSilo reads under [Supported formats](https://docs.audiosilo.app/users/getting-started/organizing-your-library#supported-formats).
