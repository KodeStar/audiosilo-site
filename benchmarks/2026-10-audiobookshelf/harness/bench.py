#!/usr/bin/env python3
"""Benchmark orchestrator: ABS vs AudioSilo, one app at a time, same host, same
read-only library. Runs on the Mac (Python stdlib), drives the host over SSH.

    python3 bench.py --tier dry-23 [--apps abs,as] [--initial 3] [--rescan 3]
                     [--startup 3] [--no-latency] [--host-latency] [--no-web]
                     [--latency-n 100] [--conc-clients 20] [--conc-seconds 20]
                     [--as-metadata default|off] [--web-runs 5]

Results: results/<tier>/<app>/*.json (+ results/<tier>/meta.json); then
summarize.py writes results/<tier>/summary.md.
"""
import argparse
import json
import os
import statistics
import subprocess
import sys
import time

import apps
import hostctl

HERE = os.path.dirname(os.path.abspath(__file__))


def log(*a):
    print(time.strftime("%H:%M:%S"), *a, flush=True)


def save(path, obj):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        json.dump(obj, f, indent=1, default=str)


def scan_measure(app, trigger, label):
    """Drop caches, start memory sampling, trigger a scan, wait for the app's own
    completion signal; return timings, CPU and memory."""
    load_before = hostctl.loadavg()
    hostctl.drop_caches()
    time.sleep(1)
    sampler = hostctl.MemSampler(app.container)
    sampler.start()
    cpu0 = hostctl.cpu_usec(app.container)
    t0 = time.time()
    token = trigger()
    done = app.wait_scan(token, timeout=6 * 3600)
    t1 = done["done_at"]  # when completion was seen, before any SSH reads
    cpu1 = hostctl.cpu_usec(app.container)
    mem = sampler.stop()
    res = {
        "label": label,
        "wall_s": round(t1 - t0, 3),
        "app_reported_s": done.get("app_reported_s"),
        "completion_signal": app.completion_signal,
        "cpu_s": round((cpu1["usage_usec"] - cpu0["usage_usec"]) / 1e6, 3),
        "cpu_user_s": round((cpu1["user_usec"] - cpu0["user_usec"]) / 1e6, 3),
        "cpu_system_s": round((cpu1["system_usec"] - cpu0["system_usec"]) / 1e6, 3),
        "mem_sampled": mem,
        "load_before": load_before,
        "load_after": hostctl.loadavg(),
        "detail": done,
    }
    log(f"  {app.name} {label}: wall {res['wall_s']} s, app-reported {res['app_reported_s']} s, cpu {res['cpu_s']} s, peak anon {mem.get('peak_anon', 0) / 2**20:.1f} MiB")
    return res


def initial_scans(app, n, out):
    runs = []
    for i in range(1, n + 1):
        log(f"[{app.name}] initial scan {i}/{n}: wipe + fresh start")
        hostctl.stop_container(app.container)
        hostctl.rm_container(app.container)
        hostctl.wipe_data(app.key)
        app.start_fresh()
        app.wait_ready()
        app.first_run_setup()
        # Idle memory with an empty library: readings at 10/30/60/... s after setup
        # (a Go or Node heap keeps shrinking for a while after start-up); the last
        # one is the reported figure.
        t_setup, timeline = time.time(), []
        for at in sorted({10, 30, 60, app.args.idle_settle_s}):
            if at > app.args.idle_settle_s:
                continue
            time.sleep(max(0.0, t_setup + at - time.time()))
            snap = hostctl.mem_snapshot(app.container)
            timeline.append({"at_s": at, "docker": snap["docker_mem_usage_bytes"], "anon": snap["anon"], "rss_kb": snap["rss_kb"]})
        idle = snap
        app.create_library()
        r = scan_measure(app, app.trigger_initial_scan, f"initial-{i}")
        r["idle_empty_library"] = idle
        r["idle_timeline"] = timeline
        r["items"] = app.item_count()
        time.sleep(60)
        r["after_scan_settled_60s"] = hostctl.mem_snapshot(app.container)
        r["data_dir"] = hostctl.du_breakdown(app.key)
        r["scan_log"] = app.scan_log_excerpt()
        runs.append(r)
        save(f"{out}/scan_initial_{i}.json", r)
    return runs


