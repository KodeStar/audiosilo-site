#!/usr/bin/env python3
"""Side-by-side headline table for several tiers:

    python3 compare.py results/1000 results/1000-m4b > results/compare.md

Each tier's own summary.md has every metric; this puts the headline ones next to each
other (medians; lower is better for every figure except req/s)."""
import glob
import json
import statistics
import sys

APPS = [("abs", "ABS"), ("as", "AudioSilo")]


def load(p):
    try:
        with open(p) as f:
            return json.load(f)
    except FileNotFoundError:
        return None


def med(xs):
    xs = [x for x in xs if x is not None]
    return statistics.median(xs) if xs else None


def f(x, unit="", nd=1):
    return "-" if x is None else f"{x:.{nd}f}{unit}"


def mib(x):
    return "-" if x is None else f"{x / 2**20:.0f} MiB"


def tier(root):
    t = {"meta": load(f"{root}/meta.json")}
    for k, _ in APPS:
        d = f"{root}/{k}"
        t[k] = {"init": [load(p) for p in sorted(glob.glob(f"{d}/scan_initial_*.json"))],
                "rescan": load(f"{d}/scan_rescan.json") or {}, "startup": load(f"{d}/startup.json") or [],
                "lat": load(f"{d}/latency_mac.json") or {}, "cold": load(f"{d}/latency_cold_covers.json") or {},
                "web": load(f"{d}/webui.json") or {},
                # the admin health measurement, in the tier or in its "<tier>-admin" rerun
                "aweb": load(f"{d}/admin_web.json") or load(f"{root.rstrip('/')}-admin/{k}/admin_web.json") or {},
                "alat": load(f"{d}/admin_latency.json") or load(f"{root.rstrip('/')}-admin/{k}/admin_latency.json") or {}}
    return t


def lat(d, name, key="p50_ms"):
    for r in d["lat"].get("results", []) + d["cold"].get("results", []):
        if r["name"] == name:
            return r.get(key)
    return None


def admin_web(d, page, cache):
    s = ((d["aweb"].get("pages", {}).get(page) or {}).get(cache) or {})
    return "n/a" if not s else f"{s['ready_ms']:.0f} ms ({s['api_requests']:.0f} API req)"


def admin_lat(d, name):
    for r in d["alat"].get("results", []):
        if r["name"] == name:
            return f"{r['p50_ms']:.2f} ms"
    return "n/a"


def web(d, page, cache, metric):
    return ((d["web"].get("pages", {}).get(page) or {}).get(cache) or {}).get(metric)


