---
title: "Set up AudioSilo with Traefik: Docker Compose and HTTPS"
description: "A step-by-step Traefik reverse proxy guide for AudioSilo, with downloadable Compose files, screenshots, HTTPS settings, phone pairing and troubleshooting."
kind: tutorial
published: 2026-10-21
updated: 2026-11-10
verified: 2026-10-28
appliesTo: "Server 2.3.1 (LinuxServer v2.3.1-ls6); Traefik 3.7.16; app 2.0.0"
tags: [reverse-proxy, https, remote-access, docker, traefik]
covers:
  - server:tls
  - server:addresses
  - server:security
  - server:libraries
  - app:connect
  - docs:/users/getting-started/remote-access
  - docs:/users/listening/connecting
related:
  - back-up-before-upgrading
  - listen-away-from-home
  - pair-your-phone
  - self-hosted-audiobook-server
screenshots:
  - id: files
    image: ../../assets/stills/reverse-proxy/traefik-files.webp
    alt: "Traefik: The configured environment variables and Compose service names in the setup terminal"
    caption: "The configured hostname, library path, user IDs and network addresses, followed by the two Compose service names."
    address: "Setup terminal"
  - id: running
    image: ../../assets/stills/reverse-proxy/traefik-running.webp
    alt: "Traefik: The AudioSilo and reverse proxy containers running in Docker Compose"
    caption: "Both services are running. Read the proxy log as well, because a running container alone does not confirm certificate issuance."
    address: "Setup terminal"
  - id: login
    image: ../../assets/stills/reverse-proxy/traefik-login.webp
    alt: "Traefik: The AudioSilo admin sign-in page reached through the HTTPS reverse proxy"
    caption: "Open /admin through the proxy and use the private first-run password from the AudioSilo log."
    address: "books.example.com:28443/admin"
  - id: network
    image: ../../assets/stills/reverse-proxy/traefik-network.webp
    alt: "Traefik: AudioSilo Network settings showing HTTPS Off and the configured trusted proxy"
    caption: "HTTPS is Off inside AudioSilo. Environment-controlled settings show a lock and the variable that supplies the value."
    address: "books.example.com:28443/admin"
  - id: address
    image: ../../assets/stills/reverse-proxy/traefik-address.webp
    alt: "Traefik: AudioSilo General settings showing the configured public address"
    caption: "Public address must be the HTTPS address that phones and invite recipients can reach."
    address: "books.example.com:28443/admin"
  - id: library
    image: ../../assets/stills/reverse-proxy/traefik-library.webp
    alt: "Traefik: Adding an AudioSilo library using the in-container folder /audiobooks"
    caption: "Choose /audiobooks, the path inside the container, when adding your library."
    address: "books.example.com:28443/admin"
  - id: pairing
    image: ../../assets/stills/reverse-proxy/traefik-pairing.webp
    alt: "Traefik: The AudioSilo connect page after sign-in, with pairing actions"
    caption: "The connect page provides the pairing QR accepted by the app. The capture uses a disposable test account."
    address: "books.example.com:28443/"
  - id: player
    image: ../../assets/stills/reverse-proxy/traefik-player.webp
    alt: "Traefik: The AudioSilo web player reached through the reverse proxy"
    caption: "Check that the library opens, audio plays and seeking works through the same HTTPS address."
    address: "books.example.com:28443/web"
revisions:
  - date: 2026-11-10
    note: "Rewritten to be shorter and easier to read. No facts changed."
  - date: 2026-10-28
    note: "Server 2.5.0 copies its database before an upgrade that changes it; links the backup-before-upgrading guide."
  - date: 2026-10-24
    note: "Noted the Set up your server flow a new 2.4.0 server opens on first sign-in, and that app 2.4.0 scans the invite card's QR directly."
---

To put AudioSilo behind **Traefik**, let Traefik serve HTTPS and forward to **`http://audiosilo:8080`**, with **AudioSilo's HTTPS mode set to Off**. Set its public address to your HTTPS hostname and trust the proxy's address for client IP handling. The files below take you from a fresh Docker Compose stack to listening on your phone.

Traefik handles HTTPS, certificate renewal and the HTTP redirect. A small file provider configuration connects its router to AudioSilo, without mounting the Docker socket.