def rescans(app, n, out):
    res = {"cold": [], "warm": []}
    for kind in ("cold", "warm"):
        for i in range(1, n + 1):
            log(f"[{app.name}] no-change rescan ({kind}) {i}/{n}")
            if kind == "cold":
                r = scan_measure(app, app.trigger_rescan, f"rescan-cold-{i}")
            else:
                # warm: no cache drop; run one right after the previous one
                cpu0 = hostctl.cpu_usec(app.container)
                t0 = time.time()
                tok = app.trigger_rescan()
                done = app.wait_scan(tok, timeout=6 * 3600)
                cpu1 = hostctl.cpu_usec(app.container)
                r = {"label": f"rescan-warm-{i}", "wall_s": round(done["done_at"] - t0, 3),
                     "app_reported_s": done.get("app_reported_s"), "completion_signal": app.completion_signal,
                     "cpu_s": round((cpu1["usage_usec"] - cpu0["usage_usec"]) / 1e6, 3), "detail": done}
                log(f"  {app.name} {r['label']}: wall {r['wall_s']} s, cpu {r['cpu_s']} s")
            r["items"] = app.item_count()
            res[kind].append(r)
            time.sleep(5)
    save(f"{out}/scan_rescan.json", res)
    return res


def startup(app, n, out):
    app.refresh_auth()  # ABS access tokens last 1 h
    runs = []
    for i in range(1, n + 1):
        log(f"[{app.name}] cold start {i}/{n}")
        hostctl.stop_container(app.container)
        time.sleep(2)
        r = hostctl.start_container_timed(app.container, app.startup_probe_cmd())
        r["probe"] = app.startup_probe_describe()
        r["load"] = hostctl.loadavg()
        app.after_restart()
        r["after_start"] = app.after_start_note()
        runs.append(r)
        log(f"  first authenticated response {r['first_ok_s']:.3f} s after docker start")
        time.sleep(5)
    save(f"{out}/startup.json", runs)
    return runs


def latency(app, out, args, picks):
    app.refresh_auth()
    resolved = app.resolve(picks)
    cold = app.latency_spec(resolved, {})["cold_covers"]
    save(f"{out}/latency_cold_covers_spec.json", {"base": app.base, "requests": [], "cold_covers": cold})
    log(f"[{app.name}] first-request cover latency ({len(cold)} distinct books)")
    subprocess.run([sys.executable, os.path.join(HERE, "latency.py"), f"{out}/latency_cold_covers_spec.json",
                    f"{out}/latency_cold_covers.json", "--conc-clients", "0"], check=True)
    # The ABS bookshelf's page size depends on the viewport, so read page 1's request
    # from the real web UI at the harness viewport (done for both apps, to record
    # that the replayed URLs match what each UI sends).
    probe = webprobe(app, out)
    spec = app.latency_spec(resolved, probe)
    spec.pop("cold_covers")
    spec["picks"] = resolved
    spec["web_probe"] = probe
    save(f"{out}/latency_spec.json", spec)
    log(f"[{app.name}] API latency from the Mac ({args.latency_n} x each, {args.latency_warmup} warm-up)")
    load0 = hostctl.loadavg()
    subprocess.run([sys.executable, os.path.join(HERE, "latency.py"), f"{out}/latency_spec.json", f"{out}/latency_mac.json",
                    "--warmup", str(args.latency_warmup), "--n", str(args.latency_n),
                    "--conc-clients", str(args.conc_clients), "--conc-seconds", str(args.conc_seconds),
                    "--pace-ms", str(args.pace_ms), "--conc-interval-ms", str(args.conc_interval_ms)], check=True)
    r = json.load(open(f"{out}/latency_mac.json"))
    r["load_before"], r["load_after"] = load0, hostctl.loadavg()
    save(f"{out}/latency_mac.json", r)
    if args.host_latency:
        log(f"[{app.name}] API latency from the host (python:3-alpine, --network host)")
        host_spec = dict(spec, base=spec["base"].replace(apps.HOST_IP, "127.0.0.1"))
        save(f"{out}/latency_spec_host.json", host_spec)
        hostctl.sh("mkdir -p /tmp/bench-client")
        for f, dst in ((os.path.join(HERE, "latency.py"), "latency.py"), (f"{out}/latency_spec_host.json", "spec.json")):
            subprocess.run(hostctl.SSH + [f"cat > /tmp/bench-client/{dst}"], stdin=open(f, "rb"), check=True)
        hostctl.sh("docker rm -f bench-client >/dev/null 2>&1; docker run --rm --name bench-client --network host "
                   "-v /tmp/bench-client:/w python:3-alpine python3 /w/latency.py /w/spec.json /w/out.json "
                   f"--warmup {args.latency_warmup} --n {args.latency_n} --conc-clients {args.conc_clients} --conc-seconds {args.conc_seconds} "
                   f"--pace-ms {args.pace_ms} --conc-interval-ms {args.conc_interval_ms}",
                   timeout=3600)
        data = hostctl.sh("cat /tmp/bench-client/out.json")
        with open(f"{out}/latency_host.json", "w") as f:
            f.write(data)


