# AudioSilo with Caddy

Follow https://audiosilo.app/blog/audiosilo-with-caddy/ for the illustrated guide.

This is a fresh, dedicated Docker Compose stack. Only the proxy publishes ports
80 and 443; AudioSilo is reached on the Docker network over HTTP port 8080.

1. Install Docker Engine and its Compose plugin.
2. Point your hostname's A record at this host's public IPv4. Publish an AAAA
   record only if IPv6 also reaches this host.
3. Forward TCP 80 and 443 to this host and allow them through the firewall.
   Both ports must be free. HTTP certificate validation needs incoming port 80.
4. Copy env.example to .env. Set BOOKS_HOST (no scheme/path), ACME_EMAIL,
   AUDIOBOOKS_DIR (an existing absolute host path), PUID, PGID and TZ.
5. If 172.30.90.0/24 overlaps an existing LAN, VPN or Docker network, change
   PROXY_SUBNET, PROXY_IP and AUDIOSILO_IP together. Only the proxy IP is trusted by AudioSilo.
6. Run `docker compose config --quiet`, `docker compose pull`, and
   `docker compose up -d`. Then `docker compose logs audiosilo` shows the
   first-run admin password and auth code once. Save them privately.
7. Check `docker compose logs caddy` for certificate/setup errors.
8. Open https://YOUR_HOST/admin and sign in as admin. Add /audiobooks as a
   library under Library > Libraries. The web player is at /web.
9. Open https://YOUR_HOST/ in a browser and enter the first-run auth code.
   The connect page's pairing QR works with the app's QR scanner. The admin
   invite card's QR opens an invite web page; it is not the app pairing QR.
10. Test from mobile data, including playback and seeking.

AUDIOSILO_* environment variables override config.yaml and lock their controls
in the admin UI. Edit the Compose/.env files and run `docker compose up -d`
when changing them; `docker compose restart` does not load changed environment.

Keep ./audiosilo (config/database) and the proxy's certificate data. A normal
`docker compose down` preserves named volumes; do not add -v when preserving
certificates. Back up the configuration before upgrading.

These recipes use the LinuxServer AudioSilo image (/config). The first-party
KodeStar image uses /data instead; do not interchange the data mounts.

The image tags are pinned to the builds checked for the guide. To upgrade, back
up AudioSilo's configuration/database and the proxy certificate state, edit the
image tags in compose.yaml to your chosen published versions, then run
`docker compose pull` and `docker compose up -d`. Check the logs, admin sign-in,
phone connection, playback and seeking again. Pulling a pinned tag does not
automatically choose a newer release.
