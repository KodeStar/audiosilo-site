---
title: "AudioSilo Server 2.6: upcoming releases, Sync v2, read-along and Audible"
description: "Upcoming releases in the player and your calendar, listening that syncs across devices and offline, an ebook that follows the narration, and Audible on the Bridge."
kind: release
published: 2026-11-07
updated: 2026-11-10
verified: 2026-11-08
appliesTo: Server 2.6.0 with its bundled web player, app 2.6.0, Bridge 0.6.0
tags: [release, server, sync, read-along, audible, bridge, metadata]
covers:
  - app:stores
  - server:upcoming
  - server:upcoming_calendar
  - server:upcoming_covers
  - server:sync
  - server:readalong
  - server:ebooks
  - server:audible
  - server:bridge
  - server:modules
  - server:match
  - server:metadata
  - server:metadata-mirror
  - server:metadata-report
  - server:scanner
  - server:series
  - server:database
  - server:migrations
  - server:backups
  - server:security
  - server:install
  - app:upcoming
  - app:readalong
  - app:companion
  - app:reader
  - app:playback
  - app:downloads
  - app:account
  - bridge:audible
  - bridge:audible-backup
  - bridge:audible-sync
  - docs:/users/listening/upcoming
  - docs:/users/listening/playback
  - docs:/users/listening/account
  - docs:/users/listening/companion
  - docs:/users/admin/audible
  - docs:/users/admin/health
  - docs:/users/admin/server
  - docs:/users/getting-started/organizing-your-library
  - docs:/users/getting-started/quickstart-docker
  - docs:/users/getting-started/running-a-bridge
related:
  - apple-watch
  - upcoming-releases
  - read-along
  - audible-backup
  - audible-listening-sync
  - smarter-bulk-matching
  - help-complete-the-community-database
  - back-up-before-upgrading
  - server-2-5
revisions:
  - date: 2026-11-10
    note: "Rewritten to be shorter and easier to read. No facts changed."
  - date: 2026-11-08
    note: "iPhone app 2.6.0 and its Apple Watch app are on the App Store now; Google Play's 2.6.0 is still to follow, with the APK until then."
  - date: 2026-11-07
    note: "Android users can install app 2.6.0 now from the APK on GitHub; the Apple Watch app arrives with iPhone app 2.6.0 on the App Store."
---

AudioSilo Server **2.6.0** came out on 7 November. Your server now tells you what's coming in the series you listen to, in the player and in your calendar. Listening on two devices, or offline, comes together properly, and the player's **Text** tab follows the ebook as the narrator reads it.

**Bridge 0.6.0**, out the same day, brings Audible to the Bridge: back up the books you bought into your library, and keep your place in step with the Audible app.

