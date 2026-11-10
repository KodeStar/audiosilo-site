---
title: "Moving from Audiobookshelf to AudioSilo: what carries over, what doesn't"
description: An honest comparison of Audiobookshelf and AudioSilo, and the steps to switch without losing anyone's progress, finished books, bookmarks or listening stats.
kind: guide
published: 2026-10-14
updated: 2026-11-10
verified: 2026-10-28
appliesTo: Server 2.5.0, app 2.0.0 and later; Audiobookshelf 2.37.2
tags: [audiobookshelf, migration, comparison]
covers:
  - server:import
  - server:abs-metadata-json
  - server:metadata
  - server:cast
  - server:household
  - app:stores
  - app:car
  - server:ebooks
  - docs:/users/admin/import
  - docs:/users/getting-started/organizing-your-library
related:
  - audiosilo-vs-audiobookshelf
  - organize-audiobook-folders
  - self-hosted-audiobook-server
  - fix-covers-and-series
  - server-2-3
hero: ../../assets/stills/server-activity-dark.webp
heroAlt: Activity in the AudioSilo admin console over 90 days, listening hours per day by person and when the household listens
revisions:
  - date: 2026-11-10
    note: "Rewritten to be shorter and easier to read. No facts changed."
  - date: 2026-11-08
    note: "Google Play now has app 2.5.0, so Android Auto and casting are on Google Play too."
  - date: 2026-10-28
    note: "Server 2.5.0's ebook reader (the web player now, the apps from app 2.5.0); CarPlay and casting in the App Store's app 2.4.1, Android Auto and casting in the Android APK; Audiobookshelf 2.37.2's ebook formats; a link to the benchmarked comparison."
  - date: 2026-10-24
    note: "Server 2.4.0: AudioSilo now has podcasts with a Bridge, and metadata.json also gives the subtitle, publisher, language, abridged, genres and tags."
---

You can move from Audiobookshelf to AudioSilo without starting over. AudioSilo reads the same folders, picks up the `metadata.json` files Audiobookshelf leaves beside your books, and imports each person's **listening history**: sessions, progress, finished dates and bookmarks.

Both can run side by side while you decide, because AudioSilo only reads your files and only reads from Audiobookshelf.

## Audiobookshelf and AudioSilo compared

Both are self-hosted, open-source Docker servers with per-person accounts and synced progress. For the full feature list and benchmarks, see [AudioSilo vs Audiobookshelf](/blog/audiosilo-vs-audiobookshelf/).

