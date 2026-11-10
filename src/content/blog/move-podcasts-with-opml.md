---
title: How to move your podcast subscriptions to another app with OPML
description: Most podcast apps export the shows you follow as an OPML file and import one. What the file carries and leaves out, the apps that can't export, and how AudioSilo uses it.
kind: guide
published: 2026-10-24
updated: 2026-11-10
verified: 2026-10-24
appliesTo: Server 2.4.0 with Bridge 0.3.0, app 2.4.0
tags: [podcasts, opml, player, getting-started]
covers:
  - server:podcasts
  - server:podcast_opml
  - server:podcast_discovery
  - app:find-shows
  - docs:/users/listening/podcasts
related:
  - podcasts
  - server-2-4
  - self-hosted-audiobook-server
  - player-tips
  - moving-from-audiobookshelf
revisions:
  - date: 2026-11-10
    note: "Rewritten to be shorter and easier to read. No facts changed."
---

**Export your subscriptions as an OPML file** in the old app and **import that file** in the new one. Nearly every independent podcast app reads and writes OPML, so the switch takes a minute. The big exceptions are Apple Podcasts and Spotify, which don't export one.

## What an OPML file is

OPML (Outline Processor Markup Language) is a small XML file. For podcasts it holds one line per show: its title and RSS feed address. A short one looks like this:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head><title>My podcasts</title></head>
  <body>
    <outline type="rss" text="A Show" xmlUrl="https://example.com/a-show/feed.xml" />
    <outline type="rss" text="Another Show" xmlUrl="https://example.org/another/rss" />
  </body>
</opml>
```

It carries **which shows you follow** and nothing else: no progress, no played marks, no downloads, no playlists. Plan on marking a few episodes as played in the new app.

## Exporting from the app you use now

Look in the app's settings for **Import/Export**, **Export OPML** or **Export subscriptions**. Some examples at the time of writing (menus move, so look nearby):

| App | Where |
|---|---|
| **Pocket Casts** | Profile > settings cog > **Import & Export** |
| **AntennaPod** | Settings > **Import/Export** > OPML export |
| **Overcast** | **Export OPML**, near the bottom of settings |

The app saves the file or offers it through the share sheet. Put it somewhere the new app can reach: your Files app, a cloud drive or an email to yourself.

## The apps that don't export

- **Apple Podcasts** has no OPML export on iPhone or Mac. List your shows and follow them again in the new app by name.
- **Spotify** neither imports nor exports OPML at the time of writing. Its exclusive shows have no public RSS feed, so they can't move.

## Importing into the new app

Look for **Import OPML** in the new app's settings, or open the file from Files or an email and choose the podcast app. A long list can take a while.

A show whose feed has moved or shut down may fail to add. That's normal: an OPML file can outlive its feeds. Find those shows again by name.

## Doing it with AudioSilo

From **server 2.4.0**, with a paired Bridge and the Podcasts module on, AudioSilo keeps your podcasts on your own server and OPML works both ways. You need app 2.4.0 or the web player bundled with your server. Older apps don't show podcasts at all, so use the web player until app 2.4.0 reaches your device.

- **Import a list**, on a podcast library's **Add shows** page, follows every show in an OPML file (up to 1 MB). The server adds five shows at a time, and the player sends the next batch while the page is open. Each show says how it went: **Following**, **Already following** or **Being added**. Importing the same file again is safe.
- **Export my shows**, in the Shows **...** menu, saves the shows you follow as an OPML file any podcast app can import.
- **Coming from Apple Podcasts?** Use **Search** on the same page. It searches Apple Podcasts through your server (or Podcast Index, if your admin set it up), so you can follow your shows again one by one.

## Good to know

- **Private feeds** (a Patreon or paid feed, say) contain your personal key. Some apps leave them out of an export. If one is included, treat the file like a password. AudioSilo never writes private feeds into an export, for anyone.
- **Dead feeds in AudioSilo:** a feed that failed in the last hour isn't asked for again, so a few dead feeds don't hold up the rest. **Try again** on that show's row retries it on its own.

[Podcasts in AudioSilo](/blog/podcasts/) covers following shows, keeping episodes and playing any episode on demand. The docs' [Podcasts page](https://docs.audiosilo.app/users/listening/podcasts) has the screens, including [Adding shows](https://docs.audiosilo.app/users/listening/podcasts#adding-shows). For why you might run your own server, see [Self-hosted audiobook server](/blog/self-hosted-audiobook-server/).
