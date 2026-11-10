---
title: "Read along: the ebook follows the narration in the AudioSilo player"
description: With a read-along made by your Bridge, the player highlights the sentence being read in the book's EPUB and turns the pages with the voice, online or offline.
kind: feature
published: 2026-11-07
updated: 2026-11-10
verified: 2026-11-08
appliesTo: Server 2.6.0 with a Bridge 0.5.0 or later, app 2.6.0
tags: [reader, ebooks, read-along, bridge, player, offline]
covers:
  - app:stores
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
  - server-2-6
  - ebook-reader
  - bridge-recaps-and-contributions
  - player-tips
  - server-2-5
revisions:
  - date: 2026-11-10
    note: "Rewritten to be shorter and easier to read. No facts changed."
  - date: 2026-11-08
    note: "App 2.6.0 is on the App Store now; on Android, the APK until 2.6.0 reaches Google Play."
  - date: 2026-11-07
    note: "Android users can install app 2.6.0 now from the APK on GitHub."
---

From version 2.6.0, the AudioSilo player shows a book's ebook text as you listen. The sentence being read is highlighted, and the pages turn by themselves with the narrator.

It works once your server's **Bridge** has made the book's **read-along**, lining up its [ebook](/blog/ebook-reader/) with the narration sentence by sentence.

## What it needs

- **Server 2.6.0 or later** (its web player), or **app 2.6.0**: on the App Store for iPhone and iPad, and on Android from the APK on [its GitHub release](https://github.com/KodeStar/audiosilo-frontend/releases/tag/v2.6.0) until 2.6.0 reaches Google Play (see [Android without Google Play](https://docs.audiosilo.app/users/listening/mobile-apps#android-without-google-play)). Older players (2.5.0) just don't show it.
- **A DRM-free EPUB beside the audio**, the one [Read the ebook](https://docs.audiosilo.app/users/listening/reading-the-ebook) opens. It must be the same book as the narration, ideally the same edition.
- **A read-along for that book**, made once by an admin with a [Bridge](https://docs.audiosilo.app/users/admin/bridge) (see [below](#making-a-read-along)). Listeners switch nothing on.

## The Text tab

Play the book and open the player's [companion](https://docs.audiosilo.app/users/listening/companion#text). The **Text** tab opens the ebook at the sentence being read and follows the voice. Pausing, skipping or changing speed moves the highlight too.

- **Tap a sentence** to move your place there.
- **Turn the page yourself** to look around. **Back to narration** returns you.

On a phone, a **Text** chip under the player's actions opens it directly.

## Follow narration in the full-screen reader

With the book in the player, press **Read the ebook**, then **Follow narration** at the foot of the page. It works like the Text tab. While following, the reader doesn't save your reading place; turn away and it saves as usual. See [Reading the ebook](https://docs.audiosilo.app/users/listening/reading-the-ebook#follow-the-narration).

## Offline

A [downloaded](https://docs.audiosilo.app/users/listening/offline-downloads#how-downloaded-playback-differs) book keeps its read-along beside its ebook, so both work with no connection.

## Making a read-along

An admin makes it once per book, with a paired Bridge, AudioSilo's optional companion container. It uses speech recognition only: **no AI agent is involved, so there is no agent cost**.

1. Open the book. In the admin console, its **Read-along** card sits under Chapters. In the player, an admin sees the **Text** tab on any book with an ebook.
2. Press **Make read-along** (or **Make again**).
3. Check the confirmation: the ebook it lines up, up to how long transcription can take, and that no agent is used.
4. Watch the progress (with **Cancel**). When it finishes, the text appears.

The Bridge must be online, offer read-alongs (update an older Bridge) and be able to write to the library. It saves the read-along in the book's hidden `.audiosilo` folder; the server still only reads. See [Making a read-along](https://docs.audiosilo.app/users/admin/making-read-along).

## Good to know

- **A poor match is refused.** If less than half the ebook lines up with the narration, nothing is saved. Put the matching edition's EPUB beside the audio and try again.
- **Out of date:** if the ebook or audio changed since it was made, listeners don't see the Text tab until an admin makes it again.
- **Transcripts are reused.** If the Bridge already transcribed the book (for [characters and recaps](/blog/bridge-recaps-and-contributions/), chapters or an earlier read-along), it reuses that transcript. It keeps one for 30 days after the book's last job.
- **One book at a time.** There's no action for a whole library or series.
- **Downloads:** a remade read-along from the same ebook reaches a download the next time the app sees the book. If the server's ebook is replaced, the download keeps its own pair. Downloads made before 2.6.0 need a connection for the Text tab until the app next sees the book on your server.

## More

The docs have each part with screenshots: [the Text tab](https://docs.audiosilo.app/users/listening/companion#text), [Follow the narration](https://docs.audiosilo.app/users/listening/reading-the-ebook#follow-the-narration), [read-alongs offline](https://docs.audiosilo.app/users/listening/offline-downloads#how-downloaded-playback-differs) and [Making a read-along](https://docs.audiosilo.app/users/admin/making-read-along), including [from the player](https://docs.audiosilo.app/users/admin/making-read-along#from-the-player). For what else a Bridge does, see [Characters and recaps from your own Bridge](/blog/bridge-recaps-and-contributions/).
