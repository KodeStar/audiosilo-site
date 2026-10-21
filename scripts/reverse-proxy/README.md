# Reverse proxy guide verification and screenshots

This runs the downloadable blog recipes from `public/downloads/reverse-proxy`
against real Docker containers. It uses the pinned, published LinuxServer
AudioSilo image, not a locally modified server. Each proxy runs sequentially on
its own disposable Compose project (`asproxy-caddy`, `asproxy-swag`,
`asproxy-traefik`). Only those named projects and this tool's `.cache` are managed.

## Run

Requirements: Docker with Compose **2.24.4+** (the lab uses `!override` to replace
ports), Python 3, OpenSSL, ffmpeg, and Node **24**. For screenshots, install
[ttyd](https://github.com/tsl0922/ttyd) and zsh on the host (`brew install ttyd` on macOS).
The regular recipes do not require ttyd, Python, ffmpeg on the host, or Node.

```sh
cd scripts/reverse-proxy
npm ci
npx playwright install chromium
python3 verify.py caddy swag traefik --capture
```

Run the runner's focused lifecycle regressions without Docker with
`python3 -m unittest discover -s scripts/reverse-proxy -p 'test_*.py'` from the
site root. The same checks also run with `python3 -O`.

Without `--capture`, only the API/media/container checks run and screenshots are
left alone. Pass one proxy to iterate on it. `--keep` leaves only the final
requested stack running for inspection; earlier stacks are stopped before the
next proxy starts. Stop the retained stack using its matching files:

```sh
docker compose -p asproxy-caddy \
  -f .cache/caddy/compose.yaml -f .cache/caddy/test.override.yaml down -v
```

The tool writes a generated 20-second AAC test audiobook, private local CA keys,
and disposable credentials under ignored `.cache/`. It does not read the owner's
library, change DNS, install certificates into a trust store, or touch existing
services. Local listeners are **127.0.0.1:28080**, **127.0.0.1:28443**, and (during
capture only) a randomly assigned **127.0.0.1** port for ttyd. Ports 28080 and
28443 must be available. The lab also needs the recipes' default
`172.30.90.0/24` subnet to be unused.

## What runs

- Parse the actual published Compose files, then start the real pinned images.
- Verify the HTTPS certificate chain and hostname against the generated local CA.
- Check the connect page, admin UI, player, API and health endpoint; reject
  unexpected redirects and check HTTP redirects to HTTPS.
- Sign in using the real first-run admin password (never included in results).
- Verify TLS Off, Public address, trusted proxy `/32`, environment precedence and
  locked settings. Confirm AudioSilo has no host port binding.
- With `--capture`, drive the actual browser login, settings, add-library form,
  invite redemption and web-player pairing. Start real audio, observe its clock
  advancing, seek, and observe playback continue. No network responses are mocked.
- Browse the read-only mounted library and request an actual audio byte range,
  requiring HTTP 206, Content-Range and exactly the requested bytes.
- Create/redeem/exchange an invite through the proxy and use the resulting session.
- Send a forged X-Forwarded-For header and check that it does not become the
  signed-in device's recorded IP.
- Restart AudioSilo and check settings, library and sessions persist.
- Run Caddy/nginx configuration validation where applicable.

Success writes `<proxy>-results.json` here with the source-file hashes, container
image IDs and each passed check. Keep those files with the corresponding guide
change. A requested rerun removes that proxy's old report before setup and writes
a replacement only after all checks and required teardown succeed. A failing run
exits nonzero and leaves no success report for the failed or unattempted requested
proxies. Reports for proxies not requested are left alone.

## Local TLS changes and limits

The public files use ports 80/443 and public certificate issuance. The lab copies
them into `.cache` and changes only its test environment:

- Host ports become 28080/28443; Public address includes `:28443`.
- Caddy loads the generated certificate with `tls` instead of public ACME.
- Traefik keeps its real file-provider router/upstream but loads that certificate;
  its public certificate resolver is removed in the lab.
- SWAG's normal initialization receives an existing certificate under
  `/config/etc/letsencrypt/live/books.example.com`, so it uses its real nginx configuration/includes
  without calling a public ACME server.
- Metadata lookups and update checks are disabled to keep this fixture isolated.

This proves routing, app setup and media transport through each actual proxy. It
does **not** verify public DNS, router forwarding, Let's Encrypt issuance/renewal,
or a native phone's camera, app and internet connection. Every guide says so and
includes the user's external checks. A locally trusted lab certificate is never
described as a publicly trusted certificate.

## Capture output

`capture.mjs` uses Playwright and sharp to save eight real WebP captures per proxy
in `src/assets/stills/reverse-proxy`. The terminal images come from a real ttyd
session running `cat .env`, Compose service listing and `docker compose ps`.
Its DOM renderer and explicit terminal size avoid blank WebGL captures.

The browser captures the published image's actual UI. Pairing codes belong only
to the disposable test installation: a later invite supersedes the captured
invite, and normal teardown stops that installation. No first-run password,
bearer token, credential log, or real account appears in a published image.

Images are rendered responsively by the blog's existing Device component, with
an explicit full-size link for reading settings on small screens. Fix capture
state or selectors and rerun; never fabricate a screenshot or edit a UI capture.
