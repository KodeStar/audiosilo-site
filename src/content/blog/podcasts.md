---
title: "Podcasts in AudioSilo: your shows beside your books"
description: Podcasts on your own server. A Bridge downloads the episodes, the server stays read-only, and the player finds shows, imports your list and plays any episode on demand.
kind: feature
published: 2026-10-24
updated: 2026-11-10
verified: 2026-10-28
appliesTo: Server 2.4.0 with Bridge 0.3.0, app 2.4.0
tags: [podcasts, bridge, player, admin]
covers:
  - server:podcasts
  - server:podcast_fetch
  - server:podcast_discovery
  - server:podcast_opml
  - server:bridge
  - server:modules
  - server:libraries
  - app:podcasts
  - app:home
  - app:library
  - app:find-shows
  - docs:/users/listening/podcasts
  - docs:/users/admin/podcasts
  - docs:/users/getting-started/running-a-bridge
related:
  - server-2-5
  - admin-console-tour
  - player-tips
  - self-hosted-audiobook-server
  - server-2-4
  - move-podcasts-with-opml
revisions:
  - date: 2026-11-10
    note: "Rewritten to be shorter and easier to read. No facts changed."
  - date: 2026-10-28
    note: "Server 2.5.0: Check for new episodes waits for the server's check, then shows what's new."
  - date: 2026-10-24
    note: "Links the new guide to moving podcast subscriptions with OPML."
---

AudioSilo now plays podcasts. A podcast library sits on your server beside your audiobooks: find shows, follow them, and play any episode, even one your server hasn't downloaded yet.

Your server still never writes to your folders. A **Bridge**, AudioSilo's optional companion container, reads the feeds and downloads the episodes.

## What it needs

- **A paired Bridge, version 0.3.0 or later.** See [Running a Bridge](https://docs.audiosilo.app/users/getting-started/running-a-bridge).
- **The Podcasts module**, turned on under **Server > Settings > Modules** in the admin console. It starts off, and pairing a Bridge doesn't turn it on.
- **App 2.4.0 or later, or the web player.** Older app builds don't show podcasts at all. The web player updates with your server, so it has podcasts as soon as your server is on 2.4.0.

## For the admin: a podcast library

1. In the console, go to **Library > Libraries > Add library**.
2. Choose **Podcasts** as the **Kind**, with a name and a folder. Leave **Give everyone access** ticked so every listener can follow shows.
3. Mount that folder read-write in the Bridge. The server keeps its read-only mount.
4. Wait for the library to show as **Ready** under **Server > Settings > Bridge**.
5. Turn the module on.

Each show has a retention policy that all its followers share:

| Policy | What it does |
|---|---|
| **Keep N** (default Keep 3) | Keeps the newest episodes. An older one can go once every current follower has finished it and a grace period (seven days by default) has passed. |
| **On demand** | Downloads an episode when someone plays it, plus at most one more from a listener's queue. |
| **Archive** | Downloads every episode and never deletes. |

Deleting an episode removes only its audio. The listing, progress and bookmarks stay.

## For the listener: shows in the Library

Pick a podcast library in the Library's picker (it has a microphone beside its name). **Shows** is a grid of every show you can see, with chips for **All** and **Following**.

On a show's page:

- Each episode says where its audio is: **Ready on your server**, **Plays on demand**, or on its way.
- A show told in order lists oldest first; others newest first. You can switch.
- **Follow** brings its new episodes to **New episodes** on Home. Everyone who follows a show shares the same downloads.

Episodes stay off your book shelves and out of book search, but one you're partway through shows in **Continue listening**.

## Finding shows

**Add shows**, above the Shows grid, offers up to three ways in:

- **Search** a podcast directory (**Apple Podcasts** by default; an admin can add **Podcast Index** or turn search off). Searches go through your server, so the directory sees your server's address, not yours.
- **Feed address** follows a show by its RSS address. Turn on **Private feed** for a paid or members-only feed.
- **Import a list** takes an **OPML** file from another podcast app (up to 1 MB). See [How to move your podcast subscriptions with OPML](/blog/move-podcasts-with-opml/).

A new show waits under **Shows being added** until the Bridge has fetched it, or says why it **Couldn't add**. **Export my shows**, in the Shows **...** menu, saves your shows as OPML.

## Playing an episode the server doesn't have yet

Press **Play** on an episode that **Plays on demand**. The player shows **Getting this episode** with its progress, then starts it by itself. Whatever you were playing keeps going meanwhile.

**Cancel** only stops the player waiting; the server still finishes the download. If it fails, the player says why and offers **Try again**.

## Good to know

- **Who can add shows:** it needs the module on, the Bridge online and full access to the library. Kids' accounts and the demo can't.
- **Private feeds** are seen only by their followers, admins included. The Bridge keeps the address encrypted, and they're never exported.
- **Imports** go five new shows at a time; the player sends the next batch while the page is open. Re-importing the same file is safe. A feed that failed in the last hour is skipped, so try it again on its own.
- **Check for new episodes**, on a show you follow, asks the server to look now (once a minute per show). From server 2.5.0 it waits for the check, then shows what's new.
- **Show policy** is set through the server's API for now. The [admin guide's Podcasts page](https://docs.audiosilo.app/users/admin/podcasts) has the calls.
- **Limits:** up to five episodes on their way per listener.
- **Not yet:** downloading episodes to your phone, podcasts in Kids mode, and casting an episode.

## More

The listening guide's [Podcasts page](https://docs.audiosilo.app/users/listening/podcasts) has every screen, including [Adding shows](https://docs.audiosilo.app/users/listening/podcasts#adding-shows). The [admin guide's Podcasts page](https://docs.audiosilo.app/users/admin/podcasts) covers libraries, retention, storage and private feeds. New to running your own server? Start with [Self-hosted audiobook server](/blog/self-hosted-audiobook-server/).