| | Audiobookshelf | AudioSilo |
|---|---|---|
| Licence | GPL-3.0 | Server AGPLv3 |
| What it serves | Audiobooks, podcasts, basic ebooks (EPUB, PDF, CBR, CBZ, AZW3, MOBI) | Audiobooks, and podcasts with the optional Bridge container (server 2.4); a DRM-free EPUB beside an audiobook opens in its reader (server 2.5: the web player, and the apps from app 2.5.0) |
| Your files | Can upload books, embed metadata and covers into files, and merge files into an M4B | Never writes to your library; edits live in its database |
| Phone apps | Android app in beta on Google Play; iOS app in beta on TestFlight (its beta is currently full) | iPhone, iPad and Android apps in the App Store and Google Play, and an Android APK on GitHub |
| Web player | Yes, installable | Yes, installable, with offline downloads |
| In the car | Android Auto | CarPlay in the iPhone app (App Store 2.4.1 and later); Android Auto in the Android app (2.1 and later, on Google Play and as an APK) |
| Casting | Chromecast from the web app and the Android app | Chromecast from the iPhone app (App Store 2.4.1 and later), the Android app (2.1 and later, on Google Play and as an APK) and the web player (server 2.3, Chromium browsers over HTTPS) |
| Metadata | Fetches from several sources | Community database at [meta.audiosilo.app](https://meta.audiosilo.app), with spoiler-safe recaps and characters for the books that have them |

**Stay with Audiobookshelf** if you rely on an ebook library (ebooks without audio, PDF or comics), web uploads, or metadata written into your files. AudioSilo only reads the EPUB beside an audiobook ([Read the ebook](/blog/ebook-reader/)), and its podcasts need the Bridge ([Podcasts in AudioSilo](/blog/podcasts/)).

**AudioSilo suits you** if you want read-only folders, store apps, or a player built around the whole book: time left at your speed, an undo for accidental jumps, a sleep timer that fades out and marks where you dozed off, and a Year in listening.

Just want better metadata in Audiobookshelf? AudioSilo's community database also works as a [custom metadata provider for Audiobookshelf](https://meta.audiosilo.app/audiobookshelf).

## Step 1: Run AudioSilo on the same folders

Point AudioSilo at the folders Audiobookshelf already reads, mounted read-only. With Docker:

```yaml
    volumes:
      - ./data:/data
      - /srv/audiobooks:/library:ro
```

[Self-hosted audiobook server](/blog/self-hosted-audiobook-server/) has the whole compose file. An Audiobookshelf layout usually scans cleanly: see [How to organise audiobook folders](/blog/organize-audiobook-folders/).

## Step 2: Let it read Audiobookshelf's metadata.json

If Audiobookshelf's **Store metadata with item** setting was on, each book folder has a `metadata.json` with your matches and corrections. Server 2.3.1 and later reads it:

- The title, authors, narrators, series and number, published year, description, **ASIN** and **ISBN** go over the audio tags. From server 2.4 so do the subtitle, publisher, language, abridged, genres and tags. An empty value doesn't clear the tag's.
- A book with an ASIN or ISBN counts as **matched** straight away.
- Your own edits in AudioSilo still win. Values from the file are marked **Audiobookshelf**.
- The next scan picks up Audiobookshelf edits. AudioSilo never writes to the file.

## Step 3: Create everyone's accounts

In the admin console, **Invite someone** creates an account, gives it access to books and shows a QR code and link.

- **Use the same usernames** as in Audiobookshelf, so the import pairs people up for you.
- **Give everyone access to their books first.** The import skips books a person can't listen to here.

## Step 4: Import the listening history

Open **Server > Settings > Import**.

1. **Connect.** Enter the Audiobookshelf address *as the AudioSilo server sees it* (the server fetches the history, not your browser) and an Audiobookshelf API token (**Settings > Users**, or **Settings > API Keys** in newer versions). An admin or root token reads every user; a regular user's token imports only that user. The token is never stored.
2. **Map the people.** Send each Audiobookshelf account to an AudioSilo person, or to **Don't import**. The default listening to bring, **before each person started using AudioSilo**, means nothing is counted twice.
3. **Review.** For each person: hours, sessions, books matched (by path, ASIN, ISBN, or title and author), and which didn't match and why.
4. **Apply.** It's written in one go, and can be **undone** later.

Progress only moves forward: an import never rewinds a book or unfinishes a finished one.

| Comes over | Doesn't |
|---|---|
| Listening sessions with their real dates (so stats, the calendar, streaks and the Year in listening carry on), progress, start and finish dates, bookmarks | Podcasts, collections, playlists, your place in ebooks, accounts and passwords |

The full walkthrough is [Importing from Audiobookshelf](https://docs.audiosilo.app/users/admin/import) in the docs.

## Step 5: Match what's left and pair the devices

- **Health > Not matched** lists books without an ASIN or ISBN. **Match automatically** looks them up for your review: see [Fix covers and series](/blog/fix-covers-and-series/).
- Everyone signs in to the app or the web player at `/web` with their invite: [How to pair your phone](/blog/pair-your-phone/).

## Step 6: Decide

Keep both running for a while. None of this changes Audiobookshelf, so if AudioSilo isn't for you, you've lost nothing. If it is, re-run the import for anyone who kept listening in Audiobookshelf: a new import replaces that person's previous one, so nothing is counted twice.

## Good to know

- **Ebooks:** an EPUB beside an audiobook needs no import. AudioSilo finds it at its next scan, and its reader starts at the beginning.
- **Podcasts:** to move your shows to a server 2.4 podcast library, use **Export OPML** in an Audiobookshelf podcast library's menu, then **Import a list** in the player's **Add shows**.
