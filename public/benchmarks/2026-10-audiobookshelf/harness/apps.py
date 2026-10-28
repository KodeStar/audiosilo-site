"""App adapters: everything app-specific (container, first-run setup, scan trigger and
completion signal, the requests each app's own web client makes)."""
import json
import os
import re
import subprocess
import time
import urllib.error
import urllib.parse
import urllib.request

import hostctl

HOST_IP = os.environ.get("BENCH_HOST_IP", "192.168.0.10")
ABS_PORT = int(os.environ.get("BENCH_ABS_PORT", "13399"))
AS_PORT = int(os.environ.get("BENCH_AS_PORT", "8199"))
ABS_IMAGE = os.environ.get("BENCH_ABS_IMAGE", "ghcr.io/advplyr/audiobookshelf:latest")
AS_IMAGE = os.environ.get("BENCH_AS_IMAGE", "ghcr.io/kodestar/audiosilo-server:latest")
HERE = os.path.dirname(os.path.abspath(__file__))

# What a desktop Chrome sends for an <img>; both servers pick formats from it.
IMG_ACCEPT = "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
JSON_ACCEPT = "application/json, text/plain, */*"


def http(method, url, body=None, headers=None, timeout=60):
    data = json.dumps(body).encode() if body is not None else None
    h = {"Accept": JSON_ACCEPT, **(headers or {})}
    if data is not None:
        h["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=data, method=method, headers=h)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        raw = r.read()
        try:
            return r.status, json.loads(raw) if raw else None
        except json.JSONDecodeError:
            return r.status, raw.decode(errors="replace")


def library_facts():
    out = hostctl.sh(f"cd {hostctl.LIBRARY} && echo books $(find . -mindepth 2 -maxdepth 2 -type d | wc -l) && "
                     "echo mp3 $(find . -type f -iname '*.mp3' | wc -l) && echo m4b $(find . -type f -iname '*.m4b' | wc -l) && "
                     "echo jpg $(find . -type f -iname '*.jpg' | wc -l) && echo bytes $(du -sb . | cut -f1)")
    return {k: int(v) for k, v in (l.split() for l in out.strip().splitlines())}


def registry_size(image):
    """Compressed linux/amd64 size from the registry manifest (sum of layer sizes)."""
    ref = image.split("/", 1)[1]
    repo, _, tag = ref.partition("@") if "@" in ref else ref.rpartition(":")
    if "@" in ref:
        repo, tag = ref.split("@")
    tok = json.load(urllib.request.urlopen(f"https://ghcr.io/token?scope=repository:{repo}:pull"))["token"]
    acc = ("application/vnd.oci.image.index.v1+json,application/vnd.docker.distribution.manifest.list.v2+json,"
           "application/vnd.oci.image.manifest.v1+json,application/vnd.docker.distribution.manifest.v2+json")

    def get(r):
        q = urllib.request.Request(f"https://ghcr.io/v2/{repo}/manifests/{r}", headers={"Authorization": "Bearer " + tok, "Accept": acc})
        with urllib.request.urlopen(q) as f:
            return json.load(f), f.headers.get("Docker-Content-Digest")

    m, digest = get(tag)
    out = {"index_digest": digest}
    if "manifests" in m:
        for x in m["manifests"]:
            p = x.get("platform", {})
            if p.get("os") == "linux" and p.get("architecture") == "amd64":
                m, out["amd64_manifest_digest"] = get(x["digest"])[0], x["digest"]
                break
    out["compressed_bytes"] = sum(l["size"] for l in m["layers"])
    out["layers"] = len(m["layers"])
    return out


SEARCH_KEYS = ["book", "authors", "series", "narrators", "tags", "genres"]


class App:
    key = name = container = ""
    completion_signal = ""

    def __init__(self, args):
        self.args = args
        self.image_ref = None
        self.token = None
        self.lib_id = None
        self._pinned = None

    # ---- image ----
    def resolve_image(self):
        hostctl.pull(self.image)
        info = hostctl.image_info(self.image)
        digest = next((d for d in info["repo_digests"] if d.startswith(self.image.split(":")[0].split("@")[0])), info["repo_digests"][0])
        self._pinned = digest  # run by digest so every container in the run is the same build
        info["pinned"] = digest
        try:
            info["registry"] = registry_size(digest)
        except Exception as e:
            info["registry"] = {"error": repr(e)}
        info["version_label"] = info["labels"].get("org.opencontainers.image.version")
        info["revision_label"] = info["labels"].get("org.opencontainers.image.revision")
        return info

    def wait_ready(self, timeout=180):
        t0 = time.time()
        while time.time() - t0 < timeout:
            try:
                s, _ = http("GET", self.base + self.ready_path, timeout=5)
                if s == 200:
                    return time.time() - t0
            except Exception:
                pass
            time.sleep(0.2)
        raise RuntimeError(f"{self.name} not ready after {timeout}s")

    def get(self, path, **kw):
        return http("GET", self.base + path, headers=self.auth_headers(), **kw)[1]

    def after_restart(self):
        pass

    def admin_prepare(self):
        pass

    def reuse_existing(self):
        """Start the existing bench container on its existing data (debug runs)."""
        hostctl.sh(f"docker start {self.container} >/dev/null")
        self.wait_ready()
        if self.key == "as":
            self.password = re.search(r"Admin password : (\S+)", hostctl.logs(self.container)).group(1)
        self.refresh_auth()
        self.after_restart()

    def after_start_note(self):
        return None


# --------------------------------------------------------------------------- ABS
class ABS(App):
    key, name, container = "abs", "Audiobookshelf", "bench-abs"
    completion_signal = ("GET /api/libraries/:id lastScan changes (set when LibraryScanner finishes) and no "
                         "'library-scan' task left in GET /api/tasks; app-reported = log timestamps of "
                         "'[LibraryScanner] Starting ... library scan' -> 'Library scan ... completed in'")
    image = ABS_IMAGE
    BP = "/audiobookshelf"  # the web client's router base path (ROUTER_BASE_PATH default)
    ready_path = "/status"
    password = os.environ.get("BENCH_ABS_PASSWORD", "change-me")

    def __init__(self, args):
        super().__init__(args)
        self.base = f"http://{HOST_IP}:{ABS_PORT}"
        self.refresh_token = None
        self.user = None
        self.page_limit = None

    def start_fresh(self):
        self.lib_id = None
        d = hostctl.DATA + "/abs"
        hostctl.sh(f"mkdir -p {d}/config {d}/metadata")
        hostctl.run_container(self.container, self._pinned or self.image, [(ABS_PORT, 80)],
                              [(f"{d}/config", "/config"), (f"{d}/metadata", "/metadata"), (hostctl.LIBRARY, "/audiobooks:ro")])

    def first_run_setup(self):
        http("POST", self.base + "/init", {"newRoot": {"username": "root", "password": self.password}})
        self.refresh_auth(force=True)

    def refresh_auth(self, force=False):
        # Reuse a token under 40 min old (access tokens last 1 h; /login is rate limited).
        if not force and self.token and time.time() - getattr(self, "_token_at", 0) < 2400:
            try:
                self.get("/api/libraries")
                return
            except Exception:
                pass
        self._token_at = time.time()
        _, r = http("POST", self.base + "/login", {"username": "root", "password": self.password}, headers={"x-return-tokens": "true"})
        self.user = r["user"]
        self.token = r["user"]["accessToken"]
        self.refresh_token = r["user"].get("refreshToken")
        if self.lib_id is None:
            libs = self.get("/api/libraries")["libraries"]
            if libs:
                self.lib_id = libs[0]["id"]

    def auth_headers(self):
        return {"Authorization": f"Bearer {self.token}"}

    def version(self):
        return http("GET", self.base + "/status")[1].get("serverVersion")

    def create_library(self):
        # The web UI's "new library" modal body (defaults; it does not scan on create).
        _, lib = http("POST", self.base + "/api/libraries",
                      {"name": "LibriVox", "folders": [{"fullPath": "/audiobooks"}], "mediaType": "book",
                       "provider": "google", "icon": "database"}, headers=self.auth_headers())
        self.lib_id = lib["id"]

    def _last_scan(self):
        return self.get(f"/api/libraries/{self.lib_id}").get("lastScan")

    def trigger_initial_scan(self):
        return self.trigger_rescan()

    def trigger_rescan(self):
        before = self._last_scan()
        self._log_since = str(int(time.time()) - 5)  # unix seconds (docker logs --since)
        http("POST", self.base + f"/api/libraries/{self.lib_id}/scan?force=0", headers=self.auth_headers())
        return before

    def wait_scan(self, before, timeout):
        t0 = time.time()
        while time.time() - t0 < timeout:
            ls = self._last_scan()
            if ls and ls != before:
                tasks = self.get("/api/tasks")["tasks"]
                if not any(t.get("action") == "library-scan" for t in tasks):
                    break
            time.sleep(0.25)
        else:
            raise RuntimeError("ABS scan timeout")
        done_at = time.time()  # the clock stops here, before the log is read over SSH
        lines = hostctl.logs(self.container, since=self._log_since)
        start = re.findall(r"\[(\d{4}-\d\d-\d\d \d\d:\d\d:\d\d\.\d+)\] INFO: \[LibraryScanner\] Starting(?: \(forced\))? library scan", lines)
        end = re.findall(r"\[(\d{4}-\d\d-\d\d \d\d:\d\d:\d\d\.\d+)\] INFO: \[LibraryScanner\] Library scan \"[^\"]+\" completed in ([^ ]+) \| (.*)", lines)
        res = {"forced": "Starting (forced)" in lines, "done_at": done_at}
        if start and end:
            ts = lambda s: time.mktime(time.strptime(s[:19], "%Y-%m-%d %H:%M:%S")) + float("0." + s[20:])
            res["app_reported_s"] = round(ts(end[-1][0]) - ts(start[-1]), 3)
            res["abs_elapsed"] = end[-1][1]
            res["abs_result"] = end[-1][2].strip()
        return res

    def scan_log_excerpt(self):
        return [l for l in hostctl.logs(self.container, since=getattr(self, "_log_since", None)).splitlines()
                if "LibraryScanner" in l or "Scan complete" in l or "ERROR" in l or "WARN" in l][-40:]

    def items(self):
        return self.get(f"/api/libraries/{self.lib_id}/items?minified=1")["results"]

    def item_count(self):
        return self.get(f"/api/libraries/{self.lib_id}/items?limit=1&page=0&minified=1")["total"]

    def item_list(self):
        return sorted(i["relPath"] for i in self.items())

    def startup_probe_cmd(self):
        return (f"curl -sf -H 'Authorization: Bearer {self.token}' "
                f"'http://127.0.0.1:{ABS_PORT}{self.BP}/api/libraries/{self.lib_id}/items?sort=media.metadata.title&desc=0&limit=36&page=0&minified=1&include=rssfeed,numEpisodesIncomplete,share'")

    def startup_probe_describe(self):
        return f"GET {self.BP}/api/libraries/:id/items (bookshelf page 0, Bearer access token) returns 200"

    # ---- requests the ABS web client makes ----
    def latency_spec(self, picks, probe):
        bp, L = self.BP, self.lib_id
        J = {"Authorization": f"Bearer {self.token}", "Accept": JSON_ACCEPT}
        limit = probe.get("abs_page_limit") or 36
        self.page_limit = limit
        total = self.item_count()
        deep_page = max(0, (total // 2) // limit)
        inc = "include=rssfeed,numEpisodesIncomplete,share"
        q = lambda s: urllib.parse.quote(s)
        mp3, m4b = picks["mp3"], picks["m4b"]
        play_body = {"deviceInfo": {"clientName": "Abs Web", "deviceId": "bench-device-0001"},
                     "supportedMimeTypes": ["audio/flac", "audio/mpeg", "audio/mp4", "audio/ogg", "audio/aac", "audio/webm"],
                     "mediaPlayer": "html5", "forceTranscode": False, "forceDirectPlay": False}

        def play(item):
            return [{"method": "POST", "path": f"{bp}/api/items/{item['abs_id']}/play", "headers": J, "body": play_body,
                     "extract": {"sid": "id", "track": "audioTracks.0.index"}, "count": ["audioTracks", "chapters"]},
                    {"path": bp + "/public/session/{sid}/track/{track}", "headers": {"Range": "bytes=0-"}, "mode": "first_byte"}]

        def cover(item):
            return {"path": f"{bp}/api/items/{item['abs_id']}/cover?ts={item['abs_updated']}", "headers": {"Accept": IMG_ACCEPT}}

        reqs = [
            {"name": "home_shelves", "group": "home", "primary": True, "path": f"{bp}/api/libraries/{L}/personalized?{inc}", "headers": J,
             "count": ["[]", "[].entities"]},
            {"name": "home_library_filterdata", "group": "home", "path": f"{bp}/api/libraries/{L}?include=filterdata", "headers": J},
            {"name": "libraries", "group": "app", "path": f"{bp}/api/libraries", "headers": J, "count": ["libraries"]},
            {"name": "library_page1", "group": "library", "primary": True,
             "path": f"{bp}/api/libraries/{L}/items?sort=media.metadata.title&desc=0&limit={limit}&page=0&minified=1&{inc}", "headers": J,
             "count": ["results", "total"]},
            {"name": "library_deep_page", "group": "library", "primary": True,
             "path": f"{bp}/api/libraries/{L}/items?sort=media.metadata.title&desc=0&limit={limit}&page={deep_page}&minified=1&{inc}", "headers": J,
             "count": ["results", "total"]},
            {"name": "search_the", "group": "search", "primary": True, "path": f"{bp}/api/libraries/{L}/search?q=the", "headers": J, "count": SEARCH_KEYS,
             "describe": f"GET {bp}/api/libraries/:id/search?q=the (search results page; server default limit 12)"},
            {"name": "search_the_typeahead", "group": "search", "path": f"{bp}/api/libraries/{L}/search?q=the&limit=3", "headers": J, "count": SEARCH_KEYS},
            {"name": "search_dickens", "group": "search", "primary": True, "path": f"{bp}/api/libraries/{L}/search?q=dickens", "headers": J, "count": SEARCH_KEYS,
             "describe": f"GET {bp}/api/libraries/:id/search?q=dickens (ABS matches book titles, not authors: the answer is the author entry, 'Charles Dickens', with its book count)"},
            {"name": "search_title", "group": "search", "primary": True, "path": f"{bp}/api/libraries/{L}/search?q=bleak%20house", "headers": J, "count": SEARCH_KEYS},
            {"name": "search_dickens_then_author_page", "group": "search", "primary": True,
             "steps": [{"path": f"{bp}/api/libraries/{L}/search?q=dickens", "headers": J, "extract": {"aid": "authors.0.id"}},
                       {"path": bp + "/api/authors/{aid}?include=items,series", "headers": J, "count": ["libraryItems"]}],
             "describe": f"search?q=dickens, then the author page the result opens: GET {bp}/api/authors/:id?include=items,series (sequential sum; this is where ABS lists the author's books)"},
            {"name": "search_dickens_typeahead", "group": "search", "path": f"{bp}/api/libraries/{L}/search?q=dickens&limit=3", "headers": J, "count": SEARCH_KEYS},
            {"name": "detail_mp3", "group": "detail", "primary": True, "path": f"{bp}/api/items/{mp3['abs_id']}?expanded=1&include=downloads,rssfeed,share", "headers": J,
             "count": ["media.audioFiles", "media.chapters"]},
            {"name": "detail_m4b", "group": "detail", "primary": True, "path": f"{bp}/api/items/{m4b['abs_id']}?expanded=1&include=downloads,rssfeed,share", "headers": J,
             "count": ["media.audioFiles", "media.chapters"]},
            {"name": "play_first_byte_mp3", "group": "play", "primary": True, "steps": play(mp3),
             "describe": f"POST {bp}/api/items/:id/play (direct play) then GET {bp}/public/session/:sid/track/:index Range: bytes=0- (first body byte)"},
            {"name": "play_first_byte_m4b", "group": "play", "primary": True, "steps": play(m4b), "describe": "as play_first_byte_mp3, M4B book"},
            {"name": "cover_grid", "group": "cover", "primary": True, **cover(mp3),
             "describe": f"GET {bp}/api/items/:id/cover?ts=<updatedAt> (no auth; server sends 400px webp)"},
        ]
        for r in reqs:
            r.setdefault("describe", f'{r.get("method", "GET")} {r.get("path")}'.replace(self.token, "<token>"))
        cold = [dict(cover(b), name=f"cover_cold_{i}") for i, b in enumerate(picks["cold_covers"])]
        return {"base": self.base, "requests": reqs, "cold_covers": cold, "deep_page": deep_page, "page_limit": limit, "total": total,
                "concurrency": dict(next(r for r in reqs if r["name"] == "library_page1"), name="library_page1_concurrent")}

    def resolve(self, picks):
        """Add ABS item ids / updatedAt to the picked books."""
        items = {i["relPath"]: i for i in self.items()}
        out = {}
        for k in ("mp3", "m4b"):
            it = items[picks[k]["path"]]
            out[k] = dict(picks[k], abs_id=it["id"], abs_updated=it["updatedAt"], abs_tracks=it["media"].get("numTracks"))
        out["cold_covers"] = [dict(c, abs_id=items[c["path"]]["id"], abs_updated=items[c["path"]]["updatedAt"])
                              for c in picks["cold_covers"] if c["path"] in items]
        return out

    def web_session(self, origin_note=None):
        return {"app": "abs", "base": self.base,
                "pages": {"home": f"{self.BP}/library/{self.lib_id}", "grid": f"{self.BP}/library/{self.lib_id}/bookshelf"},
                "localStorage": {"token": self.token},
                "cookies": [{"name": "refresh_token", "value": self.refresh_token or "", "url": self.base}],
                "coverSelector": 'img[cy-id="coverImage"]', "gridItemsPattern": "/items?", "coverPattern": "/cover"}



    # Nearest ABS equivalent of a "library health" page: the bookshelf filtered to
    # "issues" (items ABS marked missing or invalid; the sidebar links it only when
    # there are any). ABS has no system-status page; its settings pages do not
    # check dependencies, so "system" is n/a.
    def admin_session(self):
        s = self.web_session()
        return dict(s, pages={"issues": f"{self.BP}/library/{self.lib_id}/bookshelf?filter=issues"},
                    readyText={"issues": "No Issues|[1-9][\\d,]* Books?"})

    def admin_spec(self):
        J = {"Authorization": f"Bearer {self.token}", "Accept": JSON_ACCEPT}
        return {"base": self.base, "requests": [
            {"name": "admin_issues", "group": "admin", "primary": True,
             "path": f"{self.BP}/api/libraries/{self.lib_id}/items?sort=media.metadata.title&desc=0&filter=issues&limit=36&page=0&minified=1",
             "headers": J, "count": ["results", "total"],
             "describe": "GET items?filter=issues (the bookshelf's issues filter: items missing or invalid on disk)"},
        ]}

# --------------------------------------------------------------------- AudioSilo
class AS(App):
    key, name, container = "as", "AudioSilo", "bench-as"
    completion_signal = ("GET /api/v1/admin/scan-runs: the new run has finished_at and a final status; "
                         "app-reported = finished_at - started_at of that run (server clock)")
    image = AS_IMAGE
    ready_path = "/healthz"
    CLIENT = "AudioSilo/2.4.1 (web)"

    def __init__(self, args):
        super().__init__(args)
        self.base = f"http://{HOST_IP}:{AS_PORT}"
        self.password = None
        self.session = None
        self.server_id = None

    def start_fresh(self):
        self.lib_id = None
        env = {"AUDIOSILO_TLS_MODE": "off"}
        if getattr(self.args, "as_metadata", "default") == "off":
            env["AUDIOSILO_METADATA_ENABLED"] = "false"
        hostctl.run_container(self.container, self._pinned or self.image, [(AS_PORT, 8080)],
                              [(hostctl.DATA + "/as", "/data"), (hostctl.LIBRARY, "/audiobooks:ro")], env=env)

    def first_run_setup(self):
        # Headless first run: the server creates `admin` and prints a one-time
        # password in its log (pkg/launcher ensureAdmin); we read it from our own
        # container's log.
        for _ in range(50):
            m = re.search(r"Admin password : (\S+)", hostctl.logs(self.container))
            if m:
                self.password = m.group(1)
                break
            time.sleep(0.2)
        self.refresh_auth(force=True)

    def refresh_auth(self, force=False):
        # Sessions survive restarts; only sign in again when the token stops working
        # (sign-in is limited to 10 per 15 min per IP).
        if not force and self.token:
            try:
                self.get("/api/v1/me")
                return
            except Exception:
                pass
        _, r = http("POST", self.base + "/api/v1/auth/login",
                    {"username": "admin", "password": self.password, "device_name": "Web browser"},
                    headers={"X-AudioSilo-Client": self.CLIENT})
        self.session = r
        self.token = r["token"]
        self.server_id = r["server_id"]
        if self.lib_id is None:
            libs = self.get("/api/v1/libraries")
            libs = libs.get("libraries", libs) if isinstance(libs, dict) else libs
            if libs:
                self.lib_id = libs[0]["id"]

    def auth_headers(self):
        return {"Authorization": f"Bearer {self.token}", "X-AudioSilo-Client": self.CLIENT}

    def version(self):
        return http("GET", self.base + "/api/v1/server")[1].get("version")

    def _runs(self):
        return self.get("/api/v1/admin/scan-runs")["runs"]

    def create_library(self):
        # Nothing to do yet: creating the library is what starts its first scan, so
        # the create call is made by trigger_initial_scan (inside the timed window).
        self._prev_run = max([r["id"] for r in self._runs()] or [0])

    def trigger_initial_scan(self):
        # Creating a library queues its first scan (handleCreateLibrary -> startScan):
        # the create call IS the trigger, as in the console's setup flow.
        _, lib = http("POST", self.base + "/api/v1/admin/libraries", {"name": "LibriVox", "root": "/audiobooks"},
                      headers=self.auth_headers())
        self.lib_id = lib["id"]
        return self._prev_run

    def trigger_rescan(self):
        prev = max([r["id"] for r in self._runs()] or [0])
        http("POST", self.base + f"/api/v1/admin/libraries/{self.lib_id}/scan", headers=self.auth_headers())
        return prev

    def wait_scan(self, prev, timeout):
        t0 = time.time()
        while time.time() - t0 < timeout:
            runs = [r for r in self._runs() if r["id"] > prev and r["library_id"] == self.lib_id]
            if runs and all(r.get("finished_at") for r in runs):
                break
            time.sleep(0.25)
        else:
            raise RuntimeError("AudioSilo scan timeout")
        done_at = time.time()
        r = max(runs, key=lambda x: x["id"])
        self._last_run = r

        def ts(s):
            base, frac = (s.rstrip("Z").split(".") + ["0"])[:2]
            return time.mktime(time.strptime(base, "%Y-%m-%dT%H:%M:%S")) + float("0." + frac)

        return {"app_reported_s": round(ts(r["finished_at"]) - ts(r["started_at"]), 3), "run": r, "done_at": done_at}

    def scan_log_excerpt(self):
        return [l for l in hostctl.logs(self.container, tail=400).splitlines()
                if "scan" in l or "level=WARN" in l or "level=ERROR" in l][-40:]

    def books(self):
        out, cur = [], None
        while True:
            q = f"/api/v1/libraries/{self.lib_id}/books?sort=recent&limit=200" + (f"&cursor={urllib.parse.quote(cur)}" if cur else "")
            page = self.get(q)
            out.extend(page["books"])
            cur = page.get("next_cursor")
            if not cur:
                return out

    def item_count(self):
        return len(self.books())

    def item_list(self):
        return sorted(b["rel_path"] for b in self.books())

    def startup_probe_cmd(self):
        return (f"curl -sf -H 'Authorization: Bearer {self.token}' "
                f"'http://127.0.0.1:{AS_PORT}/api/v1/libraries/{self.lib_id}/books?sort=recent&limit=200'")

    def startup_probe_describe(self):
        return "GET /api/v1/libraries/:id/books?sort=recent&limit=200 (library grid page 1, Bearer session token) returns 200"

    def after_restart(self):
        # Every AudioSilo start queues a no-change scan of each library
        # (launcher: scanner.EnqueueAll(TriggerStartup)); wait for it so the next
        # measurement starts idle, and record how long it took.
        self.refresh_auth()
        t0 = time.time()
        while time.time() - t0 < 6 * 3600:
            runs = self._runs()
            if runs and runs[0].get("trigger") == "startup" and runs[0].get("finished_at"):
                self._startup_run = runs[0]
                return
            if runs and runs[0].get("trigger") != "startup" and time.time() - t0 > 20:
                self._startup_run = None
                return
            time.sleep(0.5)

    def after_start_note(self):
        r = getattr(self, "_startup_run", None)
        return {"startup_rescan_run": r} if r else None

    # ---- requests the AudioSilo web player makes ----
    def latency_spec(self, picks, probe):
        L = self.lib_id
        J = {"Authorization": f"Bearer {self.token}", "X-AudioSilo-Client": self.CLIENT, "Accept": JSON_ACCEPT}
        q = lambda s: urllib.parse.quote_plus(s, safe="")
        # cursors as the grid walks them (limit 200, sort=recent)
        pages, cur = [], None
        while True:
            path = f"/api/v1/libraries/{L}/books?sort=recent&limit=200" + (f"&cursor={q(cur)}" if cur else "")
            pages.append(path)
            cur = self.get(path).get("next_cursor")
            if not cur:
                break
        total = self.item_count()
        deep = pages[min(len(pages) - 1, (total // 2) // 200)]
        mp3, m4b = picks["mp3"], picks["m4b"]

        def play(item):
            return [{"path": f"/api/v1/libraries/{L}/progress?path={q(item['path'])}", "headers": J},
                    {"path": f"/api/v1/libraries/{L}/stream?path={q(item['as_first_file'])}&token={self.token}",
                     "headers": {"Range": "bytes=0-"}, "mode": "first_byte"}]

        def cover(item):
            return {"path": f"/api/v1/libraries/{L}/cover?path={q(item['path'])}&size=320&v={item['as_cover_version']}&token={self.token}",
                    "headers": {"Accept": IMG_ACCEPT}}

        reqs = [
            {"name": "home_shelves", "group": "home", "primary": True, "path": "/api/v1/books/recent?limit=48", "headers": J, "count": ["books"],
             "describe": "GET /api/v1/books/recent?limit=48 (the Recently added shelf; the home screen also fires the requests below in parallel)"},
            {"name": "home_progress", "group": "home", "path": "/api/v1/me/progress", "headers": J},
            {"name": "home_stats", "group": "home", "path": "/api/v1/me/stats?range=30d", "headers": J},
            {"name": "home_listening", "group": "home", "path": "/api/v1/me/listening?range=1y", "headers": J},
            {"name": "home_favourites", "group": "home", "path": "/api/v1/me/favourites", "headers": J},
            {"name": "libraries", "group": "app", "path": "/api/v1/libraries", "headers": J, "count": ["libraries"]},
            {"name": "server_info", "group": "app", "path": "/api/v1/server", "headers": J},
            {"name": "library_page1", "group": "library", "primary": True, "path": pages[0], "headers": J, "count": ["books"]},
            {"name": "library_deep_page", "group": "library", "primary": True, "path": deep, "headers": J, "count": ["books"],
             "describe": f"GET /api/v1/libraries/:id/books?sort=recent&limit=200&cursor=<cursor of page {pages.index(deep)}> (keyset pagination)"},
            {"name": "library_all_pages", "group": "library", "steps": [{"path": p, "headers": J, "count": ["books"]} for p in pages],
             "describe": f"the grid's full load: {len(pages)} sequential cursor pages of 200 (the web player loads the whole library and sorts in the browser)"},
            {"name": "search_the", "group": "search", "primary": True, "path": "/api/v1/search?q=the&limit=50", "headers": J, "count": ["books"]},
            {"name": "search_dickens", "group": "search", "primary": True, "path": "/api/v1/search?q=dickens&limit=50", "headers": J, "count": ["books"],
             "describe": "GET /api/v1/search?q=dickens&limit=50 (full-text over title, author, narrator, series: the answer is the author's books)"},
            {"name": "search_title", "group": "search", "primary": True, "path": "/api/v1/search?q=bleak+house&limit=50", "headers": J, "count": ["books"]},
            {"name": "detail_mp3", "group": "detail", "primary": True, "path": f"/api/v1/libraries/{L}/item?path={q(mp3['path'])}", "headers": J,
             "count": ["files", "chapters"],
             "describe": "GET /api/v1/libraries/:id/item?path=<book> (the book page fires /chapters, /progress, /bookmarks, /notes, /rating alongside)"},
            {"name": "detail_mp3_chapters", "group": "detail", "path": f"/api/v1/libraries/{L}/chapters?path={q(mp3['path'])}", "headers": J, "count": ["files", "chapters"]},
            {"name": "detail_m4b", "group": "detail", "primary": True, "path": f"/api/v1/libraries/{L}/item?path={q(m4b['path'])}", "headers": J, "count": ["files", "chapters"]},
            {"name": "detail_m4b_chapters", "group": "detail", "path": f"/api/v1/libraries/{L}/chapters?path={q(m4b['path'])}", "headers": J, "count": ["files", "chapters"]},
            {"name": "play_first_byte_mp3", "group": "play", "primary": True, "steps": play(mp3),
             "describe": "GET /api/v1/libraries/:id/progress?path=<book> then GET /api/v1/libraries/:id/stream?path=<first file>&token= Range: bytes=0- (first body byte)"},
            {"name": "play_first_byte_m4b", "group": "play", "primary": True, "steps": play(m4b), "describe": "as play_first_byte_mp3, M4B book"},
            {"name": "cover_grid", "group": "cover", "primary": True, **cover(mp3),
             "describe": "GET /api/v1/libraries/:id/cover?path=<book>&size=320&v=<cover_version>&token=<token> (grid tile at DPR 1)"},
        ]
        for r in reqs:
            r.setdefault("describe", f'{r.get("method", "GET")} {r.get("path")}')
            r["describe"] = r["describe"].replace(self.token, "<token>")
        cold = [dict(cover(b), name=f"cover_cold_{i}") for i, b in enumerate(picks["cold_covers"])]
        return {"base": self.base, "requests": reqs, "cold_covers": cold, "pages": len(pages), "page_limit": 200, "total": total,
                "concurrency": dict(next(r for r in reqs if r["name"] == "library_page1"), name="library_page1_concurrent")}

    def resolve(self, picks):
        """Add cover_version and the first audio file (what the player streams first)."""
        books = {b["rel_path"]: b for b in self.books()}
        out = {}
        for k in ("mp3", "m4b"):
            p = picks[k]["path"]
            ch = self.get(f"/api/v1/libraries/{self.lib_id}/chapters?path={urllib.parse.quote(p, safe='')}")
            out[k] = dict(picks[k], as_cover_version=books[p].get("cover_version") or "",
                          as_first_file=sorted(ch["files"], key=lambda f: f["seq"])[0]["rel_path"])
        out["cold_covers"] = [dict(c, as_cover_version=books[c["path"]].get("cover_version") or "")
                              for c in picks["cold_covers"] if c["path"] in books]
        return out

    # The admin console's Health section (v2.4.1): Issues (the default tab) and System.
    def admin_prepare(self):
        # A finished first-run setup (else the console sends the admin to /admin/setup).
        http("PUT", self.base + "/api/v1/admin/setup", {"finished": True}, headers=self.auth_headers())

    def admin_session(self):
        return {"app": "as", "base": self.base, "localStorage": {"audiosilo_token": self.token}, "cookies": [],
                "pages": {"issues": "/admin/health", "system": "/admin/health/system"},
                "readyText": {"issues": "could be better|All clear", "system": "AudioSilo version"}}

    def admin_spec(self):
        J = {"Authorization": f"Bearer {self.token}", "X-AudioSilo-Client": "AudioSilo admin", "Accept": JSON_ACCEPT}
        return {"base": self.base, "requests": [
            {"name": "admin_issues", "group": "admin", "primary": True, "path": "/api/v1/admin/issues", "headers": J,
             "count": ["categories", "categories.[].count"],
             "describe": "GET /api/v1/admin/issues (every issue category with its count and sample covers)"},
            {"name": "admin_issue_books", "group": "admin", "path": "/api/v1/admin/books?issue=scan_error&sort=added&order=desc&limit=50",
             "headers": J, "count": ["books"], "describe": "GET /api/v1/admin/books?issue=scan_error... (the open category's queue)"},
            {"name": "admin_system", "group": "admin", "primary": True, "path": "/api/v1/admin/system", "headers": J,
             "describe": "GET /api/v1/admin/system (ffmpeg, ffprobe, community metadata reachability, TLS, database, backups, library folders)"},
        ]}

    def web_session(self):
        user = self.session["user"]
        cid = f"{self.server_id}.{user['id']}"
        conn = {"id": cid, "serverId": self.server_id, "serverUrl": self.base, "name": "AudioSilo", "user": user}
        if self.session.get("addresses"):
            conn["addresses"] = self.session["addresses"]
        ls = {"audiosilo.storageVersion": "2", "audiosilo.cacheVersion": "1", "audiosilo.identityVersion": "2",
              "audiosilo.connections": json.dumps([conn]), "audiosilo.activeConnection": json.dumps(cid),
              f"audiosilo.token.{cid}": self.token,
              "audiosilo.librarySelection": json.dumps({"selection": {"connectionId": cid, "libraryId": self.lib_id}})}
        return {"app": "as", "base": self.base, "pages": {"home": "/web/", "grid": "/web/library"},
                "localStorage": ls, "cookies": [], "coverSelector": 'img[src*="/cover?"]',
                "gridItemsPattern": "/books?", "coverPattern": "/cover?"}


def make(key, args):
    return {"abs": ABS, "as": AS}[key](args)


def pick_books_fs(n_cold=30):
    """Pick the benchmark's books from the library on disk (so both apps get the same
    ones, matched by folder path): an MP3 multi-file book (track count closest to
    20), an M4B book (the middle one), and n_cold books from the second half of the
    sorted folder list for first-request (uncached) cover timings."""
    out = hostctl.sh(f"cd {hostctl.LIBRARY} && for d in */*/; do d=${{d%/}}; "
                     "echo \"$(ls \"$d\" | grep -ci '\\.mp3$') $(ls \"$d\" | grep -ci '\\.m4b$') $d\"; done")
    rows = []
    for l in out.strip().splitlines():
        a, b, path = l.split(" ", 2)
        rows.append((path, int(a), int(b)))
    rows.sort()
    mp3s = [r for r in rows if r[1] >= 5 and r[2] == 0]
    m4bs = [r for r in rows if r[2] == 1 and r[1] == 0]
    if not mp3s or not m4bs:
        raise RuntimeError("need at least one multi-file MP3 book and one M4B book")
    mp3 = min(mp3s, key=lambda r: (abs(r[1] - 20), r[0]))
    m4b = m4bs[len(m4bs) // 2]
    rest = [r[0] for r in rows[len(rows) // 2:] if r[0] not in (mp3[0], m4b[0])][:n_cold]
    return {"mp3": {"path": mp3[0], "files": mp3[1]}, "m4b": {"path": m4b[0], "files": 1}, "cold_covers": [{"path": p} for p in rest]}
