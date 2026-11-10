---
title: "Listen to your audiobooks away from home: remote access and HTTPS"
description: Reach a self-hosted audiobook server from your phone anywhere. The three ways to serve HTTPS, a Caddy or nginx reverse proxy, port forwarding, and home and away addresses.
kind: guide
published: 2026-10-19
updated: 2026-11-10
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
  - date: 2026-11-10
    note: "Rewritten to be shorter and easier to read. No facts changed."
  - date: 2026-10-24
    note: "Apps from 2.1 can use plain HTTP at home on a self-signed server; away from home still needs a trusted certificate."
  - date: 2026-10-21
    note: Added illustrated Caddy, SWAG and Traefik setup guides, clarified environment overrides and home addresses behind a proxy.
---

To listen away from home, your audiobook server needs **an address that works from the internet** and **HTTPS with a certificate your devices trust**. AudioSilo gives you three ways there: let the server get a free Let's Encrypt certificate itself, put it behind a reverse proxy, or keep it private behind a VPN. Then set the home and away addresses so the apps switch between them.

## Why the certificate matters

AudioSilo starts with a **self-signed** certificate. A browser warns once and lets you accept it. Two things can't:

- **The iPhone and Android apps** need a certificate they trust. From app 2.1 on iPhone and iPad, and app 2.4.0 on Android, they can use plain HTTP on your home network with the default self-signed setup. Away from home, every app needs a trusted certificate.
- **Installing the web player** to a phone's home screen needs a connection the browser fully trusts.

## Option 1: Let the server get a certificate (autocert)

If a domain name points at your home's public address, AudioSilo can get and renew a free Let's Encrypt certificate itself. In `config.yaml` in the server's data folder:

```yaml
bind: "0.0.0.0:443"
tls:
  mode: "autocert"
  hosts: ["books.example.com"]
public_url: "https://books.example.com"
```

Or as environment variables: `AUDIOSILO_TLS_MODE=autocert`, `AUDIOSILO_TLS_HOSTS=books.example.com`, `AUDIOSILO_PUBLIC_URL=https://books.example.com`.

Let's Encrypt must reach the server on **port 443** of that name. Either bind to 443 as above, or keep the default 8080 and forward port 443 on your router to it. Certificates are cached in the data folder and renewed automatically.

This is the simplest route when AudioSilo is the only thing you expose.

## Option 2: Behind a reverse proxy

If you already run Caddy, nginx, Traefik, SWAG or Nginx Proxy Manager, let the proxy handle HTTPS and run AudioSilo as plain HTTP behind it:

```yaml
tls:
  mode: "off"                                    # the proxy terminates TLS
public_url: "https://books.example.com"          # the address people use
trusted_proxies: ["127.0.0.1/32"]                # where the proxy connects from
```

`trusted_proxies` makes AudioSilo believe the proxy's `X-Forwarded-For` header, so rate limiting and sign-in lockouts apply to each real visitor, not to the proxy. List only your proxy's address or range: trusting too wide a range lets anyone fake their address.

For a complete Docker Compose setup, follow the guide for your proxy:

- [AudioSilo with Caddy](/blog/audiosilo-with-caddy/)
- [AudioSilo with SWAG](/blog/audiosilo-with-swag/)
- [AudioSilo with Traefik](/blog/audiosilo-with-traefik/)

Those guides set the same three settings as environment variables, which override `config.yaml`. If you set HTTPS mode to Off in the admin console instead, restart AudioSilo to apply it.

For a proxy and AudioSilo on the same host, without Docker, the short Caddy configuration is:

```text
books.example.com {
    reverse_proxy localhost:8080
}
```

In separate Docker containers, use the AudioSilo service name, such as `audiosilo:8080`, instead of `localhost:8080`, and trust the proxy container's actual IP instead of loopback.

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

To open no ports at all, use a VPN such as WireGuard or Tailscale. It puts your phone on your home network wherever you are, and the server stays invisible to the internet. The apps still need HTTPS with a trusted certificate on the address they use over the VPN, so pair this with a reverse proxy on your network and a certificate for a name that resolves there.

## Ports

| Setup | Open |
|---|---|
| AudioSilo on its own | **Port 8080** by default (`bind` or `AUDIOSILO_BIND`): the API, admin console, web player and audio all use it |
| Reverse proxy with an HTTP certificate challenge | TCP 80 and 443 to the proxy; AudioSilo's port can stay inside Docker |
| Direct autocert | Public TCP 443 |

## Home and away addresses

Use the same HTTPS hostname on home Wi-Fi and mobile data. If mobile data works but home Wi-Fi does not, check your router's NAT loopback support, or point the hostname at the proxy's LAN address in local DNS.

An optional **Home address** (`lan_url`, `AUDIOSILO_LAN_URL`, or **Server > Settings > General**) adds a separate home endpoint. The apps learn both addresses when connecting and check that the home one is the same server before using it. With app 2.0.0, it also needs HTTPS with a certificate the app trusts.

Leave it empty unless you have set up a separate reachable endpoint: the Docker proxy guides don't publish port 8080, so `http://192.168.1.20:8080` won't work there. The web player stays on the address you opened it at.

## Is it safe to expose?

AudioSilo is designed to sit on the internet, with protections on by default:

- **No default password**: the admin password is random, printed once on the first run.
- **No sign-ups**: the admin invites people (and, from server 2.3, signed-in people can add their own household). Devices join with short-lived codes.
- **Rate limiting and lockout**: 10 failed sign-ins in 15 minutes locks that address out.
- **Hashed secrets**: passwords use argon2id; tokens and invite codes are stored only as hashes and can be revoked per device.
- **Contained file access**: streaming can't reach outside your library folders.

Keep the server updated, as with anything you expose.

## A checklist

1. A domain name (or a dynamic DNS name) pointing at your home.
2. One of: autocert on port 443, a reverse proxy with `tls.mode: "off"` and `trusted_proxies`, or a VPN plus a proxy.
3. `public_url` set, so invites and QR codes carry the public address.
4. The HTTPS hostname tested on home Wi-Fi and mobile data.
5. Then [pair your phone](/blog/pair-your-phone/).

Every setting here is in [Remote access](https://docs.audiosilo.app/users/getting-started/remote-access) in the docs.
