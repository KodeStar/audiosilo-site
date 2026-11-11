---
title: Match automatically gets more of your library right
description: In server 2.6.0, bulk matching trusts an ASIN or ISBN the community knows, drops weak guesses, reads series from folder names, picks the recording and matches store listings.
kind: feature
published: 2026-11-07
verified: 2026-11-07
updated: 2026-11-10
revisions:
  - date: 2026-11-10
    note: "Rewritten to be shorter and easier to read. No facts changed."
  - date: 2026-11-07
    note: "The online run time is now the released 2.6.0's (about 2 minutes), not a development build's."
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

Server 2.6.0 makes **Match automatically** get more books right with less review. Right books no longer wait because a rival scored nearly as well, weak guesses stop cluttering review, and cluttered file titles get tidied. It also reads series from folder names, picks the right recording and matches books known only from a store listing.

There's nothing to turn on. Use the same card in **Health > Not matched**: **Find matches**, then **Review and apply**. Nothing changes until you click **Apply**.

## An ASIN or ISBN the community database knows is enough

A confident match normally needs a score of at least 90, a lead of 10 points over the next candidate, an ASIN or ISBN, and a recording within 10% of your book's length. The lead held many right books back.

Now a book whose tags carry an ASIN or ISBN the community database knows needs no lead, as long as the length fits. It goes to **To review** when the length doesn't fit, or when the next candidate was found by an identifier too.

## Tags count as hints

A scan now reads an ASIN, ISBN and language from the files' tags, but only as hints for a match. They never become the book's own ASIN or ISBN, so the book stays **Not matched** until a match applies. Existing books have these tags read at the next scan.

Tags are often wrong. In the benchmark below, 272 of the 1,677 tagged books with a confirmed listing carried an ASIN that wasn't that listing. A stored ASIN takes a book out of match runs, so a wrong tag would lock it out.

An Audiobookshelf `metadata.json` counts straight away, as Audiobookshelf wrote it after a match.

## The right recording

A community work can hold several recordings: the unabridged reading, another narrator's, a full-cast dramatization. A match now uses your book's length to pick yours.

- **A tag that names another edition.** If the tagged recording is more than 10% off your book's length and the work has one within 10%, the match proposes that one. If your narrator reads the tagged one, it's kept and held for review.
- **Dramatizations** within 1% of your book's length (or 2 minutes, whichever is more) are matched like any other recording. A book can also say it's one through its author credit ("Michael J. Sullivan - Graphic Audio") or a genre such as Radio Drama, Audio Drama or Hörspiel.

## Folder names that state a series

Some library tools name folders and files `Author; Series; Book NN; Title`, such as `Mark Tufo; Indian Hill; Book 04; From The Ashes`. A name like that now sets the book's series and number.

- `Book 04` is number 4, and `Book 2.5` is 2.5.
- `Book 01-05` is a box set of books 1 to 5.
- `Book XX` and `Book 00` mean no number.
- The title at the end is optional.

