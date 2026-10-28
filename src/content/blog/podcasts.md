---
title: "Podcasts in AudioSilo: your shows beside your books"
description: Podcasts on your own server. A Bridge downloads the episodes, the server stays read-only, and the player finds shows, imports your list and plays any episode on demand.
kind: feature
published: 2026-10-24
updated: 2026-10-28
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
  - date: 2026-10-28
    note: "Server 2.5.0: Check for new episodes waits for the server's check, then shows what's new."
  - date: 2026-10-24
    note: "Links the new guide to moving podcast subscriptions with OPML."
---

AudioSilo now plays podcasts. A podcast library sits on your server next to your audiobooks, and the player shows its shows in the Library, gives each show a page of its own, puts new episodes from the shows you follow on Home, and plays an episode even when your server hasn't downloaded it yet. You can add shows yourself too: search a podcast directory, paste a feed's address, or bring your list from another podcast app, and take it with you again when you like. Your server still never writes to your folders: a **Bridge**, AudioSilo's optional companion container, reads the feeds and downloads the episodes, and the server reads what it saves.

## What it needs

- **A paired Bridge, version 0.3.0 or later.** The Bridge does the writing: it reads each show's feed, saves the show's details and artwork, downloads episodes and removes older ones it no longer needs to keep. See [Running a Bridge](https://docs.audiosilo.app/users/getting-started/running-a-bridge).
- **The Podcasts module**, turned on in the admin console under **Server > Settings > Modules**. It starts off, and pairing a Bridge doesn't turn it on.
- **The AudioSilo app 2.4.0 or later, or the web player.** Older app builds don't show podcasts at all, not even to an admin. The web player comes with your server and is updated with it, so it has podcasts as soon as your server is on 2.4.0, even before app 2.4.0 reaches your phone.

## For the admin: a podcast library

Podcasts live in a library of their own. In the console, **Library > Libraries > Add library**, choose **Podcasts** as the **Kind**, and give it a name and a folder. Leave **Give everyone access** ticked (the default) and every listener on the server can follow shows in it. Mount that same folder read-write in the Bridge; the server keeps its read-only mount. The library shows as **Ready** under **Server > Settings > Bridge** once the Bridge can write to it, even while it's still empty. Then turn the module on.

The Bridge makes one folder per show, with the feed's details and artwork. Each show has a retention policy that everyone following it shares:

- **Keep N** (the default is Keep 3) keeps the newest episodes downloaded. An older one can be deleted once every current follower has finished it and a grace period has passed (seven days by default).
- **On demand** downloads an episode when someone plays it, and prepares at most one more from a listener's queue.
- **Archive** downloads every episode in the feed and never deletes.

Deleting an episode removes only its audio: the listing, progress and bookmarks stay. For now, setting a show's policy goes through the server's API; the console doesn't have a screen for it yet. Adding shows is something listeners do themselves in the player (see [Finding shows](#finding-shows) below), and the console has no screen for that either. The [admin guide's Podcasts page](https://docs.audiosilo.app/users/admin/podcasts) has the calls.

Directory search uses **Apple Podcasts**. You can also set up **Podcast Index**, and then listeners get to pick which one to search, or you can turn search off.

Members-only feeds are handled as the secrets they are. A **Private feed** is seen only by the people who follow it, admins included, its address is kept encrypted by the Bridge, and it's never written into an OPML export.

## For the listener: shows in the Library

Pick a podcast library in the Library's picker (it has a microphone beside its name). It has two sections, **Shows** and **Folders**. **Shows** is a grid of every show you can see, with a line under each cover for a **New episode** in the last 14 days, and chips to switch between **All** and the shows you're **Following**.

A show's page has its cover, description and episodes. A show that's told in order lists its oldest episode first, so you start at the beginning, and every other show lists its newest first; **Newest first** and **Oldest first** switch it. Each episode says where its audio is: **Ready on your server**, **Plays on demand**, or on its way. Its **...** menu adds it to **Up next** or marks it finished.

**Follow** on a show's page is what brings its new episodes to your Home, and tells the server to keep them coming. Everyone who follows a show shares the same downloaded episodes.

## Finding shows

**Add shows**, above the grid in a podcast library's Shows, opens a page of the same name. It has up to three sections, depending on what your server offers: **Search**, **Feed address** and **Import a list**. Adding shows needs the same as the Follow button (the module on and the Bridge online), and full access to the library. Kids' accounts and the demo can't add shows.

- **Search** a podcast directory by a show's name. Each result has the show's artwork, maker and number of episodes, a link to view it on the directory, and **Follow**. The search and the artwork go through your server, so the directory sees your server's address, not yours, and only the words you searched for (and, for Apple, your device's country).
- **Feed address** follows a show by its RSS address. Turn on **Private feed** for a paid or members-only feed, so only you see it and it's never exported.
- **Import a list** takes an **OPML** file exported from another podcast app (up to 1 MB) and follows every show in it. Your server adds at most five new shows for you at a time, so a long list goes in batches of five, and the player sends the next batch by itself while the page is open. Each show in the list says how it went: **Following**, **Already following**, **Being added**, **In the list twice**, and so on. Importing the same file again is safe: shows already done say so and the rest go ahead. A feed that failed to add in the last hour isn't asked for again by an import, so a few dead feeds in a list don't hold up the shows after them; it's marked as not added, and you can try that show again on its own. [How to move your podcast subscriptions with OPML](/blog/move-podcasts-with-opml/) covers exporting the list from the app you use now.

