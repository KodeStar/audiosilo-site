---
title: "Read the ebook: your EPUBs in the AudioSilo player"
description: A book whose folder holds its DRM-free EPUB gets a Read the ebook button in the web player and the iOS and Android apps, with your place kept on every device and offline reading.
kind: feature
published: 2026-10-28
updated: 2026-11-10
verified: 2026-11-07
appliesTo: Server 2.5.0, app 2.5.0
tags: [reader, ebooks, player, offline]
covers:
  - app:stores
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
  - date: 2026-11-10
    note: "Rewritten to be shorter and easier to read. No facts changed."
  - date: 2026-11-07
    note: "App 2.5.0 is now on the App Store and Google Play."
  - date: 2026-10-28
    note: "Where to get app 2.5.0 while it is in store review: the Android APK."
---

From server 2.5.0, AudioSilo opens the ebook that sits beside your audiobook. When a book's folder holds its EPUB, the book's page gets a **Read the ebook** button in the web player and the iOS and Android apps. Your place is kept on every device, and downloaded books can be read offline.

## What it needs

- **Server 2.5.0 or later.** The web player (`/web`) can read as soon as your server is upgraded.
- **App 2.5.0 or later** on a phone or tablet. It came out on 28 October and is on the App Store and Google Play. On Android you can also install the APK from [its GitHub release](https://github.com/KodeStar/audiosilo-frontend/releases/tag/v2.5.0) (see [Android without Google Play](https://docs.audiosilo.app/users/listening/mobile-apps#android-without-google-play)).
- **One DRM-free EPUB in the book's folder.**

## Set it up: put the EPUB beside the audio

There is nothing to switch on. Put the ebook in the book's folder and let your server scan:

```text
Terry Pratchett/
└── Discworld/
    └── 01 - The Colour of Magic/
        ├── The Colour of Magic.m4b
        └── The Colour of Magic.epub     ← Read the ebook
```

- **A book that is a folder** needs exactly one `.epub` directly inside it. With two or more, AudioSilo uses none: keep one, or move the others out.
- **A book that is a single audio file** takes an `.epub` with the same name beside it, such as `Project Hail Mary.m4b` and `Project Hail Mary.epub`.

The next library scan picks up new, removed or renamed ebooks. An admin can press **Rescan** on the library in the admin console rather than wait. After the upgrade, the first scan finds existing ebooks without re-reading your audiobooks. [How to organize audiobook folders](/blog/organize-audiobook-folders/) has a layout that works.

## Reading

Press **Read the ebook** on the book's page, next to the download button. The reader fills the window and follows the app's light or dark appearance.

- **Turn pages** by tapping or clicking the page edges, swiping, or with the arrow keys. A right-to-left book turns the other way.
- **Contents** (the list button, top right) lists the chapters, with yours in bold.
- **Smaller text** and **Larger text** change the size; it's remembered on that device for every book.
- **Close** with the **×** at the top left (or **Esc** in the web player).

## Your place, on every device

The reader saves your place a moment after you stop on a page, and straight away when you close it. Your server keeps it for your account, so the book opens where you left off on any device.

If another device read further, AudioSilo asks instead of jumping. A note offers the further place, such as *"On Pixel 8 you were at 60%. Jump there?"*, with **Jump** and **Stay**.

Reading and listening keep separate places.

## Reading offline

[Downloading a book](https://docs.audiosilo.app/users/listening/offline-downloads), in the apps or the web player, saves its ebook too. A downloaded book shows **Read the ebook** even when your server can't be reached. Your place is saved on the device and sent to the server when you're back online.

A book downloaded before your app or web player could read has no ebook in its download. To read it offline, remove the download and download it again.

## Safe with any EPUB

An EPUB can carry scripts. AudioSilo's reader blocks them before they run and has no network access of its own, so an ebook can't send anything anywhere. In the apps it never sees your sign-in token.

## Good to know

- **DRM:** a locked EPUB still shows the button, but the reader can't open it and says so.
- **Ebook only:** a folder with an ebook and no audio isn't a book in AudioSilo.
- **Not yet:** the reader opens EPUB only, not MOBI, AZW3 or PDF. It can't search the text, keep highlights or notes, or follow along with the audio. Your bookmarks and notes stay with the audiobook.

The docs' [Reading the ebook](https://docs.audiosilo.app/users/listening/reading-the-ebook) page has every screen and what each message means. The same ebook is what a paired Bridge reads when it [writes characters and recaps](/blog/bridge-recaps-and-contributions/), and [Player tips](/blog/player-tips/) has more on the player.
