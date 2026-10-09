/**
 * Install snippets, true to the server's Dockerfile and the docs quickstart
 * (audiosilo-docs docs-users/getting-started/quickstart-docker.md, first-run.md).
 */
export const composeYaml = `services:
  audiosilo:
    image: ghcr.io/kodestar/audiosilo-server:latest
    restart: unless-stopped
    ports:
      - "8080:8080"
    volumes:
      - ./data:/data                  # database, config, certificates
      - /srv/audiobooks:/library:ro   # your books, mounted read-only
    environment:
      PUID: "1000"                    # owner of /data (Unraid: 99)
      PGID: "1000"                    # group of /data (Unraid: 100)
      # AUDIOSILO_PUBLIC_URL: "https://books.example.com"  # used in QR/invite links
      # AUDIOSILO_TLS_MODE: "off"     # only behind a TLS-terminating reverse proxy
      AUDIOSILO_WEB_DIR: /app/web`

export const composeRun = `docker compose up -d
docker compose logs     # the admin password and auth code, shown once`

export const dockerRun = `docker run -d --name audiosilo -p 8080:8080 \\
  -v "$PWD/data:/data" \\
  -v /srv/audiobooks:/library:ro \\
  ghcr.io/kodestar/audiosilo-server:latest

docker logs audiosilo   # the admin password and auth code, shown once`

export const binaryRun = `# Download the archive for your OS from GitHub Releases, then:
./audiosilo --data ./data

# Or set the admin password in a browser wizard instead:
./audiosilo --setup --data ./data`

/** The real first-run banner (first-run.md). Values are placeholders. */
export const firstRunBanner = `========================================================
 AudioSilo first-run setup - store these now, shown once
========================================================
  Admin username : admin
  Admin password : <generated password>
  Auth code      : <generated code>
  Config file    : /data/config.yaml`
