#!/usr/bin/env python3
"""results/<tier>/ -> results/<tier>/summary.md (every metric, both apps, no winners
picked: lower is better for every time, memory and size figure)."""
import glob
import json
import os
import statistics
import sys

APPS = [("abs", "Audiobookshelf"), ("as", "AudioSilo")]


def load(p):
    try:
        with open(p) as f:
            return json.load(f)
    except FileNotFoundError:
        return None


def mib(b):
    return "-" if b is None else f"{b / 2**20:.1f} MiB"


def num(x, unit="", nd=2):
    if x is None:
        return "-"
    if isinstance(x, float):
        x = round(x, nd)
    return f"{x}{unit}"


def med(xs):
    xs = [x for x in xs if x is not None]
    return statistics.median(xs) if xs else None


def spread(xs, unit=" s"):
    xs = [x for x in xs if x is not None]
    if not xs:
        return "-"
    if len(xs) == 1:
        return f"{xs[0]:.2f}{unit}"
    return f"{statistics.median(xs):.2f}{unit} ({min(xs):.2f}-{max(xs):.2f})"


def main(root):
    meta = load(f"{root}/meta.json")
    L = []
    w = L.append
    lib = meta.get("library", {})
    w(f"# ABS vs AudioSilo benchmark: {meta['tier']}\n")
    w(f"Run {meta.get('started')} to {meta.get('finished', '(unfinished)')}, total {num(meta.get('elapsed_s'), ' s', 0)}. "
      f"Library `{meta.get('library_path')}` at start: {lib.get('books')} book folders, {lib.get('mp3')} MP3 + {lib.get('m4b')} M4B files, "
      f"{lib.get('bytes', 0) / 2**30:.2f} GiB; at end: {meta.get('library_at_end', {}).get('books')} folders.\n")
    h = meta["host"]
    w(f"Host: {h['cpu_model']}, {h['cpus']} CPUs, {h['memtotal']} RAM, kernel {h['kernel']}, Docker {h['docker']}. "
      f"Load average at start {meta['load_at_start']['load1']}/{meta['load_at_start']['load5']}/{meta['load_at_start']['load15']}, "
      f"at end {meta.get('load_at_end', {}).get('load1')}. Other containers running on the host (idle, untouched): "
      f"{len(meta.get('other_running_containers', []))}.\n")
    if meta.get("library_changing"):
        w("**WARNING: the library changed during the pre-run check, so the two apps did not scan the same set of books. "
          "Compare the 'Books found' row before reading anything else.**\n")
    for k, n in APPS:
        m = meta["apps"].get(k, {})
        if m.get("library_before"):
            w(f"- Library on disk during the {n} run: {m['library_before'].get('books')} folders before, "
              f"{(m.get('library_after') or {}).get('books')} after.")
    w("")
    a = meta["args"]
    ph = a.get("phases", "scan,rescan,startup,latency,web")
    if "scan" not in ph.split(","):
        w(f"**Phases run here: {ph} only**, on the bench data the tier's main run left behind (same library, "
          "already scanned). Every table below that belongs to a phase not run is empty.\n")
    w(f"Settings ({ph}): initial scans x{a['initial']} (fresh data each), no-change rescans x{a['rescan']} cold + x{a['rescan']} warm, "
      f"cold starts x{a['startup']}, API {a['latency_warmup']} warm-up + {a['latency_n']} timed requests each, "
      f"concurrency {a['conc_clients']} clients x {a['conc_seconds']} s, web UI {a['web_runs']} runs per page and cache state. "
      f"AudioSilo metadata setting: {a['as_metadata']}.\n")

    D = {k: {} for k, _ in APPS}
    for k, _ in APPS:
        d = f"{root}/{k}"
        D[k]["init"] = [load(p) for p in sorted(glob.glob(f"{d}/scan_initial_*.json"))]
        D[k]["rescan"] = load(f"{d}/scan_rescan.json")
        D[k]["startup"] = load(f"{d}/startup.json")
        D[k]["lat"] = load(f"{d}/latency_mac.json")
        D[k]["lat_host"] = load(f"{d}/latency_host.json")
        D[k]["cold_cov"] = load(f"{d}/latency_cold_covers.json")
        D[k]["web"] = load(f"{d}/webui.json")
        D[k]["items"] = load(f"{d}/items.json")
        D[k]["spec"] = load(f"{d}/latency_spec.json")
        D[k]["final"] = load(f"{d}/final_memory.json")
        D[k]["admin_web"] = load(f"{d}/admin_web.json")
        D[k]["admin_lat"] = load(f"{d}/admin_latency.json")
        D[k]["admin_spec"] = load(f"{d}/admin_spec.json")

    def row(label, f):
        w(f"| {label} | " + " | ".join(f(D[k], meta["apps"].get(k, {})) for k, _ in APPS) + " |")

    hdr = "| | " + " | ".join(n for _, n in APPS) + " |\n|---|" + "---|" * len(APPS)

    w("## Images\n")
    w(hdr)
    row("Version", lambda d, m: str(m.get("version") or m.get("image", {}).get("version_label")))
    row("Image (pinned digest)", lambda d, m: f"`{m.get('image', {}).get('pinned', '-')}`")
    row("Compressed size (registry, linux/amd64)", lambda d, m: mib(m.get("image", {}).get("registry", {}).get("compressed_bytes")))
    row("Uncompressed size (docker image inspect)", lambda d, m: mib(m.get("image", {}).get("uncompressed_bytes")))
    w("")

    w("## Memory, CPU and disk\n")
    w("`docker` = docker stats MEM USAGE (cgroup memory.current minus inactive_file). `anon` = cgroup anonymous memory "
      "(the process heap, no page cache). `RSS` = summed VmRSS of the container's processes. Peak during scan is sampled "
      "every 0.5 s; `memory.peak` is the kernel's high-water mark of memory.current, which also counts page cache from "
      "reading the audio files, so it overstates the app's own memory.\n")
    w(hdr)

    def medinit(d, f):
        return med([f(r) for r in d["init"] if r])

    row("Idle, empty library: docker / anon / RSS", lambda d, m:
        f"{mib(medinit(d, lambda r: r['idle_empty_library']['docker_mem_usage_bytes']))} / {mib(medinit(d, lambda r: r['idle_empty_library']['anon']))} / {mib(medinit(d, lambda r: r['idle_empty_library']['rss_kb'] * 1024))}")
    row("Idle timeline, anon at s after setup", lambda d, m: ", ".join(
        f"{t['at_s']}s {t['anon'] / 2**20:.0f}" for t in (d["init"][0].get("idle_timeline") or [])) + " MiB" if d["init"] and d["init"][0].get("idle_timeline") else "-")
    row("Peak during initial scan: anon (sampled)", lambda d, m: mib(medinit(d, lambda r: r["mem_sampled"].get("peak_anon"))))
    row("Peak during initial scan: docker (sampled)", lambda d, m: mib(medinit(d, lambda r: r["mem_sampled"].get("peak_docker_usage"))))
    row("memory.peak since container start (incl. page cache)", lambda d, m: mib(medinit(d, lambda r: r["after_scan_settled_60s"].get("peak"))))
    row("60 s after scan: docker / anon / RSS", lambda d, m:
        f"{mib(medinit(d, lambda r: r['after_scan_settled_60s']['docker_mem_usage_bytes']))} / {mib(medinit(d, lambda r: r['after_scan_settled_60s']['anon']))} / {mib(medinit(d, lambda r: r['after_scan_settled_60s']['rss_kb'] * 1024))}")
    row("CPU time used by initial scan (user+sys)", lambda d, m: spread([r["cpu_s"] for r in d["init"] if r]))
    row("Data dir after initial scan", lambda d, m: mib(medinit(d, lambda r: r["data_dir"]["total_bytes"])))
    row("End of run (after API + web tests): docker / anon", lambda d, m:
        f"{mib(d['final']['docker_mem_usage_bytes'])} / {mib(d['final']['anon'])}" if d["final"] else "-")
    w("")
    for k, n in APPS:
        if D[k]["init"]:
            dd = D[k]["init"][-1]["data_dir"]["du_dirs"]
            parts = ", ".join(f"`{p}` {mib(v)}" for p, v in sorted(dd.items()) if p != "." and p.count("/") == 1)
            files = D[k]["init"][-1]["data_dir"].get("top_files", {})
            big = ", ".join(f"`{p}` {mib(v)}" for p, v in sorted(files.items(), key=lambda x: -x[1])[:4])
            w(f"- {n} data dir breakdown (last initial run): {parts or 'no subdirectories'}. Largest top-level files: {big}. "
              f"{D[k]['init'][-1]['data_dir'].get('file_count')} files in all.")
    w("")

    w("## Scanning\n")
    w(hdr)
    row("Initial full scan, wall (median, min-max)", lambda d, m: spread([r["wall_s"] for r in d["init"] if r]))
    row("Initial full scan, app-reported", lambda d, m: spread([r.get("app_reported_s") for r in d["init"] if r]))
    row("Books found", lambda d, m: ", ".join(str(r["items"]) for r in d["init"] if r))
    row("No-change rescan, cold cache: wall", lambda d, m: spread([r["wall_s"] for r in (d["rescan"] or {}).get("cold", [])]))
    row("No-change rescan, cold cache: CPU", lambda d, m: spread([r["cpu_s"] for r in (d["rescan"] or {}).get("cold", [])]))
    row("No-change rescan, warm cache: wall", lambda d, m: spread([r["wall_s"] for r in (d["rescan"] or {}).get("warm", [])]))
    row("No-change rescan, warm cache: CPU", lambda d, m: spread([r["cpu_s"] for r in (d["rescan"] or {}).get("warm", [])]))
    row("Cold start to first authenticated library response", lambda d, m: spread([r["first_ok_s"] for r in d["startup"] or []]))
    w("")
    for k, n in APPS:
        if D[k]["init"]:
            w(f"- {n} completion signal: {D[k]['init'][0]['completion_signal']}.")
    if D["abs"]["init"]:
        forced = [r["detail"].get("forced") for r in D["abs"]["init"] if r]
        w(f"- ABS initial scans ran as `(forced)`: {forced} (ABS forces the first scan of a new library because its metadata precedence was never recorded; this is its out-of-box behaviour).")
    if D["as"]["startup"]:
        sr = [((r.get("after_start") or {}).get("startup_rescan_run") or {}) for r in D["as"]["startup"]]
        w(f"- AudioSilo queues a no-change scan of every library on each start (pkg/launcher); runs recorded after the cold starts: "
          + ", ".join(f"{x.get('status')} {x.get('books')} books" for x in sr if x) + ". ABS does not scan on start.")
    ia, ib = set(D["abs"]["items"] or []), set(D["as"]["items"] or [])
    if ia or ib:
        w(f"- Item sanity (by library-relative folder): ABS {len(ia)}, AudioSilo {len(ib)}, in both {len(ia & ib)}. "
          f"Only in ABS: {sorted(ia - ib)[:20]}. Only in AudioSilo: {sorted(ib - ia)[:20]}.")
    w("")

    for src, title in (("lat", "from the Mac over the LAN"), ("lat_host", "from the host (loopback, python:3-alpine)")):
        if not any(D[k][src] for k, _ in APPS):
            continue
        w(f"## API latency {title}\n")
        w("Sequential requests over one keep-alive connection (first-byte requests open a fresh connection each), "
          "request starts spaced at least 25 ms apart (AudioSilo limits each client IP to about 50 API requests/s; "
          "the spacing is applied to both apps and is never inside a timed sample). "
          "p50 / p95 / max in ms; size is the decoded body (wire size with gzip in the JSON files); for the two-step "
          "play flows it is the first step's body plus the 1 audio byte.\n")
        names = []
        for k, _ in APPS:
            for r in (D[k][src] or {}).get("results", []):
                if r["name"] not in names:
                    names.append(r["name"])
        if src == "lat":
            for k, _ in APPS:
                cc = (D[k]["cold_cov"] or {}).get("results", [])
                if cc and "cover_first_request" not in names:
                    names.insert(0, "cover_first_request")
        w("| Request | " + " | ".join(f"{n} p50 / p95 / max | {n} bytes" for _, n in APPS) + " |")
        w("|---|" + "---|---|" * len(APPS))
        for nm in names:
            cells = []
            for k, _ in APPS:
                res = (D[k][src] or {}).get("results", [])
                if src == "lat":
                    res = res + (D[k]["cold_cov"] or {}).get("results", [])
                r = next((x for x in res if x["name"] == nm), None)
                if not r:
                    cells += ["n/a", ""]
                elif r.get("error"):
                    cells += [f"error: {r['error'][:60]}", ""]
                else:
                    rc = r.get("result_counts")
                    rc = (" (" + ", ".join(f"{'shelves' if k == '[]' else k.split('.')[-1]}={v}" for k, v in rc.items() if v) + ")") if rc else ""
                    cells += [f"{r['p50_ms']} / {r['p95_ms']} / {r['max_ms']}", f"{r.get('decoded_bytes_median')}{rc}"]
            w(f"| {nm} | " + " | ".join(cells) + " |")
        for ckey, clabel in (("concurrency_paced", "concurrency, steady load: library page 1"), ("concurrency", "concurrency, saturating: library page 1")):
            cc = [(D[k][src] or {}).get(ckey) for k, _ in APPS]
            if any(cc):
                w(f"| **{clabel}** | " + " | ".join(
                    (f"{c['req_per_s']} ok req/s, p50 {c.get('p50_ms')} / p95 {c.get('p95_ms')} ms | {c['clients']} clients x {c['seconds']} s"
                     + (f", {c['offered_req_per_s']} req/s offered" if c.get("offered_req_per_s") else ", back to back")
                     + f", status {c.get('status')}" if c else "n/a | ")
                    for c in cc) + " |")
        w("")
        if src == "lat":
            w("Exact requests (tokens elided):\n")
            for k, n in APPS:
                spec = D[k]["spec"]
                if not spec:
                    continue
                w(f"**{n}** (base {spec['base']}, page size {spec.get('page_limit')}, total {spec.get('total')}):\n")
                for r in spec["requests"]:
                    w(f"- `{r['name']}`: {r.get('describe')}")
                w("")

    if any(D[k]["web"] for k, _ in APPS):
        w("## Web UI (Playwright Chromium, 1440x900, DPR 1, from the Mac)\n")
        w("Medians of the runs. Times in ms from navigation start. `first cover`: first cover image inside the viewport "
          "fully loaded; `screen`: last cover inside the viewport loaded (all visible loaded, then stable 1.5 s). "
          "Bytes are transferred (compressed) bytes; cache hits count 0.\n")
        w("| Page | Cache | " + " | ".join(f"{n} first cover / screen / LCP | {n} req / KiB / JS KiB" for _, n in APPS) + " |")
        w("|---|---|" + "---|---|" * len(APPS))
        for page in ("home", "grid"):
            for cache in ("cold", "warm"):
                cells = []
                for k, _ in APPS:
                    s = ((D[k]["web"] or {}).get("pages", {}).get(page) or {}).get(cache)
                    if not s:
                        cells += ["n/a", ""]
                        continue
                    cells += [f"{num(s['firstCover_ms'], '', 0)} / {num(s['screenCovers_ms'], '', 0)} / {num(s['lcp_ms'], '', 0)}",
                              f"{num(s['requests'], '', 0)} / {s['bytes'] / 1024:.0f} / {s['js_bytes'] / 1024:.0f}"]
                w(f"| {page} | {cache} | " + " | ".join(cells) + " |")
        w("")
        for k, n in APPS:
            web = D[k]["web"]
            if not web:
                continue
            g = web["pages"]["grid"]["cold_runs"][0]
            hm = web["pages"]["home"]["cold_runs"][0]
            blocked = sorted({b for p in web["pages"].values() for r in p["cold_runs"] + p["warm_runs"] for b in r["blocked"]})
            failed = sorted({b for p in web["pages"].values() for r in p["cold_runs"] + p["warm_runs"] for b in r["failed"]})
            w(f"- {n}: grid URL `{g['url']}` (ended at `{g['finalUrl'].split('//', 1)[-1].split('/', 1)[-1]}`), "
              f"{g['visibleCovers']} covers in view; home `{hm['url']}`, {hm['visibleCovers']} covers in view. "
              f"Screenshots: {', '.join(os.path.basename(x) for x in sorted(glob.glob(f'{root}/{k}/shots/*.png')))}. "
              f"External requests blocked: {blocked or 'none'}. Failed same-origin requests: {failed or 'none'}.")
        w("")
    if any(D[k]["admin_web"] or D[k]["admin_lat"] for k, _ in APPS):
        w("## Admin health page\n")
        w("AudioSilo: the admin console's Health section, Issues (the default tab) and System. Audiobookshelf has no "
          "health or system-status page; its nearest equivalent to Issues is the bookshelf filtered to `issues` "
          "(items it marked missing or invalid; the sidebar shows the link only when there are any). It has nothing "
          "comparable to System, so that row is n/a.\n")
        w("Browser: Playwright Chromium from the Mac, medians of the runs, ms from navigation start. `ready`: the "
          "page's data has rendered (its text shows the result) and no API request is in flight; `last API`: end of "
          "the last API response.\n")
        w("| Page | Cache | " + " | ".join(f"{n} ready / last API ms | {n} API req / KiB" for _, n in APPS) + " |")
        w("|---|---|" + "---|---|" * len(APPS))
        for page in ("issues", "system"):
            for cache in ("cold", "warm"):
                cells = []
                for k, _ in APPS:
                    s_ = ((D[k]["admin_web"] or {}).get("pages", {}).get(page) or {}).get(cache)
                    if not s_:
                        cells += ["n/a", ""]
                        continue
                    cells += [f"{num(s_['ready_ms'], '', 0)} / {num(s_['api_ms'], '', 0)}",
                              f"{num(s_['api_requests'], '', 0)} / {s_['bytes'] / 1024:.0f}"]
                w(f"| {page} | {cache} | " + " | ".join(cells) + " |")
        w("")
        for k, n in APPS:
            aw = D[k]["admin_web"]
            if not aw:
                continue
            for page, v in aw["pages"].items():
                r0 = v["cold_runs"][0]
                calls = "; ".join(f"{a['m']} {a['u']} ({a['dur_ms']} ms, {a['b']} B)" for a in r0["api_log"])
                w(f"- {n} {page} (`{r0['url']}`), API requests on the first cold load: {calls}.")
        w("")
        w("API replay (same method as the latency tables: 5 warm-up + timed requests, paced):\n")
        w("| Request | " + " | ".join(f"{n} p50 / p95 / max | {n} bytes" for _, n in APPS) + " |")
        w("|---|" + "---|---|" * len(APPS))
        names = []
        for k, _ in APPS:
            for r in (D[k]["admin_lat"] or {}).get("results", []):
                if r["name"] not in names:
                    names.append(r["name"])
        for nm in names:
            cells = []
            for k, _ in APPS:
                r = next((x for x in (D[k]["admin_lat"] or {}).get("results", []) if x["name"] == nm), None)
                if not r:
                    cells += ["n/a", ""]
                    continue
                cnt = r.get("result_counts")
                cells += [f"{r.get('p50_ms')} / {r.get('p95_ms')} / {r.get('max_ms')}",
                          f"{r.get('decoded_bytes_median')}" + (f" ({', '.join(f'{a}={b}' for a, b in cnt.items())})" if cnt else "")]
            w(f"| {nm} | " + " | ".join(cells) + " |")
        w("")
        for k, n in APPS:
            for r in (D[k]["admin_spec"] or {}).get("requests", []):
                w(f"- {n} `{r['name']}`: {r.get('describe')}")
        w("")
    out = f"{root}/summary.md"
    with open(out, "w") as f:
        f.write("\n".join(L) + "\n")
    print(out)


if __name__ == "__main__":
    main(sys.argv[1])
