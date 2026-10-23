---
title: "Podcasts in AudioSilo: your shows beside your books"
description: A podcast library on your own server. A Bridge downloads the episodes, the server stays read-only, and the player shows your shows, new episodes and plays any episode on demand.
kind: feature
published: 2026-10-23
verified: 2026-10-23
# Draft until the server release that completes Bridge Phase 2 and the 2.2.0 app ship.
# The release pass sets appliesTo to the real versions, flips draft and re-verifies.
appliesTo: The server release after 2.3.1 with a paired Bridge, and the AudioSilo app 2.2.0 (merged or in review, not yet released)
tags: [podcasts, bridge, player, admin]
covers:
  - server:podcasts
  - server:podcast_fetch
  - server:bridge
  - server:modules
  - server:libraries
  - app:podcasts
  - app:home
  - app:library
  - docs:/users/listening/podcasts
  - docs:/users/admin/podcasts
  - docs:/users/getting-started/running-a-bridge
related:
  - admin-console-tour
  - player-tips
  - self-hosted-audiobook-server
draft: true
---

AudioSilo now plays podcasts. A podcast library sits on your server next to your audiobooks, and the player shows its shows in the Library, gives each show a page of its own, puts new episodes from the shows you follow on Home, and plays an episode even when your server hasn't downloaded it yet. Your server still never writes to your folders: a **Bridge**, AudioSilo's optional companion container, reads the feeds and downloads the episodes, and the server reads what it saves.

## What it needs

- **A paired Bridge.** The Bridge does the writing: it reads each show's feed, saves the show's details and artwork, downloads episodes and removes older ones it no longer needs to keep. See [Running a Bridge](https://docs.audiosilo.app/users/getting-started/running-a-bridge).
- **The Podcasts module**, turned on in the admin console under **Server > Settings > Modules**. It starts off, and pairing a Bridge doesn't turn it on.
- **The AudioSilo app 2.2.0 or later.** Older app builds don't show podcasts at all, not even to an admin, so update from the App Store or Google Play. The web player comes with your server and is updated with it.

## For the admin: a podcast library

Podcasts live in a library of their own. In the console, **Library > Libraries > Add library**, choose **Podcasts** as the **Kind**, and give it a name and a folder. Mount that same folder read-write in the Bridge; the server keeps its read-only mount. The library shows as **Ready** under **Server > Settings > Bridge** once the Bridge can write to it, even while it's still empty. Then turn the module on.

The Bridge makes one folder per show, with the feed's details and artwork. Each show has a retention policy that everyone following it shares:

- **Keep N** (the default is Keep 3) keeps the newest episodes downloaded. An older one can be deleted once every current follower has finished it and a grace period has passed (seven days by default).
- **On demand** downloads an episode when someone plays it, and prepares at most one more from a listener's queue.
- **Archive** downloads every episode in the feed and never deletes.

Deleting an episode removes only its audio: the listing, progress and bookmarks stay. For now, setting a show's policy, following a new feed by its address, searching podcast directories and importing or exporting an OPML list of shows all go through the server's API; the console and the player don't have screens for them yet. The [admin guide's Podcasts page](https://docs.audiosilo.app/users/admin/podcasts) has the calls.

Members-only feeds are handled as the secrets they are. A **Private feed** is seen only by the people who follow it, admins included, its address is kept encrypted by the Bridge, and it's never written into an OPML export.

## For the listener: shows in the Library

Pick a podcast library in the Library's picker (it has a microphone beside its name). It has two sections, **Shows** and **Folders**. **Shows** is a grid of every show you can see, with a line under each cover for a **New episode** in the last 14 days, and chips to switch between **All** and the shows you're **Following**.

A show's page has its cover, description and episodes. A show that's told in order lists its oldest episode first, so you start at the beginning, and every other show lists its newest first; **Newest first** and **Oldest first** switch it. Each episode says where its audio is: **Ready on your server**, **Plays on demand**, or on its way. Its **...** menu adds it to **Up next** or marks it finished.

**Follow** on a show's page is what brings its new episodes to your Home, and tells the server to keep them coming. Everyone who follows a show shares the same downloaded episodes.

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
- **Finding new shows in the player**: following a feed by its address, searching podcast directories and importing a list of shows from another app. Your admin can add shows for you in the meantime.

## More

The listening guide's [Podcasts page](https://docs.audiosilo.app/users/listening/podcasts) has every screen with screenshots, and the [admin guide's Podcasts page](https://docs.audiosilo.app/users/admin/podcasts) covers podcast libraries, retention, storage and private feeds. New to running your own server? Start with [Self-hosted audiobook server](/blog/self-hosted-audiobook-server/).
