---
title: "Characters and recaps from your own Bridge, and sharing them back"
description: A paired Bridge writes characters, chapter recaps and a spoiler-free description for books the community hasn't covered, and can send them, and your corrections, back to it.
kind: feature
published: 2026-10-24
verified: 2026-10-24
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
---

AudioSilo's community database at [meta.audiosilo.app](https://meta.audiosilo.app) gives many books a cast list and chapter-by-chapter recaps, with spoiler protection that only shows what you've reached. Plenty of books aren't covered yet. With server 2.4.0 and a paired **Bridge**, AudioSilo's optional companion container, your server can write them itself: the Bridge transcribes the book (or reads its ebook), has an AI agent pick out the people and the events, checks the result for mistakes and spoilers, and saves it with the book. Some hours later the book's **Characters** and **Recaps** tabs appear in the player. If you like, the Bridge then offers them to the community, so every other server gets them too.

**Where it shows:** the Generate button, the **Generated on this server** mark and the generated description are in the **web player bundled with your server** (`/web`) and in **app 2.4.0**. Until app 2.4.0 reaches your device, use the web player: older apps show the Characters and Recaps tabs only for books matched to the community, without the mark, and don't show a generated description. Chapters a Bridge finds reach older apps too.

## What it needs

- **A Bridge, version 0.3.0 or later,** paired with your server and online, with its **agent container** and a credential for the agent. A Claude or ChatGPT subscription works, or an Anthropic or OpenAI API key. [Running a Bridge](https://docs.audiosilo.app/users/getting-started/running-a-bridge) walks through the setup, and the Bridge's setup checklist (also shown in the console under **Server > Settings > Bridge**) says what is still to do.
- **Community metadata switched on** in the console (it is by default).
- **A library the Bridge can write to.** The results go in a hidden `.audiosilo` folder inside the book's folder; your audio files are never touched. The server itself still only reads.
- **An admin account.** Only admins see the Generate buttons. Everyone who can listen to the book sees the results.

The book doesn't need a community match, an ASIN or an ISBN to be generated.

## Generating a book

On a book's page in the console, the **Community metadata** card has **Generate characters and recaps**. A series card on **Library > Series** has **Generate for the series**, which queues every book without recaps in reading order, since each book's recaps build on the ones before it. In the player (the web player, or app 2.4.0), an admin sees the same button on a book's page.

The confirmation says what the run will take before anything is spent: whether it reads **the audio** or **the ebook beside it** (a single `.epub` in the book's folder is much quicker than transcribing), how long transcription should take on your hardware, and an **Agent cost** estimate learned from the books your Bridge has already done. Transcription runs on the Bridge itself, or on a faster computer as an ASR worker, and costs nothing but time. The agent is the only cost, and the Bridge caps it: **$100 a month** across all books and **$75 a book** by default, both adjustable. A job that reaches a cap pauses rather than failing.

While it runs, the book's page shows the current step ("Transcribing", "Writing characters and recaps", "Checking for mistakes", which the player words as "Checking for mistakes and spoilers"), how far it has got and about how long is left, in the console and in the player. You can close the page: the Bridge carries on, and the console's notifications can tell you when it's done.

## What you get

- **Characters** and **Recaps** tabs on the book in the player, and the companion's **Who's who** and **Story so far**, with the same spoiler protection as the community's. A small **Generated on this server** mark says where they came from.
- **A short, spoiler-free description**, written from the opening chapters only and in the agent's own words. The player shows it in About only when nothing else describes the book. It always stays on your server.
- **Chapters for a book that has none.** A single file with no chapter markers gets its chapters first, found in the narration where the narrator reads out each heading. They reach the player as soon as they're found, hours before the recaps. **Detect chapters** on the Health page does just this part, with no agent and no agent cost. When the headings can't be heard with confidence, the Bridge pauses and says why instead of guessing.

The community's always comes first. If it has characters but no recaps for a book, the player shows the community's characters with your generated recaps; once it has both, yours step aside but stay in the book's folder.

## Sharing with the community

Everything the Bridge writes stays on your server unless you choose to send it. To be able to, sign the Bridge in to GitHub on its **Accounts** tab and turn on the **Contributions** module under **Server > Settings > Modules**. Then there are three ways to give back, all on a book's page in the console:

- **Also contribute to the community**, in the Generate dialog, switched on by default while you can contribute. The results are saved on your server either way.
- **Share with the community**, for a book you generated and kept local. The Bridge sends what it already wrote: nothing is generated again and the agent costs nothing.
- **Suggest corrections**, when you've edited a matched book's title, author, narrator, series, published date or ISBN and your values differ from the community's. You tick the fields to send, say where the right values come from, and the Bridge files them together.

Each submission becomes an issue on the community's GitHub repositories under your GitHub name, and every resulting change is reviewed before it is merged. Some corrections, such as a title, apply automatically once checked; others wait for a maintainer. The book's page links each submission ("Contributed, waiting for review"), and once the community publishes it, every server gets it. Sharing characters and recaps needs the book to be matched to a community entry. Characters and recaps are shared under **CC BY-SA 4.0** and corrections are released as **CC0**, like the rest of the database. Nothing about your listeners, your library or your other books is sent.

## More

The docs cover each part in detail: [Generating characters and recaps](https://docs.audiosilo.app/users/admin/generating-characters-and-recaps) (the confirmation, pauses, chapters and costs), [Contributing from your server](https://docs.audiosilo.app/users/community/contributing-from-your-server) (what is sent, how it is reviewed) and [The Bridge](https://docs.audiosilo.app/users/admin/bridge) in the console, including [Share with the community](https://docs.audiosilo.app/users/admin/bridge#share-with-the-community) and [Suggest corrections](https://docs.audiosilo.app/users/admin/bridge#suggest-corrections). For fixing a book's details by hand first, see [Fix covers and series](/blog/fix-covers-and-series/).