**Where it runs:** the new listening features are in the **web player bundled with the server** (`/web`) and in **app 2.6.0**, on the App Store for iPhone and iPad. On Android, 2.6.0 is still to come on Google Play; install it now from the APK on [its GitHub release](https://github.com/KodeStar/audiosilo-frontend/releases/tag/v2.6.0) (see [Android without Google Play](https://docs.audiosilo.app/users/listening/mobile-apps#android-without-google-play)). The [Apple Watch app](/blog/apple-watch/) comes with the iPhone app; the [Apple Watch guide](https://docs.audiosilo.app/users/listening/apple-watch) covers what it needs.

## How to update

1. Check Docker is **20.10.10 or newer** (`docker version`). The image now uses the native SQLite engine, and older Docker can stop it at start-up.
2. Run `docker compose pull && docker compose up -d`, or install from [GitHub Releases](https://github.com/KodeStar/audiosilo-server/releases). Coming from 2.5.1, eleven database migrations run on first start, after the server copies your database into its backups folder ([how to back up before you upgrade](/blog/back-up-before-upgrading/)).
3. If you run a Bridge, update it to **0.6.0** (`ghcr.io/kodestar/audiosilo-bridge`) alongside the server. Audible needs the two together.
4. Run a scan to pick up the new series hints from folder names (below). You don't need to rebuild the index.

## What's coming in your series

Once a day your server checks the series in your library against the community catalogue at [meta.audiosilo.app](https://meta.audiosilo.app). Home shows **Coming up in your series**: preorders, recent releases and the volumes you're missing. An **Upcoming** page lists everything, and series pages show release dates for books you don't have yet.

Upcoming also gives you a private calendar link for Apple Calendar, Google Calendar, Outlook or any calendar app that takes a link. See [Upcoming releases](/blog/upcoming-releases/) and the docs' [Upcoming releases](https://docs.audiosilo.app/users/listening/upcoming).

## Sync v2: listening across devices and offline

Your devices now send what you listened to, not just a position. Offline listening waits on the device and joins up later, counted on the day you listened, and listening sent twice is counted once.

Nothing moves your place back by itself. When two devices listened without seeing each other's place, the server keeps the place further on, and the player offers **Jump** or **Stay**, naming the other device. Home and your account page show listening waiting to sync. See [Listening on more than one device](https://docs.audiosilo.app/users/listening/playback#listening-on-more-than-one-device) and [Listening sync](https://docs.audiosilo.app/users/listening/account#listening-sync).

## Follow the narration

The player's **Text** tab now follows the ebook as you listen, highlighting the sentence you hear and turning the pages. Tap a sentence to move there, or browse and press **Back to narration**. The full-screen reader has **Follow narration** too, and it works offline for downloaded books. See [Read along](/blog/read-along/).

## Audible on the Bridge

With **Bridge 0.6.0** and the **Audible** module turned on in the console:

1. **Sign in** on the Bridge's **Accounts** tab. Each Audible account belongs to a person on your server and a books library. Your Amazon credentials stay sealed on the Bridge.
2. **Back up** one title, **Back up everything**, or set a policy for new purchases. The Bridge saves an M4B without re-encoding, keeps the chapters, places it beside your series' other books, and never replaces an existing file.
3. **Sync listening places with Audible**, if you want. About every 15 minutes the Bridge brings across an Audible place that is further on, and it can send your AudioSilo place back a few minutes after you stop.

It's meant for **a personal backup of books you bought**, with your own account. Laws on removing DRM differ from country to country, so check yours first. See [Back up your Audible books](/blog/audible-backup/), [Audible listening sync](/blog/audible-listening-sync/) and the docs' [Audible](https://docs.audiosilo.app/users/admin/audible).

## Smarter matching

**Match automatically** gets more of a library right, with less waiting. It weighs narrator, language, series position and running time alongside title and author. ASIN and ISBN tags count as hints to check, very weak guesses stay out of review, and runs against meta.audiosilo.app check six books at once.

**Fill in what's missing** can strip series labels and edition clutter from a confidently matched title; your own edits stay locked. A book with no ASIN or ISBN can now match a store listing when the full author and series position agree and both lengths are within 2%. **Unlink** on its page removes such a match. See [Match automatically gets more of your library right](/blog/smarter-bulk-matching/).

## Help fill gaps in the community catalogue

**Help complete the community database** (**Settings > Community metadata**, off by default) runs a daily check and reports the ASINs the catalogue doesn't know. It sends ASINs only: no file names, paths, people, listening history or server identifier. See [Help complete the community database](/blog/help-complete-the-community-database/).

## Folder names that state their series

A book named `Author; Series; Book 02; Title` now gives its series and number from its folder or file name, when the tags leave them out. `Book 01-03` is a range, and `Book XX` or `Book 00` puts the book in the series with no number. See [Organizing your library](https://docs.audiosilo.app/users/getting-started/organizing-your-library).

## Faster database work on Linux

The Docker image and the native Linux downloads now use the native SQLite engine, with a faster matching path. The macOS and Windows downloads keep the pure-Go engine. The database format is the same, and on Linux you can switch back with `AUDIOSILO_SQLITE=modernc` and a restart.

## Fixes

- **Changing your password signs your other sessions out**, keeping the device you changed it on. An admin's password reset and **Sign out everywhere** end sessions too. Personal API keys and calendar links keep working.
- **Android, in app 2.6.0**: a very long single-file M4B or M4A book no longer runs out of memory at chapter changes.
- **Characters and recaps follow your copy's chapters**, and an appearance past the last chapter reads **Near the end**.
- **An album tag that's only the series name** no longer hides the book's title.
- **Unlink** is refused while a match run is working, so the run can't write the match back.

## Good to know

- **Defaults:** Upcoming is on while community metadata is on. The unknown-ASIN report, the Audible module and Audible place sync start off.
- **Upcoming dates** are the earliest audiobook release the catalogue knows, which can differ from your local store. The first full check runs about an hour after the server starts, and kids' accounts don't see it.
- **The calendar link is private:** anyone with it can read that feed, and resetting it stops the old one. A cloud calendar such as Google Calendar needs your server at a public HTTPS address with a trusted certificate.
- **Older apps** keep saving their place as before, without Upcoming, Sync v2 or the Text tab.
- **Read-alongs** need Bridge 0.5.0 or later to make. A missing or out-of-date one isn't offered to listeners.
- **Audible backups** need the library mapped and writable on the Bridge. Audible listening adds nothing to your AudioSilo history or stats. An account signed in with an older device profile may need **Sign in again**, then **Back up** again for titles that failed.
- **Audible sync limitation:** the Audible app can still resume at an older place after the Bridge has reported sending yours.
- **Matching limitation:** reverting a community ASIN doesn't reject the match, and a later refresh can write it back. To remove a match, clear the book's ASIN and ISBN, then use **Unlink** before the next refresh.
- **Self-hosted metadata service?** Deploy v0.25.5 or later as well.

Every change to the player API is additive, so existing iOS, Android and web players keep working. The full notes: [v2.6.0](https://github.com/KodeStar/audiosilo-server/releases/tag/v2.6.0) and [Bridge v0.6.0](https://github.com/KodeStar/audiosilo-bridge/releases/tag/v0.6.0).
