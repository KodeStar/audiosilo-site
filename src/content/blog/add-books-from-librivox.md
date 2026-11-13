---
title: "Add free LibriVox audiobooks to your library from AudioSilo"
description: "Admins can search LibriVox in the console or the player, and the Bridge downloads the recording into a library, already matched. Matched books link back to LibriVox."
kind: feature
published: 2026-11-13
verified: 2026-11-13
appliesTo: Server 2.7.0, app 2.7.0 and a Bridge updated with them (not released yet)
tags: [librivox, bridge, metadata, library, player]
covers:
  - server:librivox
  - app:librivox
  - bridge:librivox
  - server:metadata
  - server:match
  - server:bridge
  - app:book-page
  - app:library
  - docs:/users/admin/librivox
  - docs:/users/admin/bridge
  - docs:/users/listening/book-page
related:
  - librivox-community-metadata
  - organize-audiobook-folders
  - m4b-vs-mp3-audiobooks
  - fix-covers-and-series
screenshots:
  - id: console
    image: ../../assets/stills/librivox/console-librivox-dark.webp
    alt: "The admin console's Library > LibriVox page: a search for The Wind in the Willows and its LibriVox recordings, each with a library picker and Add"
    caption: "Library > LibriVox lists each recording with its readers, length, sections and LibriVox project number."
    address: "Admin console"
  - id: player
    image: ../../assets/stills/librivox/player-find-librivox-dark.webp
    alt: "The web player's Find on LibriVox page: a search for The Wind in the Willows, with Add to Books under each recording"
    caption: "Find on LibriVox in the web player. The book goes to the library you opened it from."
    address: "Web player"
draft: true
---

From 2.7.0, an admin can search LibriVox's free public-domain audiobooks from AudioSilo and add one to a books library. Your Bridge downloads the recording, files it in the library and has the server index it. The book arrives matched to its LibriVox recording, with no matching by hand.

The search reads the LibriVox catalogue in AudioSilo's community metadata database ([how LibriVox got there](/blog/librivox-community-metadata/)). Your server never asks LibriVox itself. The Bridge downloads the audio from archive.org, where LibriVox keeps its recordings.

## What it needs

- **An admin account.** Listeners don't see the search.
- **Server 2.7.0** with community metadata on, in **Server > Settings > Community metadata**.
- **A paired Bridge**, updated together with your server.
- **The books library shown as Ready** in **Server > Settings > Bridge**, so the Bridge can write to it.
- To add from the player: **app 2.7.0**, or the web player in server 2.7.0.

## Add a book in the console

To add a book from the admin console, open **Library > LibriVox**.

1. Type a title or an author in **Search LibriVox**.
2. Select a result. Each of its recordings shows who reads it, its length, its number of sections and its LibriVox project number.
3. Pick the library on the recording's row, when you have more than one books library.
4. Press **Add**, or **Add to** *the library* when you have only one.

The recording's row shows the Bridge's progress. When the book is in, the row shows **In library**, a link to the book.

<!-- screenshot:console -->

## Add a book in the player

To add a book from the app or the web player, open **Books** in the **Library** tab of a books library.

1. Press the **...** button beside the sort and layout controls. It shows only while the Bridge is online.
2. Choose **Find on LibriVox**.
3. Type a title or an author, press **Search** and select a result.
4. Press **Add to** *the library* on the recording you want.

The row shows the progress, with **Cancel** while it runs. Once the book is in, the row says **In your library**, and **Open** takes you to its page.

<!-- screenshot:player -->

## What lands in your library

The Bridge makes one folder for the book, by author and title:

```
Charles Dickens/
  A Christmas Carol/
    01 - Marley's Ghost.mp3
    02 - The First of the Three Spirits.mp3
    ...
    cover.jpg
```

- Each LibriVox section is one file and one chapter, numbered in reading order.
- When the author already has a folder in the library, the book goes in it.
- If a folder of that name already exists, the Bridge uses *Title* (LibriVox *number*) instead. It never writes into an existing book.
- The book appears all at once, when every section is in.

The Bridge adds one book at a time. Audible backups and the podcast episodes your server fetches by itself take turns with it.

## Also free on LibriVox

Every listener sees this part. When a book is matched to a LibriVox recording, its **About** card ends with **Also free on LibriVox**, which opens the recording's page on librivox.org.

A book is matched by its ASIN or ISBN, or by an admin in the console. LibriVox downloads rarely carry either number. So from 2.7.0, the book page also reads the community details of a book an admin matched in the console. A book added from LibriVox is matched already.

## Good to know

- **Cancel and restart.** In the console, cancel from the **Jobs** list in **Server > Settings > Bridge**. A cancelled book leaves nothing behind. If the Bridge stops part way, it picks up where it left off and doesn't download finished sections again.
- **When adding fails,** the row says why, such as a full disk or archive.org being out of reach. Add the recording again to retry.
- **A new books library** with no books yet can't be **Ready**. Add one book to it first.
- **Notifications.** The server tells you when a book is added or fails to add, in the bell.
- **Where community details show.** For a book with no ASIN or ISBN, they show on its page and in Search. The companion, Home's cards, the end credits and downloaded copies still leave them out.

## More

The User Guide's [Add free books from LibriVox](https://docs.audiosilo.app/users/admin/librivox) covers every step and failure message. [The book page](https://docs.audiosilo.app/users/listening/book-page#about-this-book) explains the About card.

The recordings exist because LibriVox's volunteers read, check and coordinate them. You can [find out about volunteering at LibriVox](https://librivox.org/pages/about-librivox/).
