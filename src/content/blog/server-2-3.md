---
title: "AudioSilo Server 2.3: household members, Chromecast and a local metadata copy"
description: Add kids and grown-ups from the player, see what the house is playing, cast to a Chromecast, keep the community database on your server, and read Audiobookshelf's metadata.json.
kind: release
published: 2026-10-14
updated: 2026-11-10
verified: 2026-10-19
appliesTo: Server 2.3.0 and 2.3.1, with its bundled web player
tags: [release, server, household, chromecast, metadata]
covers:
  - server:household
  - server:household_members
  - server:cast
  - server:tls
  - server:series
  - server:metadata-mirror
  - server:metadata
  - server:abs-metadata-json
  - app:household
  - app:cast
  - docs:/users/listening/household
  - docs:/users/listening/in-the-house
  - docs:/users/listening/chromecast
  - docs:/users/admin/server
  - docs:/users/getting-started/remote-access
related:
  - server-2-2
  - moving-from-audiobookshelf
  - fix-covers-and-series
  - listen-away-from-home
  - server-2-4
supersededBy: server-2-4
supersededNote: Server 2.4 is out, with podcasts, a Bridge that writes characters, recaps, descriptions and chapters, a guided first run for new servers, genres and tags, and files in natural order. Everything below still applies.
revisions:
  - date: 2026-11-10
    note: "Rewritten to be shorter and easier to read. No facts changed."
hero: ../../assets/stills/server-people-dark.webp
heroAlt: The People page in the AudioSilo admin console, every household account with what they are listening to and how many devices they use
---

AudioSilo Server **2.3.0** and **2.3.1** came out on 14 October. 2.3.0 is about the people you listen with: household members, an opt-in view of what the house is playing, and casting to a Chromecast. It also tidies up series and can keep the community metadata on your own disk, and 2.3.1 reads Audiobookshelf's `metadata.json`.

**Where it runs:** the new listening features are in the **web player bundled with the server** (`/web`). The iPhone, iPad and Android apps in the stores are 2.0.0 and don't have them yet, but keep working with 2.3 as before.

## How to update

1. Back up your data folder. 2.3.0 runs five database migrations and 2.3.1 one, on first start.
2. Run `docker compose pull && docker compose up -d`, or install from [GitHub Releases](https://github.com/KodeStar/audiosilo-server/releases).

## Household members

Anyone with an account, not just the admin, can add the **kids and grown-ups** they live with, from the player. A **kid** is signed in on the owner's device in **kids mode**; a **grown-up** gets a pairing QR for their own device. Each member sees everything the owner can, or only the collections the owner shares. See [Your household](https://docs.audiosilo.app/users/listening/household).

## Listening in the house

People who opt in see what the rest of the household is **playing or just listened to**, and only books they could open themselves. It's **off by default** and reciprocal: you see others only while you share. See [Listening in the house](https://docs.audiosilo.app/users/listening/in-the-house).

## Chromecast

The web player can **cast a book to a Chromecast**, a TV with Google Cast or a Nest speaker, from Chrome, Edge and other Chromium browsers over HTTPS. The Cast device gets a short-lived token for that one book and never sees your sign-in. See [Chromecast](https://docs.audiosilo.app/users/listening/chromecast).

## Plain HTTP at home, for self-signed servers

Phone apps can't accept the server's own certificate. So the port now also answers **plain HTTP to devices on your home network**, sends everyone else to HTTPS, and pairing links tell the apps that address. Turn it off with **Plain HTTP at home** (Server > Settings > Network & HTTPS) or `AUDIOSILO_TLS_HOME_HTTP=false`.

## Series

- **Omnibus editions**: a series number can be a range, `1-3`. The book fills books 1 to 3, and "next in series" continues with book 4.
- **One series, any spelling**: "He Who Fights With Monsters" and "...with Monsters" are one series everywhere. The Series page is paged and searchable, and Health lists series spelled several ways.
- **Books in several series**: "next" follows every series a book is in without stepping backwards.

## Community metadata on your own server

- **Keep a local copy** (`metadata.mode: mirror`, Settings > Community metadata > Source): the server downloads the community database (about 450 MB, 1.8 GB on disk) and answers lookups from it, so no book is looked up over the internet.
- **Fill in matched books** (Health > Not matched) refreshes the details of books that already have an ASIN or ISBN.
- A match applies automatically only when the recording's length is within 10% of the book's, so a dramatization no longer lands on an unabridged book unasked.
- **Duplicates**: Health says when two books share an ASIN or ISBN, and warns when their lengths differ.

## 2.3.1: Audiobookshelf's metadata.json

AudioSilo now reads the `metadata.json` Audiobookshelf writes (its **Store metadata with item** setting). Its title, authors, narrators, series and number, published year, description, ASIN and ISBN go over the audio tags, and a book with an ASIN or ISBN counts as matched straight away. Your own edits still win, and AudioSilo never writes to the file. See [Moving from Audiobookshelf](/blog/moving-from-audiobookshelf/).

## Fixes

- Series cards pick the right community rail for sub-series (Tiffany Aching, not all of Discworld).
- The connect and setup pages now match the admin console's look, in light and dark.

## Good to know

- **Chromecast needs a trusted certificate.** A server on the default self-signed certificate can't cast.
- **Plain HTTP at home** is on by default, and off when you supply your own certificate. The apps use it from **app 2.1**, which isn't in the stores yet; until then they need a trusted certificate. Away from home always needs autocert or a reverse proxy: [Listen away from home](/blog/listen-away-from-home/).
- Household members are real accounts with their own progress, bookmarks and stats. Admins see households on the People page, and can turn the feature off or limit who may add members.

The full notes: [v2.3.0](https://github.com/KodeStar/audiosilo-server/releases/tag/v2.3.0) and [v2.3.1](https://github.com/KodeStar/audiosilo-server/releases/tag/v2.3.1).
