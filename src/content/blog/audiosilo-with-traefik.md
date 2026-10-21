---
title: "Set up AudioSilo with Traefik: Docker Compose and HTTPS"
description: "A step-by-step Traefik reverse proxy guide for AudioSilo, with downloadable Compose files, screenshots, HTTPS settings, phone pairing and troubleshooting."
kind: tutorial
published: 2026-10-21
verified: 2026-10-21
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
    caption: "Both services are running. Read the proxy log as well: a running container alone does not confirm certificate issuance."
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
---

To put AudioSilo behind **Traefik**, let Traefik serve HTTPS and forward to **`http://audiosilo:8080`**, with **AudioSilo's HTTPS mode set to Off**. Set its public address to your HTTPS hostname and trust the proxy's address for client IP handling. This guide gives you the files and takes you from a fresh Docker Compose stack to listening on your phone.

Traefik handles HTTPS, certificate renewal and the HTTP redirect. A small file provider configuration connects its router to AudioSilo, without mounting the Docker socket.

## Step 1: Prepare the hostname and network

Use a Linux host with [Docker Engine and the Compose plugin](https://docs.docker.com/engine/install/) installed. These instructions use a terminal on that host. Confirm both commands work:

```sh
docker version
docker compose version
```

You'll also need an existing audiobook folder on that host, a domain you control and an email address for the certificate account. The example hostname is **`books.example.com`**; replace it with your own throughout.

1. In your DNS provider, add an **A record** for `books` pointing to the host's public IPv4 address. For a server at home, that is your router's public address, not `192.168.x.x`.
2. Add an **AAAA record only if incoming IPv6 also reaches this host**. Remove a stale AAAA record before continuing. If you use a DNS/CDN service with a proxy toggle, use DNS-only while setting up this direct connection.
3. Give the Docker host a stable LAN address. Forward **TCP 80 to TCP 80** and **TCP 443 to TCP 443** on that host in your router, and allow those ports through its firewall. A VPS needs its provider firewall configured too. The exact screens depend on your router and DNS provider.
4. Confirm no other service already owns ports 80 or 443. This is a fresh, dedicated proxy stack; [use the existing-proxy instructions below](#if-you-already-run-traefik) if those ports belong to a proxy you want to keep.

You can inspect the public records with `nslookup books.example.com`. If your internet connection uses CGNAT and cannot accept incoming connections, this particular port-forwarding setup cannot validate a certificate or serve remote listeners; use the [VPN route](/blog/listen-away-from-home/#option-3-keep-it-private-with-a-vpn) or a reachable host instead.

## Step 2: Download and edit the files

Create a directory for this stack, then download its files:

```sh
mkdir -p ~/audiosilo-traefik
cd ~/audiosilo-traefik
mkdir -p dynamic
curl -fL https://audiosilo.app/downloads/reverse-proxy/traefik/compose.yaml -o compose.yaml
curl -fL https://audiosilo.app/downloads/reverse-proxy/traefik/env.example -o .env
curl -fL https://audiosilo.app/downloads/reverse-proxy/traefik/dynamic/audiosilo.yaml -o dynamic/audiosilo.yaml
```

You can also save the [Compose file](/downloads/reverse-proxy/traefik/compose.yaml), [environment example](/downloads/reverse-proxy/traefik/env.example) and [dynamic/audiosilo.yaml](/downloads/reverse-proxy/traefik/dynamic/audiosilo.yaml) directly. Save the environment example as **`.env`**, including the leading dot, beside `compose.yaml`.

Open `.env` with your editor, for example `nano .env`, and replace these values:

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

`BOOKS_HOST` is just the hostname, without `https://`, a port or a path. `AUDIOBOOKS_DIR` is the **existing absolute folder on the host** containing your books. Use the output of `id -u` and `id -g` for `PUID` and `PGID`, choosing a user/group that can read that folder; on Unraid these are commonly `99` and `100`. Set `TZ` to your timezone, such as `Europe/London`. Quote a value containing spaces in `.env`.

The dedicated Docker network uses `172.30.90.0/24`. If that overlaps your LAN, VPN or another Docker network, change **all three** `PROXY_SUBNET`, `PROXY_IP` and `AUDIOSILO_IP` to an unused subnet and two different addresses inside it. For example, `172.30.91.0/24`, `172.30.91.2` and `172.30.91.3`. The fixed addresses prevent Docker assigning the proxy's reserved IP to AudioSilo first. AudioSilo trusts only the proxy IP with `/32`.

The AudioSilo service already contains the settings that matter:

```yaml
AUDIOSILO_BIND: 0.0.0.0:8080
AUDIOSILO_TLS_MODE: "off"
AUDIOSILO_PUBLIC_URL: https://${BOOKS_HOST}
AUDIOSILO_TRUSTED_PROXIES: ${PROXY_IP}/32
```

Compose expands those variables from `.env`. AudioSilo has **no published host port**: the proxy reaches it over the Docker network. The LinuxServer image stores configuration and its database in `./audiosilo`, mounted at `/config`, and reads your books at `/audiobooks:ro`. The first-party KodeStar image uses `/data` instead; keep the image and data mount together if adapting this example. The [LinuxServer AudioSilo reference](https://docs.linuxserver.io/images/docker-audiosilo/) describes this image.

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

Traefik expands `BOOKS_HOST` in this **dynamic file**. Compose passes the variable to the container; it also sets the static entry points, file provider and Let's Encrypt resolver through Traefik's command arguments. The HTTP challenge uses port 80, and the `traefik_acme` volume preserves certificate state. Traefik's public dashboard is not enabled.

The file provider deliberately keeps discovery simple: no Docker socket, container labels or Docker API version setting is required. The upstream name `audiosilo` resolves on the shared Docker network. See Traefik's [file provider](https://doc.traefik.io/traefik/providers/file/) and [ACME documentation](https://doc.traefik.io/traefik/https/acme/) for the two parts of this configuration.

## Step 4: Start the stack and sign in

From the directory containing `compose.yaml`:

```sh
docker compose config --quiet
docker compose pull
docker compose up -d
docker compose ps
docker compose logs traefik
```

The config command should finish without errors. Both services should be running, and the proxy log should show successful certificate setup without DNS, connection or ACME errors. On a public hostname, wait for a trusted certificate before sending credentials through the site.

<!-- screenshot:running -->

Now read AudioSilo's first-run log:

```sh
docker compose logs audiosilo
```

On a new configuration directory it prints a generated **admin password** and **auth code** once. Save them privately. Open **`https://books.example.com/admin`**, sign in as `admin` with that password, and keep the auth code for the phone step. Use your real hostname here. If this is an existing configuration, use the credentials you already have; restarting does not print a fresh password.

<!-- screenshot:login -->

## Step 5: Check the three AudioSilo settings

In the admin console, open **Server > Settings > Network & HTTPS**. Confirm **HTTPS mode is Off** and **Trusted proxies** contains `172.30.90.2/32`, or the address you chose. AudioSilo speaks HTTP inside Docker; Traefik supplies the HTTPS visitors use.

<!-- screenshot:network -->

Open **Server > Settings > General** and confirm **Public address** is `https://books.example.com`, using your real hostname and no `:8080` suffix.

<!-- screenshot:address -->

These fields show as **locked by environment variables** in this setup. That is expected: supported `AUDIOSILO_*` environment variables override `config.yaml`, including after the file has been generated. To change one, edit Compose or `.env` and run **`docker compose up -d`** to recreate the affected container. `docker compose restart` keeps the old environment.

**Trusted proxies** controls whose forwarded client IP is believed for rate limits and sign-in lockouts. It does not disable HTTPS redirects. A single stable proxy IP is sufficient; there is no need to trust every container or your whole LAN.

## Step 6: Add your audiobook library

Go to **Library > Libraries > Add library**. Give the library a name and set **Folder** to **`/audiobooks`**, then click **Add library and scan**. Use the path inside the container, even if the host path in `.env` was `/srv/audiobooks` or a NAS mount. Let the scan fill in the covers.

<!-- screenshot:library -->

If the folder is empty or unavailable, check the host path in `.env`, its mount and read permissions for your chosen `PUID`/`PGID`. AudioSilo's library mount is read-only; keep managing the files on the host. The [library documentation](https://docs.audiosilo.app/users/admin/libraries) covers scans and folder selection.

## Step 7: Pair your phone and test playback

Open **`https://books.example.com/`** in a browser and enter the **auth code** from the first-run log. The connect page signs in and displays the **pairing QR code** and **Open in app** action. In the AudioSilo iOS or Android app, choose **Scan a QR code** on its connect screen and scan that pairing QR. You can pair the admin account; creating a separate listener is optional.

<!-- screenshot:pairing -->

For someone else, use **People > Invite someone** in the admin console. Open the resulting **invite link in a browser** first, or scan its QR with the phone's normal camera. That page then provides the pairing QR for the AudioSilo app. **The QR on the admin invite card opens a web page; the app's scanner expects the pairing QR on the connect page.** You can also enter the server address in the app and sign in with the invite code.

Open **`https://books.example.com/web`** to check the web player too. Start a book, seek forward, pause and resume. Covers and audio should load through the HTTPS hostname.

<!-- screenshot:player -->

Finally, turn **Wi-Fi off** on your phone and repeat the connection and playback test over mobile data. That checks DNS, router forwarding and the public certificate from outside your home. A test on your home Wi-Fi alone cannot confirm remote access. If mobile data works but home Wi-Fi does not, check your router's NAT loopback support or configure local DNS to resolve the same hostname to the Docker host's LAN address.

Leave **Home address** empty for this proxy-only stack unless you have a separate, reachable home endpoint with a certificate your app trusts. Do not enter `http://192.168.x.x:8080`: this example does not publish AudioSilo's port 8080. [Pair your phone](/blog/pair-your-phone/) and [Connecting and signing in](https://docs.audiosilo.app/users/listening/connecting) explain the other sign-in routes.

## Troubleshooting

- **An `https://...:80` redirect or a redirect loop:** confirm `AUDIOSILO_TLS_MODE` is exactly `off` on the running AudioSilo container and recreate it with `docker compose up -d`. The upstream must be **HTTP** on 8080. Public URL should be the external **HTTPS** address. Trusted proxies is a separate client-IP setting.
- **A changed setting is ignored:** environment variables take precedence over the config file. Check `docker compose config` for the resolved values, then recreate the service. The admin console's lock badge identifies the variable in control.
- **A port is already allocated:** keep the service that owns 80/443 and use the existing-proxy section below, or choose a different host for this fresh stack.
- **A subnet overlap error:** select an unused `PROXY_SUBNET` and update `PROXY_IP` and `AUDIOSILO_IP` with it in `.env`.
- **The app rejects a QR:** open the invite link in a browser and scan the **connect page's pairing QR**, or enter the server address and invite code in the app.
- **Traefik returns 404:** its router did not match. Use the exact hostname in `BOOKS_HOST`, check that `dynamic/audiosilo.yaml` exists, and read `docker compose logs traefik` for template or YAML errors. A request to an IP address does not match the hostname rule.
- **502 Bad Gateway:** the router matched but the backend is unreachable. Check AudioSilo's log, the shared network and the upstream `http://audiosilo:8080`.
- **A default or untrusted certificate:** inspect the ACME error in Traefik's log. Check DNS and public port 80 before trying again. Keep the certificate volume between restarts.
- **A Docker API error from another configuration:** this example uses the file provider and does not need Docker access. Remove unrelated Docker provider settings when testing the dedicated example.

For the proxy's own check/log command:

```sh
docker compose logs traefik
```

## If you already run Traefik

Use the existing proxy that owns ports 80/443. The complete downloadable stack above is for a new proxy instance.

Keep your existing Traefik ports, certificate storage and entry points. Enable the file provider if you do not already use it, then add the downloaded `dynamic/audiosilo.yaml` to its watched directory. Set the rule to your actual hostname, or pass `BOOKS_HOST` into that Traefik container. Match `websecure` and `letsencrypt` to your existing entry point and certificate resolver names.

Connect AudioSilo to Traefik's Docker network and ensure `audiosilo` resolves there. Use HTTP port 8080 as the backend, set AudioSilo's TLS mode to `off`, public URL to `https://books.example.com` and trusted proxies to the actual Traefik IP with `/32`. Give the proxy a stable address. Watch Traefik's logs after it loads the file, then verify `/admin`, `/web` and playback. If your existing setup uses the Docker provider, you can instead describe the same hostname router and port 8080 service with labels; the downloadable example is the file-provider version.

## Updating the pinned images

The download pins the exact image builds listed below so the setup is reproducible. `docker compose pull` fetches those tags; it does not choose a newer version automatically.

Before upgrading, make a restorable backup of AudioSilo's configuration/database and the proxy's certificate state. Use AudioSilo's backup feature or stop the container before copying its database files. Edit the `image:` tags in `compose.yaml` to the published versions you want, then run:

```sh
docker compose pull
docker compose up -d
docker compose ps
```

Read both services' logs and repeat admin sign-in, phone connection, playback and seeking. Keep the same data directories and certificate volumes when recreating the containers.

## What we tested

The screenshots come from a local Docker test of these files on 21 October 2026, using the released LinuxServer AudioSilo **v2.3.1-ls6** image and **Traefik 3.7.16**. The test hostname was `books.example.com`, mapped locally, with HTTPS on **28443**; alternate local test ports leave existing host services in place. That is why the screenshots include `:28443`; the public recipe uses standard ports 80/443 and no port in Public address.

The lab uses a local certificate authority to exercise HTTPS routing. **Public DNS, router forwarding and Let's Encrypt issuance are not verified by that local test**; follow the external checks in steps 1 and 7 for your deployment. The local run checks the admin UI, environment-controlled settings, library access, connect-page pairing, web player and audio requests through the proxy. It also checks redirects and forwarded client-IP handling. The captured invite and pairing QR are invalidated after capture, and the disposable containers are stopped.

For general background, see [remote access and HTTPS](/blog/listen-away-from-home/) and the documentation's [Remote access](https://docs.audiosilo.app/users/getting-started/remote-access) page. Keep the configuration/database directory and certificate data backed up before upgrades; normal `docker compose down` preserves named volumes, while `down -v` removes them.
