---
title: "Faster transcription for your Bridge: an ASR worker in one command"
description: Bridge 0.4.0 installs an ASR worker on a Mac with Apple silicon or a Linux PC with an NVIDIA card from one line you paste in a terminal. Run it again to update.
kind: feature
published: 2026-10-28
verified: 2026-10-28
appliesTo: Bridge 0.4.0, Server 2.5.0
tags: [bridge, asr, workers, recaps, self-hosting]
covers:
  - bridge:workers
  - bridge:install
  - server:bridge
  - docs:/users/getting-started/running-a-worker
  - docs:/users/getting-started/running-a-bridge
  - docs:/users/admin/bridge
related:
  - bridge-recaps-and-contributions
  - server-2-5
draft: false
---

Before a [Bridge](/blog/bridge-recaps-and-contributions/) can write characters and chapter recaps for a book from its audio, it transcribes the whole book. In its standard container that runs on the processor, which takes hours for a long book on a typical NAS. An **ASR worker** (ASR is automatic speech recognition) does the transcribing on a faster computer instead. From **Bridge 0.4.0**, out on 28 October alongside server 2.5.0, setting one up is a single line: the Bridge's **Workers** tab gives you a command to paste into that computer's terminal, and it downloads the worker from your Bridge, installs it as a service and starts it.

## Which computer

- **A Mac with Apple silicon** (M1 or later), which runs the speech recognition on the Mac's graphics chip. The docs' example: on a Mac Studio, an 11-hour book took about 37 minutes.
- **A Linux computer with an NVIDIA graphics card.**

The worker connects to the Bridge over your local network, takes the audio a piece at a time, transcribes it and sends the text back. It needs no access to your library: the Bridge sends it the audio. While a worker is connected, every book's transcription goes to it, and the rest of the work stays on the Bridge.

If your Bridge runs in Docker on a Mac, this is the way to get the fast speech recognition at all: Docker on macOS can't reach the graphics chip, so run a worker on the same Mac.

## What you need

- A **Bridge 0.4.0** or later, running in Docker and paired with your server. Update the image (`ghcr.io/kodestar/audiosilo-bridge`) first if yours is older.
- The worker's computer on the **same local network** as the Bridge, running macOS or Linux. The worker's connection, and its download, are refused from the internet and over a VPN address like Tailscale's.
- On a Mac, **Python 3** and **ffmpeg** (for example `brew install python ffmpeg`). On Linux, nothing more: the command uses `curl` and `gzip`.

## Setting it up

1. Open the Bridge's page and its **Workers** tab. Under **Add a worker**, give it a name (the computer it runs on, say) and press **Add worker**.
2. The page shows the command, with the worker's token in it. The token is shown only this once, so press **Copy** before **Done**. Copy now works on a plain `http://` page too; if the browser still refuses, the page selects the command for you to copy by hand.
3. Paste it into a terminal on the worker's computer:

```bash
curl -fsSL http://192.168.1.20:8091/worker/install.sh | sh -s -- --token asw_...
```

The command downloads the worker build for that computer from your Bridge (the same version as the Bridge), puts it in `~/.audiosilo-bridge-worker`, installs it as a service that starts when you log in and restarts itself if it stops, and starts it.

The first start sets up the speech recognition, which takes a few minutes: on a Mac it builds it (and downloads its model, about 1.6 GB, on the first book it transcribes); on Linux it downloads a build for your computer, the GPU one when it finds an NVIDIA driver. Then the worker shows as **Connected** on the Workers tab, with the speech recognition it runs (after an update, within a few seconds). The server's admin console lists it too, under **Settings > Bridge > Workers**.

A few things worth knowing:

- **Try it first.** Add `--run` to the end of the command to run the worker in that terminal instead of installing the service. It stops when you press Ctrl-C.
- **Updating is the same line.** When you update the Bridge, paste the command again (the token is remembered, so you can leave out `--token` and what follows it): it replaces the worker with the Bridge's new version, restarts the service and keeps its settings.
- **Behind a reverse proxy**, set the Bridge's public address (`public_url`) to the proxy's full address and the command uses it.
- **A refusal is explained.** If the Bridge turns the download away (from outside your network, say), the command prints why rather than failing silently.
- Each Bridge release on GitHub also carries the worker downloads, for installing by hand (or when the Bridge runs outside Docker, which can't serve them).

## When the worker is off

When no worker is connected (its computer is asleep, say), the Bridge follows its **When no ASR worker is connected** setting: it carries on with its own slower speech recognition (the default), or the book waits until a worker connects (a Bridge with no speech recognition of its own always waits). While a book waits, the server's console links its speech recognition step to the Bridge's Workers tab, and so does the Bridge's own **Status** tab.

The full walkthrough, including installing by hand and removing a worker, is in the docs: [Running an ASR worker](https://docs.audiosilo.app/users/getting-started/running-a-worker). For what the Bridge does with the transcript, see [Characters and recaps from your own Bridge](/blog/bridge-recaps-and-contributions/).
