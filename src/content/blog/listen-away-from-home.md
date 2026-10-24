---
title: "Listen to your audiobooks away from home: remote access and HTTPS"
description: Reach a self-hosted audiobook server from your phone anywhere. The three ways to serve HTTPS, a Caddy or nginx reverse proxy, port forwarding, and home and away addresses.
kind: guide
published: 2026-10-19
updated: 2026-10-24
verified: 2026-10-24
appliesTo: Server 2.3.1 and 2.4.0, app 2.0.0 and later
tags: [remote-access, https, reverse-proxy, self-hosting]
covers:
  - server:tls
  - server:addresses
  - server:security
  - app:connect
  - docs:/users/getting-started/remote-access
  - docs:/users/listening/connecting
related:
  - self-hosted-audiobook-server
  - pair-your-phone
  - audiobooks-on-unraid
hero: ../../assets/stills/player-mobile-home-dark.webp
heroAlt: Home in the AudioSilo app on a phone, with the book you are on, time left at your speed and the day you will finish
revisions:
  - date: 2026-10-24
    note: "Apps from 2.1 can use plain HTTP at home on a self-signed server; away from home still needs a trusted certificate."
  - date: 2026-10-21
    note: Added illustrated Caddy, SWAG and Traefik setup guides, clarified environment overrides and home addresses behind a proxy.
---

To listen to a self-hosted audiobook server away from home, it needs **an address that works from the internet** and **HTTPS with a certificate your devices trust**. You get there in one of three ways: let the server fetch a free Let's Encrypt certificate itself, put it behind a reverse proxy you already run, or keep it private and reach it over a VPN. This guide walks through each with AudioSilo, then sets up the home and away addresses so the phone apps switch between them by themselves.

## Why the certificate matters

AudioSilo serves HTTPS from the start, with a **self-signed** certificate it makes itself. A browser shows a warning the first time and lets you accept it, which is fine at home. Two things can't accept that warning:

- **The iPhone and Android apps.** They need a certificate they trust. (From app 2.1 on iPhone and iPad, and app 2.4.0 on Android, they can use plain HTTP on your home network with the default self-signed setup, but away from home every app needs a trusted certificate.)
- **Installing the web player** to a phone's home screen, which needs a connection the browser fully trusts.

So for listening on the go, give the server an HTTPS address with a trusted certificate. The proxy guides below use that same HTTPS hostname for mobile and web access.

## Option 1: Let the server get a certificate (autocert)

If you have a domain name pointing at your home's public address, AudioSilo can get and renew a free Let's Encrypt certificate itself. In `config.yaml` in the server's data folder:

```yaml
bind: "0.0.0.0:443"
tls:
  mode: "autocert"
  hosts: ["books.example.com"]
public_url: "https://books.example.com"
```

Or as environment variables: `AUDIOSILO_TLS_MODE=autocert`, `AUDIOSILO_TLS_HOSTS=books.example.com`, `AUDIOSILO_PUBLIC_URL=https://books.example.com`. Let's Encrypt must be able to reach the server on **port 443** of that name: either bind to 443 as above, or keep the default 8080 and forward port 443 on your router to it. Certificates are cached in the data folder and renewed automatically.

This is the simplest route when AudioSilo is the only thing you expose.

## Option 2: Behind a reverse proxy

If you already run Caddy, nginx, Traefik, SWAG or Nginx Proxy Manager for other services, let the proxy handle HTTPS and run AudioSilo as plain HTTP behind it:

```yaml
tls:
  mode: "off"                                    # the proxy terminates TLS
public_url: "https://books.example.com"          # the address people use
trusted_proxies: ["127.0.0.1/32"]                # where the proxy connects from
```

`trusted_proxies` tells AudioSilo to believe the proxy's `X-Forwarded-For` header, so rate limiting and sign-in lockouts apply to each real visitor instead of to the proxy. List only your proxy's address or range: trusting too wide a range lets anyone fake their address.

For a complete Docker Compose setup with downloads, screenshots and verification steps, follow the guide for your proxy:

- [AudioSilo with Caddy](/blog/audiosilo-with-caddy/)
- [AudioSilo with SWAG](/blog/audiosilo-with-swag/)
- [AudioSilo with Traefik](/blog/audiosilo-with-traefik/)