## What you need

- A Linux host with [Docker Engine and the Compose plugin](https://docs.docker.com/engine/install/), and a terminal on it.
- An existing audiobook folder on that host.
- A domain you control and an email address for the certificate account.

Confirm Docker works:

```sh
docker version
docker compose version
```

The example hostname is **`books.example.com`**. Replace it with your own throughout.

## Step 1: Prepare the hostname and network

1. In your DNS provider, add an **A record** for `books` pointing to the host's public IPv4 address. At home, that is your router's public address, not `192.168.x.x`.
2. Add an **AAAA record only if incoming IPv6 also reaches this host**, and remove a stale one. If your DNS/CDN service has a proxy toggle, use DNS-only for now.
3. Give the Docker host a stable LAN address. Forward **TCP 80 to TCP 80** and **TCP 443 to TCP 443** to it on your router, and allow both through its firewall. A VPS needs its provider firewall opened too.
4. Make sure nothing else owns ports 80 or 443. If a proxy you want to keep does, see [If you already run Traefik](#if-you-already-run-traefik).

Check the public records with `nslookup books.example.com`. Behind CGNAT, with no incoming connections, this setup can't get a certificate or serve remote listeners. Use the [VPN route](/blog/listen-away-from-home/#option-3-keep-it-private-with-a-vpn) or a reachable host instead.

## Step 2: Download and edit the files

```sh
mkdir -p ~/audiosilo-traefik
cd ~/audiosilo-traefik
mkdir -p dynamic
curl -fL https://audiosilo.app/downloads/reverse-proxy/traefik/compose.yaml -o compose.yaml
curl -fL https://audiosilo.app/downloads/reverse-proxy/traefik/env.example -o .env
curl -fL https://audiosilo.app/downloads/reverse-proxy/traefik/dynamic/audiosilo.yaml -o dynamic/audiosilo.yaml
```

Or save the [Compose file](/downloads/reverse-proxy/traefik/compose.yaml), [environment example](/downloads/reverse-proxy/traefik/env.example) and [dynamic/audiosilo.yaml](/downloads/reverse-proxy/traefik/dynamic/audiosilo.yaml) directly. Save the environment example as **`.env`**, with the leading dot, beside `compose.yaml`.

Open `.env` in an editor, for example `nano .env`, and replace these values:

```dotenv
BOOKS_HOST=books.example.com
ACME_EMAIL=you@example.com
PUID=1000
PGID=1000
TZ=Etc/UTC
AUDIOBOOKS_DIR=/srv/audiobooks
PROXY_SUBNET=172.30.90.0/24
PROXY_IP=172.30.90.2
AUDIOSILO_IP=172.30.90.3
```

| Value | What to enter |
|---|---|
| `BOOKS_HOST` | Only the hostname, with no `https://`, port or path. |
| `AUDIOBOOKS_DIR` | The **existing absolute folder on the host** that holds your books. |
| `PUID`, `PGID` | The output of `id -u` and `id -g`, for a user/group that can read that folder. On Unraid, commonly `99` and `100`. |
| `TZ` | Your timezone, such as `Europe/London`. |

Quote any value that contains spaces.

If `172.30.90.0/24` overlaps your LAN, VPN or another Docker network, change **all three** `PROXY_SUBNET`, `PROXY_IP` and `AUDIOSILO_IP` to an unused subnet and two addresses in it, such as `172.30.91.0/24`, `172.30.91.2` and `172.30.91.3`. Fixed addresses stop Docker giving the proxy's IP to AudioSilo, which trusts only the proxy IP with `/32`.

The AudioSilo service already contains the settings that matter:

```yaml
AUDIOSILO_BIND: 0.0.0.0:8080
AUDIOSILO_TLS_MODE: "off"
AUDIOSILO_PUBLIC_URL: https://${BOOKS_HOST}
AUDIOSILO_TRUSTED_PROXIES: ${PROXY_IP}/32
```

AudioSilo has **no published host port**. The proxy reaches it over the Docker network. The LinuxServer image keeps its configuration and database in `./audiosilo` (mounted at `/config`) and reads your books at `/audiobooks:ro`. The first-party KodeStar image uses `/data` instead. See the [LinuxServer AudioSilo reference](https://docs.linuxserver.io/images/docker-audiosilo/).

<!-- screenshot:files -->

## Step 3: Check the Traefik configuration

```yaml
http:
  routers:
    audiosilo:
      rule: 'Host(`{{ env "BOOKS_HOST" }}`)'
      entryPoints:
        - websecure
      service: audiosilo
      tls:
        certResolver: letsencrypt
  services:
    audiosilo:
      loadBalancer:
        servers:
          - url: http://audiosilo:8080
```

Traefik expands `BOOKS_HOST` in this **dynamic file**. Compose sets the static entry points, file provider and Let's Encrypt resolver through Traefik's command arguments. The HTTP challenge uses port 80, and the `traefik_acme` volume keeps certificate state. Traefik's public dashboard is not enabled. See Traefik's [file provider](https://doc.traefik.io/traefik/providers/file/) and [ACME documentation](https://doc.traefik.io/traefik/https/acme/).

## Step 4: Start the stack and sign in

From the directory containing `compose.yaml`:

```sh
docker compose config --quiet
docker compose pull
docker compose up -d
docker compose ps
docker compose logs traefik
```

The config command should finish without errors and both services should be running. The proxy log should show no DNS, connection or ACME errors. On a public hostname, wait for a trusted certificate before signing in.

<!-- screenshot:running -->

Now read AudioSilo's first-run log:

```sh
docker compose logs audiosilo
```

On a new configuration directory it prints an **admin password** and **auth code** once. Save them privately; a restart does not print them again.

Open **`https://books.example.com/admin`** and sign in as `admin` with that password. Keep the auth code for Step 7.

The pinned download runs 2.3.1, which opens the console directly. A new server on **2.4.0 or later** opens **Set up your server** first; **Finish later** takes you to the console to follow this guide.

<!-- screenshot:login -->

## Step 5: Check the AudioSilo settings

Open **Server > Settings > Network & HTTPS**. Confirm **HTTPS mode is Off** and **Trusted proxies** contains `172.30.90.2/32`, or the address you chose.

<!-- screenshot:network -->

Open **Server > Settings > General**. Confirm **Public address** is `https://books.example.com`, with no `:8080`.

<!-- screenshot:address -->

These fields are **locked by environment variables**, as expected. Supported `AUDIOSILO_*` variables override `config.yaml`. To change one, edit Compose or `.env` and run **`docker compose up -d`**. `docker compose restart` keeps the old environment.

**Trusted proxies** decides whose forwarded client IP is believed for rate limits and sign-in lockouts. It does not disable HTTPS redirects. Trust the one proxy IP, not your whole LAN.

## Step 6: Add your audiobook library

Go to **Library > Libraries > Add library**. Name it, set **Folder** to **`/audiobooks`** (the path inside the container) and click **Add library and scan**.

<!-- screenshot:library -->

If the folder is empty, check the host path in `.env`, its mount and read permissions for your `PUID`/`PGID`. The mount is read-only, so keep managing files on the host. See the [library documentation](https://docs.audiosilo.app/users/admin/libraries).

## Step 7: Pair your phone and test playback

1. Open **`https://books.example.com/`** in a browser and enter the **auth code**. The connect page shows a **pairing QR code**.
2. In the AudioSilo iOS or Android app, choose **Scan a QR code** and scan it. Pairing the admin account is fine.

<!-- screenshot:pairing -->

For someone else, use **People > Invite someone**. They open the **invite link in a browser** for a pairing QR, or enter the server address and invite code in the app. App 2.4.0's scanner also accepts the invite card's QR directly; earlier apps need the connect page's pairing QR.

Open **`https://books.example.com/web`**. Start a book, seek forward, pause and resume.

<!-- screenshot:player -->

Then turn **Wi-Fi off** on your phone and repeat the test over mobile data. Home Wi-Fi alone can't confirm remote access. If mobile data works but Wi-Fi does not, check your router's NAT loopback support or point the hostname at the host's LAN address in local DNS.

Leave **Home address** empty unless you have a separate home endpoint with a certificate your app trusts. This stack does not publish port 8080, so `http://192.168.x.x:8080` won't work. [Pair your phone](/blog/pair-your-phone/) and [Connecting and signing in](https://docs.audiosilo.app/users/listening/connecting) cover other sign-in routes.

## Troubleshooting

- **An `https://...:80` redirect or a redirect loop:** confirm `AUDIOSILO_TLS_MODE` is exactly `off` on the running container and recreate it with `docker compose up -d`. The upstream must be **HTTP** on 8080.
- **A changed setting is ignored:** environment variables win. Check `docker compose config` for the resolved values, then recreate the service.
- **A port is already allocated:** see [If you already run Traefik](#if-you-already-run-traefik), or use a different host.
- **A subnet overlap error:** pick an unused `PROXY_SUBNET` and update `PROXY_IP` and `AUDIOSILO_IP` to match.
- **Traefik returns 404:** its router did not match. Use the exact hostname in `BOOKS_HOST`, check that `dynamic/audiosilo.yaml` exists, and read `docker compose logs traefik` for template or YAML errors. A request to an IP address does not match the hostname rule.
- **502 Bad Gateway:** the router matched but the backend is unreachable. Check AudioSilo's log, the shared network and the upstream `http://audiosilo:8080`.
- **A default or untrusted certificate:** read the ACME error in Traefik's log. Check DNS and public port 80 before trying again. Keep the certificate volume between restarts.
- **A Docker API error from another configuration:** this example uses the file provider and does not need Docker access. Remove unrelated Docker provider settings.

Read Traefik's log with:

```sh
docker compose logs traefik
```

## If you already run Traefik

Use the proxy that already owns ports 80/443; the download above is for a new proxy instance.

1. Keep your existing Traefik ports, certificate storage and entry points. Enable the file provider if you do not already use it.
2. Add the downloaded `dynamic/audiosilo.yaml` to its watched directory. Set the rule to your actual hostname, or pass `BOOKS_HOST` into that Traefik container.
3. Match `websecure` and `letsencrypt` to your existing entry point and certificate resolver names.
4. Connect AudioSilo to Traefik's Docker network and make sure `audiosilo` resolves there. The backend is HTTP port 8080.
5. Set AudioSilo's **HTTPS mode** to **Off**, **Public address** to `https://books.example.com` and **Trusted proxies** to the actual Traefik IP with `/32`. Give the proxy a stable address.
6. Watch Traefik's logs after it loads the file, then check `/admin`, `/web` and playback.

If your setup uses the Docker provider, you can describe the same hostname router and port 8080 service with labels instead. The download is the file-provider version.

## Updating the pinned images

The download pins the image versions in [What we tested](#what-we-tested); `docker compose pull` never picks a newer one by itself.

1. Back up AudioSilo's configuration/database and the proxy's certificate state. Use AudioSilo's backup feature, or stop the container before copying its database files.
2. Edit the `image:` tags in `compose.yaml` to the versions you want.
3. Pull and recreate:

```sh
docker compose pull
docker compose up -d
docker compose ps
```

Read both logs, then repeat sign-in, pairing, playback and seeking. `docker compose down` keeps named volumes; `down -v` removes them.

From server 2.5.0, the server also copies its database before an upgrade that changes it (**Before an upgrade** in **Server > Settings > Backups**). [How to back up a self-hosted app before you upgrade it](/blog/back-up-before-upgrading/) covers rolling back.

## What we tested

| | |
|---|---|
| Date | 21 October 2026 |
| AudioSilo | LinuxServer **v2.3.1-ls6** image |
| Proxy | **Traefik 3.7.16** |
| Test address | `books.example.com`, mapped locally, HTTPS on **28443** |

The screenshots come from a local Docker test of these files, hence `:28443`; the public recipe uses ports 80/443 and no port in Public address. The test used a local certificate authority, so **it didn't verify public DNS, router forwarding or Let's Encrypt issuance**. Do the outside checks in steps 1 and 7 yourself. The test did check the console, locked settings, library access, connect-page pairing, the web player, audio, redirects and forwarded client IPs through the proxy.

For background, see [remote access and HTTPS](/blog/listen-away-from-home/) and the docs' [Remote access](https://docs.audiosilo.app/users/getting-started/remote-access) page.
