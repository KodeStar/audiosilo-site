---
title: Back up your Audible books straight into your AudioSilo library
description: Your server's Bridge can sign in to your Audible accounts, back up the books you bought as M4B files into your library, and keep backing up new ones as you buy them.
kind: feature
published: 2026-11-07
verified: 2026-11-07
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
---

Until now, getting your Audible books into AudioSilo meant running a separate tool: download, convert, then copy the files into your library yourself. From version 2.6.0, your server's **Bridge** can do all of it. Sign in to your Audible account once, and from the admin console you can back up one book at a time, back up all of an account's books that aren't here yet in one go, or let the Bridge back up new purchases by itself. Each book arrives as an ordinary M4B file in your library, scanned and ready to play.

It's off until an admin turns it on, and it's meant for one thing: **a personal backup of books you bought**, with your own account. Laws on removing DRM, even from your own purchases, differ from country to country, and in some places it isn't allowed at all, even for personal use. Check your local law before you use it, and keep the copies for yourself.

## What it needs

- **Server 2.6.0 or later** with a [Bridge](https://docs.audiosilo.app/users/getting-started/running-a-bridge) paired and online, on **Bridge 0.6.0**, the release that came out beside server 2.6.0 (its Accounts tab has an **Audible** card). Update the two together: Audible's jobs need both.
- **The Audible module turned on** in the console's **Server > Settings > Modules**. It starts off.
- **The account's library Ready on the Bridge**: mapped and writable on the Bridge's **Libraries** tab. The server itself still only reads your books; the Bridge is the part that writes them.
- **Room for the books**, in the Bridge's data folder while it downloads and in the library afterwards.

## Sign in on the Bridge, once per account

You sign in on the Bridge's own page, on its **Accounts** tab, and nowhere else. Amazon doesn't let other programs show its sign-in page, so you pick the Audible store the account buys from, sign in on Amazon's page in your browser, and paste back the address it ends on. Your Amazon password never reaches the Bridge or your server: Amazon gives the Bridge a sign-in for a device called **"&lt;your first name&gt;'s AudioSilo"**, which the Bridge keeps encrypted.

As you sign in, you say who the account is for:

- **Belongs to**: the person on your server whose books these are.
- **Library**: the books library the account's titles are matched against, and where its backups go.
- **Back up**: what the Bridge backs up on its own. You pick it here when you add the account; after that you change it in the console (more on that below).

You can add several accounts, each for one person and one library. [Bridge accounts](https://docs.audiosilo.app/users/getting-started/bridge-accounts#audible) in the docs walks through the sign-in step by step.

## See what's already here

With the module on, the console's **Server > Settings** gains an **Audible** page. It lists every title your accounts own and says, for each one, whether it's **On this server** or **Not here**. The Bridge matches titles to your books by their ASIN first, then by title and author, so the books you already had count too. A title that isn't here yet says where its backup would go.

The server asks the Bridge to check each account every 6 hours, and **Check now** asks straight away.

## Back up a book, or everything

- **Back up** on a title backs up that one book.
- **Back up everything...** is the one-off for the books the account already owns. It asks you to confirm first, with how many books and roughly how much space they take, then queues every available title that isn't on your server. It leaves out titles you marked **Not this book**, ones that are probably here under another title, and preorders.
- **Not this book** is for a title the Bridge matched to the wrong book, or one you never want backed up on its own.

For each book, the Bridge asks Audible for it with your account, downloads it, removes the copy protection without re-encoding it (a **lossless copy** that keeps the chapters) and copies it into your library. The server then indexes the new book straight away and gives it the title's ASIN, so it plays in the web player and the apps like any other book in the library.

The Bridge works through one book at a time per account, so a big library can take days. A download cut off by a dropped connection or a restart carries on where it stopped. Each backup shows in the Bridge's **Jobs** list, and a finished or failed one is notified like the Bridge's other jobs.

## Where the books go

By default, a backup goes **beside the series' other books**, named the way your library already names them: the same author folder, the series' folder and its numbering. A book of a series you don't have yet goes under its author and series, and a book in no series under `Author/Title/`.

If you'd rather name the folders yourself, give the account a **placement template** in **Account settings...**, such as `{Author}/{Series}/{ {PaddedSeq} - }{Title}`, or give one title its own **Destination...**. Whatever the placement, a backup **never overwrites anything**: if the place is taken, the backup stops and tells you. For the usual placement, the titles page warns you before you start; a title's own destination is checked when its backup starts. [How to organise audiobook folders](/blog/organize-audiobook-folders/) explains the layout these rules follow.

## New purchases, by themselves

**Back up by itself**, in **Account settings...** on the account's card, picks what the Bridge backs up after each check:

- **Every new book** you buy from now on;
- **New books in series you have**: a new purchase when a book of its series is already on your server for that person;
- **Only books you choose**: nothing by itself.

These act on new purchases only; for the books the account already had, use **Back up everything...**.

## Preorders on release day

**Back up** on a preorder remembers it, and the title shows **Backs up on release**. From the release date, the server checks the account every hour instead of every 6 hours, and the first check that finds the book available backs it up. A preorder the account's policy covers is backed up the same way. If it still isn't out 14 days after its release date, the title says so and asks you to check it on Audible.

## Keeping your place in step too

The same Audible module can also keep your listening place in step with the Audible app, both ways, so you can switch between them mid-book. That's a separate switch for each account, and it works for books you already had as well as the ones the Bridge backed up: see [Audible and AudioSilo keep your listening place in step](/blog/audible-listening-sync/).

## Other ways to back up

If you don't run a Bridge, or want the files somewhere other than an AudioSilo library, [How to back up your Audible library](/blog/back-up-your-audible-library/) covers Libation, OpenAudible and audible-cli, the folder layout that scans cleanly, and how to keep a second copy.

## More

[Audible](https://docs.audiosilo.app/users/admin/audible) in the docs covers everything here in full, including [how titles are matched](https://docs.audiosilo.app/users/admin/audible#how-titles-are-matched) and [what a failed backup means](https://docs.audiosilo.app/users/admin/audible#when-a-backup-fails).