Each keeps AudioSilo's HTTP port inside Docker, gives the proxy a stable address and sets `AUDIOSILO_TLS_MODE=off`, `AUDIOSILO_PUBLIC_URL` and `AUDIOSILO_TRUSTED_PROXIES`. Supported environment variables override `config.yaml` and lock their settings in the admin console. After editing the Compose environment, recreate the container with `docker compose up -d`; a restart alone keeps its old environment. If setting HTTPS mode to Off in the admin UI instead, restart AudioSilo to apply it.

For a proxy and AudioSilo running directly on the same host, the short Caddy configuration is:

```text
books.example.com {
    reverse_proxy localhost:8080
}
```

In separate Docker containers, use the AudioSilo service name on their shared network, such as `audiosilo:8080`, instead of `localhost:8080`. The loopback trusted-proxy setting above applies to the same-host setup; in Docker, trust the proxy container's actual IP instead.

With nginx:

```nginx
server {
    listen 443 ssl;
    server_name books.example.com;
    # ssl_certificate     /etc/letsencrypt/live/books.example.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/books.example.com/privkey.pem;

    location / {
        proxy_pass         http://127.0.0.1:8080;
        proxy_set_header   Host $host;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }
}
```

Never use `tls.mode: "off"` without a proxy in front that serves HTTPS: plain HTTP over the internet sends passwords and audio unencrypted.

## Option 3: Keep it private with a VPN

If you'd rather open no ports at all, a VPN such as WireGuard or Tailscale puts your phone on your home network wherever you are. The server stays invisible to the internet. The apps still need HTTPS with a trusted certificate on whatever address they use over the VPN, so pair this with a reverse proxy on your network and a certificate for a name that resolves there.

## Ports and firewalls

- AudioSilo listens on **port 8080** by default (`bind`, or `AUDIOSILO_BIND`).
- Everything goes over that one port: the API, the admin console, the web player and audio streaming. There's nothing else to open.
- With a reverse proxy that uses an HTTP certificate challenge, forward TCP 80 and 443 to the proxy and allow both through the firewall. AudioSilo's own HTTP port can stay inside Docker. Direct autocert uses public TCP 443.

## Home and away addresses

Start by using the same HTTPS hostname on home Wi-Fi and mobile data. If mobile data works but home Wi-Fi does not, check your router's NAT loopback support or use local DNS to point that same hostname at the proxy's LAN address. The certificate still matches the hostname.

An optional **Home address** (`lan_url`, `AUDIOSILO_LAN_URL`, or **Server > Settings > General**) supplies a separate home endpoint. The iPhone and Android apps learn home and public addresses when connecting and check that a home endpoint is the same server before using it. With app 2.0.0, that endpoint also needs HTTPS with a certificate the app trusts.

The dedicated Docker proxy guides do not publish port 8080, so `http://192.168.1.20:8080` would not work for those stacks. Leave Home address empty unless you have configured a separate reachable endpoint. The web player stays on the address you opened it at.

## Is it safe to expose?

AudioSilo's server is designed to sit on the internet, and its protections are on by default:

- **No default password**: the admin password is random, printed once on the first run.
- **No sign-ups**: nobody can create an account from outside. The admin invites people (and, from server 2.3, signed-in people can add their own household), and devices join with short-lived codes.
- **Rate limiting and lockout**: 10 failed sign-ins in 15 minutes locks that address out.
- **Hashed secrets**: passwords use argon2id; tokens and invite codes are stored only as hashes and can be revoked per device.
- **Contained file access**: streaming can't reach outside your library folders.

Keep the server updated, as with anything you expose.

## A checklist

1. A domain name (or a dynamic DNS name) pointing at your home.
2. One of: autocert on port 443, a reverse proxy with `tls.mode: "off"` and `trusted_proxies`, or a VPN plus a proxy.
3. `public_url` set, so invites and QR codes carry the public address.
4. The HTTPS hostname tested on home Wi-Fi and mobile data. Set `lan_url` only for a separate home endpoint your app can reach and trust.
5. Then [pair your phone](/blog/pair-your-phone/).

Every setting here is in [Remote access](https://docs.audiosilo.app/users/getting-started/remote-access) in the docs.
