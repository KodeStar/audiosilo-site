import json, urllib.request, sys
out=[]; off=0
while True:
    url=f"https://librivox.org/api/feed/audiobooks?format=json&limit=500&offset={off}"
    try:
        d=json.loads(urllib.request.urlopen(urllib.request.Request(url,headers={"User-Agent":"curl/8"}),timeout=120).read())
    except Exception as e:
        print("stop",off,e,file=sys.stderr); break
    b=d.get("books") or []
    if not b: break
    out+=b; off+=500; print(off,len(out),file=sys.stderr)
json.dump(out,open("catalog.json","w"))
