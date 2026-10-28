#!/usr/bin/env node
// Admin "health" page timing (Playwright + Chromium, from the Mac).
//
//   node admin.mjs <session.json> <out.json> [--runs 5] [--shots DIR]
//
// session.json (written by bench.py): {app, base, pages:{name: path}, localStorage,
// cookies, readyText:{name: regex source}}.
//
// For each page, cold (fresh context per run) and warm (one context, primed once):
//   ready_ms:  the page's text matches readyText (its data has rendered) AND no same-origin API request
//              is in flight; the time is the later of the selector appearing and the
//              last API response before the network went quiet for 1.5 s
//   api_ms:    the end of the last API response (ms from navigation start)
//   plus requests, transferred bytes, and the list of API requests with durations.
// Long-lived streams (EventSource, WebSocket) are listed but never waited for.
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
  throw new Error('playwright not found (see webui.mjs)');
}
const {chromium} = await loadPlaywright();

const argv = process.argv.slice(2);
const opt = (n, d) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : d);
const [sessPath, outPath] = argv;
const RUNS = Number(opt('runs', 5));
const SHOTS = opt('shots', null);
const VIEWPORT = {width: 1440, height: 900};
const sess = JSON.parse(await readFile(sessPath, 'utf8'));
const origin = new URL(sess.base).origin;
if (SHOTS) await mkdir(SHOTS, {recursive: true});
const browser = await chromium.launch({headless: true, args: [`--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE ${new URL(sess.base).hostname}`]});

