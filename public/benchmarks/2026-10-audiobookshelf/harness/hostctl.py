"""Host-side control over SSH: containers, page cache, cgroup readings, disk usage.

Every command runs on the benchmark host (BENCH_HOST, default root@192.168.0.10).
Only the harness's own containers (bench-abs, bench-as) and its own data dir
(BENCH_DATA, default /mnt/cache/appdata/bench) are ever touched.
"""
import os
import shlex
import subprocess
import threading
import time

HOST = os.environ.get("BENCH_HOST", "root@192.168.0.10")
DATA = os.environ.get("BENCH_DATA", "/mnt/cache/appdata/bench")
LIBRARY = os.environ.get("BENCH_LIBRARY", "/mnt/user/librivox/books")
OWN = ("bench-abs", "bench-as")
SSH = ["ssh", "-o", "BatchMode=yes", "-o", "ConnectTimeout=10", "-o", "ServerAliveInterval=15", HOST]


def sh(cmd, check=True, timeout=600):
    """Run a shell command on the host; return stdout (str)."""
    p = subprocess.run(SSH + [cmd], capture_output=True, text=True, timeout=timeout)
    if check and p.returncode != 0:
        raise RuntimeError(f"host command failed ({p.returncode}): {cmd}\n{p.stderr.strip()}")
    return p.stdout


def _own(name):
    if name not in OWN:
        raise ValueError(f"refusing to touch container {name!r}: not one of {OWN}")


def drop_caches():
    sh("sync; echo 3 > /proc/sys/vm/drop_caches")


def loadavg():
    a = sh("cat /proc/loadavg").split()
    return {"load1": float(a[0]), "load5": float(a[1]), "load15": float(a[2]), "procs": a[3]}


def host_info():
    out = sh("uname -r; nproc; grep MemTotal /proc/meminfo; grep -m1 'model name' /proc/cpuinfo; docker version --format '{{.Server.Version}}'")
    lines = out.strip().splitlines()
    return {"kernel": lines[0], "cpus": int(lines[1]), "memtotal": lines[2].split(":", 1)[1].strip(),
            "cpu_model": lines[3].split(":", 1)[1].strip(), "docker": lines[4]}


def other_containers():
    return sh("docker ps --format '{{.Names}}'").split()


def rm_container(name):
    _own(name)
    sh(f"docker rm -f {name} >/dev/null 2>&1 || true")


def stop_container(name):
    _own(name)
    sh(f"docker stop -t 30 {name} >/dev/null 2>&1 || true")


def wipe_data(app):
    """Delete the app's bench data dir (only under DATA)."""
    assert app in ("abs", "as")
    base = DATA.rstrip("/")
    assert base.startswith("/") and base.count("/") >= 2, f"refusing to wipe under BENCH_DATA={DATA!r}"
    d = f"{base}/{app}"
    sh(f"rm -rf {shlex.quote(d)} && mkdir -p {shlex.quote(d)}")


def run_container(name, image, port_map, volumes, env=None, extra=""):
    _own(name)
    rm_container(name)
    v = " ".join(f"-v {shlex.quote(a)}:{shlex.quote(b)}" for a, b in volumes)
    e = " ".join(f"-e {shlex.quote(k)}={shlex.quote(str(val))}" for k, val in (env or {}).items())
    p = " ".join(f"-p {h}:{c}" for h, c in port_map)
    return sh(f"docker run -d --name {name} {p} {v} {e} {extra} {shlex.quote(image)}").strip()


def start_container_timed(name, probe_cmd, timeout=180):
    """Drop caches, `docker start`, then poll probe_cmd (a shell command run on the
    host) every 50 ms until it succeeds. Times are taken on the host with
    date +%s%N so there is no clock skew. Returns seconds (float)."""
    _own(name)
    script = f"""
sync; echo 3 > /proc/sys/vm/drop_caches
t0=$(date +%s%N)
docker start {name} >/dev/null
t1=$(date +%s%N)
deadline=$(( t0 + {timeout} * 1000000000 ))
while :; do
  if {probe_cmd} >/dev/null 2>&1; then break; fi
  now=$(date +%s%N); if [ $now -gt $deadline ]; then echo TIMEOUT; exit 1; fi
  sleep 0.05
done
t2=$(date +%s%N)
echo $t0 $t1 $t2
"""
    out = sh(script, timeout=timeout + 30).strip().split()
    t0, t1, t2 = (int(x) for x in out)
    return {"docker_start_s": (t1 - t0) / 1e9, "first_ok_s": (t2 - t0) / 1e9}


def container_id(name):
    _own(name)
    return sh(f"docker inspect -f '{{{{.Id}}}}' {name}").strip()


def cgroup_dir(name):
    return f"/sys/fs/cgroup/docker/{container_id(name)}"


