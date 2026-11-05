---
title: Match automatically gets more of your library right
description: From server 2.6.0, bulk matching trusts an ASIN or ISBN the community knows, keeps weak guesses out of review, tidies cluttered file titles and treats tags as hints.
kind: feature
published: 2026-11-05
verified: 2026-11-05
appliesTo: Server 2.6.0
tags: [metadata, matching, admin]
covers:
  - server:match
  - server:metadata
  - server:metadata-mirror
  - server:health
  - server:scanner
  - meta:match
  - docs:/users/admin/health
  - docs:/users/admin/books
  - docs:/users/admin/server
related:
  - fix-covers-and-series
  - organize-audiobook-folders
  - moving-from-audiobookshelf
hero: ../../assets/stills/server-health-dark.webp
heroAlt: Health in the AudioSilo admin console, the Not matched list with the Match automatically card above the books still to match
draft: true
---

Run **Match automatically** over a big library and the slow part comes afterwards. Right books wait for review because another book in the same series scored nearly as well, the review list fills with guesses that were never close, and a file title like "Emergence: The Mystic Knight, Book 1 (Unabridged)" stays that way. Server 2.6.0 works on all three.

There's nothing to turn on. It's the same card in **Health > Not matched**: **Find matches**, then **Review and apply**. Nothing changes until you click **Apply**, so "confident" below still means ticked and waiting for you, not already written.

## An ASIN or ISBN the community knows is enough

A confident match normally needs a score of at least 90, a lead of 10 points over the next candidate, an ASIN or ISBN to attach, and a recording within 10% of your book's length. The lead is what held many right books back.

Now, if a book's tags carry an ASIN or ISBN the community database knows, it needs no lead. It goes into **Confident**, ticked, whatever the next candidate scored, as long as the recording's length fits. It goes to **To review** when the length doesn't fit, or when the next candidate was found by an identifier too. An identifier the community doesn't know costs nothing: the book is matched on its other details.

## Tags count as hints, and why

A scan now reads an ASIN, ISBN and language from the audio files' tags, but only as hints for a match. They never become the book's own ASIN or ISBN. A book with an ASIN tag still shows under **Not matched** (its row still says "No ASIN or ISBN"), and players treat it as unmatched, until a match applies. Books already on your server have these tags read at the next scan.

That looks like a detour, so here's the reason: tags are often wrong about this. In the benchmark described below, 272 of the 1,677 tagged books with a confirmed listing carried an ASIN that wasn't that listing, whether another store's, another edition's or simply wrong. A stored ASIN takes a book out of match runs, and **Fill in matched books** never matches it again by title, so taking a wrong tag at its word would lock that book out of matching.

An Audiobookshelf `metadata.json` is different. Audiobookshelf wrote it after a match, so its ASIN or ISBN counts as the book's straight away.

## Weak matches stop cluttering review

When a run's best candidate scores under 60%, the community most likely doesn't have the book, and a candidate that low is almost always another book. So it's no longer offered for review. The book is listed under **Not found**, with the score in its wording: "Only weak community matches (the best scored 48 of 100): find it by hand from the book page".

A right book can score that low too, so nothing is hidden from you. **Match by hand** still works from that row, and the match dialog still lists the closest candidates, however low they scored.

## File titles get tidied

**Fill in what's missing**, the default, used to leave every title alone. Now it replaces a title when the one from your files is the community's title plus nothing but clutter: the series name, a number the book's position or the community's title states, the community's subtitle, words such as "book", "volume" or "unabridged", and a store's genre labels such as "LitRPG". So "Emergence: The Mystic Knight, Book 1 (Unabridged)" becomes "Emergence".

Anything else keeps the file's title:

- a real extra word;
- "Part 1" or "Part 2", which split the book, and "abridged", which names another edition;
- a number nothing states, such as "Book 2" on a work the community places at number 1;
- a title you edited yourself.

The review lists the change under each book ("Sets Title, Narrator, and ASIN"). A tidied title is a **Community** value, so reverting it brings the file's title back, but a later **Fill in what's missing** can tidy it again. Type the title you want to keep it for good.

