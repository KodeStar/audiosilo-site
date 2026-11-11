---
title: "Upcoming releases: what's coming in the series you listen to"
description: AudioSilo now checks your series daily and shows their preorders, new releases and missing volumes in the player and the console, and release days in your calendar.
kind: feature
published: 2026-11-07
updated: 2026-11-10
verified: 2026-11-08
appliesTo: Server 2.6.0 with its bundled web player, app 2.6.0
tags: [series, metadata, player, admin, notifications]
covers:
  - app:stores
  - server:upcoming
  - server:metadata
  - server:metadata-mirror
  - server:series
  - server:notifications
  - server:admin_ui
  - server:upcoming_calendar
  - server:upcoming_covers
  - server:meta_covers
  - server:addresses
  - server:tls
  - app:upcoming
  - app:home
  - app:series
  - app:you
  - app:kids
  - docs:/users/listening/upcoming
  - docs:/users/getting-started/remote-access
  - docs:/users/listening/browsing
  - docs:/users/listening/you
  - docs:/users/admin/server
  - docs:/users/admin/books
  - docs:/users/admin/notifications
related:
  - server-2-6
  - fix-covers-and-series
  - player-tips
  - server-2-5
revisions:
  - date: 2026-11-10
    note: "Rewritten to be shorter and easier to read. No facts changed."
  - date: 2026-11-08
    note: "App 2.6.0 is on the App Store now; on Android, the APK until 2.6.0 reaches Google Play."
  - date: 2026-11-07
    note: "Android users can install app 2.6.0 now from the APK on GitHub."
---

From version 2.6.0, AudioSilo keeps an eye on the series in your library. Once a day your server checks for preorders, recent releases and volumes you're missing, and the player shows them on Home, on an **Upcoming** page and on each series page. You can also subscribe your calendar to the release days.

## What it needs

- **Server 2.6.0 or later** with the [community metadata](https://docs.audiosilo.app/users/admin/server#community-metadata) lookup on. The list comes from the community database on [AudioSilo Meta](https://meta.audiosilo.app), which is free and community-run. No [Bridge](https://docs.audiosilo.app/users/admin/bridge) is needed.
- **Check for upcoming releases** on, in the console's **Server > Settings > Community metadata**. It's on by default.
- **The web player your 2.6.0 server serves**, or **app 2.6.0** for iPhone, iPad and Android: on the App Store now, and on Android from the APK on [its GitHub release](https://github.com/KodeStar/audiosilo-frontend/releases/tag/v2.6.0) until 2.6.0 reaches Google Play (see [Android without Google Play](https://docs.audiosilo.app/users/listening/mobile-apps#android-without-google-play)). Older players carry on without it.

Only series you have at least one book of are checked, and a book you already have is never listed. Your server asks AudioSilo Meta only about series and books, never about who is listening. With a [local copy](https://docs.audiosilo.app/users/admin/server#keeping-a-local-copy) of the community database, it answers the check itself.

## Coming up in your series

Home gets a **Coming up in your series** shelf, after **Next in your series**: preorders first, then recent releases, then missing books. Each shows its cover, title, series number and a date. Your server fetches the covers, so your device never contacts the sites they come from. Tap a book to open its series, or **See all** for the Upcoming page.

The shelf only appears when there's something in it.

## The Upcoming page

The page lists everything in up to three groups:

- **Coming soon**: preorders, soonest first.
- **Just released**: books out in the last 90 days (an admin can change this), newest first.
- **Missing from your series**: a gap below your latest book (you have 3 and 5, so 4 is missing), or the next book after it.

Open it from **See all** on Home, the **Upcoming** section of the **Me** tab on a phone, or **You** in the top bar on a tablet or computer.

Each book has one date, as precise as the community database knows it:

| Group | Example |
|---|---|
| Preorder | **Out Nov 12, 2026** |
| Recent release | **Released Oct 2026** |
| Missing book | **First released 2014** |

A **New** badge marks a book your server first listed in the last seven days. With more than one server, the shelf and page combine them, and each book shows once.

## Add to your calendar

The **Add to your calendar** card on the Upcoming page gives you a private link to subscribe to. Each book coming out shows as an all-day event on its release day. If a date slips, the event moves; a book you add to your library drops out.

1. Press **Get calendar link**.
2. On an iPhone, iPad or Mac, press **Subscribe** and confirm in Calendar. Anywhere else, press **Copy link** and paste it into Google Calendar, Outlook or any app that can add a calendar from a link.

With more than one server, each gets its own row and link.

Only books with a known release day go in: preorders and recent releases. Events are named like *"Leviathan Falls (The Expanse #9)"* and show as free time. Calendar apps re-check on their own schedule, so a new release can take a while to appear.

**Cloud calendars need a public address.** Google Calendar, Outlook on the web and an Apple Calendar subscription kept in iCloud fetch the link from the internet. They need a public HTTPS address with a trusted certificate (see [Remote access](https://docs.audiosilo.app/users/getting-started/remote-access)). When your admin has set the server's public address, the link uses it.

**Treat the link like a password.** Anyone with it can see your upcoming releases, though nothing else. It's shown only on the device that made it. **Reset link** makes a new one and stops the old one; **Turn off** stops it altogether.

## Dates on series pages

A series page's ghost spines for books you don't have now show when they're out: **Out Nov 12, 2026** instead of **Not in your library**, or the year a released book first came out. These dates show whenever the lookup is on, even with the daily check off.

## In the admin console

On **Library > Series**, a gap now shows its release date ("12 Nov 2026", "Nov 2026" or "2026"), with **Preorder** or **New** where there's room.

The **Check for upcoming releases** switch sits under **Look up community metadata**. Under it, the console shows when the last check ran and what it found, or in red why it failed. The first check runs when you switch it on, or about an hour after the server starts.

## A notification when a book comes out

Admins get a new notification, **New releases in your series**. When a book comes out in a series your libraries hold and your server doesn't have it, the daily check sends one message with up to five titles. It goes to your [notification channels](https://docs.audiosilo.app/users/admin/notifications#what-to-send) and the console's bell.

Each book is announced once. The first check only notes what's already out, so you aren't flooded.

## Good to know

- **Standalone books aren't checked**, nor series with none of their books on your server.
- **Kids don't see it.** No shelf, page, You section or calendar link. A link made before an account became a kid's stops working. The [demo](https://docs.audiosilo.app/users/demo) shows upcoming releases, but demo accounts can't subscribe to a calendar.
- **Dates come from the community database.** A book with no date has no date line. The date is the first release anywhere, so your local store may get it a little later.
- **Home-only addresses** and self-signed certificates work only in a calendar app that fetches the link itself, on a device that reaches and trusts your server.

## More

[Upcoming releases](https://docs.audiosilo.app/users/listening/upcoming) in the docs covers the shelf, page and dates with screenshots, and [Add to your calendar](https://docs.audiosilo.app/users/listening/upcoming#add-to-your-calendar) has steps for Apple Calendar, Google Calendar and Outlook. For admins: [Community metadata](https://docs.audiosilo.app/users/admin/server#community-metadata), [Series](https://docs.audiosilo.app/users/admin/books#series) and [What to send](https://docs.audiosilo.app/users/admin/notifications#what-to-send). If your series look wrong, [Fix covers and series](/blog/fix-covers-and-series/) helps first.
