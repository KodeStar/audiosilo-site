---
title: "AudioSilo Server 2.4: podcasts, the Bridge and a guided first run"
description: Podcasts beside your books, a Bridge that writes characters, recaps, descriptions and chapters for you, a guided setup for new servers, genres and tags, and files in natural order.
kind: release
published: 2026-10-24
updated: 2026-10-24
verified: 2026-10-24
appliesTo: Server 2.4.0 and 2.4.1 with their bundled web player, app 2.4.0, Bridge 0.3.0 and 0.3.1
tags: [release, server, podcasts, bridge, setup, metadata]
covers:
  - server:podcasts
  - server:podcast_fetch
  - server:podcast_discovery
  - server:podcast_opml
  - server:bridge
  - server:modules
  - server:setup
  - server:libraries
  - server:scanner
  - server:formats
  - server:transcode
  - server:metadata
  - server:abs-metadata-json
  - server:match
  - server:health
  - server:chapters
  - app:podcasts
  - app:library
  - app:home
  - app:connect
  - docs:/users/listening/podcasts
  - docs:/users/admin/podcasts
  - docs:/users/admin/bridge
  - docs:/users/admin/generating-characters-and-recaps
  - docs:/users/getting-started/running-a-bridge
  - docs:/users/getting-started/first-run
  - docs:/users/getting-started/organizing-your-library
  - docs:/users/admin/books
  - docs:/users/admin/health
related:
  - podcasts
  - first-run-setup
  - organize-audiobook-folders
  - server-2-3
  - bridge-recaps-and-contributions
  - tidy-a-big-library
  - audiobook-files-out-of-order
  - move-podcasts-with-opml
revisions:
  - date: 2026-10-24
    note: "v2.4.1: fixes for sign-in, servers that aren't answering, downloads and the car, plus Bridge v0.3.1."
  - date: 2026-10-24
    note: "Links the posts on Bridge recaps and contributions, tidying a big library, OPML and file order."
  - date: 2026-10-24
    note: "Corrects where genres come from (files and metadata.json, not community matches) and that Shift-click selects a range in the grid too."
hero: ../../assets/stills/server-health-dark.webp
heroAlt: Health in the AudioSilo admin console, the Not matched list with the Match automatically card above the books still to match
---

AudioSilo Server **2.4.0** came out on 24 October. The big one is **podcasts**: a podcast library sits on your server next to your audiobooks. They arrive with the **Bridge**, AudioSilo's optional companion container, which does the writing the server never does: it downloads episodes, and it can write characters, recaps, descriptions and chapters for books the community hasn't covered. New servers also get a guided first run, books gain genres and tags, and a book's files now play in natural order.

**Where it runs:** the new listening features are in the **web player bundled with the server** (`/web`) and in **app 2.4.0** for iPhone, iPad and Android. Until app 2.4.0 reaches your device, use the web player for podcasts: older apps don't show them at all, even to an admin. Every change to the player API is additive, so older apps keep working with 2.4 for everything else.

## How to update