def mem_snapshot(name):
    """memory.current, memory.peak, memory.stat (anon/file/...), summed VmRSS of the
    container's processes, and docker stats' MEM USAGE string."""
    cg = cgroup_dir(name)
    out = sh(f"""cd {cg}; echo current $(cat memory.current); echo peak $(cat memory.peak 2>/dev/null || echo -1)
grep -E '^(anon|file|kernel|shmem|file_mapped|inactive_file|active_file|sock) ' memory.stat
r=0; for p in $(cat cgroup.procs); do v=$(awk '/^VmRSS/{{print $2}}' /proc/$p/status 2>/dev/null); r=$((r + ${{v:-0}})); done; echo rss_kb $r
echo pids $(cat pids.current)
echo dstats "$(docker stats --no-stream --format '{{{{.MemUsage}}}}|{{{{.CPUPerc}}}}' {name})" """)
    res = {}
    for line in out.strip().splitlines():
        k, v = line.split(" ", 1)
        res[k] = v.strip() if k == "dstats" else int(v)
    # docker stats (cgroup v2) reports usage - inactive_file
    res["docker_mem_usage_bytes"] = res["current"] - res.get("inactive_file", 0)
    return res


def cpu_usec(name):
    out = sh(f"grep -E '^(usage|user|system)_usec' {cgroup_dir(name)}/cpu.stat")
    return {k: int(v) for k, v in (l.split() for l in out.strip().splitlines())}


class MemSampler:
    """Samples a container's cgroup memory every `interval` s from a long-lived ssh
    session (one awk-free shell loop on the host), so we get a true peak of anon
    memory (the app's own heap) separate from page cache that the scan's file reads
    charge to the same cgroup."""

    def __init__(self, name, interval=0.5):
        self.cg = cgroup_dir(name)
        self.interval = interval
        self.samples = []
        self.proc = None
        self.thread = None

    def start(self):
        loop = (f"cd {self.cg}; while :; do t=$(date +%s%N); c=$(cat memory.current); "
                f"a=$(grep -m1 '^anon ' memory.stat); i=$(grep -m1 '^inactive_file ' memory.stat); "
                f"u=$(grep -m1 '^usage_usec' cpu.stat); echo $t $c ${{a#anon }} ${{i#inactive_file }} ${{u#usage_usec }}; "
                f"sleep {self.interval}; done")
        self.proc = subprocess.Popen(SSH + [loop], stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True)
        self.thread = threading.Thread(target=self._read, daemon=True)
        self.thread.start()
        time.sleep(0.3)

    def _read(self):
        for line in self.proc.stdout:
            p = line.split()
            if len(p) == 5:
                try:
                    t, cur, anon, inact, usage = (int(x) for x in p)
                except ValueError:
                    continue
                self.samples.append({"t_ns": t, "current": cur, "anon": anon, "usage_minus_inactive": cur - inact, "cpu_usec": usage})

    def stop(self):
        if self.proc:
            self.proc.terminate()
            try:
                self.proc.wait(5)
            except subprocess.TimeoutExpired:
                self.proc.kill()
        if self.thread:
            self.thread.join(2)
        return self.summary()

    def summary(self):
        s = self.samples
        if not s:
            return {"n": 0}
        return {"n": len(s), "interval_s": self.interval,
                "peak_anon": max(x["anon"] for x in s),
                "peak_current": max(x["current"] for x in s),
                "peak_docker_usage": max(x["usage_minus_inactive"] for x in s)}


def du_breakdown(app):
    """Data dir size after a scan, broken down two levels deep (bytes, apparent=no)."""
    d = shlex.quote(f"{DATA}/{app}")

    def parse(out):
        res = {}
        for l in out.strip().splitlines():
            size, path = l.split(None, 1)
            res[path] = int(size)
        return res

    dirs = parse(sh(f"cd {d} && du -b --max-depth=2 . | sort -k2"))
    files = parse(sh(f"cd {d} && find . -maxdepth 2 -type f -printf '%s %p\\n' | sort -k2"))
    n_files = int(sh(f"find {d} -type f | wc -l").strip())
    return {"total_bytes": dirs.get(".", 0), "file_count": n_files, "du_dirs": dirs, "top_files": files}


def logs(name, since=None, tail=None):
    _own(name)
    a = f"--since {since}" if since else ""
    t = f"--tail {tail}" if tail else ""
    return sh(f"docker logs {a} {t} {name} 2>&1")


def image_info(image):
    out = sh(f"docker image inspect --format '{{{{json .RepoDigests}}}}|{{{{.Size}}}}|{{{{.Id}}}}|{{{{json .Config.Labels}}}}' {shlex.quote(image)}")
    import json
    digests, size, iid, labels = out.strip().split("|", 3)
    return {"repo_digests": json.loads(digests), "uncompressed_bytes": int(size), "image_id": iid, "labels": json.loads(labels)}


def pull(image):
    sh(f"docker pull -q {shlex.quote(image)}", timeout=900)