A show the library already has is followed straight away. A new one has to be fetched by the Bridge first, so it shows under **Shows being added** until it's ready, or says why it **Couldn't add** (the feed didn't answer, the address isn't a podcast feed, and so on). Back in Shows, a line such as **Adding 2 shows** is there while any are on their way.

**Export my shows**, in the Shows **...** menu, saves the shows you follow on this server as an OPML file any podcast app can import. Private feeds are never exported, for anyone, admins included.

**Check for new episodes**, on the page of a show you follow, asks your server to look at its feed now instead of waiting for its next check. A show can be checked once a minute. From server 2.5.0, the button says **Asked the server to check** until the server has checked the show, then the page shows anything new.

## New episodes on Home

**New episodes** on Home gathers recent episodes from the shows you follow, newest first, leaving out trailers and anything you've started or finished. Podcasts stay off your book shelves: episodes never turn up in **Next in your series**, **Recently added** or book search. An episode you're in the middle of does show in **Continue listening**, like a book.

## Playing an episode the server doesn't have yet

Press **Play** on an episode that **Plays on demand** and your server asks the Bridge for it. The player shows **Getting this episode** with how much has arrived, and starts the episode by itself as soon as it's ready. Whatever you were listening to keeps playing in the meantime. **Cancel** only stops the player waiting: the server finishes the download, so the episode is **Ready on your server** next time.

If the episode can't be fetched, the player says why (the module is off, the Bridge is offline, the download failed) and offers **Try again**. Each listener can have up to five episodes on their way at once.

## Not in this first release

These come later:

- **Downloading episodes** to your phone for offline listening. Episodes stream from your server for now.
- **Kids mode.** It doesn't show podcasts at all yet, and a kid's account can't follow shows.
- **Casting** an episode. The Cast button doesn't appear while one plays.

## More

The listening guide's [Podcasts page](https://docs.audiosilo.app/users/listening/podcasts) has every screen with screenshots, including [Adding shows](https://docs.audiosilo.app/users/listening/podcasts#adding-shows), and the [admin guide's Podcasts page](https://docs.audiosilo.app/users/admin/podcasts) covers podcast libraries, retention, storage and private feeds. New to running your own server? Start with [Self-hosted audiobook server](/blog/self-hosted-audiobook-server/).
