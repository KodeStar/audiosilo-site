#!/usr/bin/env python3
"""HTTP latency runner (Python stdlib only, so it also runs in python:3-alpine on
the host). Reads a request-set JSON (written by bench.py), writes results JSON.

    python3 latency.py <requests.json> <out.json> [--warmup 5] [--n 100] [--pace-ms 25]
                       [--conc-clients 20] [--conc-seconds 20] [--conc-interval-ms 500]

--pace-ms spaces request starts (default 25 ms, at most 40 req/s): AudioSilo
limits each client IP to about 50 API requests/s (burst 200, not configurable),
so an unpaced loop would measure its 429s. Applied to both apps; the wait is never
inside a timed sample. The concurrency phase runs twice: paced (each client one
request per --conc-interval-ms, default 20 x 2/s = 40 req/s offered) and
saturating (back to back), reporting every status code.

requests.json: {"base": "http://host:port", "requests": [ {
    "name": "library_page1", "method": "GET", "path": "/api/...",
    "headers": {...}, "body": null | {...},
    "mode": "full" | "first_byte",       # first_byte: time to first body byte, then drop the connection
    "steps": [ {method, path, headers, body, mode, extract?} ... ]  # optional: a multi-request flow timed end to end
}], "concurrency": {"name": ..., "path": ..., "headers": {...}} }

Each sample is timed from just before the request is written to the end of the
body (full) or the first body byte (first_byte). Keep-alive: one persistent
connection per runner (a browser keeps its connection too); first_byte requests
use a fresh connection per sample (the body is abandoned), and the TCP connect is
included in that sample. Accept-Encoding: gzip is sent (browsers send gzip/br; br
is not in the stdlib), and both wire bytes and decoded bytes are recorded.
"""
import gzip
import http.client
import json
import statistics
import sys
import time
import urllib.parse
import zlib


def pct(xs, p):
    if not xs:
        return None
    s = sorted(xs)
    k = (len(s) - 1) * p / 100
    f = int(k)
    c = min(f + 1, len(s) - 1)
    return s[f] + (s[c] - s[f]) * (k - f)


def stats_ms(xs):
    return {"n": len(xs), "p50_ms": round(pct(xs, 50) * 1000, 2), "p95_ms": round(pct(xs, 95) * 1000, 2),
            "p99_ms": round(pct(xs, 99) * 1000, 2), "max_ms": round(max(xs) * 1000, 2),
            "min_ms": round(min(xs) * 1000, 2), "mean_ms": round(statistics.mean(xs) * 1000, 2)}


class Conn:
    def __init__(self, base):
        u = urllib.parse.urlsplit(base)
        self.host, self.port = u.hostname, u.port or 80
        self.c = None

    def get(self, fresh=False):
        if fresh or self.c is None:
            if self.c is not None:
                self.c.close()
            self.c = http.client.HTTPConnection(self.host, self.port, timeout=60)
        return self.c

    def close(self):
        if self.c is not None:
            self.c.close()
            self.c = None


def decode(body, enc):
    if enc == "gzip":
        return gzip.decompress(body)
    if enc == "deflate":
        try:
            return zlib.decompress(body)
        except zlib.error:
            return zlib.decompress(body, -zlib.MAX_WBITS)
    return body


PACE = [0.0, 0.0]  # [min seconds between request starts, last start]; set by --pace-ms


def pace():
    """Space request starts at least PACE[0] apart. The wait is never inside a timed
    sample: it happens before the clock starts."""
    if PACE[0] > 0:
        wait = PACE[1] + PACE[0] - time.perf_counter()
        if wait > 0:
            time.sleep(wait)
        PACE[1] = time.perf_counter()


def one(conn, req, ctx=None):
    """Perform one request; return (seconds, status, wire_bytes, decoded_bytes, json_or_None)."""
    pace()
    method = req.get("method", "GET")
    path = req["path"]
    headers = {"Accept-Encoding": "gzip, deflate", "Accept": "*/*", **req.get("headers", {})}
    body = req.get("body")
    if ctx:
        path = path.format(**ctx)
        if isinstance(body, str):
            body = body.format(**ctx)
    data = None
    if body is not None:
        data = body if isinstance(body, (bytes, str)) else json.dumps(body)
        if isinstance(data, str):
            data = data.encode()
        headers.setdefault("Content-Type", "application/json")
    mode = req.get("mode", "full")
    for attempt in range(2):
        c = conn.get(fresh=(mode == "first_byte") or attempt > 0)
        try:
            t0 = time.perf_counter()
            c.request(method, path, body=data, headers=headers)
            r = c.getresponse()
            if mode == "first_byte":
                first = r.read(1)
                t = time.perf_counter() - t0
                conn.close()
                return t, r.status, len(first), len(first), None, dict(r.getheaders())
            raw = r.read()
            t = time.perf_counter() - t0
            enc = (r.getheader("Content-Encoding") or "").lower()
            dec = decode(raw, enc)
            js = None
            if req.get("extract") or req.get("count"):
                try:
                    js = json.loads(dec)
                except Exception:
                    js = None
            return t, r.status, len(raw), len(dec), js, dict(r.getheaders())
        except (http.client.RemoteDisconnected, ConnectionResetError, BrokenPipeError):
            conn.close()
            if attempt:
                raise
    raise RuntimeError("unreachable")


