#!/usr/bin/env python3
"""LibriVox benchmark corpus fetcher (parallel variant of demo-fetch.py).
Usage: fetch.py MAP STAGING LIBRARY COUNT WORKERS
MAP lines: <archive.org id>|<Author/Title>|<mp3|m4b>|<librivox id>|<secs>.
Idempotent: books already in LIBRARY are skipped; each finished book is moved in with one rename."""
import json, os, re, shutil, subprocess, sys, time, urllib.parse, urllib.request
from concurrent.futures import ThreadPoolExecutor
UA = {"User-Agent": "curl/8.5.0 (audiosilo benchmark corpus; kode@audiosilo.app)"}

FILE_WORKERS = 4

def get(url, dest=None, tries=4):
    for n in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=180) as r:
                if dest is None:
                    return r.read()
                tmp = dest + ".part"
                with open(tmp, "wb") as f:
                    shutil.copyfileobj(r, f, 1 << 20)
                os.replace(tmp, dest)
                return None
        except Exception as e:  # noqa: BLE001
            print(f"    retry {n + 1}: {url}: {e}", flush=True)
            time.sleep(5 * (n + 1))
    raise RuntimeError(f"failed: {url}")

def track_key(f):
    t = str(f.get("track", "")).split("/")[0]
    return (0, int(t), f.get("name", "")) if t.isdigit() else (1, 0, f.get("name", ""))

def pick(files, mode):
    if mode == "m4b":
        m4b = [f for f in files if f.get("name", "").lower().endswith(".m4b")]
        for rate in ("64kb", "48kb", "32kb", ""):
            sel = [f for f in m4b if rate in f["name"].lower()]
            if sel:
                return sorted(sel, key=lambda f: f["name"]), "m4b"
    mp3 = [f for f in files if f.get("format") == "64Kbps MP3"] or [f for f in files if f.get("name", "").lower().endswith(".mp3")]
    return sorted(mp3, key=track_key), "mp3"

def book(line, staging, library):
    ia, rel, mode = line.split("|")[:3]
    final = os.path.join(library, rel)
    if os.path.isdir(final):
        return
    try:
        meta = json.loads(get(f"https://archive.org/metadata/{ia}"))
        files, got = pick(meta.get("files", []), mode)
        if not files:
            print(f"!! no audio: {ia}", flush=True)
            return
        work = os.path.join(staging, rel)
        os.makedirs(work, exist_ok=True)
        plan = []
        for i, f in enumerate(files, 1):
            name = os.path.basename(f["name"])
            out = name if got == "m4b" and len(files) == 1 else f"{i:03d} - {name}"
            dest = os.path.join(work, out)
            if not (os.path.exists(dest) and os.path.getsize(dest) == int(f.get("size", -1))):
                plan.append((f, out, dest))
        if plan:
            lst = os.path.join(work, ".aria2.list")
            with open(lst, "w") as fh:
                for f, out, _ in plan:
                    fh.write(f"https://archive.org/download/{ia}/{urllib.parse.quote(f['name'])}\n out={out}\n")
            subprocess.run(["aria2c", "-q", "-j4", "-x8", "-s8", "-k2M", "--file-allocation=none", "--auto-file-renaming=false",
                            "--allow-overwrite=true", "--max-tries=5", "--retry-wait=5", "--timeout=60", "-d", work, "-i", lst], timeout=7200)
            os.remove(lst)
            for f, out, dest in plan:  # HTTP fallback for anything aria2 missed
                if not (os.path.exists(dest) and os.path.getsize(dest) == int(f.get("size", -1))):
                    get(f"https://archive.org/download/{ia}/{urllib.parse.quote(f['name'])}", dest)
            for p in os.listdir(work):
                if p.endswith(".aria2"):
                    os.remove(os.path.join(work, p))
        cover = os.path.join(work, "cover.jpg")
        if not os.path.exists(cover):
            try:
                get(f"https://archive.org/services/img/{ia}", cover)
            except RuntimeError:
                pass
        os.makedirs(os.path.dirname(final), exist_ok=True)
        os.rename(work, final)
        print(f"done {got} {len(files):3d} {rel}", flush=True)
    except Exception as e:  # noqa: BLE001
        print(f"!! FAILED {ia} {rel}: {e}", flush=True)

def main(mapfile, staging, library, count, workers):
    lines = [l.strip() for l in open(mapfile, encoding="utf-8") if l.strip()][: int(count)]
    with ThreadPoolExecutor(int(workers)) as ex:
        list(ex.map(lambda l: book(l, staging, library), lines))
    print("ALL DONE", sum(1 for _ in os.scandir(library)), "authors", flush=True)

if __name__ == "__main__":
    main(*sys.argv[1:6])
