---
title: Match automatically gets more of your library right
description: In server 2.6.0, bulk matching trusts an ASIN or ISBN the community knows, drops weak guesses, reads series from folder names, picks the recording and matches store listings.
kind: feature
published: 2026-11-07
verified: 2026-11-07
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
  - docs:/users/admin/libraries
  - docs:/users/getting-started/organizing-your-library
related:
  - server-2-6
  - fix-covers-and-series
  - organize-audiobook-folders
  - moving-from-audiobookshelf
hero: ../../assets/stills/server-health-dark.webp
heroAlt: Health in the AudioSilo admin console, the Not matched list with the Match automatically card above the books still to match
---

Run **Match automatically** over a big library and the slow part comes afterwards. Right books wait for review because another book in the same series scored nearly as well, the review list fills with guesses that were never close, and a file title like "Emergence: The Mystic Knight, Book 1 (Unabridged)" stays that way. Server 2.6.0 works on all three. It also reads a book's series from a folder name that states one, picks the recording your book's length names, and matches books the community knows only from a store listing with no ASIN or ISBN.

There's nothing to turn on. It's the same card in **Health > Not matched**: **Find matches**, then **Review and apply**. Nothing changes until you click **Apply**, so "confident" below still means ticked and waiting for you, not already written.

## An ASIN or ISBN the community knows is enough

A confident match normally needs a score of at least 90, a lead of 10 points over the next candidate, an ASIN or ISBN to attach, and a recording within 10% of your book's length. The lead is what held many right books back.

Now, if a book's tags carry an ASIN or ISBN the community database knows, it needs no lead. It goes into **Confident**, ticked, whatever the next candidate scored, as long as the recording's length fits. It goes to **To review** when the length doesn't fit, or when the next candidate was found by an identifier too. An identifier the community doesn't know costs nothing: the book is matched on its other details.

## Tags count as hints, and why

A scan now reads an ASIN, ISBN and language from the audio files' tags, but only as hints for a match. They never become the book's own ASIN or ISBN. A book with an ASIN tag still shows under **Not matched** (its row still says "No ASIN or ISBN"), and players treat it as unmatched, until a match applies. Books already on your server have these tags read at the next scan.

That looks like a detour, so here's the reason: tags are often wrong about this. In the benchmark described below, 272 of the 1,677 tagged books with a confirmed listing carried an ASIN that wasn't that listing, whether another store's, another edition's or simply wrong. A stored ASIN takes a book out of match runs, and **Fill in matched books** never matches it again by title, so taking a wrong tag at its word would lock that book out of matching.

An Audiobookshelf `metadata.json` is different. Audiobookshelf wrote it after a match, so its ASIN or ISBN counts as the book's straight away.

## The recording your book's length names

A community work can hold several recordings of one book: the unabridged reading, another narrator's, a full-cast dramatization. A match now leans on your book's length to pick the one your files are.

- **A tag that names another edition.** When a book's tag ASIN or ISBN names a recording more than 10% off the book's length, and the same work has another recording within 10%, **Match automatically** proposes that one instead. If the book's narrator reads the tagged recording, the match keeps it and holds the book for review. The match dialog still starts from the tagged recording, so choose the edition there.
- **Dramatizations.** A work that holds only a dramatization of the book used to wait for review unless your book said it was one. Now a dramatization within 1% of your book's length (or 2 minutes, whichever is more) is matched like any other recording, as another production is hardly ever that close. A book can also say it's a dramatization through its author credit, such as "Michael J. Sullivan - Graphic Audio", or a genre such as Radio Drama, Audio Drama or Hörspiel.

A book that doesn't say it's a dramatization never moves onto one from a tag, unless its narrator reads it or its length names it.

## Folder names that state a series

Some library tools name each book's folder and file `Author; Series; Book NN; Title`, such as `Mark Tufo; Indian Hill; Book 04; From The Ashes`. From 2.6.0 a name like that states the book's series and number, wherever the folder sits. The admin console and the player show the book in its series, and a match knows which volume it's looking for.

- `Book 04` is number 4, and `Book 2.5` is 2.5.
- `Book 01-05` is a box set of books 1 to 5.
- `Book XX` and `Book 00` put the book in the series with no number.
- The title part at the end is optional (`A.R. Wise; Deadlocked; Book 01`).

