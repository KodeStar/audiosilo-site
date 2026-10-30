---
title: "Upcoming releases: what's coming in the series you listen to"
description: AudioSilo now checks the series in your library once a day and shows the preorders, new releases and missing volumes in them, in the player and the admin console.
kind: feature
published: 2026-10-30
verified: 2026-10-30
appliesTo: Server 2.6.0, app 2.6.0
tags: [series, metadata, player, admin, notifications]
covers:
  - server:upcoming
  - server:metadata
  - server:metadata-mirror
  - server:series
  - server:notifications
  - server:admin_ui
  - app:upcoming
  - app:home
  - app:series
  - app:you
  - app:kids
  - docs:/users/listening/upcoming
  - docs:/users/listening/browsing
  - docs:/users/listening/you
  - docs:/users/admin/server
  - docs:/users/admin/books
  - docs:/users/admin/notifications
related:
  - fix-covers-and-series
  - player-tips
  - server-2-5
draft: true
---

Finishing book five and then finding out, months later, that book six came out in the spring is a very familiar way to lose track of a series. From version 2.6.0, AudioSilo keeps an eye on the series in your library for you. Once a day your server checks which books in them you can preorder, which came out recently and which volumes your library is missing, and the player shows them on the home screen, on an **Upcoming** page and on each series page. Admins see the same dates in the console, and can be told when a new book comes out.

## What it needs

- **Server 2.6.0 or later** with the [community metadata](https://docs.audiosilo.app/users/admin/server#community-metadata) lookup on. The list comes from the free, community-run catalogue at [meta.audiosilo.app](https://meta.audiosilo.app). No [Bridge](https://docs.audiosilo.app/users/admin/bridge) is needed.
- **Check for upcoming releases** on, in the console's **Server > Settings > Community metadata**. It's on by default.
- **App 2.6.0 or later**, or the web player your 2.6.0 server serves, to see it as a listener. Older players and apps carry on as before, without it.

The check covers the series your libraries hold, so it only lists series you have at least one book of, and never a book you already have. Your server asks the metadata service only about series and books, never about who is listening, and with a [local copy](https://docs.audiosilo.app/users/admin/server#keeping-a-local-copy) of the community metadata it answers the check itself.

## Coming up in your series

The player's home screen gets a **Coming up in your series** shelf, right after **Next in your series**: preorders first, then recent releases, then the books you're missing. Each book is a pale "ghost" cover, since it isn't on your server and there's no artwork to show, with its title, the series and its number in it, and a date line. Tap one to open its series page, or **See all** for the Upcoming page.

The shelf only appears when there's something in it. Before your server's first check, or when nothing is coming up, Home looks just as it did.

## The Upcoming page

The Upcoming page lists everything, in up to three groups:

- **Coming soon**: books you can preorder, the soonest first.
- **Just released**: books that came out in the last 90 days (an admin can change how far back that goes), the newest first.
- **Missing from your series**: books that aren't on your server and aren't preorders. That's a gap below the latest book you have (you have books 3 and 5, so 4 is missing), or the next book after it.

You'll find it from **See all** on Home, in the **Upcoming** section of the **Me** tab on a phone, or under **You** in the top bar on a tablet or computer. The You section is there whenever your server offers upcoming releases, so you can open the page even while Home has nothing to show.

Each book has one date, as precise as the community catalogue knows it: **Out Nov 12, 2026** for a preorder, **Released Oct 2026** for a recent release, **First released 2014** for a missing book. The date is the book's first release anywhere, the earliest the catalogue lists across its recordings and stores, so your local store may get a new book a little later than the date says. A small **New** badge marks a book your server first listed in the last seven days.

If you're connected to more than one server, the shelf and the page combine them. A book shows once even when two of your servers both lack it, and one listed by a server other than your main one says which server it came from.

## Dates on series pages

A series page already shows the books you don't have as ghost spines. Now a ghost that isn't out yet says when it will be: **Out Nov 12, 2026** in the list, instead of **Not in your library**. A ghost that's already out shows the year it first came out. These dates come straight from the community catalogue, so they show whenever your server's lookup is on, even with the daily check switched off.

## In the admin console

On **Library > Series**, a series with a matched book already shows the books you don't have as dashed gaps. A gap now shows its release date beside its title ("12 Nov 2026", "Nov 2026" or "2026"), with **Preorder** before it for a book that isn't out yet and **New** for one that came out in the last 90 days, where the spine is tall enough. It's a quick way to see what you could add.

The **Check for upcoming releases** switch sits under **Look up community metadata** and works only while the lookup is on. Under it, the console says when the last check ran and how many series and books it found, or, in red, why it failed. The first check runs as soon as you switch it on, or about an hour after the server starts.

## A notification when a book comes out

There's a new notification for admins: **New releases in your series**. When a book comes out in a series your libraries hold and your server doesn't have it (a preorder whose day has come, or a book released recently), the daily check sends one message, with up to five titles. It goes wherever you send your other [notifications](https://docs.audiosilo.app/users/admin/notifications#what-to-send) and always shows in the console's bell.

Each book is announced once and never again. The first check after you turn it on, or after a series first appears on your server, only notes what is already out, so you aren't flooded with messages about old books.

## What it doesn't do

- **It's for series you already have.** A series with none of its books on your server isn't checked, and a standalone book isn't either.
- **Kids don't see it.** A kid's account gets no shelf, no Upcoming page and no You section. The [demo](https://docs.audiosilo.app/users/demo) shows it like any other account.
- **The dates are the community catalogue's.** A book the catalogue has no date for has no date line, and the date is the first release anywhere, not necessarily in your country.
- **The notification is for admins.** Listeners see what's coming in the player; the message goes to the console's notification channels.

## More

[Upcoming releases](https://docs.audiosilo.app/users/listening/upcoming) in the docs covers the shelf, the page, the dates and the empty states with screenshots. For admins, see [Community metadata](https://docs.audiosilo.app/users/admin/server#community-metadata) for the switch, [Series](https://docs.audiosilo.app/users/admin/books#series) for the console's dated gaps and [What to send](https://docs.audiosilo.app/users/admin/notifications#what-to-send) for the notification. If your series look wrong to begin with, [Fix covers and series](/blog/fix-covers-and-series/) helps first.