def webprobe(app, out):
    """Load the grid once in the real web UI and read the request it makes for page 1."""
    sess = app.web_session()
    save(f"{out}/web_session.json", sess)
    subprocess.run(["node", os.path.join(HERE, "webui.mjs"), f"{out}/web_session.json", f"{out}/webprobe.json", "--probe"], check=True)
    p = json.load(open(f"{out}/webprobe.json"))
    if app.key == "abs" and p.get("gridRequest"):
        import urllib.parse as up
        q = up.parse_qs(up.urlsplit(p["gridRequest"]).query)
        p["abs_page_limit"] = int(q["limit"][0])
    log(f"  web probe: grid request {p.get('gridRequest')}")
    return p


def webui(app, out, args):
    app.refresh_auth()
    sess = app.web_session()
    save(f"{out}/web_session.json", sess)
    log(f"[{app.name}] web UI (Playwright, {args.web_runs} cold + {args.web_runs} warm per page)")
    load0 = hostctl.loadavg()
    subprocess.run(["node", os.path.join(HERE, "webui.mjs"), f"{out}/web_session.json", f"{out}/webui.json",
                    "--runs", str(args.web_runs), "--shots", f"{out}/shots"], check=True)
    r = json.load(open(f"{out}/webui.json"))
    r["load_before"], r["load_after"] = load0, hostctl.loadavg()
    save(f"{out}/webui.json", r)