The files' tags still come first: a series tag wins over the name, and when the tags give a series but no number, the name's number is kept. In a library set to take [folder names first](https://docs.audiosilo.app/users/admin/libraries#where-book-details-come-from), the name's series, number and title win over the tags. Books already on your server get their series at the first scan after the upgrade, without a re-index, and your own edits stay on top.

## Store listings with no ASIN

The community database holds some books only as a store listing with no ASIN or ISBN, such as Audiobook Guild and GraphicAudio titles. A match to one always waited in **To review**, since a confident match needs an ASIN or ISBN to attach. Even once you applied it, the book stayed under **Not matched**, and the next run asked about it again.

From 2.6.0 such a match goes into **Confident**, ticked, when all of these hold:

- it scores at least 90, 10 points ahead of the next candidate;
- the community names the book's author in full and places the work at the book's number in its series, so a book outside a series always goes to review;
- both lengths are known, and the recording's is within 2% of the book's. A narrator who reads it doesn't widen that.

Anything else goes to **To review**, as before, where you can tick it.

Applying such a match, from a run or from the match dialog, now records the community work the book is, and for a book with no ASIN or ISBN that's what makes it matched. It counts as **Matched** in **Books**' **Community metadata** filter, it leaves **Health > Not matched**, and later match runs skip it. **Fill in matched books** looks it up by that work, following it if the community merges or renames it, and offers an ASIN or ISBN if the recording has gained one since.

The book's **Community metadata** card shows **Community work**, which opens the work on the community site, and says how and when it was matched: "No ASIN or ISBN: matched to its store listing by a bulk match 2 days ago." **Unlink**, beside **Compare fields**, undoes the match. It asks first, and there's no undo: the community's values and cover go with it, the book is **Not matched** again, and the next run asks about it again. Your own edits stay, and matching the book again brings the values back.

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

- **Place in a series.** A work in the book's series at another position scores lower, so book 4 is no rival to a book that says it's book 1. An omnibus that covers the position isn't marked down. A title that's the series name and a number, such as "Dungeon Diving 102", is read as a title, not a position, when the book says it's another number.
- **The series' own listing.** A work the community lists in the book's series at exactly the book's number (or a box set's range), with a recording within 2% of the book's length, isn't marked down when the book's title doesn't name it, such as a first volume whose file carries only its subtitle. A title that clearly names another volume of the series still wins. So more of a series' volumes land in **Confident**.
- **Language.** A work the community knows to be in another language scores lower. The book's own language counts: from its tags, an Audiobookshelf `metadata.json` or your edit. A book that states none is matched in its library's language, when the library has one: at least 20 of its books state a language, and at least 90% of those agree ("English", "eng" and "en" count as one). There's nothing to set. **Audible marketplace** plays no part, since the store you buy from says nothing about what language your library is in.
- **Length.** A work whose closest recording is more than 25% away from the book's length scores lower, as that's likely another edition or an abridgement.
- **Narrators.** A recording read by the book's narrators counts in the work's favour, and it's the recording the match picks if its length fits.

## What one benchmark measured