Update with `docker compose pull && docker compose up -d`, or from [GitHub Releases](https://github.com/KodeStar/audiosilo-server/releases). Back up your data folder first: eight database migrations (0047 to 0054) run on first start, and the next scan reads each book's genres from its files and `metadata.json` once, without re-reading the audio.

Podcasts, generating, chapter detection and contributions need **Bridge 0.3.0 or later**. Its image is now public, so no login is needed: `ghcr.io/kodestar/audiosilo-bridge`. See [Running a Bridge](https://docs.audiosilo.app/users/getting-started/running-a-bridge).

## 2.4.1: fixes

Server **2.4.1** and **Bridge 0.3.1** came out on 24 October with fixes and nothing new to set up. Update the server the same way (`docker compose pull && docker compose up -d`); there are no database migrations this time. Update the Bridge image (`ghcr.io/kodestar/audiosilo-bridge`) to 0.3.1 too. If an admin console tab was open during the upgrade, reload it.

- **Sign in again.** When a server ends your session (an admin signed you out, or your password changed), the player shows one **Sign in again** message with a **Reconnect** button, instead of load errors with a Retry that couldn't work.
- **A server that isn't answering** is only marked down when it really isn't: one slow or dropped request no longer does it. When it answers again, the Library reloads by itself. With more than one server, the top bar, Home and **Library > Folders** name the one that's down.
- **Downloads and the car.** When a book's download finishes while you're streaming it, playback moves to the downloaded copy at the same place, in the order you're listening in. A bookmark added in CarPlay or Android Auto that couldn't be saved offline keeps its place when it's sent again.
- **Up next** keeps an episode your server is still fetching until it starts playing, and still has it if the fetch fails.
- **Links to a book** that name one of its audio files or a disc folder open the book with your saved place, and a link that doesn't say which server opens on your default one.
- **Admin console.** A library declared in `config.yaml` can't be deleted from the console any more: before, the delete removed everyone's progress, bookmarks and notes in it, and the library came back at the next restart. A Shift-click range in Match review now takes in a book you matched by hand once the list has read it again.
- **Web players on another site.** With **Allowed web origins** set, a web player served from another site now gets your server's covers and audio; before, the browser blocked its covers.
- **Bridge 0.3.1.** `reset-password` signs out every Bridge page session in the same step, and installing ffmpeg, ffprobe or whisper-cli on Linux gets past a "text file busy" error instead of failing.

The player fixes are in the web player bundled with 2.4.1, and in app 2.4.1 for iPhone and Android when that update reaches your device. Older apps keep working as before. The full notes: [v2.4.1](https://github.com/KodeStar/audiosilo-server/releases/tag/v2.4.1).

## Podcasts beside your books

- **Shows in the Library.** A podcast library has a **Shows** grid that marks shows with a new episode, and each show has a page of its own. A show told in order starts at its first episode.
- **New episodes** on Home gathers the latest from the shows you follow. Podcasts stay off your book shelves, book search and "next in series"; an episode you're in the middle of shows in **Continue listening**, like a book.
- **Play any episode, downloaded or not.** Each show keeps the newest episodes ready (**Keep N**, Keep 3 by default), downloads an episode only when someone plays it (**On demand**), or keeps the whole feed (**Archive**). Press Play on an episode that isn't on the server yet and the player shows **Getting this episode** and starts it once it's ready, while whatever you were listening to keeps playing.
- **Add shows from the player.** Search a podcast directory (Apple Podcasts, or Podcast Index if your admin sets it up), follow a show by its feed address, or import an **OPML** list from another podcast app. A long list goes in batches of five, and a feed that just failed isn't asked for again, so a few dead feeds don't hold up the rest. **Export my shows** saves your list for any podcast app, and **Check for new episodes** looks at a show's feed now. Moving from another app? See [How to move your podcast subscriptions with OPML](/blog/move-podcasts-with-opml/).
- **Private feeds** (paid or members-only) are seen only by the people who follow them, admins included. The Bridge keeps their addresses encrypted, and they never go into an export.

To set it up: pair a Bridge, turn on **Podcasts** under **Server > Settings > Modules**, then add a library with the **Podcasts** kind. **Give everyone access** grants a new podcast library to every listener. Episodes stream from your server for now; downloading them to a phone, kids mode and casting come later. The whole tour is in [Podcasts in AudioSilo](/blog/podcasts/).

## More from the Bridge

The server still never writes to your folders. Pair a Bridge under **Settings > Bridge** (it has a setup card showing what's ready and what's left), and besides podcasts it can:

- **Generate characters and recaps** for a book the community hasn't covered, from the book's page in the console or the player (admins only). It transcribes the book, has an AI agent you provide (Claude or Codex, with your own subscription or API key) read it, checks the result for mistakes and spoilers, and shows an estimate first. A monthly cap limits what it spends.
- **Write a description**: a short, spoiler-free one for a book nothing else describes. It stays on your server.
- **Detect chapters** for a long book with none (**Health > Long books without chapters**), from the narration, with no agent cost. The book's page can switch back to the file's own chapters.
- Hand the transcription to an **ASR worker** on a faster computer: a Mac with Apple silicon, or a PC with an NVIDIA GPU.

Everything a Bridge generated is marked **Generated on this server** in the player and saved in a `.audiosilo` folder beside the book, so it survives a rebuild of the database. See [Generating characters and recaps](https://docs.audiosilo.app/users/admin/generating-characters-and-recaps), and [Characters and recaps from your own Bridge](/blog/bridge-recaps-and-contributions/) for a walk-through.

### Giving back, only when you ask

With a Bridge signed in to GitHub and the **Contributions** module on, a book's **Community metadata** card can **Share with the community** the characters and recaps your Bridge generated (CC BY-SA 4.0, filed under your GitHub account). **Suggest corrections** sends the edits you pick from a matched book whose details you've fixed (CC0), each reviewed on GitHub like any other submission. Nothing is sent unless you ask, and the descriptions a Bridge writes always stay on your server. See [The Bridge](https://docs.audiosilo.app/users/admin/bridge).

## Set up your server

The first time you sign in to the admin console on a new server, it opens **Set up your server**: eight short, skippable steps from an empty server to a named, matched library and a signed-in phone. It catches the usual Docker host-path mistake before you meet an empty library, compares up to eight of your books named from tags and from folders side by side, sets up community metadata and your Audible marketplace, checks the addresses phones will use and your backup schedule, then pairs a phone with a QR code and, if you like, adds a Bridge. Everything you choose is an ordinary setting, skipped steps wait on the Overview's **Finish setting up** card, and a server already in use never sees the flow. More in [Set up your server](/blog/first-run-setup/).

## Library and console

- **Genres and tags.** Books gain genres, tags, a subtitle, publisher, language and abridged, all editable on the book's page, one book at a time or in bulk. Genres are read from the files' genre tag and Audiobookshelf's `metadata.json`, tags from `metadata.json`, and the subtitle, publisher, language and abridged from `metadata.json` or a community match. The player shows the subtitle and genre and tag chips, and **Library > Books** in the console filters by genre and tag. More in [Tidying a big library](/blog/tidy-a-big-library/).
- **Files play in natural order.** "2- Part" now comes before "10- Part", whatever the punctuation, in folder books and in each disc of a joined book, so parts no longer need leading zeros. Chapters a Bridge found move with their files. [How to organise audiobook folders](/blog/organize-audiobook-folders/) is updated, and [Why audiobook files play out of order](/blog/audiobook-files-out-of-order/) covers the rest.
- **`.mka` (Matroska audio)** is indexed and plays in the web player, converted by the server as it plays (this needs ffmpeg). The iOS and Android apps list these books but can't play them yet.
- **Duplicates across libraries**: **Health > Likely duplicates** has **Include other libraries**, and each copy says which library it's in.
- **Selecting many books**: a **Select** button on Books, Shift-click for a range in the grid or the table, **Select all** for every book shown, and **Select all N matching** past the loaded page (up to 1,000 books).
- **Match review** lists the best matches first, **Match by hand** opens over the review without losing your place, and a book matched since the run is left alone when you apply it.
- **Listen in player** on a book's console page opens it in the web player, already signed in.
- The library export adds published dates, every series a book is in, an optional description, and one row per copy if you ask.

## Fixes worth knowing

- A series tag with a marked position, like "Discworld, book #40", now gives the series "Discworld" and position 40.
- A title written in another script ("Война и мир", "第1章") is kept instead of being replaced by the folder name.
- Re-running a match no longer replaces a book you matched by hand.
- Scanning an invite QR code in app 2.4.0 goes straight to signing in, instead of being turned away.
- In the player, the search palette and Up next show book titles instead of file names.

## After updating

- **Natural file order may move a listener's place.** A book whose files played out of order is fixed at the next scan, and someone partway through it may find their place has moved. A copy downloaded to a phone takes the new order the next time the book is started online with app 2.4.0, and plays in its download order until then.
- The tag fixes above reach an existing book when one of its files changes, or when you press **Rescan this book**.
- Rolling back to 2.3.1 still works; upgrading again re-indexes podcast shows.

Thanks to @scruffynerf and @wtanksleyjr for the requests behind much of the library work. The full notes: [v2.4.0](https://github.com/KodeStar/audiosilo-server/releases/tag/v2.4.0).
