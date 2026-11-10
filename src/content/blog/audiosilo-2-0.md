---
title: "AudioSilo 2.0: the redesigned player, now in the App Store and on Google Play"
description: A new player rebuilt around the whole book, on the web, iPhone, iPad and Android. What's in 2.0, from the whole-book timeline and Sleep timer 2.0 to your Year in listening.
kind: release
published: 2026-10-12
updated: 2026-11-10
verified: 2026-10-24
appliesTo: App 2.0.0 (iOS, Android), server 2.0.0 and later
tags: [release, app, player, redesign]
covers:
  - app:stores
  - app:full-player
  - app:sleep-timer
  - app:home
  - app:library
  - app:search
  - app:journal
  - app:year-in-listening
  - server:web_player
  - server:addresses
  - server:import
  - docs:/users/listening/full-player
  - docs:/users/listening/you
  - docs:/users/listening/mobile-apps
related:
  - player-tips
  - pair-your-phone
  - server-2-2
  - server-2-3
revisions:
  - date: 2026-11-10
    note: "Rewritten to be shorter and easier to read. No facts changed."
hero: ../../assets/stills/player-ipad-player-dark.webp
heroAlt: The AudioSilo full player on an iPad, with the chapter seek bar, the whole-book timeline with bookmark pins, and Who's who alongside
---

AudioSilo 2.0 is a new player, rebuilt from the ground up around the whole book. It's the same app with the same look on the web, iPhone, iPad and Android, in light and dark (new installs follow your system).

It reached the **App Store** for iPhone and iPad on 10 October and **Google Play** on 12 October. It has been the web player of every AudioSilo server since server 2.0.0, released on 8 October.

## Get it

1. Install it from the [App Store](https://apps.apple.com/us/app/audiosilo/id6783431375) or [Google Play](https://play.google.com/store/apps/details?id=app.audiosilo), or open `/web` on your server.
2. [Pair it with a QR code](/blog/pair-your-phone/).

No server? Try it in the [live demo](https://demo.audiosilo.app/web/demo).

## Browse

- **Home**: what you're listening to, with the time left at your speed and when you'll finish. Then Continue listening, Next in your series, This week, and shelves like Recently added and Favourites.
- **Library**: books, authors, series, narrators, collections and folders, as a grid or a list, with filters, sorting and an A-Z rail.
- **Series bookcase**: a series as spines in reading order, the book you're on face-out, and ghost spines for the books you don't have yet.
- **Search** across all your servers for books, authors, series, narrators and the characters you've met so far, never ahead of where you are.
- **Up next**: a queue you can drag to reorder, with suggestions to carry on a series.

## The player

- **The whole-book timeline** shows every chapter, bookmark and note, under a chapter seek bar that gives fine control even in a long book.
- **Undo a jump**: after any skip of more than a minute, a "Back to" chip takes you back.
- **Sleep timer 2.0**: stop after a set time with a gentle fade, or at the end of this or a later chapter. If you nod off, it marks where and offers to jump back. In the apps, a shake keeps the book going.
- **Companion**: Who's who and Story so far from the community database, revealed only up to where you are, plus a "Previously on" after a break. These appear for books someone has written recaps and characters for.
- **End of book**: the next book in the series, your stats for this one and a rating.
- **Bookmarks and notes**: labels on bookmarks, and notes pinned to a moment.

See [The full player](https://docs.audiosilo.app/users/listening/full-player).

## You and your listening

- **Journal**: your listening history, bookmarks and notes across every book, exported to Markdown or CSV.
- **You**: a listening calendar, your listening clock, a yearly goal and streak, and your top authors, narrators and series.
- **Year in listening**: a story of your year you can share as an image.
- **Settings and Account** are regrouped so each setting lives in one place. Your devices (and sign-out) are under Account.

See [You](https://docs.audiosilo.app/users/listening/you).

## On the web

The web player at `/web` has keyboard shortcuts (press `?`) and **⌘K** / Ctrl+K quick search that also runs actions. Books your browser can't play are converted on the fly when the server has ffmpeg, which the Docker image includes.

## Home and away

The apps know both of your server's addresses and switch on their own: the home address on your network, the public one when you're out. Your admin sets the home address once (Server > Settings > General > **Home address**). See [Listen away from home](/blog/listen-away-from-home/).

## Server 2.0 alongside

Server 2.0.0 bundles this player at `/web` and adds the home and away addresses. It also brings **Import listening history from Audiobookshelf**, so people moving over keep their stats, streaks and finished dates. See [Moving from Audiobookshelf](/blog/moving-from-audiobookshelf/).

## Good to know

- The web player needs a recent browser: about Safari 16.4, Chrome 111 or Firefox 128 or newer.
- Every change to the player API is additive, so older apps keep working with newer servers.
- New to AudioSilo? Start with [Self-hosted audiobook server](/blog/self-hosted-audiobook-server/). For the hidden gems, see [14 player features worth knowing](/blog/player-tips/).