async function newContext() {
  const ctx = await browser.newContext({viewport: VIEWPORT, deviceScaleFactor: 1, serviceWorkers: 'allow'});
  await ctx.addInitScript(
    ({storage, origin}) => {
      if (location.origin === origin) for (const [k, v] of Object.entries(storage)) localStorage.setItem(k, v);
      // Ready watcher: the first time the page's text matches window.__readyRe (set
      // per load), checked every animation frame and every 50 ms, in epoch ms.
      const st = (window.__ready = {at: null});
      const tick = () => {
        if (st.at === null && window.__readyRe && document.body && new RegExp(window.__readyRe).test(document.body.innerText)) st.at = Date.now();
      };
      setInterval(tick, 50);
      const raf = () => {
        tick();
        if (st.at === null) requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
    },
    {storage: sess.localStorage, origin},
  );
  const cookies = (sess.cookies || []).filter((c) => c.value);
  if (cookies.length) await ctx.addCookies(cookies);
  return ctx;
}

const STREAM = new Set(['EventSource', 'WebSocket']);
const isApi = (r) => /\/api\//.test(r.url) && r.type !== 'Image' && !STREAM.has(r.type) && new URL(r.url).origin === origin;

async function measure(ctx, pageName, shot) {
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Network.enable');
  const reqs = new Map();
  cdp.on('Network.requestWillBeSent', (e) => {
    if (!reqs.has(e.requestId)) reqs.set(e.requestId, {url: e.request.url, method: e.request.method, type: e.type, bytes: 0, cached: false, status: null, wall: e.wallTime * 1000, ts: e.timestamp, done: false});
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
    if (e.response.fromDiskCache || e.response.fromServiceWorker) r.cached = true;
  });
  cdp.on('Network.loadingFinished', (e) => {
    const r = reqs.get(e.requestId);
    if (r) {
      r.bytes = e.encodedDataLength;
      r.dur = (e.timestamp - r.ts) * 1000;
      r.end = r.wall + r.dur;
      r.done = true;
    }
  });
  cdp.on('Network.loadingFailed', (e) => {
    const r = reqs.get(e.requestId);
    if (r) {
      r.failed = e.errorText;
      r.done = true;
      r.end = Date.now();
    }
  });
  const sel = sess.readyText[pageName];
  await page.addInitScript((re) => (window.__readyRe = re), sel);
  const t0 = Date.now();
  await page.goto(origin + sess.pages[pageName], {waitUntil: 'commit', timeout: 60000});
  let selAt = null;
  const deadline = Date.now() + 60000;
  let lastActivity = Date.now();
  let seen = 0;
  while (Date.now() < deadline) {
    await page.waitForTimeout(50);
    if (selAt === null) {
      try {
        selAt = await page.evaluate(() => window.__ready && window.__ready.at);
      } catch {}
    }
    const api = [...reqs.values()].filter(isApi);
    const inflight = api.some((r) => !r.done);
    if (api.length !== seen || inflight) {
      seen = api.length;
      lastActivity = Date.now();
    }
    if (selAt && !inflight && Date.now() - lastActivity >= 1500) break;
  }
  const list = [...reqs.values()];
  const api = list.filter(isApi);
  const apiEnd = api.length ? Math.max(...api.map((r) => r.end || 0)) : null;
  await page.waitForTimeout(200);
  if (shot) await page.screenshot({path: shot, fullPage: false});
  const strip = (u) => u.replace(/token=[^&]+/, 'token=...').replace(origin, '');
  const res = {
    page: pageName,
    url: sess.pages[pageName],
    finalUrl: page.url().replace(origin, ''),
    selector: sel,
    selector_ms: selAt ? selAt - t0 : null,
    api_ms: apiEnd ? Math.round(apiEnd - t0) : null,
    ready_ms: selAt ? Math.round(Math.max(selAt, apiEnd || 0) - t0) : null,
    requests: list.length,
    api_requests: api.length,
    bytes: list.reduce((a, r) => a + (r.bytes || 0), 0),
    api_bytes: api.reduce((a, r) => a + (r.bytes || 0), 0),
    streams: list.filter((r) => STREAM.has(r.type)).map((r) => strip(r.url)),
    failed: list.filter((r) => /^https?:/.test(r.url) && new URL(r.url).origin === origin && (r.failed || (r.status && r.status >= 400))).map((r) => `${r.status || r.failed} ${strip(r.url)}`),
    blocked: list.filter((r) => /^https?:/.test(r.url) && new URL(r.url).origin !== origin).map((r) => r.url),
    api_log: api.map((r) => ({m: r.method, u: strip(r.url), s: r.status, b: r.bytes, c: r.cached, start_ms: Math.round(r.wall - t0), dur_ms: r.dur != null ? Math.round(r.dur) : null})),
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
const METRICS = ['ready_ms', 'selector_ms', 'api_ms', 'requests', 'api_requests', 'bytes', 'api_bytes'];
const summarize = (runs) => Object.fromEntries(METRICS.map((m) => [m, median(runs.map((r) => r[m]))]));

const result = {app: sess.app, viewport: VIEWPORT, runs: RUNS, browser: browser.version(), pages: {}};
for (const pageName of Object.keys(sess.pages)) {
  const cold = [];
  for (let i = 0; i < RUNS; i++) {
    const ctx = await newContext();
    cold.push(await measure(ctx, pageName, SHOTS && i === 0 ? path.join(SHOTS, `${sess.app}-admin-${pageName}-cold.png`) : null));
    await ctx.close();
  }
  const ctx = await newContext();
  await measure(ctx, pageName, null);
  const warm = [];
  for (let i = 0; i < RUNS; i++) warm.push(await measure(ctx, pageName, SHOTS && i === 0 ? path.join(SHOTS, `${sess.app}-admin-${pageName}-warm.png`) : null));
  await ctx.close();
  result.pages[pageName] = {cold: summarize(cold), warm: summarize(warm), cold_runs: cold, warm_runs: warm};
  const c = result.pages[pageName].cold, w = result.pages[pageName].warm;
  console.log(`  ${pageName}: cold ready ${c.ready_ms} ms (last API ${c.api_ms} ms, ${c.api_requests} API req, ${(c.bytes / 1024).toFixed(0)} KiB) | warm ready ${w.ready_ms} ms`);
  for (const a of cold[0].api_log) console.log(`     ${a.m} ${a.u} ${a.s} ${a.b} B start ${a.start_ms} dur ${a.dur_ms} ms`);
}
await browser.close();
await writeFile(outPath, JSON.stringify(result, null, 1));