Tags still win (a tagged series with no number keeps the name's number), unless the library takes [folder names first](https://docs.audiosilo.app/users/admin/libraries#where-book-details-come-from). Existing books pick this up at the next scan, no re-index needed, and your own edits stay on top.

## Store listings with no ASIN

Some books exist in the community database only as a store listing with no ASIN or ISBN, such as Audiobook Guild and GraphicAudio titles. These always waited in **To review**. Now one goes into **Confident** when:

- it scores at least 90, 10 points ahead of the next candidate;
- the community database names the author in full and places the work at the book's number in its series;
- both lengths are known and within 2% of each other.

Applying one records the community work, which makes the book matched. It leaves **Health > Not matched**, and later runs skip it. The book's **Community metadata** card shows **Community work**, and **Unlink** removes the match. **Unlink** asks first, and you can't reverse it. The community database's values and cover go, and your own edits stay.

## Weak matches stop cluttering review

A best candidate under 60% is almost always another book, so it's no longer offered for review. The book goes under **Not found** with its score. **Match by hand** still works from that row.

## File titles get tidied

**Fill in what's missing** now replaces a file title that is the community database's title plus only clutter: the series name, the book's number, the subtitle, words like "book" or "unabridged", and store genre labels like "LitRPG". So "Emergence: The Mystic Knight, Book 1 (Unabridged)" becomes "Emergence".

The file's title is kept when it has a real extra word, "Part 1" or "abridged", a number nothing states, or your own edit. Type a title to keep it for good.

## The score looks at more

Besides title, author, series and length, the score now weighs:

- **Place in a series.** A work at another position scores lower, unless it's an omnibus that covers it.
- **The series' own listing.** A work at exactly the book's number, within 2% of its length, isn't marked down when the file title doesn't name it.
- **Language.** A work in another language scores lower. A book with no language uses its library's, when at least 20 books state one and at least 90% agree.
- **Length.** A closest recording more than 25% off scores lower.
- **Narrators.** A recording read by the book's narrators counts in its favour.

## What one benchmark measured

We tested against the 4,044 audiobooks in [LibraForge's public benchmark](https://coconautilus17.github.io/LibraForge/#books), with their original tags and reference answers, in our own harness on a local copy of the community database.

The first changes (identifier rule, weak-match floor, tag hints, title tidy, new scoring):

| Of 4,044 books | Server 2.5.1 | First changes |
|---|---:|---:|
| Confident and right | 2,761 | 3,008 |
| Confident and wrong | 160 | 135 |

The later changes, with a stricter check and a newer copy of the database (so don't compare with the table above):

| Of 4,044 books | Confident and right | Confident and wrong |
|---|---:|---:|
| Before series listing, folder names and recording choice | 3,463 | 8 |
| After them | 3,590 | 7 |
| Every change but store listings (newer database copy) | 3,620 | 4 |
| With store listings | 3,806 | 4 |

Store listings also cut the right matches waiting in **To review** by the same 186.

The stricter check compares a book whose reference answer has no ASIN against the community work the benchmark's hand-checked answer points to. On the same run, the old check counted 131 confident matches wrong and the stricter one 9.

This is one test of mostly English books, not a promise about your library. The figures are ours, not LibraForge's, and this post compares no tools.

## A run takes 2 minutes instead of 13

A run against AudioSilo Meta used to make about three and a half requests per book, one at a time. Now it makes one, six books at once, with the same results.

| 4,044 books, live service | Run time |
|---|---:|
| Before 2.6.0 (a library that size) | about 13 minutes |
| Released 2.6.0 | about 2 minutes |

## When you get it

Everything except the new scoring arrives with 2.6.0. The scoring depends on where answers come from:

| Where answers come from | New scoring |
|---|---|
| A local copy (`metadata.mode: mirror`) | With 2.6.0 |
| AudioSilo Meta (meta.audiosilo.app) | Since 7 November 2026; language and narrators count from 2.6.0 |
| Your own copy of AudioSilo Meta | Needs v0.25.5 or later |

## Good to know

- **Check Confident before applying.** A wrong ASIN tag can apply the wrong work, as nothing checks a hint. To undo one, clear the book's ASIN (and ISBN), then **Unlink**. Reverting values alone leaves the match, a known issue in 2.6.0 (see [Filling in books that are already matched](https://docs.audiosilo.app/users/admin/health#filling-in-books-that-are-already-matched)).
- **Store-listing matches have no "About this book" in players yet**, as players look details up by ASIN or ISBN. Title, series, narrator and cover still show.
- **Title tidying looks at words, not meaning.** "Book of the Dead" matched to "Dead" would become "Dead".
- **What a match sends:** the book's tagged details, length, narrators, language, identifiers, what you type and up to three folder names. Nothing about your server or listeners, and none of it leaves your server with a ready local copy. To show a candidate's cover, your server downloads just the image, such as from Audible's image servers or Open Library.

Full rules: [Matching every book at once](https://docs.audiosilo.app/users/admin/health#matching-every-book-at-once) and [Books matched to a store listing](https://docs.audiosilo.app/users/admin/books#books-matched-to-a-store-listing). For one book at a time, see [Fix wrong covers, titles and series](/blog/fix-covers-and-series/).
