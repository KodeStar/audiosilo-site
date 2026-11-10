---
title: Help complete the community database from your own server
description: From server 2.6.0, an opt-in setting sends the community metadata service, once a day, the Audible ASINs of your books it doesn't know, and nothing else, so they can be added.
kind: feature
published: 2026-11-07
updated: 2026-11-10
verified: 2026-11-07
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
  - server-2-6
  - smarter-bulk-matching
  - upcoming-releases
  - fix-covers-and-series
revisions:
  - date: 2026-11-10
    note: "Rewritten to be shorter and easier to read. No facts changed."
---

Server 2.6.0 adds **Help complete the community database**, a setting that's **off** until you turn it on. Once a day, it sends the community metadata service the Audible ASINs of your books that the catalogue at [meta.audiosilo.app](https://meta.audiosilo.app) doesn't know, and nothing else. Those books can then be added for everyone.

## What it needs

- **Server 2.6.0 or later.** No app update is needed.
- **Look up community metadata** on. The new switch is greyed out otherwise.

Find it in the admin console under **Server > Settings > Community metadata**.

## What it does once a day

1. **Collects your books' Audible ASINs.** Each book's own ASIN, and an ASIN from a book's tags only when the book has no ASIN or ISBN of its own (nor one you edited or cleared) and no other book's tags carry the same ASIN.
2. **Keeps the unknown ones.** It looks each up in the community database, as the ordinary lookup does: up to 500 lookups a day, and an ASIN is looked up again after 30 days.
3. **Sends them** to the metadata service, and nothing else: no titles, file paths, server name, or anything about who listens. An ASIN already sent isn't sent again for a month, and one the database later adds stops being sent.

It sends only over HTTPS. With a **Service address** starting `http://` (other than one on the same machine, for testing), nothing is sent. A server in [demo mode](https://docs.audiosilo.app/users/admin/server#demo-mode) never sends a report.

With a [local copy](https://docs.audiosilo.app/users/admin/server#keeping-a-local-copy) of the database (`metadata.mode: mirror`), the lookups stay on your server. Only the report goes out, and not until the copy is ready.

## What the service keeps

The service sees your server's IP address while it receives a report, like any web service. After that, per the [meta.audiosilo.app privacy page](https://meta.audiosilo.app/privacy) ("Reports of unknown books"):

- It stores each ASIN with a count and the first and last day it was reported, with no IP address.
- An address is held in memory for about a day after its last request, for a rate limit.
- Reports over HTTPS aren't written to meta.audiosilo.app's access log.
- The error log can still record the address of a request that goes wrong, such as a report sent while the service is restarting.

## What happens to a report

A report is a suggestion of where to look, never a record. Nothing in it goes into the database as it is.

The database's sync bot looks each reported ASIN up as a real Audible listing. It can add only:

- **A standalone book**, as a new work in no series.
- **A new volume of a series the database already holds.** It never starts a new series.
- **Another edition of a book the database already holds.**

Each change is a pull request on the [community database](https://github.com/KodeStar/audiosilo-meta), with at most 25 records and at most one every 48 hours, checked by an AI review before it's merged. The [first such import](https://github.com/KodeStar/audiosilo-meta/pull/2895), on 2026-11-05, added 5 works.

Once a book is in, later lookups find it on any server that has it (with a local copy, once the copy next updates). A book whose ASIN is only in its tags isn't looked up by that ASIN: match it, by hand or with **Match automatically**, to find the new record.

## Telling how it's going

A line under the switch says how the last report went:

| Message | Meaning |
|---|---|
| "Not sent yet" | The first report goes out as soon as you switch it on, or about an hour after the server starts. |
| "Last report *when*: *N* unknown ASINs sent" | It worked. |
| "Last checked *when*: nothing new to send" | Every ASIN it looked up is known or was sent recently. |
| "Last tried *when*: the metadata service doesn't take reports ..." | With an `http://` **Service address**, it's tried daily and sends nothing until the address is fixed. An older service, or one with reports off, is left alone for a week. |
| "Last report failed *when*; it's tried again tomorrow." (in red) | Any ASIN the service didn't accept is sent again next time. |

## Turning it off

Switch it off and the reports stop. Turning **Look up community metadata** off stops them too, with every other lookup.

The full rules are in [Helping complete the community database](https://docs.audiosilo.app/users/admin/server#helping-complete-the-community-database), and the [FAQ](https://docs.audiosilo.app/users/faq#does-my-server-tell-anyone-which-books-i-have) covers what your server sends. For another 2.6.0 change, see [Match automatically gets more of your library right](/blog/smarter-bulk-matching/).
