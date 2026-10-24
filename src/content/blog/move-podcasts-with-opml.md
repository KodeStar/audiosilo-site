---
title: How to move your podcast subscriptions to another app with OPML
description: Most podcast apps export the shows you follow as an OPML file and import one. What the file carries and leaves out, the apps that can't export, and how AudioSilo uses it.
kind: guide
published: 2026-10-24
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
---

To move your podcasts from one app to another, **export your subscriptions as an OPML file** in the old app and **import that file** in the new one. OPML is a plain list of the RSS feed addresses of the shows you follow, and nearly every independent podcast app reads and writes it, so the switch takes a minute and you don't have to search for each show again. The two big exceptions are Apple Podcasts and Spotify, which don't export one (more below).

## What an OPML file is

OPML (Outline Processor Markup Language) is a small XML file. For podcasts it holds one line per show: its title and the address of its RSS feed, the same feed every podcast app reads. A short one looks like this:

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

Because it is only a list of feeds, it carries **which shows you follow** and nothing else: no listening progress, no played or unplayed marks, no downloads, no playlists. Plan on marking a few episodes as played in the new app.

## Exporting from the app you use now

The option is usually in the app's settings, under a name like **Import/Export**, **Export OPML** or **Export subscriptions**. A few examples at the time of writing (menus move between versions, so look nearby if yours differs):

- **Pocket Casts**: Profile, then the settings cog, then **Import & Export**.
- **AntennaPod**: Settings, then **Import/Export**, then the OPML export.
- **Overcast**: **Export OPML** is near the bottom of its settings screen.

The app saves the file or offers it through your phone's share sheet. Save it somewhere you can reach from the new app, such as your Files app, a cloud drive or an email to yourself.

## The apps that don't export

- **Apple Podcasts** has no OPML export on iPhone or Mac. The practical route is to make a list of your shows and follow them again in the new app by searching for each one by name.
- **Spotify** neither imports nor exports OPML at the time of writing, and its exclusive shows have no public RSS feed at all, so they can't move to another app.

A **private or members-only feed** (a Patreon or paid feed, say) is an address with your personal key in it. Some apps leave those out of an export; where one is included, treat the file like a password and don't share it.

## Importing into the new app

Look for **Import OPML** in the same part of the new app's settings, or open the file from your Files app or an email and pick the podcast app to open it with. The app reads each feed, so a long list can take a little while, and a show whose feed has moved or shut down may fail to add. That's normal: an OPML file can outlive the feeds in it. Find those shows again by name.

## Doing it with AudioSilo

From **server 2.4.0**, with a paired Bridge and the Podcasts module on, AudioSilo keeps your podcasts on your own server next to your audiobooks, and OPML works both ways in the player. That means app 2.4.0 or the web player bundled with your server: until app 2.4.0 reaches your device, use the web player, since older apps don't show podcasts at all.

- **Import a list**, on the **Add shows** page of a podcast library, takes an OPML file from another app (up to 1 MB) and follows every show in it. Your server adds new shows five at a time, and the player sends the next batch by itself while the page is open. Each show in the list says how it went (**Following**, **Already following**, **Being added**), so importing the same file again is safe. A feed that failed to add in the last hour isn't asked for again, so a few dead feeds don't hold up the rest, and **Try again** on that show's row asks for it on its own.
- **Export my shows**, in the Shows **...** menu, saves the shows you follow as an OPML file any podcast app can import. Private feeds are never written into an export, for anyone.
- Coming from Apple Podcasts, use **Search** on the same page instead: it searches Apple Podcasts through your server (or Podcast Index, if your admin has set it up), so you can follow your shows again one by one.

[Podcasts in AudioSilo](/blog/podcasts/) covers the rest: following shows, keeping episodes and playing any episode on demand. The docs' [Podcasts page](https://docs.audiosilo.app/users/listening/podcasts) has the screens, including [Adding shows](https://docs.audiosilo.app/users/listening/podcasts#adding-shows). For what a self-hosted server is and why you might run one, see [Self-hosted audiobook server](/blog/self-hosted-audiobook-server/).