def dig(js, path):
    cur = js
    for part in path.split("."):
        if isinstance(cur, list):
            cur = cur[int(part)]
        else:
            cur = cur[part]
    return cur


def count_path(js, path):
    """Length of the array at a dotted path; '[]' maps over a list and sums
    ("[].entities" = entities across every shelf). A number at the path is returned
    as is (e.g. a `total` field)."""
    def walk(cur, parts):
        if not parts:
            if isinstance(cur, list):
                return len(cur)
            if isinstance(cur, (int, float)) and not isinstance(cur, bool):
                return cur
            return 0 if cur is None else 1
        head, rest = parts[0], parts[1:]
        if head == "[]":
            return sum(walk(x, rest) for x in (cur or []))
        if isinstance(cur, dict):
            return walk(cur.get(head), rest)
        return 0
    return walk(js, [p for p in path.split(".") if p])


def counts_of(req, js):
    if not req.get("count") or js is None:
        return None
    return {p: count_path(js, p) for p in req["count"]}


def run_flow(conn, steps):
    """Run a multi-step flow (e.g. POST play then GET the first audio byte). Values
    extracted from earlier JSON responses fill {placeholders} in later paths."""
    ctx = {}
    total = 0.0
    per = []
    wire = dec = 0
    status = []
    counts = {}
    for st in steps:
        t, s, w, d, js, _ = one(conn, st, ctx)
        for k, v in (counts_of(st, js) or {}).items():
            counts[k] = counts.get(k, 0) + v
        total += t
        per.append(t)
        wire += w
        dec += d
        status.append(s)
        for key, jpath in (st.get("extract") or {}).items():
            v = dig(js, jpath)
            ctx[key] = urllib.parse.quote(str(v), safe="/:?=&%") if key.endswith("_url") else v
    return total, status, wire, dec, per, counts or None


def measure(base, req, warmup, n):
    conn = Conn(base)
    times, statuses, wires, decs, steps_t = [], {}, [], [], []
    for i in range(warmup + n):
        if req.get("steps"):
            t, s, w, d, per, cnt = run_flow(conn, req["steps"])
            s = ",".join(str(x) for x in s)
        else:
            t, s, w, d, js, _ = one(conn, req)
            per, cnt = None, counts_of(req, js)
        if i >= warmup:
            times.append(t)
            statuses[str(s)] = statuses.get(str(s), 0) + 1
            wires.append(w)
            decs.append(d)
            if per:
                steps_t.append(per)
    conn.close()
    out = {"name": req["name"], **stats_ms(times), "status": statuses,
           "wire_bytes_median": int(statistics.median(wires)), "decoded_bytes_median": int(statistics.median(decs)),
           "samples_ms": [round(t * 1000, 3) for t in times], "result_counts": cnt}
    if steps_t:
        out["step_p50_ms"] = [round(pct([s[i] for s in steps_t], 50) * 1000, 2) for i in range(len(steps_t[0]))]
    return out


def _conc_worker(a):
    base, req, start_at, until, interval, idx, clients = a
    # stagger paced clients across the interval so they don't fire in lockstep
    nxt = start_at + (interval * idx / clients if interval else 0)
    time.sleep(max(0.0, nxt - time.time()))  # all workers start together
    conn = Conn(base)
    local, codes = [], {}
    while time.time() < until:
        if interval:
            nxt += interval
        try:
            t, s, *_ = one(conn, req)
            codes[str(s)] = codes.get(str(s), 0) + 1
            if s == 200:
                local.append(t)
        except Exception as ex:
            codes[type(ex).__name__] = codes.get(type(ex).__name__, 0) + 1
            conn.close()
        if interval:
            time.sleep(max(0.0, nxt - time.time()))
    conn.close()
    return local, codes