def admin(app, out, args):
    """The admin 'health' page (AudioSilo: console Health > Issues and System; ABS:
    nearest equivalent, see apps.ABS.admin_session) in the browser, plus its API
    requests replayed like the latency phase."""
    app.refresh_auth()
    app.admin_prepare()
    sess = app.admin_session()
    save(f"{out}/admin_session.json", sess)
    log(f"[{app.name}] admin health page (Playwright, {args.web_runs} cold + {args.web_runs} warm)")
    subprocess.run(["node", os.path.join(HERE, "admin.mjs"), f"{out}/admin_session.json", f"{out}/admin_web.json",
                    "--runs", str(args.web_runs), "--shots", f"{out}/shots"], check=True)
    spec = app.admin_spec()
    save(f"{out}/admin_spec.json", spec)
    log(f"[{app.name}] admin health API ({args.latency_n} x each, {args.latency_warmup} warm-up)")
    subprocess.run([sys.executable, os.path.join(HERE, "latency.py"), f"{out}/admin_spec.json", f"{out}/admin_latency.json",
                    "--warmup", str(args.latency_warmup), "--n", str(args.latency_n), "--conc-clients", "0",
                    "--pace-ms", str(args.pace_ms)], check=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--tier", required=True)
    ap.add_argument("--apps", default="abs,as")
    ap.add_argument("--initial", type=int, default=3)
    ap.add_argument("--rescan", type=int, default=3)
    ap.add_argument("--startup", type=int, default=3)
    ap.add_argument("--latency-n", type=int, default=100)
    ap.add_argument("--latency-warmup", type=int, default=5)
    ap.add_argument("--conc-clients", type=int, default=20)
    ap.add_argument("--conc-seconds", type=int, default=20)
    ap.add_argument("--web-runs", type=int, default=5)
    ap.add_argument("--pace-ms", type=int, default=25)
    ap.add_argument("--idle-settle-s", type=int, default=120,
                    help="seconds after first-run setup before the idle (empty library) memory reading")
    ap.add_argument("--conc-interval-ms", type=int, default=500)
    ap.add_argument("--stable-check-s", type=int, default=60)
    ap.add_argument("--require-stable", action="store_true",
                    help="abort if the library changes during a 60 s check before the run")
    ap.add_argument("--no-latency", action="store_true")
    ap.add_argument("--host-latency", action="store_true")
    ap.add_argument("--no-web", action="store_true")
    ap.add_argument("--as-metadata", choices=["default", "off"], default="default")
    ap.add_argument("--phases", default="scan,rescan,startup,latency,web,admin",
                    help="subset to run; without 'scan' the existing bench data and container are reused (for debugging)")
    args = ap.parse_args()

    root = os.path.join(HERE, "results", args.tier)
    os.makedirs(root, exist_ok=True)
    names = args.apps.split(",")
    # Never run both at once: stop every bench container first.
    for c in hostctl.OWN:
        hostctl.stop_container(c)

    lib0 = apps.library_facts()
    log(f"checking the library is not changing ({args.stable_check_s} s)...")
    time.sleep(args.stable_check_s)
    lib1 = apps.library_facts()
    changing = lib0 != lib1
    if changing:
        log(f"WARNING: the library changed during the check ({lib0} -> {lib1}); results are not comparable between apps")
        if args.require_stable:
            sys.exit(2)
    prev = None
    if os.path.exists(f"{root}/meta.json"):
        with open(f"{root}/meta.json") as f:
            prev = json.load(f)
    meta = {"tier": args.tier, "library_changing": changing, "args": vars(args), "started": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
            "host": hostctl.host_info(), "other_running_containers": hostctl.other_containers(),
            "load_at_start": hostctl.loadavg(), "library_path": hostctl.LIBRARY, "library": apps.library_facts(), "apps": {}}
    save(f"{root}/meta.json", meta)
    if prev:
        # keep the other app's entry when only one app is (re)run into this tier
        for k, v in prev.get("apps", {}).items():
            if k not in names:
                meta["apps"][k] = v
    picks = prev["picks"] if prev and prev.get("picks") and set(names) != {"abs", "as"} else apps.pick_books_fs()
    meta["picks"] = picks
    save(f"{root}/meta.json", meta)
    t_start = time.time()
    for key in names:
        app = apps.make(key, args)
        out = os.path.join(root, key)
        os.makedirs(out, exist_ok=True)
        t_app = time.time()
        log(f"===== {app.name} =====")
        img = app.resolve_image()
        meta["apps"][key] = {"image": img, "library_before": apps.library_facts()}
        save(f"{root}/meta.json", meta)
        phases = args.phases.split(",")
        if "scan" in phases:
            initial_scans(app, args.initial, out)
        else:
            app.reuse_existing()
        meta["apps"][key]["version"] = app.version()
        if "rescan" in phases:
            rescans(app, args.rescan, out)
        save(f"{out}/items.json", app.item_list())
        if "startup" in phases:
            startup(app, args.startup, out)
        if "latency" in phases and not args.no_latency:
            latency(app, out, args, picks)
        if "web" in phases and not args.no_web:
            webui(app, out, args)
        if "admin" in phases:
            admin(app, out, args)
        save(f"{out}/final_memory.json", hostctl.mem_snapshot(app.container))
        hostctl.stop_container(app.container)
        meta["apps"][key]["elapsed_s"] = round(time.time() - t_app, 1)
        meta["apps"][key]["library_after"] = apps.library_facts()
        save(f"{root}/meta.json", meta)
    meta["finished"] = time.strftime("%Y-%m-%dT%H:%M:%S%z")
    meta["elapsed_s"] = round(time.time() - t_start, 1)
    meta["load_at_end"] = hostctl.loadavg()
    meta["library_at_end"] = apps.library_facts()
    save(f"{root}/meta.json", meta)
    log(f"done in {meta['elapsed_s']} s; results in {root}")


if __name__ == "__main__":
    main()
