---
title: "Characters and recaps from your own Bridge, and sharing them back"
description: A paired Bridge writes characters, chapter recaps and a spoiler-free description for books the community hasn't covered, and can send them, and your corrections, back to it.
kind: feature
published: 2026-10-24
updated: 2026-11-10
verified: 2026-10-28
appliesTo: Server 2.4.0 with Bridge 0.3.0, app 2.4.0
tags: [bridge, metadata, recaps, community, admin]
covers:
  - server:bridge
  - server:modules
  - server:contributions
  - server:metadata
  - server:chapters
  - app:recaps
  - app:companion
  - app:book-page
  - bridge:sidecars
  - bridge:contributions
  - docs:/users/admin/generating-characters-and-recaps
  - docs:/users/community/contributing-from-your-server
  - docs:/users/admin/bridge
  - docs:/users/getting-started/running-a-bridge
related:
  - fix-covers-and-series
  - admin-console-tour
  - server-2-4
  - podcasts
  - first-run-setup
revisions:
  - date: 2026-11-10
    note: "Rewritten to be shorter and easier to read. No facts changed."
  - date: 2026-10-28
    note: "Bridge 0.4.0: the Workers tab installs an ASR worker with one command."
---

With server 2.4.0 and a paired **Bridge**, AudioSilo's optional companion container, your server can write characters and chapter recaps for books the community database hasn't covered. Some hours later the book's **Characters** and **Recaps** tabs appear in the player.

If you like, the Bridge then offers them to the community database on [AudioSilo Meta](https://meta.audiosilo.app), so every other server gets them too.

## How it works

The Bridge transcribes the book (or reads its ebook), has an AI agent pick out the people and events, checks the result for mistakes and spoilers, and saves it with the book. You only see what you've reached, as with the community database's recaps.

## What it needs

- **A Bridge, version 0.3.0 or later,** paired and online, with its **agent container** and a credential: a Claude or ChatGPT subscription, or an Anthropic or OpenAI API key. See [Running a Bridge](https://docs.audiosilo.app/users/getting-started/running-a-bridge).
- **Community metadata switched on** (it is by default).
- **A library the Bridge can write to.** Results go in a hidden `.audiosilo` folder in the book's folder; your audio is never touched.
- **An admin account** to start it. Everyone who can listen to the book sees the results.

The book doesn't need a community match, an ASIN or an ISBN.

## Generating a book

1. On the book's page in the console, press **Generate characters and recaps** on the **Community metadata** card. (Admins see the same button in the player.)
2. Read the confirmation: whether it reads **the audio** or **the ebook beside it** (which skips transcription), how long transcription should take, and an **Agent cost** estimate.
3. Confirm. The page shows the current step, progress and time left. You can close it; the Bridge carries on.

**Generate for the series**, on a series card in **Library > Series**, queues every book without recaps in reading order.

| Part | Cost |
|---|---|
| Transcription | Only time. Runs on the Bridge, or on a faster computer as an ASR worker (from Bridge 0.4.0 the **Workers** tab gives one line to install it; see [Running a worker](https://docs.audiosilo.app/users/getting-started/running-a-worker)) |
| The agent | The only cost. Capped by default at **$100 a month** across all books and **$75 a book**, both adjustable. A job that reaches a cap pauses rather than failing |

## What you get

- **Characters** and **Recaps** tabs, and the companion's **Who's who** and **Story so far**, marked **Generated on this server**.
- **A short, spoiler-free description**, from the opening chapters only, shown in About when nothing else describes the book. It stays on your server.
- **Chapters for a single file that has none**, found where the narrator reads each heading. They arrive hours before the recaps. **Detect chapters** on the Health page does only this, with no agent cost.

The community database always comes first. Once it has a book's characters and recaps, yours step aside but stay in the book's folder.

## Sharing with the community

Everything stays on your server unless you send it. To be able to send it:

1. Sign the Bridge in to GitHub on its **Accounts** tab.
2. Turn on the **Contributions** module under **Server > Settings > Modules**.

A book's page in the console then offers:

- **Also contribute to the community**, in the Generate dialog, on by default.
- **Share with the community**, for a book you generated and kept local. Nothing is generated again, so the agent costs nothing.
- **Suggest corrections**, when your edits to a matched book's title, author, narrator, series, published date or ISBN differ from the community database's.

Each submission becomes an issue on the community database's GitHub repositories under your GitHub name, and is reviewed before it's merged. Nothing about your listeners, your library or your other books is sent.

## Good to know

- **Players:** the Generate button, the **Generated on this server** mark and the description need the web player bundled with your server (`/web`) or **app 2.4.0**. Older apps show the tabs only for books matched to the community database. Chapters a Bridge finds reach older apps too.
- **Sharing characters and recaps** needs the book to be matched to a community entry.
- **Corrections:** some, such as a title, apply automatically once checked; others wait for a maintainer.
- **Licences:** characters and recaps are shared under **CC BY-SA 4.0**, corrections as **CC0**, like the rest of the database.

## More

See [Generating characters and recaps](https://docs.audiosilo.app/users/admin/generating-characters-and-recaps), [Contributing from your server](https://docs.audiosilo.app/users/community/contributing-from-your-server) and [The Bridge](https://docs.audiosilo.app/users/admin/bridge), including [Share with the community](https://docs.audiosilo.app/users/admin/bridge#share-with-the-community) and [Suggest corrections](https://docs.audiosilo.app/users/admin/bridge#suggest-corrections). To fix a book's details by hand first, see [Fix covers and series](/blog/fix-covers-and-series/).