The rule looks at words, not meaning, so it can overreach. "Book", "of" and "the" all count as clutter, so a file titled "Book of the Dead" matched to a work called "Dead" would be cut down to "Dead". Reading the review before you apply is still worth doing.

## The score looks at more

The score still weighs title, author, series and length. It now also looks at:

- **Place in a series.** A work in the book's series at another position scores lower, so book 4 is no rival to a book that says it's book 1. An omnibus that covers the position isn't marked down.
- **Language.** A work the community knows to be in another language scores lower. Only the book's own language counts: from its tags, an Audiobookshelf `metadata.json` or your edit. **Audible marketplace** plays no part, since the store you buy from says nothing about what language your library is in.
- **Length.** A work whose closest recording is more than 25% away from the book's length scores lower, as that's likely another edition or an abridgement.
- **Narrators.** A recording read by the book's narrators counts in the work's favour, and it's the recording the match picks if its length fits.

## What one benchmark measured

We tested this against the 4,044 audiobooks in [LibraForge's public benchmark](https://coconautilus17.github.io/LibraForge/#books), using their original tags and that benchmark's reference answers. We ran them through our own test harness, on a local copy of the community database, with server 2.5.1's matching and with the new code:

| Of 4,044 books | Server 2.5.1 | New code |
|---|---:|---:|
| Confident and right | 2,761 | 3,008 |
| Confident and wrong | 160 | 135 |

That's what this one test measured, not a promise about your library. It's one list of mostly English books, and your tags and your books will differ. These figures come from our harness, not from the benchmark's page. That page is published by LibraForge and compares several tools including itself; this post makes no comparison with any of them. Note the second row, too: 135 confident matches were still wrong, which is why **Confident** is a list to look through and not a guarantee.

## Limits worth knowing

**A wrong ASIN in a tag can apply the wrong work.** Nothing else checks a hint. An ASIN that names another work of about the same length is confident and ticked like any other, so it can apply the wrong book, or the right book's other recording. Look through **Confident** before you apply, especially if your tags came from a source you don't trust.

To undo one, revert the values on the book's page, or use **Clear community matches** (**Server > Settings > Community metadata > Danger zone**) to undo every community match in a library. The next run will find the same tag again, so correct the tag, or match the book by hand, which keeps it out of later runs.

**A book that states no language isn't judged on it.** With no language tag, an English work can still be a confident match for a German book, as it could before.

## When you get it

The identifier rule, the weak-match floor, the title tidy and the tag hints are in the server, so they arrive with 2.6.0 however your server looks books up.

The new scoring lives in the community database's matching, so it depends on where the answers come from:

- **Keep a local copy** (`metadata.mode: mirror`): at the release, as the copy's matching ships inside the server.
- **Asking meta.audiosilo.app**: once that service has been updated. Until then, your server gets the old scores with the new rules around them.

The benchmark above ran on a local copy, so it shows both halves together.

## What a match sends

To find these books, a match now sends more than it used to: the book's tagged title, author and series, its length, narrators and language, its ASIN or ISBN (with neither, any in its tags), anything you type, and up to three of its folder names (the top folder, the folder holding the book, and the book's own folder or file name). It sends nothing about your server or who listens. With a local copy that's ready, none of it leaves your server. To show a candidate's cover, your server also downloads the image from wherever the catalogue keeps it, such as Audible's image servers or Open Library; only the image itself is asked for.

The full rules are in the docs: [Matching every book at once](https://docs.audiosilo.app/users/admin/health#matching-every-book-at-once), including [ASIN and ISBN tags are hints](https://docs.audiosilo.app/users/admin/health#asin-and-isbn-tags-are-hints), [Weak matches](https://docs.audiosilo.app/users/admin/health#weak-matches) and [Tidied titles](https://docs.audiosilo.app/users/admin/health#tidied-titles). For matching one book at a time and fixing what a match can't, see [Fix wrong covers, titles and series](/blog/fix-covers-and-series/).
