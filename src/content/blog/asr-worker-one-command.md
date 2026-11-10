---
title: "Faster transcription for your Bridge: an ASR worker in one command"
description: Bridge 0.4.0 installs an ASR worker on a Mac with Apple silicon or a Linux PC with an NVIDIA card from one line you paste in a terminal. Run it again to update.
kind: feature
published: 2026-10-28
updated: 2026-11-10
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
revisions:
  - date: 2026-11-10
    note: "Rewritten to be shorter and easier to read. No facts changed."
---

From **Bridge 0.4.0**, you can set up an ASR worker with one line pasted into a terminal. The Bridge's **Workers** tab gives you the command. It downloads the worker from your Bridge, installs it as a service and starts it.

An **ASR worker** (automatic speech recognition) transcribes books on a faster computer. A [Bridge](/blog/bridge-recaps-and-contributions/) transcribes a whole book before writing its characters and chapter recaps. In its standard container that runs on the processor, which takes hours for a long book on a typical NAS. Bridge 0.4.0 came out on 28 October alongside server 2.5.0.

## Which computer

- **A Mac with Apple silicon** (M1 or later), which runs the speech recognition on the graphics chip. The docs' example: on a Mac Studio, an 11-hour book took about 37 minutes.
- **A Linux computer with an NVIDIA graphics card.**

The worker connects to the Bridge over your local network. The Bridge sends it the audio a piece at a time, so it needs no access to your library. While a worker is connected, every book's transcription goes to it; the rest of the work stays on the Bridge.

If your Bridge runs in Docker on a Mac, a worker is the only way to get fast speech recognition. Docker on macOS can't reach the graphics chip, so run a worker on the same Mac.

## What you need

- **Bridge 0.4.0** or later, in Docker and paired with your server. Update the image (`ghcr.io/kodestar/audiosilo-bridge`) first if yours is older.
- The worker's computer on the **same local network** as the Bridge, running macOS or Linux. The worker and its download are refused from the internet and over a VPN address like Tailscale's.
- On a Mac, **Python 3** and **ffmpeg** (for example `brew install python ffmpeg`). On Linux, nothing more: the command uses `curl` and `gzip`.

## Setting it up

1. Open the Bridge's page and its **Workers** tab.
2. Under **Add a worker**, give it a name (the computer it runs on, say) and press **Add worker**.
3. The page shows the command, with the worker's token in it. The token is shown only once, so press **Copy** before **Done**. Copy works on a plain `http://` page too; if the browser refuses, the page selects the command for you to copy by hand.
4. Paste it into a terminal on the worker's computer:

```bash
curl -fsSL http://192.168.1.20:8091/worker/install.sh | sh -s -- --token asw_...
```

The command downloads the worker build for that computer from your Bridge, at the Bridge's version. It installs it in `~/.audiosilo-bridge-worker` as a service that starts at log-in and restarts if it stops, then starts it.

The first start sets up speech recognition, which takes a few minutes:

- **On a Mac** it builds it, and downloads its model (about 1.6 GB) on the first book it transcribes.
- **On Linux** it downloads a build for your computer, the GPU one when it finds an NVIDIA driver.

Then the worker shows as **Connected** on the Workers tab, with the speech recognition it runs. The server's admin console lists it under **Settings > Bridge > Workers**.

## Updating

When you update the Bridge, paste the command again. The token is remembered, so you can leave out `--token` and what follows. It replaces the worker with the Bridge's new version, restarts the service and keeps its settings. The worker shows as Connected again within a few seconds.

## When the worker is off

When no worker is connected (its computer is asleep, say), the Bridge follows its **When no ASR worker is connected** setting:

- carry on with its own slower speech recognition (the default), or
- make the book wait until a worker connects.

A Bridge with no speech recognition of its own always waits. While a book waits, the server's console and the Bridge's **Status** tab both link to the Bridge's Workers tab.

## Good to know

- **Try it first.** Add `--run` to the end of the command to run the worker in that terminal instead of installing the service. Ctrl-C stops it.
- **Behind a reverse proxy,** set the Bridge's public address (`public_url`) to the proxy's full address, and the command uses it.
- **A refusal is explained.** If the Bridge turns the download away (from outside your network, say), the command prints why.
- **Installing by hand:** each Bridge release on GitHub carries the worker downloads. You need these when the Bridge runs outside Docker, which can't serve them.

The full walkthrough, including installing by hand and removing a worker, is in [Running an ASR worker](https://docs.audiosilo.app/users/getting-started/running-a-worker). For what the Bridge does with the transcript, see [Characters and recaps from your own Bridge](/blog/bridge-recaps-and-contributions/).
