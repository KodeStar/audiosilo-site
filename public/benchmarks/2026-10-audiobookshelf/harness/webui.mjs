#!/usr/bin/env node
// Web UI timing for one app's own web client (Playwright + Chromium, from the Mac).
//
//   node webui.mjs <session.json> <out.json> [--runs 5] [--shots DIR] [--probe]
//
// session.json (written by bench.py): {app, base, pages:{home,grid}, localStorage,
// cookies, coverSelector, gridItemsPattern, coverPattern}.
//
// For each page (home, grid) and each cache state:
//   cold: a fresh browser context per run (empty HTTP cache, no service worker),
//   warm: one context, the page loaded once unmeasured, then N measured loads.
// The app is signed in before it boots by writing what its web client stores
// (localStorage, plus ABS's refresh cookie) in an init script. Requests to any
// origin other than the app's are blocked and listed (ABS's web client checks
// GitHub for releases; nothing is allowed to leave the LAN in either test).
//
// Per load, times are ms from just before page.goto():
//   firstCover: the first cover <img> inside the viewport that has finished
//               loading (complete && naturalWidth > 0)
//   screenCovers: the time the last cover inside the viewport finished loading,
//               once every visible cover is loaded and nothing changed for 1.5 s
//   lcp: Chrome's largest-contentful-paint; dcl/load: the document's events
// plus requests, transferred bytes (CDP encodedDataLength, so what crossed the
// wire, compressed; 0 for cache hits), JS bytes, cache hits.
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';

async function loadPlaywright() {
  const candidates = [
    process.env.PLAYWRIGHT_MODULE,
    new URL('./node_modules/playwright/index.mjs', import.meta.url).pathname,
    `${process.env.HOME}/dev/audiosilo/audiosilo-docs/screenshots/node_modules/playwright/index.mjs`,
  ].filter(Boolean);
  for (const c of candidates) {
    try {
      return await import(c);
    } catch {}
  }
  throw new Error('playwright not found: run `npm i playwright@1.61.1 && npx playwright install chromium` in the harness dir, or set PLAYWRIGHT_MODULE');
}
const {chromium} = await loadPlaywright();

const argv = process.argv.slice(2);
const opt = (n, d) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : d);
const [sessPath, outPath] = argv;
const RUNS = Number(opt('runs', 5));
const SHOTS = opt('shots', null);
const PROBE = argv.includes('--probe');
const VIEWPORT = {width: 1440, height: 900};
const sess = JSON.parse(await readFile(sessPath, 'utf8'));
const origin = new URL(sess.base).origin;
if (SHOTS) await mkdir(SHOTS, {recursive: true});

// Every host but the app's resolves to nothing, so no request leaves the LAN. (Not
// page.route(): Playwright turns the HTTP cache off while routing is on, which
// would make the warm runs meaningless.)
const browser = await chromium.launch({headless: true, args: [`--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE ${new URL(sess.base).hostname}`]});