ROWS = [
    ("Initial scan, wall (median)", lambda d: f(med([r["wall_s"] for r in d["init"]]), " s")),
    ("Initial scan, CPU time", lambda d: f(med([r["cpu_s"] for r in d["init"]]), " s")),
    ("Books found", lambda d: ", ".join(str(r["items"]) for r in d["init"])),
    ("Peak anon memory during scan", lambda d: mib(med([r["mem_sampled"].get("peak_anon") for r in d["init"]]))),
    ("Idle memory, empty library (docker / anon)", lambda d: f"{mib(med([r['idle_empty_library']['docker_mem_usage_bytes'] for r in d['init']]))} / {mib(med([r['idle_empty_library']['anon'] for r in d['init']]))}"),
    ("Memory 60 s after scan (docker / anon)", lambda d: f"{mib(med([r['after_scan_settled_60s']['docker_mem_usage_bytes'] for r in d['init']]))} / {mib(med([r['after_scan_settled_60s']['anon'] for r in d['init']]))}"),
    ("Data dir after scan", lambda d: mib(med([r["data_dir"]["total_bytes"] for r in d["init"]]))),
    ("No-change rescan, cold cache", lambda d: f(med([r["wall_s"] for r in d["rescan"].get("cold", [])]), " s")),
    ("No-change rescan, warm cache", lambda d: f(med([r["wall_s"] for r in d["rescan"].get("warm", [])]), " s")),
    ("Cold start to first library answer", lambda d: f(med([r["first_ok_s"] for r in d["startup"]]), " s", 2)),
    ("API p50: home shelves", lambda d: f(lat(d, "home_shelves"), " ms", 2)),
    ("API p50: library page 1", lambda d: f(lat(d, "library_page1"), " ms", 2)),
    ("API p50: deep page", lambda d: f(lat(d, "library_deep_page"), " ms", 2)),
    ("API p50: search 'the'", lambda d: f(lat(d, "search_the"), " ms", 2)),
    ("API p50: search 'bleak house'", lambda d: f(lat(d, "search_title"), " ms", 2)),
    ("API p50: book detail (M4B)", lambda d: f(lat(d, "detail_m4b"), " ms", 2)),
    ("API p50: play to first byte (MP3)", lambda d: f(lat(d, "play_first_byte_mp3"), " ms", 2)),
    ("API p50: play to first byte (M4B)", lambda d: f(lat(d, "play_first_byte_m4b"), " ms", 2)),
    ("API p50: cover, uncached", lambda d: f(lat(d, "cover_first_request"), " ms", 2)),
    ("API p50: cover, cached", lambda d: f(lat(d, "cover_grid"), " ms", 2)),
    ("Steady 40 req/s, p95", lambda d: f((d["lat"].get("concurrency_paced") or {}).get("p95_ms"), " ms", 2)),
    ("Saturating, ok req/s (one client IP)", lambda d: f((d["lat"].get("concurrency") or {}).get("req_per_s"), "", 0)),
    ("Web grid, cold: first cover / screen", lambda d: f"{f(web(d, 'grid', 'cold', 'firstCover_ms'), '', 0)} / {f(web(d, 'grid', 'cold', 'screenCovers_ms'), ' ms', 0)}"),
    ("Web grid, warm: first cover / screen", lambda d: f"{f(web(d, 'grid', 'warm', 'firstCover_ms'), '', 0)} / {f(web(d, 'grid', 'warm', 'screenCovers_ms'), ' ms', 0)}"),
    ("Web home, cold: first cover / screen", lambda d: f"{f(web(d, 'home', 'cold', 'firstCover_ms'), '', 0)} / {f(web(d, 'home', 'cold', 'screenCovers_ms'), ' ms', 0)}"),
    ("Admin health page, cold: ready", lambda d: admin_web(d, "issues", "cold")),
    ("Admin health page, warm: ready", lambda d: admin_web(d, "issues", "warm")),
    ("Admin health API p50 (AS /admin/issues; ABS items?filter=issues)", lambda d: admin_lat(d, "admin_issues")),
    ("Admin system page, cold: ready", lambda d: admin_web(d, "system", "cold")),
    ("Web grid, cold: transferred / JS", lambda d: f"{f((web(d, 'grid', 'cold', 'bytes') or 0) / 1024, '', 0)} / {f((web(d, 'grid', 'cold', 'js_bytes') or 0) / 1024, ' KiB', 0)}"),
]


def main(roots):
    tiers = [(r.rstrip("/").split("/")[-1], tier(r)) for r in roots]
    out = ["# ABS vs AudioSilo: tiers side by side\n"]
    out.append("| Tier | Path | Book folders | MP3 files | M4B files | Size |")
    out.append("|---|---|---|---|---|---|")
    for name, t in tiers:
        lib = t["meta"]["library"]
        out.append(f"| {name} | `{t['meta'].get('library_path')}` | {lib['books']} | {lib['mp3']} | {lib['m4b']} | {lib['bytes'] / 2**30:.0f} GiB |")
    out.append("")
    hdr = "| Metric | " + " | ".join(f"{n} {a}" for n, _ in tiers for _, a in APPS) + " |"
    out.append(hdr)
    out.append("|---|" + "---|" * (len(tiers) * len(APPS)))
    for label, fn in ROWS:
        cells = []
        for _, t in tiers:
            for k, _ in APPS:
                try:
                    cells.append(fn(t[k]) if t[k]["init"] else "-")
                except Exception:
                    cells.append("-")
        out.append(f"| {label} | " + " | ".join(cells) + " |")
    out.append("\nFull figures, request URLs and caveats: each tier's `summary.md` and the harness README.")
    print("\n".join(out))


if __name__ == "__main__":
    main(sys.argv[1:])
