---
title: "How to pair your phone with your AudioSilo server using a QR code"
description: Sign the iPhone, iPad or Android app in to a self-hosted audiobook server by scanning a QR code. Invites, adding more devices, and what to do when it can't connect.
kind: tutorial
published: 2026-10-15
updated: 2026-11-10
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
  - date: 2026-11-10
    note: "Rewritten to be shorter and easier to read. No facts changed."
  - date: 2026-10-28
    note: "Server and app 2.5.0 say whether an invite is used up or expired, and how long to wait after too many tries."
  - date: 2026-10-24
    note: "App 2.4.0 scans the invite card's QR directly, apps from 2.1 connect over plain HTTP at home to a self-signed server, and setup step 7 pairs a phone."
  - date: 2026-10-21
    note: Corrected the invite QR and app pairing QR steps, and clarified that an admin can pair their existing account.
---

To sign the AudioSilo app in, open the server's connect page in a browser, then scan its **pairing QR** from inside the app. An admin's invite link takes you to that page. App 2.4.0 can also scan the invite card's QR directly.

## Before you start: the apps need a trusted address

A fresh AudioSilo server uses a **self-signed certificate**. A browser lets you click past its warning; the iPhone and Android apps can't.

| Where you are | What works |
|---|---|
| Home Wi-Fi, app 2.1 or later on iPhone and iPad, 2.4.0 on Android, server 2.3 or later | Plain `http://` to the self-signed server |
| Away from home, or app 2.0.0 | An address with a trusted certificate |

For a trusted certificate, use the server's own Let's Encrypt **autocert** mode or your reverse proxy: [Listen away from home](/blog/listen-away-from-home/) sets it up.

Not there yet? Use the **web player**. Open `https://your-server:8080/web` in the phone's browser, accept the warning and sign in. Everything here works there too, except scanning a QR code in the app.

## Step 1: Install the app

AudioSilo is free on the [App Store](https://apps.apple.com/us/app/audiosilo/id6783431375) for iPhone and iPad and on [Google Play](https://play.google.com/store/apps/details?id=app.audiosilo) for Android.

## Step 2: Make an invite (admin)

1. In the admin console, go to **People** and click **Invite someone**.
2. Fill in the dialog:
   - **Their name**, as it shows in the player.
   - **What can they listen to?**: all libraries, one library, one of your shares, or decide later.
   - **Devices it can pair**: 5 by default, so one invite covers a phone, a tablet and a browser.
   - **Expires after**: 1 day by default.
3. Click **Create invite**. You get a **QR code**, the **invite link** and the **code**.

The code is shown only once. Need it again? Rotate the invite. The new account has no password, and most listeners never need one.

## Step 3: Open the invite, then pair the app

1. Open the **invite link in a browser**, or scan the invite card's QR with the phone's **normal camera**. The server's connect page opens and signs the invite in.
2. The page shows the **pairing QR**, **Open in app** and **Open web player**.
3. In the AudioSilo app, tap **Scan a QR code** and scan the **pairing QR**. Or, on the same phone, choose **Open in app**.

With app 2.4.0, **Scan a QR code** also takes the invite card's QR directly. You can also type the server address in the app, tap **Continue**, choose **Invite code** and enter the code.

**Admins:** you can pair your existing account too. Enter the auth code the server printed on first start on the connect page, then use its pairing QR or **Open in app**. On a new server running 2.4.0, step 7 of the console's **Set up your server** also shows a pairing QR.

## Step 4: Add your other devices

You don't need another invite.

1. On your account page in the player, under **Pair another device**, tap **Show a pairing code**.
2. Scan the QR with the other device's app, or use **Share link** (apps) or **Copy link** (web).

The code works for **10 minutes**, for one device. **Make a new code** gives you a fresh one.

## Step 5: Set a password (optional)

On your account page, tap **Set a password** (at least 8 characters). It lets you sign in on a new phone without asking for a fresh invite.

## Good to know

- **Home and away:** if your server has a home and a public address, the app learns both when it pairs and switches on its own, after checking the home address really is your server. The admin sets it under **Server > Settings > General**.

- **"Couldn't reach ..."**: check the address and that the server is running. A home address like `192.168.1.20:8080` only works on your home network.
- **Works in the browser but not the app**: the server is still self-signed, and the app is 2.0.0 or you're away from home. See the first section.
- **"That QR code isn't an AudioSilo pairing code."** (apps before 2.4.0): you scanned the invite card's QR. Open the invite link in a browser, then scan the connect page's **pairing QR**. Or enter the address and invite code in the app.
- **An expired or used-up invite**: from 2.5.0 the message says which. Ask the admin for a new one, or rotate it on the Invites page.
- **Too many tries**: the server slows repeated failed sign-ins on purpose. Wait a few minutes; from 2.5.0 the message says how many.

The docs cover every route in [Connecting and signing in](https://docs.audiosilo.app/users/listening/connecting).
