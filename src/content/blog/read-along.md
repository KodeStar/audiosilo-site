---
title: "Read along: the ebook follows the narration in the AudioSilo player"
description: With a read-along made by your Bridge, the player highlights the sentence being read in the book's EPUB and turns the pages with the voice, online or offline.
kind: feature
published: 2026-10-29
verified: 2026-10-29
appliesTo: Server 2.6.0 with a Bridge, app 2.6.0
tags: [reader, ebooks, read-along, bridge, player, offline]
covers:
  - server:readalong
  - server:ebooks
  - server:bridge
  - app:readalong
  - app:companion
  - app:reader
  - app:downloads
  - bridge:readalong
  - docs:/users/admin/making-read-along
  - docs:/users/listening/companion
  - docs:/users/listening/reading-the-ebook
  - docs:/users/listening/offline-downloads
related:
  - ebook-reader
  - bridge-recaps-and-contributions
  - player-tips
  - server-2-5
draft: true
---

Since server 2.5.0, AudioSilo opens the [ebook that sits beside an audiobook](/blog/ebook-reader/), but reading and listening went their separate ways. From version 2.6.0 they meet. Once your server's **Bridge** has made a book's **read-along**, lining its ebook up with the narration sentence by sentence, the player shows the text as you listen: the sentence being read is highlighted, and the pages turn by themselves as the narrator goes on.

## What it needs

- **Server 2.6.0 or later**, with its web player, and **app 2.6.0 or later** on a phone or tablet. Older players and apps (2.5.0) simply don't show it, and carry on working as before.
- **A book with a DRM-free EPUB beside its audio**, the same one [Read the ebook](https://docs.audiosilo.app/users/listening/reading-the-ebook) opens. It has to be the same book as the narration, and ideally the same edition.
- **A read-along for that book**, made once by an admin with a [Bridge](https://docs.audiosilo.app/users/admin/bridge) (more on that [below](#making-a-read-along)). There's nothing for listeners to switch on.

## The Text tab

Play the book and open the player's [companion](https://docs.audiosilo.app/users/listening/companion#text). Right after **Story so far** there is now a **Text** tab. It opens the ebook at the sentence being read, highlights it, and turns the page mid-sentence when the voice gets there, through the chapters too. Pausing, skipping or changing the speed in the player moves the highlight with it.

- **Tap a sentence** to move the audiobook to the start of it. It moves your place rather than starting playback: a playing book carries on from there, a paused one waits there.
- **Turn the page yourself** (the edges of the text, or a swipe) to look back or ahead. The tab stops following you around, and **Back to narration** takes you back to the sentence being read.

On a computer the tab sits in the companion column beside the player, and on a tablet under the controls with the other tabs. On a phone there's no chip for it yet: open the companion from any chip, then pick **Text** at the top of the sheet.

The Text tab only appears for a book whose read-along fits the book as it is. If the ebook or the audio files changed since the read-along was made, it is out of date, and the tab stays away until an admin makes it again.

## Follow narration in the full-screen reader

The full-screen reader can follow along too. With the book in the player (playing, or loaded and paused), press **Read the ebook**: a **Follow narration** button appears at the foot of the page. Press it, and the reader turns to the sentence being read and keeps up with the voice, with the same tap-a-sentence and **Back to narration** as the Text tab.

While the reader follows the narration it doesn't save your reading place, since the narration is turning the pages, not you. Turn away and the page you're on is saved as usual. [Reading the ebook](https://docs.audiosilo.app/users/listening/reading-the-ebook#follow-the-narration) has the details.

## Offline

A book you [download](https://docs.audiosilo.app/users/listening/offline-downloads) now keeps its read-along beside its ebook, so the Text tab and **Follow narration** work with no connection. If the read-along is made again on the server, the app fetches the new one the next time it sees the book there, and drops its copy if the read-along goes out of date. A download made before 2.6.0 picks up the read-along the next time the app sees the book on your server; until then, the Text tab needs a connection.

## Making a read-along

An admin makes a book's read-along once, with a paired Bridge, AudioSilo's optional companion container. The Bridge makes it from the audiobook and its matching EPUB using speech recognition only: **no AI agent is involved, so there is no agent cost**. If the Bridge already transcribed the book, for [characters and recaps](/blog/bridge-recaps-and-contributions/) or for detecting chapters, it reuses that transcript instead of transcribing again.

There are two places to start one:

- **In the admin console**, a book with an ebook has a **Read-along** card on its page, under Chapters. It says whether the book has a read-along, whether it is up to date, and offers **Make read-along** (or **Make again**).
- **In the player**, an admin sees the **Text** tab on every book with an ebook. Where there's nothing to follow yet, or the read-along is out of date, the tab offers **Make read-along** right there.

Either way, a confirmation says what will happen before anything starts: the ebook it lines up, about how long transcription can take on your Bridge (less when it still has the book's transcript), and that no agent is used. While it runs, the card and the Text tab show its progress, with **Cancel**. When it finishes, the text appears.

The Bridge needs to be online, offer read-alongs (an older Bridge doesn't, so update it), and be able to write to the book's library: the read-along is saved in the book's hidden `.audiosilo` folder, and the server itself still only reads. Community metadata, a match and the agent container aren't needed.

A poor match is refused. If less than half of the ebook's text lines up with the narration, the ebook and the audio aren't the same book, or are very different editions, and the job stops and saves nothing: a read-along that is mostly wrong would only send listeners to the wrong place. Put the matching edition's EPUB beside the audio and make it again.

[Making a read-along](https://docs.audiosilo.app/users/admin/making-read-along) covers the card, the confirmation, failures and how read-alongs share the Bridge's work with generating recaps and detecting chapters.

## What it doesn't do

- **It needs a DRM-free EPUB of the same edition.** A locked EPUB can't be read, and a different book or edition doesn't line up.
- **It's one book at a time.** There's no action to make read-alongs for a whole library or series.
- **It needs a Bridge.** The server doesn't make read-alongs by itself.
- **Older players don't show it.** The 2.5.0 web player and apps carry on as before, without the Text tab or Follow narration; update to 2.6.0 to read along.

## More

The docs have each part with screenshots: [the companion's Text tab](https://docs.audiosilo.app/users/listening/companion#text), [Follow the narration](https://docs.audiosilo.app/users/listening/reading-the-ebook#follow-the-narration) in the reader, [read-alongs offline](https://docs.audiosilo.app/users/listening/offline-downloads) and [Making a read-along](https://docs.audiosilo.app/users/admin/making-read-along), including [from the player](https://docs.audiosilo.app/users/admin/making-read-along#from-the-player). For the reader itself, see [Read the ebook](/blog/ebook-reader/), and for what else a Bridge does, [Characters and recaps from your own Bridge](/blog/bridge-recaps-and-contributions/).
