---
title: Help complete the community database from your own server
description: From server 2.6.0, an opt-in setting sends the community metadata service, once a day, the Audible ASINs of your books it doesn't know, and nothing else, so they can be added.
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

Your server looks each book up in the free, community-run catalogue at [meta.audiosilo.app](https://meta.audiosilo.app) by its ASIN or ISBN. When the catalogue doesn't have a book, the lookup comes back empty, and until now that's where it ended: unless someone added the book by hand, the community side never heard it was missing. Server 2.6.0 adds a setting that tells them: **Help complete the community database**, **off** until you turn it on.

## What it needs

**Server 2.6.0 or later**, with **Look up community metadata** on: the new switch works only while the lookup is on, and is greyed out otherwise. It's in the admin console under **Server > Settings > Community metadata**. Players aren't involved, so no app update is needed.

## What it does once a day

While the switch is on, the server does three things:

1. It collects your books' Audible ASINs: each book's own ASIN, and an ASIN from a book's tags only when the book has no ASIN or ISBN of its own (nor one you edited or cleared) and no other book's tags carry the same ASIN.
2. It looks each one up in the community database first, as the ordinary lookup always does, and keeps only the ones the database doesn't know. That's up to 500 lookups a day, and an ASIN is looked up again after 30 days.
3. It sends those unknown ASINs to the metadata service, and nothing else: no titles, file paths, server name, or anything about who listens. An ASIN already sent isn't sent again for a month, and one the database later adds stops being sent.

It sends only over HTTPS: with a **Service address** that starts with `http://` (other than one on the same machine, for testing), nothing is sent. A server in [demo mode](https://docs.audiosilo.app/users/admin/server#demo-mode) never sends a report.

## With a local copy

If you [keep a local copy](https://docs.audiosilo.app/users/admin/server#keeping-a-local-copy) of the community database (`metadata.mode: mirror`), the lookups are answered by the copy on your server and stay there. Only the report itself goes to the metadata service, and nothing is sent until the copy is ready.

## What the service keeps

The service sees your server's IP address while it receives a report, as any web service sees the address of a request. Here's what happens after that, as the [meta.audiosilo.app privacy page](https://meta.audiosilo.app/privacy) ("Reports of unknown books") describes it:

- It stores each ASIN with a count and the first and last day it was reported, and stores no IP address with them.
- An address is held in memory for about a day after its last request, to enforce a rate limit.
- At meta.audiosilo.app these reports aren't written to the access log when they arrive over HTTPS, which is how AudioSilo servers send them.
- The web server's error log can still record the address of a request that goes wrong, such as a report that can't reach the service while it's restarting.

## What happens to a report

A report is a suggestion of where to look, never a record: nothing in it goes into the database as it is.

The community database's sync bot, the one that already keeps the series it holds complete, reads the reported ASINs and looks each one up as a real Audible listing. What it can add from them is kept narrow:

- **A standalone book**, as a new work in no series.
- **A new volume of a series the database already holds.** It never starts a new series from a report.
- **Another edition of a book the database already holds**, attached to that book as another recording or ASIN.

Each change is a pull request on the [community database](https://github.com/KodeStar/audiosilo-meta) with at most 25 records, at most one every 48 hours, and each is checked by an AI review before it's merged. The first such import, on 2026-11-05, added 5 works ([audiosilo-meta#2895](https://github.com/KodeStar/audiosilo-meta/pull/2895)).

Once a book is in, a later lookup of it finds it, on your server and on any other server that has it (with a local copy, once the copy next updates). A book whose ASIN is only in its tags isn't looked up by that ASIN: matching it, by hand or with **Match automatically**, can find the new record.

## Telling how it's going

While the switch and the lookup are both on, a line under the switch says how the last report went:

- "Not sent yet": the first report goes out as soon as you switch it on, or about an hour after the server starts.
- "Last report *when*: *N* unknown ASINs sent", or "Last checked *when*: nothing new to send" when every ASIN it looked up is known or was sent recently.
- "Last tried *when*: the metadata service doesn't take reports (it needs an https address and a service that accepts them)." With an `http://` **Service address** it's tried again daily, and sends nothing until the address is fixed; an older service, or one run with reports turned off, is left alone for a week.
- In red, "Last report failed *when*; it's tried again tomorrow." Any ASIN the service didn't accept is sent again next time.

## Turning it off

Switch it off and the reports stop. Turning **Look up community metadata** off stops them too, along with every other lookup. The full rules are in the docs: [Helping complete the community database](https://docs.audiosilo.app/users/admin/server#helping-complete-the-community-database), and the [FAQ](https://docs.audiosilo.app/users/faq#does-my-server-tell-anyone-which-books-i-have) on what your server sends. For another 2.6.0 change to how books are found, see [Match automatically gets more of your library right](/blog/smarter-bulk-matching/).