def concurrency(base, req, clients, seconds, interval=0.0):
    """`clients` separate processes (not threads: the GIL would cap a fast server),
    each with its own keep-alive connection, loop on the request until a shared
    deadline: back to back (interval 0, closed loop: saturation) or one request
    every `interval` seconds per client (a steady offered load)."""
    import multiprocessing as mp
    ctx = mp.get_context("spawn")
    with ctx.Pool(clients) as pool:
        start_at = time.time() + 3.0  # time for the workers to spawn
        parts = pool.map(_conc_worker, [(base, req, start_at, start_at + seconds, interval, i, clients) for i in range(clients)])
        wall = float(seconds)
    lat = [t for p in parts for t in p[0]]
    codes = {}
    for p in parts:
        for k, v in p[1].items():
            codes[k] = codes.get(k, 0) + v
    errs = [sum(v for k, v in codes.items() if k != "200")]
    res = {"name": req["name"], "clients": clients, "seconds": seconds, "interval_s": interval, "wall_s": round(wall, 2),
           "requests_ok": len(lat), "errors": errs[0], "status": codes, "req_per_s": round(len(lat) / wall, 1),
           "offered_req_per_s": round(clients / interval, 1) if interval else None}
    if lat:
        res.update(stats_ms(lat))
    return res


def main():
    args = sys.argv[1:]
    spec_path, out_path = args[0], args[1]

    def opt(name, d):
        return type(d)(args[args.index(name) + 1]) if name in args else d

    warmup, n = opt("--warmup", 5), opt("--n", 100)
    cc, cs = opt("--conc-clients", 20), opt("--conc-seconds", 20)
    PACE[0] = opt("--pace-ms", 25) / 1000.0
    paced_interval = opt("--conc-interval-ms", 500) / 1000.0
    spec = json.load(open(spec_path))
    base = spec["base"]
    res = {"base": base, "warmup": warmup, "n": n, "started": time.time(), "results": []}
    if spec.get("cold_covers"):
        # First request for each of N distinct covers (nothing cached server side yet:
        # both servers resize on first request and keep the result on disk).
        conn = Conn(base)
        ts, sizes, st = [], [], {}
        for req in spec["cold_covers"]:
            t, s, w, d, _, _ = one(conn, req)
            ts.append(t)
            sizes.append(d)
            st[str(s)] = st.get(str(s), 0) + 1
        conn.close()
        r = {"name": "cover_first_request", "group": "cover", "primary": True, **stats_ms(ts), "status": st,
             "decoded_bytes_median": int(statistics.median(sizes)), "wire_bytes_median": int(statistics.median(sizes)),
             "endpoint": f"first request of {len(ts)} distinct covers (same URL form as cover_grid)",
             "samples_ms": [round(t * 1000, 3) for t in ts]}
        res["results"].append(r)
        print(f'  {"cover_first_request":<28} p50 {r["p50_ms"]} ms  p95 {r["p95_ms"]} ms  n {len(ts)}  status {st}', flush=True)
    for req in spec["requests"]:
        try:
            r = measure(base, req, warmup, n)
        except Exception as e:  # report, never hide
            r = {"name": req["name"], "error": repr(e)}
        r["endpoint"] = req.get("describe") or f'{req.get("method", "GET")} {req.get("path")}'
        r["group"], r["primary"] = req.get("group"), bool(req.get("primary"))
        res["results"].append(r)
        print(f'  {req["name"]:<28} p50 {r.get("p50_ms")} ms  p95 {r.get("p95_ms")} ms  bytes {r.get("decoded_bytes_median")}  status {r.get("status") or r.get("error")}  counts {r.get("result_counts")}', flush=True)
    res["pace_ms"] = PACE[0] * 1000
    if spec.get("concurrency") and cc > 0:
        PACE[0] = 0.0  # pacing is per process; the concurrency workers use their own schedule
        time.sleep(5)  # let any per-client rate limit bucket refill
        r = concurrency(base, spec["concurrency"], cc, cs, paced_interval)
        r["endpoint"] = f'GET {spec["concurrency"]["path"]}'
        res["concurrency_paced"] = r
        print(f'  concurrency paced {cc} clients x 1 req/{paced_interval}s for {cs}s: {r.get("req_per_s")} req/s  p50 {r.get("p50_ms")} p95 {r.get("p95_ms")} ms  status {r.get("status")}', flush=True)
        time.sleep(5)
        r = concurrency(base, spec["concurrency"], cc, cs)
        r["endpoint"] = f'GET {spec["concurrency"]["path"]}'
        res["concurrency"] = r
        print(f'  concurrency saturating {cc}x{cs}s: {r.get("req_per_s")} req/s ok  p95 {r.get("p95_ms")} ms  status {r.get("status")}', flush=True)
    json.dump(res, open(out_path, "w"), indent=1)


if __name__ == "__main__":
    main()