We tested this against the 4,044 audiobooks in [LibraForge's public benchmark](https://coconautilus17.github.io/LibraForge/#books), using their original tags and that benchmark's reference answers. We ran them through our own test harness, on a local copy of the community database, with server 2.5.1's matching and with the first of these changes (the identifier rule, the weak-match floor, tags as hints, the title tidy and the new scoring):

| Of 4,044 books | Server 2.5.1 | First changes |
|---|---:|---:|
| Confident and right | 2,761 | 3,008 |
| Confident and wrong | 160 | 135 |

That's what this one test measured, not a promise about your library. It's one list of mostly English books, and your tags and your books will differ. These figures come from our harness, not from the benchmark's page. That page is published by LibraForge and compares several tools including itself; this post makes no comparison with any of them. Note the second row, too: 135 confident matches were still wrong, which is why **Confident** is a list to look through and not a guarantee.

We then made the harness's checking stricter in one place. A book whose reference answer has no ASIN used to count as right when the title and author agreed; now it's checked against the community work that the benchmark's hand-checked answer points to. On the same run, the old check counted 131 confident matches wrong and the stricter one 9, so most of the drop from 135 was the old check's mistakes, not the matching. The table below uses the stricter check and a newer copy of the community database, so set it beside the one above only with that in mind. It's the same harness and the same 4,044 books, before and after the series listing, the folder names and the recording choice described in this post:

| Of 4,044 books | Before | After |
|---|---:|---:|
| Confident and right | 3,463 | 3,590 |
| Confident and wrong | 8 | 7 |

With every change above, on a newer copy of the community database, the same harness counted 3,620 confident and right and 4 confident and wrong. Matching store listings was the last change measured:

| Of 4,044 books | Before | After |
|---|---:|---:|
| Confident and right | 3,620 | 3,806 |
| Confident and wrong | 4 | 4 |

Right matches left waiting in **To review** fell by the same 186. The same caveats hold: one test, one list of books, our harness.

## Limits worth knowing

**A wrong ASIN in a tag can apply the wrong work.** Nothing else checks a hint. An ASIN that names another work of about the same length is confident and ticked like any other, so it can apply the wrong book, or the right book's other recording. Look through **Confident** before you apply, especially if your tags came from a source you don't trust.

To undo one, clear the book's ASIN (and ISBN, if it has one) on its page, then use **Unlink** there to remove the match it recorded. In 2.6.0, reverting the values alone leaves the match in place, and a later **Fill in matched books** can write the community's ASIN back: a [known issue](https://docs.audiosilo.app/users/admin/health#filling-in-books-that-are-already-matched) ([server #330](https://github.com/KodeStar/audiosilo-server/issues/330)). To undo every community match in a library, use **Clear community matches** (**Server > Settings > Community metadata > Danger zone**). The next run will find the same tag again, so correct the tag, or match the book by hand, which keeps it out of later runs.

**Players don't show "About this book" for a store-listing match yet.** Players look community details up by ASIN or ISBN, so a book matched to a store listing has none to offer them. The values the match wrote are the book's own, so its title, series, narrator and cover show everywhere. The community chapter check, the community's places and gaps on the **Series** page and **Suggest corrections** leave such a book out too.

**A book that states no language isn't always judged on it.** In a library of mixed languages, or one where fewer than 20 books state a language, a book with no language tag isn't judged on it, so an English work can still be a confident match for a German book, as it could before.

## When you get it

The identifier rule, the weak-match floor, the title tidy, the tag hints, the series in folder names, the recording choice, the library's language and store-listing matching are in the server, so they arrive with 2.6.0 however your server looks books up.

The new scoring lives in the community database's matching, so it depends on where the answers come from:

- **Keep a local copy** (`metadata.mode: mirror`): with 2.6.0, as the copy's matching ships inside the server.
- **Asking meta.audiosilo.app**: that service runs all of the new scoring, the series' own listing and the "Dungeon Diving 102" rule included, since 7 November 2026. Language and narrators count from 2.6.0, when your server starts sending them.
- **Your own metadata service**: if you host one, it needs v0.25.5 or later for these rules. Refreshing its data alone doesn't update its matching.

The benchmark above ran on a local copy, so it shows both halves together.

## A run is much quicker too

A bulk match asking meta.audiosilo.app used to make about three and a half requests per book, waiting on each one. From 2.6.0 it makes one, and six books run at once. A run over the benchmark's 4,044 books took 1 minute 32 seconds against the live service, where a run over a library that size had taken about 13 minutes. The results come out the same on the same data.

Refreshing details and re-picking a marketplace still make their separate requests, so they don't get this speed-up.

## What a match sends

To find these books, a match now sends more than it used to: the book's tagged title, author and series, its length, narrators and language, its ASIN or ISBN (with neither, any in its tags), anything you type, and up to three of its folder names (the top folder, the folder holding the book, and the book's own folder or file name). It sends nothing about your server or who listens. With a local copy that's ready, none of it leaves your server. To show a candidate's cover, your server also downloads the image from wherever the catalogue keeps it, such as Audible's image servers or Open Library; only the image itself is asked for.

The full rules are in the docs: [Matching every book at once](https://docs.audiosilo.app/users/admin/health#matching-every-book-at-once), including [ASIN and ISBN tags are hints](https://docs.audiosilo.app/users/admin/health#asin-and-isbn-tags-are-hints), [Store listings with no ASIN or ISBN](https://docs.audiosilo.app/users/admin/health#store-listings-with-no-asin-or-isbn), [Weak matches](https://docs.audiosilo.app/users/admin/health#weak-matches) and [Tidied titles](https://docs.audiosilo.app/users/admin/health#tidied-titles), and [Books matched to a store listing](https://docs.audiosilo.app/users/admin/books#books-matched-to-a-store-listing) for the book page's **Community work** and **Unlink**. For matching one book at a time and fixing what a match can't, see [Fix wrong covers, titles and series](/blog/fix-covers-and-series/).