async function newContext() {
  const ctx = await browser.newContext({viewport: VIEWPORT, deviceScaleFactor: 1, serviceWorkers: 'allow'});
  await ctx.addInitScript(
    ({storage, origin, sel}) => {
      if (location.origin === origin) for (const [k, v] of Object.entries(storage)) localStorage.setItem(k, v);
      // Cover watcher: polls every animation frame + 50 ms timer, in epoch ms.
      const st = (window.__bench = {firstCover: null, lastChange: null, visible: 0, loaded: 0, lcp: null, sig: ''});
      try {
        new PerformanceObserver((l) => {
          for (const e of l.getEntries()) st.lcp = performance.timeOrigin + e.startTime;
        }).observe({type: 'largest-contentful-paint', buffered: true});
      } catch {}
      const tick = () => {
        const imgs = document.querySelectorAll(sel);
        let vis = 0, ok = 0;
        for (const im of imgs) {
          const r = im.getBoundingClientRect();
          if (r.width < 8 || r.height < 8 || r.bottom <= 0 || r.right <= 0 || r.top >= innerHeight || r.left >= innerWidth) continue;
          vis++;
          if (im.complete && im.naturalWidth > 0) ok++;
        }
        const now = Date.now();
        if (ok > 0 && st.firstCover === null) st.firstCover = now;
        const sig = `${vis}/${ok}`;
        if (sig !== st.sig) {
          st.sig = sig;
          st.lastChange = now;
        }
        st.visible = vis;
        st.loaded = ok;
      };
      setInterval(tick, 50);
      const raf = () => {
        tick();
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
    },
    {storage: sess.localStorage, origin, sel: sess.coverSelector},
  );
  const cookies = (sess.cookies || []).filter((c) => c.value);
  if (cookies.length) await ctx.addCookies(cookies);
  return ctx;
}

async function measure(ctx, pageName, shot) {
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Network.enable');
  const reqs = new Map();
  cdp.on('Network.requestWillBeSent', (e) => {
    if (!reqs.has(e.requestId)) reqs.set(e.requestId, {url: e.request.url, method: e.request.method, type: e.type, bytes: 0, cached: false, sw: false, status: null, wall: e.wallTime * 1000, ts: e.timestamp});
  });
  cdp.on('Network.requestServedFromCache', (e) => {
    const r = reqs.get(e.requestId);
    if (r) r.cached = true;
  });
  cdp.on('Network.responseReceived', (e) => {
    const r = reqs.get(e.requestId);
    if (!r) return;
    r.type = e.type || r.type;
    r.status = e.response.status;
    r.mime = e.response.mimeType;
    if (e.response.fromDiskCache || e.response.fromPrefetchCache) r.cached = true;
    if (e.response.fromServiceWorker) r.sw = true;
  });
  cdp.on('Network.loadingFinished', (e) => {
    const r = reqs.get(e.requestId);
    if (r) {
      r.bytes = e.encodedDataLength;
      r.dur = (e.timestamp - r.ts) * 1000;
    }
  });
  cdp.on('Network.loadingFailed', (e) => {
    const r = reqs.get(e.requestId);
    if (r) r.failed = e.errorText;
  });

  const url = origin + sess.pages[pageName];
  const t0 = Date.now();
  await page.goto(url, {waitUntil: 'commit', timeout: 60000});
  // wait for covers to settle: visible > 0, all visible loaded, unchanged 1.5 s
  let st = null;
  const deadline = Date.now() + 45000;
  while (Date.now() < deadline) {
    await page.waitForTimeout(100);
    try {
      st = await page.evaluate(() => ({...window.__bench}));
    } catch {
      continue; // navigation in progress (ABS goes through /login and back)
    }
    if (st.visible > 0 && st.loaded === st.visible && Date.now() - st.lastChange >= 1500) break;
  }
  const nav = await page.evaluate(() => {
    const n = performance.getEntriesByType('navigation')[0];
    return n ? {dcl: performance.timeOrigin + n.domContentLoadedEventEnd, load: performance.timeOrigin + n.loadEventEnd, finalUrl: location.href} : {finalUrl: location.href};
  });
  await page.waitForTimeout(300);
  if (shot) await page.screenshot({path: shot});
  const list = [...reqs.values()];
  const rel = (x) => (x ? x - t0 : null);
  const settled = st && st.visible > 0 && st.loaded === st.visible;
  const res = {
    page: pageName,
    url: sess.pages[pageName],
    finalUrl: nav.finalUrl,
    firstCover_ms: rel(st?.firstCover),
    screenCovers_ms: settled ? rel(st.lastChange) : null,
    settled,
    visibleCovers: st?.visible,
    loadedCovers: st?.loaded,
    lcp_ms: rel(st?.lcp),
    dcl_ms: rel(nav.dcl),
    load_ms: rel(nav.load),
    requests: list.length,
    requests_network: list.filter((r) => !r.cached && !r.sw).length,
    cache_hits: list.filter((r) => r.cached || r.sw).length,
    bytes: list.reduce((a, r) => a + (r.bytes || 0), 0),
    js_bytes: list.filter((r) => r.type === 'Script').reduce((a, r) => a + (r.bytes || 0), 0),
    js_requests: list.filter((r) => r.type === 'Script').length,
    image_bytes: list.filter((r) => r.type === 'Image').reduce((a, r) => a + (r.bytes || 0), 0),
    image_requests: list.filter((r) => r.type === 'Image').length,
    api_requests: list.filter((r) => /\/api\//.test(r.url) && r.type !== 'Image').length,
    failed: list.filter((r) => /^https?:/.test(r.url) && new URL(r.url).origin === origin).filter((r) => r.failed || (r.status && r.status >= 400)).map((r) => `${r.status || r.failed} ${r.url.replace(/token=[^&]+/, 'token=...')}`),
    blocked: list.filter((r) => /^https?:/.test(r.url) && new URL(r.url).origin !== origin).map((r) => r.url),
    request_log: list.map((r) => ({u: r.url.replace(/token=[^&]+/, 'token=...').replace(origin, ''), t: r.type, s: r.status, b: r.bytes, c: r.cached || r.sw,
      start_ms: Math.round(r.wall - t0), dur_ms: r.dur != null ? Math.round(r.dur) : null})),
    shot,
  };
  await page.close();
  return res;
}

const median = (xs) => {
  const s = xs.filter((x) => typeof x === 'number').sort((a, b) => a - b);
  if (!s.length) return null;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const METRICS = ['firstCover_ms', 'screenCovers_ms', 'lcp_ms', 'dcl_ms', 'load_ms', 'requests', 'requests_network', 'bytes', 'js_bytes', 'js_requests', 'image_bytes', 'image_requests', 'api_requests', 'visibleCovers'];
const summarize = (runs) => Object.fromEntries(METRICS.map((m) => [m, median(runs.map((r) => r[m]))]));

if (PROBE) {
  const ctx = await newContext();
  const page = await ctx.newPage();
  const seen = [];
  page.on('request', (r) => seen.push(r.url()));
  await page.goto(origin + sess.pages.grid, {waitUntil: 'commit'});
  for (let i = 0; i < 100; i++) {
    await page.waitForTimeout(200);
    if (seen.some((u) => u.includes(sess.gridItemsPattern)) && seen.some((u) => u.includes(sess.coverPattern))) break;
  }
  await page.waitForTimeout(1000);
  const strip = (u) => u && u.replace(/token=[^&]+/, 'token=...');
  const out = {
    gridRequest: seen.find((u) => u.includes(sess.gridItemsPattern)) || null,
    gridRequests: seen.filter((u) => u.includes(sess.gridItemsPattern)).map(strip),
    firstCoverRequest: strip(seen.find((u) => u.includes(sess.coverPattern))),
    viewport: VIEWPORT,
  };
  await writeFile(outPath, JSON.stringify(out, null, 1));
  console.log(JSON.stringify({grid: strip(out.gridRequest), cover: out.firstCoverRequest}));
  await browser.close();
  process.exit(0);
}

const result = {app: sess.app, viewport: VIEWPORT, dpr: 1, runs: RUNS, browser: browser.version(), pages: {}};
for (const pageName of ['home', 'grid']) {
  const cold = [];
  for (let i = 0; i < RUNS; i++) {
    const ctx = await newContext();
    const shot = SHOTS && i === 0 ? path.join(SHOTS, `${sess.app}-${pageName}-cold.png`) : null;
    cold.push(await measure(ctx, pageName, shot));
    await ctx.close();
  }
  const warm = [];
  const ctx = await newContext();
  await measure(ctx, pageName, null); // prime: fills the HTTP cache (and service worker)
  for (let i = 0; i < RUNS; i++) {
    const shot = SHOTS && i === 0 ? path.join(SHOTS, `${sess.app}-${pageName}-warm.png`) : null;
    warm.push(await measure(ctx, pageName, shot));
  }
  await ctx.close();
  result.pages[pageName] = {cold: summarize(cold), warm: summarize(warm), cold_runs: cold, warm_runs: warm};
  const c = result.pages[pageName].cold, w = result.pages[pageName].warm;
  console.log(`  ${pageName}: cold first cover ${c.firstCover_ms} ms, screen ${c.screenCovers_ms} ms, ${c.requests} req, ${(c.bytes / 1024).toFixed(0)} KiB (JS ${(c.js_bytes / 1024).toFixed(0)} KiB) | warm first cover ${w.firstCover_ms} ms, screen ${w.screenCovers_ms} ms, ${(w.bytes / 1024).toFixed(0)} KiB`);
}
await browser.close();
await writeFile(outPath, JSON.stringify(result, null, 1));
