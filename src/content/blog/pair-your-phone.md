---
title: "How to pair your phone with your AudioSilo server using a QR code"
description: Sign the iPhone, iPad or Android app in to a self-hosted audiobook server by scanning a QR code. Invites, adding more devices, and what to do when it can't connect.
kind: tutorial
published: 2026-10-15
updated: 2026-10-28
verified: 2026-10-28
appliesTo: App 2.0.0 to 2.5.0, server 2.3.1 to 2.5.0
tags: [apps, pairing, getting-started, invites]
covers:
  - app:connect
  - app:account
  - server:invites
  - server:tls
  - server:addresses
  - docs:/users/listening/connecting
  - docs:/users/listening/account
  - docs:/users/admin/users-and-invites
  - docs:/users/getting-started/remote-access
related:
  - listen-away-from-home
  - self-hosted-audiobook-server
  - player-tips
hero: ../../assets/stills/server-invite-dark.webp
heroAlt: An invite ready in the AudioSilo admin console, with a QR code to scan with a phone camera, the invite link and a one-time code
revisions:
  - date: 2026-10-28
    note: "Server and app 2.5.0 say whether an invite is used up or expired, and how long to wait after too many tries."
  - date: 2026-10-24
    note: "App 2.4.0 scans the invite card's QR directly, apps from 2.1 connect over plain HTTP at home to a self-signed server, and setup step 7 pairs a phone."
  - date: 2026-10-21
    note: Corrected the invite QR and app pairing QR steps, and clarified that an admin can pair their existing account.
---

To sign the AudioSilo app in with a QR code, open the server's connect page in a browser first, then scan its **pairing QR** from inside the app. If an admin sends you an invite, open that invite link in the browser to reach the pairing page. Scanned with the phone's camera, the invite card's QR opens a web page; app 2.4.0's own scanner also signs in with it directly, while earlier apps need the connect page's pairing QR. This guide covers each step, adding more devices later, and the trusted address the phone apps need.

## Before you start: the apps need a trusted address

A fresh AudioSilo server uses a **self-signed certificate**. A browser lets you click past its warning; the iPhone and Android apps can't. From app 2.1 on iPhone and iPad (app 2.4.0 on Android), the apps get round that at home: while the phone is on the same Wi-Fi as the server, they connect over plain `http://`, which a self-signed server (2.3 or later) offers to devices on your home network. App 2.0.0, and every app away from home, needs an address with a certificate it trusts: Let's Encrypt through the server's own **autocert** mode, or a reverse proxy you already run. [Listen away from home](/blog/listen-away-from-home/) sets this up, and it's what you want for listening outside the house anyway.

Not there yet? The **web player** works in the meantime. Open `https://your-server:8080/web` in the phone's browser, accept the certificate warning and sign in; everything in this guide works there too, except scanning a QR code from inside the app.

## Step 1: Install the app

AudioSilo is free on the [App Store](https://apps.apple.com/us/app/audiosilo/id6783431375) for iPhone and iPad and on [Google Play](https://play.google.com/store/apps/details?id=app.audiosilo) for Android.

## Step 2: Make an invite (admin)

In the admin console, go to **People** and click **Invite someone**. One dialog does everything:

- **Their name**, as it shows in the player.
- **What can they listen to?**: all libraries, one library, one of your shares, or decide later.
- **Devices it can pair**: 5 by default, so one invite covers a phone, a tablet and a browser.
- **Expires after**: 1 day by default.

Click **Create invite**. You get a **QR code**, the **invite link** and the **code** on its own. The new account has no password; most listeners never need one.

The code is shown only this once: the server keeps just a fingerprint of it. Need it again later? Rotate the invite for a fresh one.

## Step 3: Open the invite, then pair the app

Open the **invite link in a browser**, or scan the invite card's QR with the phone's **normal camera**. That opens the server's connect page and signs the invite in. The page then shows the **pairing QR**, **Open in app** and **Open web player**.

If the pairing page is on another screen, open AudioSilo on the phone, tap **Scan a QR code** on its connect screen and scan the **connect page's pairing QR**. The app signs in and opens your library. If you opened the invite on the same phone, choose **Open in app** instead. With app 2.4.0, **Scan a QR code** also takes the invite card's QR itself and signs in at once.

You can also type the server address in the app, tap **Continue**, choose **Invite code** and enter the invite code directly.

As the admin, you can pair your existing account too: enter the auth code the server printed on first start on the server's connect page, then use that page's pairing QR or **Open in app**. You do not need a separate listener account. On a new server running 2.4.0, step 7 of the console's **Set up your server** shows a pairing QR for your phone too.

## Step 4: Add your other devices

Already signed in on one device? You don't need another invite. On your account page in the player, under **Pair another device**, tap **Show a pairing code**. A QR appears that works for **10 minutes**, for one device. Scan it with the other device's app, or use **Share link** (in the apps) or **Copy link** (on the web) to send it. When it fades, **Make a new code** gives you a fresh one.

## Step 5: Set a password (optional, but worth it)

An invited account starts without a password, which is fine day to day. Setting one on your account page (**Set a password**, at least 8 characters) gives you a way back in on a new phone without asking anyone for a fresh invite.

## At home and away

When your server has both a home address and a public one, the app learns both while it pairs and switches between them by itself: the quick route on your Wi-Fi, the public address when you're out. It checks that the server at the home address really is yours before using it. The admin sets the home address under **Server > Settings > General**.

## When it doesn't connect

- **"Couldn't reach ..."**: check the address for typos and that the server is running. A home address like `192.168.1.20:8080` only works on your home network.
- **The app can't connect to a server that works in the browser**: the server is still on its self-signed certificate, and the app is 2.0.0 or you're away from home. See the first section.
- **"That QR code isn't an AudioSilo pairing code."** (apps before 2.4.0): you may have scanned the admin invite card's QR, which opens a web page. Open the invite link in a browser first, then scan the connect page's **pairing QR** with the app. Alternatively, enter the server address and invite code in the app.
- **An expired or used-up invite**: from 2.5.0 the message says which ("This invite has expired", or it has been used on all the devices it allows). Ask the admin for a new one, or rotate it on the Invites page.
- **Too many tries**: the server slows down repeated failed sign-ins on purpose. Wait a few minutes; from 2.5.0 the message says how many.

The docs cover every route in [Connecting and signing in](https://docs.audiosilo.app/users/listening/connecting).
