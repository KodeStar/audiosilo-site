---
title: Back up your Audible books straight into your AudioSilo library
description: Your server's Bridge can sign in to your Audible accounts, back up the books you bought as M4B files into your library, and keep backing up new ones as you buy them.
kind: feature
published: 2026-11-07
updated: 2026-11-10
verified: 2026-11-08
appliesTo: Server 2.6.0 with Bridge 0.6.0
tags: [audible, bridge, backup, m4b, admin]
covers:
  - server:audible
  - server:bridge
  - server:modules
  - bridge:audible
  - bridge:audible-backup
  - docs:/users/admin/audible
  - docs:/users/admin/bridge
  - docs:/users/getting-started/bridge-accounts
  - docs:/users/getting-started/running-a-bridge
related:
  - server-2-6
  - audible-listening-sync
  - back-up-your-audible-library
  - organize-audiobook-folders
revisions:
  - date: 2026-11-10
    note: "Rewritten to be shorter and easier to read. No facts changed."
  - date: 2026-11-08
    note: "Added how the Bridge's Audible support was built, crediting mkb79/Audible and Libation."
---

From version 2.6.0, your server's **Bridge** can back up the Audible books you bought straight into your library. Sign in once, then back up one book, everything not here yet, or new purchases by themselves. Each book arrives as an ordinary M4B file, scanned and ready to play.

It's off until an admin turns it on, and it's for one thing: **a personal backup of books you bought**, with your own account. Laws on removing DRM, even from your own purchases, differ by country, and in some places it isn't allowed at all. Check your local law first, and keep the copies for yourself.

## What it needs

- **Server 2.6.0 or later** with a [Bridge](https://docs.audiosilo.app/users/getting-started/running-a-bridge) paired and online, on **Bridge 0.6.0** or later (its Accounts tab has an **Audible** card). Update the two together.
- **The Audible module turned on** in the console's **Server > Settings > Modules**. It starts off.
- **The account's library Ready on the Bridge**: mapped and writable on its **Libraries** tab. The server still only reads your books; the Bridge writes them.
- **Room for the books**, in the Bridge's data folder while downloading and in the library afterwards.

## Sign in on the Bridge

1. On the Bridge's own page, open the **Accounts** tab.
2. Pick the Audible store the account buys from.
3. Sign in on Amazon's page in your browser, and paste back the address it ends on.
4. Set **Belongs to** (whose books these are), **Library** (where they're matched and backed up) and **Back up** (what the Bridge backs up on its own).

Your Amazon password never reaches the Bridge or your server. Amazon gives the Bridge a sign-in for a device called **"&lt;your first name&gt;'s AudioSilo"**, which it keeps encrypted. You can add several accounts, each for one person and one library. See [Bridge accounts](https://docs.audiosilo.app/users/getting-started/bridge-accounts#audible) for the full steps.

## See what's already here

With the module on, **Server > Settings** gains an **Audible** page. It lists every title your accounts own as **On this server** or **Not here**. Titles are matched by ASIN first, then by title and author, so books you already had count too.

The server has the Bridge check each account every 6 hours; **Check now** checks straight away.

## Back up a book, or everything

- **Back up** on a title backs up that one book.
- **Back up everything...** queues every available title not on your server, after confirming how many books and roughly how much space. It skips titles marked **Not this book**, ones probably here under another title, and preorders.
- **Not this book** is for a wrong match, or a title you never want backed up.

The Bridge downloads each book with your account and removes the copy protection without re-encoding (a **lossless copy** that keeps the chapters). The server indexes it straight away with the title's ASIN, so it plays everywhere.

The Bridge works one book at a time per account, so a big library can take days. A cut-off download carries on where it stopped. Each backup shows in the Bridge's **Jobs** list and is notified like its other jobs.

## Where the books go

By default a backup goes **beside the series' other books**, following your library's naming. A new series goes under its author and series; a book in no series under `Author/Title/`.

To name folders yourself, give the account a **placement template** in **Account settings...**, such as `{Author}/{Series}/{ {PaddedSeq} - }{Title}`, or give one title its own **Destination...**. A backup **never overwrites anything**: if the place is taken, it stops and tells you.

## New purchases, by themselves

**Back up by itself**, in **Account settings...**, picks what the Bridge backs up after each check:

- **Every new book** you buy from now on;
- **New books in series you have** on your server for that person;
- **Only books you choose**: nothing by itself.

These cover new purchases only. For books the account already had, use **Back up everything...**.

## Preorders on release day

**Back up** on a preorder shows **Backs up on release**. From the release date the account is checked every hour instead of every 6, and the first check that finds the book backs it up. Preorders the account's policy covers work the same way. If it still isn't out 14 days later, the title asks you to check it on Audible.

## Good to know

- **Listening place sync** is a separate switch per account: see [Audible and AudioSilo keep your listening place in step](/blog/audible-listening-sync/).
- **No Bridge?** [How to back up your Audible library](/blog/back-up-your-audible-library/) covers Libation, OpenAudible and audible-cli.
- **Folder layout:** [How to organise audiobook folders](/blog/organize-audiobook-folders/) explains the rules backups follow.

## How we built it

The Bridge is written in Go, and there was no Go library for Audible, so we wrote our own: signing in, registering as a device, reading your library, fetching books and syncing your place. ffmpeg removes the copy protection.

Two open-source projects showed us how Audible works, and we checked our work against them:

- **[mkb79/Audible](https://github.com/mkb79/Audible)**, the Python library behind audible-cli, our main reference for Audible's sign-in and API.
- **[Libation](https://github.com/rmcrackan/Libation)**, especially for what Audible's refusals mean and which app details it accepts at sign-in.

Our thanks to both.

## More

[Audible](https://docs.audiosilo.app/users/admin/audible) in the docs covers it all, including [how titles are matched](https://docs.audiosilo.app/users/admin/audible#how-titles-are-matched) and [what a failed backup means](https://docs.audiosilo.app/users/admin/audible#when-a-backup-fails).
