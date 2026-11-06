---
title: Help complete the community database from your own server
description: From server 2.6.0, an opt-in setting sends the community database, once a day, the Audible ASINs of your books it doesn't know, and nothing else, so they can be added.
kind: feature
published: 2026-11-06
verified: 2026-11-06
appliesTo: Server 2.6.0
tags: [metadata, admin, privacy]
covers:
  - server:metadata
  - server:metadata-mirror
  - server:metadata-report
  - server:demo
  - meta:intake
  - meta:sync
  - docs:/users/admin/server
  - docs:/users/faq
related:
  - smarter-bulk-matching
  - upcoming-releases
  - fix-covers-and-series
draft: true
---

Your server looks each book up in the free, community-run catalogue at [meta.audiosilo.app](https://meta.audiosilo.app) by its ASIN or ISBN. When the catalogue doesn't have a book, the lookup comes back empty, and until now that's where it ended: nobody on the community side knew the book was missing. Server 2.6.0 adds a setting that tells them. It's called **Help complete the community database**, and it's **off** until you turn it on.

## What it needs

- **Server 2.6.0 or later**, with **Look up community metadata** on. The new switch works only while the lookup is on, and is greyed out otherwise.
- The switch itself, in the admin console's **Server > Settings > Community metadata**.

Players aren't involved. Nothing changes for listeners, and no app update is needed.

## What it does once a day

While the switch is on, the server does three things once a day:

1. It collects your books' Audible ASINs: each book's own ASIN, and an ASIN from a book's tags only when the book has no ASIN or ISBN of its own (nor one you edited or cleared) and no other book's tags carry the same ASIN.
2. It looks each one up in the community database first, as the ordinary lookup always does, and keeps only the ones the database doesn't know. That's up to 500 lookups a day, and an ASIN is looked up again after 30 days.
3. It sends those unknown ASINs to the metadata service, and nothing else: no titles, file paths, server name, or anything about who listens.

An ASIN already sent isn't sent again for a month, and one the database later adds stops being sent.

## With a local copy

If you [keep a local copy](https://docs.audiosilo.app/users/admin/server#keeping-a-local-copy) of the community database (`metadata.mode: mirror`), the lookups are answered by the copy on your server and stay there. Only the report itself goes to the metadata service, and nothing is sent until the copy is ready.

## What the service keeps

The service sees your server's IP address while it receives a report, as any web service sees the address of a request. Here's what happens after that, as the [meta.audiosilo.app privacy page](https://meta.audiosilo.app/privacy) ("Reports of unknown books") puts it:

- It stores each ASIN with a count and the first and last day it was reported, and stores no IP address with them.
- An address is held in memory for about a day after its last request, to enforce a rate limit.
- At meta.audiosilo.app these reports aren't written to the access log when they arrive over HTTPS, which is how AudioSilo servers send them.
- The web server's error log can still record the address of a request that goes wrong, such as a report that can't reach the service while it's restarting.

Your server sends reports only over HTTPS. With a **Service address** that starts with `http://` (other than one on the same machine, for testing), nothing is sent. A server in [demo mode](https://docs.audiosilo.app/users/admin/server#demo-mode) never sends a report.

## What happens to a report

A report is a suggestion of where to look, never a record. Nothing in it goes into the database as it is.

The community database's sync bot, the one that already keeps the series it holds complete, reads the reported ASINs and looks each one up as a real Audible listing. What it can add from them is kept narrow:

- **A standalone book**, as a new work in no series.
- **A new volume of a series the database already holds.** It never starts a new series from a report.

Each change is a pull request on the [community database](https://github.com/KodeStar/audiosilo-meta) with at most 25 records, at most one every 48 hours, and each is checked by an AI review before it's merged. The first such import, on 2026-11-05, added 5 works ([audiosilo-meta#2895](https://github.com/KodeStar/audiosilo-meta/pull/2895)).

Once a book is in, the next lookup of it finds it, on your server and on every other server that has it.

## Telling how it's going

While the switch and the lookup are both on, a line under the switch says how the last report went:

- "Not sent yet": the first report goes out as soon as you switch it on, or about an hour after the server starts.
- "Last report *when*: *N* unknown ASINs sent", or "Last checked *when*: nothing new to send" when every ASIN is known or was sent recently.
- "Last tried *when*: the metadata service doesn't take reports". An older service, or one run with reports turned off, is then left alone for a week.
- In red, "Last report failed *when*; it's tried again tomorrow." Any ASIN the service didn't accept is sent again next time.

## Turning it off

Switch it off and the reports stop. Turning **Look up community metadata** off stops them too, along with every other lookup. The full rules are in the docs: [Helping complete the community database](https://docs.audiosilo.app/users/admin/server#helping-complete-the-community-database), and the [FAQ](https://docs.audiosilo.app/users/faq) on what your server sends. For the other 2.6.0 change to how books are found, see [Match automatically gets more of your library right](/blog/smarter-bulk-matching/).
