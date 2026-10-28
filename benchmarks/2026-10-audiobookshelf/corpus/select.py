import json, re
c = json.load(open("catalog.json"))
def ia(b):
    m = re.search(r"archive.org/compress/([^/]+)/", b.get("url_zip_file") or "")
    return m and m.group(1)
def clean(s):
    s = re.sub(r'[/\\:*?"<>|]', "-", s).strip().rstrip(". ")
    return re.sub(r"\s+", " ", s)[:150]
def author(b):
    a = b.get("authors") or []
    if not a: return "Unknown"
    x = a[0]
    if (x.get("last_name") or "").lower() == "various": return "Various"
    return clean(f"{x.get('first_name','')} {x.get('last_name','')}".strip()) or "Unknown"
en = sorted((b for b in c if b.get("language") == "English" and ia(b) and int(b.get("totaltimesecs") or 0) > 0), key=lambda b: int(b["id"]))
seen, out = set(), []
for b in en:
    t = clean(re.sub(r"\s*\((version|v\.?)\s*\d+[^)]*\)\s*$", "", b["title"], flags=re.I))
    a = author(b)
    k = (a.lower(), t.lower())
    if not t or k in seen: continue
    seen.add(k)
    mode = "m4b" if len(out) % 3 == 2 else "mp3"
    out.append(f"{ia(b)}|{a}/{t}|{mode}|{b['id']}|{b['totaltimesecs']}")
    if len(out) == 5000: break
open("map.txt", "w").write("\n".join(out) + "\n")
print(len(out), "books", round(sum(int(l.split("|")[4]) for l in out) / 3600), "hours")
