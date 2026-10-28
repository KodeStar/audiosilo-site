---
title: "Read the ebook: your EPUBs in the AudioSilo player"
description: A book whose folder holds its DRM-free EPUB gets a Read the ebook button in the web player and the iOS and Android apps, with your place kept on every device and offline reading.
kind: feature
published: 2026-10-28
updated: 2026-10-28
verified: 2026-10-28
appliesTo: Server 2.5.0, app 2.5.0
tags: [reader, ebooks, player, offline]
covers:
  - server:ebooks
  - server:reading-progress
  - server:scanner
  - server:web_player
  - app:reader
  - app:book-page
  - app:downloads
  - docs:/users/listening/reading-the-ebook
  - docs:/users/listening/offline-downloads
related:
  - server-2-5
  - organize-audiobook-folders
  - player-tips
  - bridge-recaps-and-contributions
revisions:
  - date: 2026-10-28
    note: "Where to get app 2.5.0 while it is in store review: the Android APK."
---

Plenty of audiobook libraries keep the ebook next to the audio. From server 2.5.0, AudioSilo opens it. When a book's folder holds its EPUB, the book's page gets a **Read the ebook** button, in the web player and in the iOS and Android apps alike. The reader shows the text a page at a time, remembers where you got to on every device you read on, and a book you download takes its ebook with it, so you can read with no connection too.

## What it needs

- **Server 2.5.0 or later.** It comes with the reader in the web player (`/web`), so the web player can read as soon as your server is upgraded.
- **The AudioSilo app 2.5.0 or later** to read on your phone or tablet. If your app doesn't show **Read the ebook** on a book that has one, update it to 2.5.0. App 2.5.0 came out on 28 October and is in review at the App Store and Google Play, so it reaches the stores once that clears; on Android you can install it now from the APK on [its GitHub release](https://github.com/KodeStar/audiosilo-frontend/releases/tag/v2.5.0) (see [Android without Google Play](https://docs.audiosilo.app/users/listening/mobile-apps#android-without-google-play)).
- **One DRM-free EPUB in the book's folder.** That's the whole setup, covered below.

## Setting it up: put the EPUB beside the audio

There is nothing to switch on. Put the ebook in the book's folder, with the audio, and let your server scan:

```text
Terry Pratchett/
└── Discworld/
    └── 01 - The Colour of Magic/
        ├── The Colour of Magic.m4b
        └── The Colour of Magic.epub     ← Read the ebook
```

- **A book that is a folder** needs exactly one `.epub` directly inside it. With two or more, AudioSilo can't tell which one is the book, so it uses none of them: keep one, or move the others out.
- **A book that is a single audio file** takes an `.epub` with the same name beside it, such as `Project Hail Mary.m4b` and `Project Hail Mary.epub`.

Your server notices a new ebook at its next library scan, and notices one you remove or rename too. An admin can press **Rescan** on the library in the admin console rather than wait. After the upgrade, the first scan finds the ebooks already in your libraries without re-reading your audiobooks. If your folders could use a tidy first, [How to organize audiobook folders](/blog/organize-audiobook-folders/) has a layout that works.

The ebook has to be an **EPUB without DRM**. A locked EPUB still shows the button, but the reader can't open it and says so. And a folder that holds only an ebook, with no audio, isn't a book in AudioSilo: the reader is for audiobooks that come with their text.

## Reading

Press **Read the ebook** on the book's page, next to the download button. The reader fills the window, with the book's title at the top and, under it, the chapter you're in and how far through the book you are. It follows the app's light or dark appearance.

- **Turn pages** by tapping or clicking the edges of the page, by swiping on a touch screen, or with the arrow keys. A book written right to left turns the other way.
- **Contents**, the list button at the top right, lists the book's chapters with the one you're in shown in bold. Pick one to go there.
- **Smaller text** and **Larger text** change the size a step at a time, and the size is remembered on that device for every book.
- **Close** with the **×** at the top left (or **Esc** in the web player), and you're back where you were.

## Your place, on every device

The reader saves your place a moment after you stop on a page, and straight away when you close it or switch away. Your server keeps it for your account, so the book opens at the page you reached in another browser, on another computer or in the app on your phone.

When another device read further, AudioSilo neither moves your place back nor jumps you forward without asking. A note at the foot of the page offers the further place, such as *"On Pixel 8 you were at 60%. Jump there?"*, with **Jump** and **Stay**. Stay keeps you where you are, so going back on purpose works.

Reading and listening keep separate places: reading doesn't move where you are in the audiobook, and listening doesn't move where you are in the ebook.

## Reading offline

[Downloading a book](https://docs.audiosilo.app/users/listening/offline-downloads), in the apps or the web player, now saves its ebook beside the audio, and the reader opens it from the device whether you have a connection or not. A downloaded book shows **Read the ebook** even while your server can't be reached. Your place is saved on the device meanwhile and sent to your server when the connection is back; if another device read further in the meantime, you get the **Jump there?** note rather than losing either place.

A book downloaded before your app or web player could read keeps playing offline as before, but its download has no ebook. To read it offline, remove the download and download the book again.

## Safe with any EPUB

An EPUB is a little website, and it can carry scripts. AudioSilo's reader runs none of them: scripts in the book are blocked before they can run, and the reader has no network access of its own, so an ebook can't send anything anywhere. In the apps it never sees your sign-in token.

## What it doesn't do yet

The reader is deliberately simple for now. It opens EPUB files only, not MOBI, AZW3 or PDF. It can't search the text, keep highlights or notes in it, or follow along with the audio as you listen. Your bookmarks and notes stay with the audiobook.

## More

The listening guide's [Reading the ebook](https://docs.audiosilo.app/users/listening/reading-the-ebook) page has every screen with screenshots and what each message means when an ebook won't open. The same ebook is what a paired Bridge reads when it [writes characters and recaps](/blog/bridge-recaps-and-contributions/) for a book, and [Player tips](/blog/player-tips/) has more on getting around the player.
