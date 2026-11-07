---
title: "AudioSilo Server 2.6: upcoming releases, Sync v2, read-along and Audible"
description: "Upcoming releases in the player and your calendar, listening that syncs across devices and offline, an ebook that follows the narration, and Audible on the Bridge."
kind: release
published: 2026-11-07
verified: 2026-11-07
appliesTo: Server 2.6.0 with its bundled web player, app 2.6.0, Bridge 0.6.0
tags: [release, server, sync, read-along, audible, bridge, metadata]
covers:
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
  - upcoming-releases
  - read-along
  - audible-backup
  - audible-listening-sync
  - smarter-bulk-matching
  - help-complete-the-community-database
  - back-up-before-upgrading
  - server-2-5
---

AudioSilo Server **2.6.0** came out on 7 November. Your server now keeps an eye on the series you listen to and tells you what's coming, in the player and in your calendar. Your devices send what you listened to rather than just where you are, so listening on two devices, or offline, comes together properly. The player's **Text** tab follows the ebook as the narrator reads it. And **Bridge 0.6.0**, out the same day, brings Audible to the Bridge: sign in to your accounts, back up the books you bought into your library, and keep your listening place in step with the Audible app.

**Where it runs:** the new listening features are in the **web player bundled with the server** (`/web`) today. **App 2.6.0** for iPhone, iPad and Android brings them to the apps once it reaches the App Store and Google Play. Older apps keep working with 2.6 as before, without Upcoming, Sync v2 or the Text tab. An Apple Watch companion for the iPhone app isn't available yet; we'll say so here when it is.

## How to update

Update with `docker compose pull && docker compose up -d`, or from [GitHub Releases](https://github.com/KodeStar/audiosilo-server/releases). Eleven database migrations (0059 to 0069) run on first start. Before they run, the server copies your database into its backups folder, as it has since 2.5 (see [How to back up a self-hosted app before you upgrade it](/blog/back-up-before-upgrading/)).

- **Docker needs 20.10.10 or newer.** The image now uses the native SQLite engine, and older Docker can stop it at start-up. `docker version` shows yours.
- **If you run a Bridge, update it to 0.6.0** (`ghcr.io/kodestar/audiosilo-bridge`) alongside the server. Audible needs the two together. Older Bridges keep their previous jobs, and making read-alongs still needs Bridge 0.5.0 or later.
- **Run a scan** afterwards to pick up the new tag hints for matching and series from folder names (below). You don't need to rebuild the index.

## What's coming in your series

Once a day your server checks the series in your library against the community catalogue at [meta.audiosilo.app](https://meta.audiosilo.app), and the player shows what it finds:

- **Coming up in your series** on Home: preorders, recent releases and the volumes your library is missing, with their covers. Your server fetches the covers, so your device doesn't contact the sites they come from.
- An **Upcoming** page with everything, and release dates on the books you don't have yet on each series page.
- **Add release days to your calendar.** Upcoming gives you a private link to subscribe to in Apple Calendar, Google Calendar, Outlook or any calendar app that takes a link. A book with an exact release day is an all-day event; a changed date moves it, and adding the book to your server removes it. Keep the link private, as anyone with it can read that feed, and resetting it stops the old one. A cloud calendar such as Google Calendar needs to reach your server at a public HTTPS address with a trusted certificate.

The dates are the earliest audiobook release the catalogue knows, which can differ from your local store. It's on by default while community metadata is on, the first full check runs about an hour after the server starts, and kids' accounts don't see it. More in [Upcoming releases: what's coming in the series you listen to](/blog/upcoming-releases/), and in the docs' [Upcoming releases](https://docs.audiosilo.app/users/listening/upcoming).

## Sync v2: listening across devices and offline

- **Your devices send what you listened to, not just a position.** Listening waits on the device while it's offline and joins up when the server is reachable again. History, the Journal and your stats count it on the day you listened, and listening sent twice is counted once.
- **Nothing moves your place back by itself.** When two devices listened without seeing each other's place, the server keeps the place further on and remembers the other. The player offers **Jump** or **Stay**, naming the device, rather than quietly moving you. A finished book stays finished until you start it again.
- **See what has reached your server.** Home and your account page show listening waiting to sync, and the account page lists anything the server couldn't accept, with the reason.

It needs the 2.6.0 player; older apps keep saving their place as before. See [Listening on more than one device](https://docs.audiosilo.app/users/listening/playback#listening-on-more-than-one-device) and [Listening sync](https://docs.audiosilo.app/users/listening/account#listening-sync) in the docs.

## Follow the narration

In 2.5.1 a Bridge learned to make read-alongs, lining a book's ebook up with its narration sentence by sentence. Now the player uses them. The player's **Text** tab follows the ebook as you listen, highlighting the sentence you hear and turning the pages. Tap a sentence to move there; turn the page yourself to browse, and **Back to narration** brings you back. The full-screen reader has **Follow narration** too, and following doesn't move your separate reading place.

A downloaded book keeps its read-along with its ebook, so it works offline. A missing or out-of-date read-along isn't offered to listeners; an admin can make one from the player with a Bridge that makes read-alongs (0.5.0 or later). The whole tour is in [Read along: the ebook follows the narration in the AudioSilo player](/blog/read-along/).

## Audible on the Bridge

With **Bridge 0.6.0** and the **Audible** module turned on in the console (it starts off):

- **Sign in on the Bridge's Accounts tab.** Each Audible account belongs to a person on your server and a books library. Your Amazon credentials stay sealed on the Bridge. The console's **Settings > Audible** lists the account's titles, shows which are already on your server, and where a backup would go.
- **Back up books you bought into your library.** Back up one title, **Back up everything**, or set a policy for future purchases: every new book, or new books in series you already have. The Bridge saves an M4B without re-encoding the audio, keeps the chapters, places it beside your series' other books (or by a template or destination you choose), never replaces an existing file, and asks the server to index it. Backups need the library mapped and writable on the Bridge.
- **Keep your place in step, both ways.** Turn on **Sync listening places with Audible** for an account. About every 15 minutes the Bridge brings across an Audible place that is further on, and a few minutes after you stop listening in AudioSilo it can send your place back to Audible. **Don't sync** leaves a title out. Only places move: Audible listening adds nothing to your AudioSilo history or stats.

It's meant for **a personal backup of books you bought**, with your own account; laws on removing DRM differ from country to country, so check yours first. **A known limitation:** the Audible app can still resume at an older place after the Bridge has reported sending yours ([Bridge #51](https://github.com/KodeStar/audiosilo-bridge/issues/51)). More in [Back up your Audible books straight into your AudioSilo library](/blog/audible-backup/) and [Audible and AudioSilo keep your listening place in step, both ways](/blog/audible-listening-sync/), and in the docs' [Audible](https://docs.audiosilo.app/users/admin/audible).

## Smarter matching

**Match automatically** gets more of a library right, with less waiting:

- **More of what your files already say.** Matching weighs narrator, language, series position and running time alongside title and author. ASIN and ISBN tags count as hints to check, so a stray identifier in a file doesn't mark a book matched on its own.
- **Fewer right books stuck in review, fewer bad guesses in it.** An identifier the community knows, whose recording fits, no longer waits behind an almost-equal runner-up, and very weak guesses stay out of the review list.
- **Cleaner titles.** **Fill in what's missing** can strip a series label, book number or edition clutter from a confidently matched title. Your own edits stay locked, and matching never rewrites your audio tags.
- **The right recording**, with more care over running time and dramatizations, and **books with no ASIN or ISBN**: a confident match to a store listing can apply when the full author and series position agree and both lengths are within 2%. A match is now remembered per book, so later runs skip it, and for a book matched with no ASIN or ISBN, **Unlink** on its page removes it.
- **Online runs are quicker.** Against meta.audiosilo.app, the match and its details arrive together, six books are checked at once, and busy or rate-limited answers are retried.

**A known limitation:** reverting a community ASIN on a matched book doesn't reject the match, and a later refresh can write the ASIN back. To remove a match, clear the book's ASIN and ISBN, then use **Unlink** before the next refresh ([server #330](https://github.com/KodeStar/audiosilo-server/issues/330)). If you host your own metadata service, deploy v0.25.5 or later as well. The details, and what one benchmark measured, are in [Match automatically gets more of your library right](/blog/smarter-bulk-matching/).

## Help fill gaps in the community catalogue, if you choose

**Help complete the community database** is a new switch in **Settings > Community metadata**, **off** by default. Once on, a daily job checks your books' ASINs and reports the ones the community catalogue doesn't know: ASINs only, with no file names, paths, people, listening history or server identifier. It works with a local copy too, where the checks stay on your server and only the report goes out. See [Help complete the community database from your own server](/blog/help-complete-the-community-database/).

## Folder names that state their series

- **A book named `Author; Series; Book 02; Title`** now gives its series and number, from its folder or file name, when the tags leave them out. `Book 01-03` is a range, and `Book XX` or `Book 00` puts the book in the series with no number.
- **An album tag that's only the series name** no longer hides the book's title: the server uses the title tag or the title from the path instead.

A scan after the upgrade picks both up for the books you have, and your own edits stay. See [Organizing your library](https://docs.audiosilo.app/users/getting-started/organizing-your-library).

## Faster database work on Linux

The Docker image and the native Linux downloads now use the native SQLite engine, with a faster matching path. The macOS and Windows downloads keep the pure-Go engine. The database format is the same, and on Linux you can switch back with `AUDIOSILO_SQLITE=modernc` and a restart.

## Fixes worth knowing

- **Changing your password signs your other sessions out**, keeping the device you changed it on. An admin's password reset and **Sign out everywhere** end sessions too. Personal API keys and calendar links keep working.
- **Android, in app 2.6.0:** a very long single-file M4B or M4A book no longer runs out of memory at chapter changes.
- **Characters and recaps follow your copy's chapters**, and an appearance past the last chapter reads **Near the end**.
- **Unlink** is refused while a match run is working, so the run can't write the match back.

## After updating

- **New defaults:** Upcoming checks are on while community metadata is on. The unknown-ASIN report is off, the Audible module starts off, and Audible place sync is off for every account until you turn it on.
- **An Audible account** signed in with an older device profile may need **Sign in again** on the Bridge, then **Back up** again for titles that failed.
- **Minimum app version is unchanged.** Older iOS and Android apps keep working; Upcoming, Sync v2 and following the narration need app 2.6.0 or the bundled web player.

Every change to the player API is additive, so existing iOS, Android and web players keep working. The full notes: [v2.6.0](https://github.com/KodeStar/audiosilo-server/releases/tag/v2.6.0) and [Bridge v0.6.0](https://github.com/KodeStar/audiosilo-bridge/releases/tag/v0.6.0).
