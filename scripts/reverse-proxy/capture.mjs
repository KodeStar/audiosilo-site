// Real browser and terminal captures of the disposable verification stack.
// No mocked application responses, injected UI, or replacement screenshots.
import assert from 'node:assert/strict'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { chromium } from 'playwright'
import sharp from 'sharp'

const here = path.dirname(fileURLToPath(import.meta.url))
const state = JSON.parse(await readFile(process.argv[2], 'utf8'))
const { tool, origin, password, token, folder } = state
const output = path.resolve(here, '../../src/assets/stills/reverse-proxy')
await mkdir(output, { recursive: true })
const browser = await chromium.launch({
  args: ['--no-proxy-server', '--host-resolver-rules=MAP books.example.com 127.0.0.1'],
})
// Python's HTTPS client separately verifies the full local certificate chain.
// This flag is restricted to this disposable browser, never the user's browser.
const context = await browser.newContext({
  viewport: { width: 1440, height: 1050 }, deviceScaleFactor: 1.5,
  colorScheme: 'dark', reducedMotion: 'reduce', ignoreHTTPSErrors: true,
})
await context.addInitScript(() => {
  // Observe real detached audio elements without mocking their network or media.
  window.__audios = []
  const OriginalAudio = window.Audio
  window.Audio = function (...args) {
    const audio = new OriginalAudio(...args)
    window.__audios.push(audio)
    return audio
  }
  window.Audio.prototype = OriginalAudio.prototype
})
const page = await context.newPage()
let terminal
const checks = []
async function shot(name, target = page) {
  await target.evaluate(() => document.fonts.ready)
  await target.waitForTimeout(500)
  const png = await target.screenshot()
  await sharp(png).webp({ quality: 85 }).toFile(path.join(output, `${tool}-${name}.webp`))
  checks.push(name)
}
async function api(route, method = 'GET', data) {
  const result = await page.evaluate(async ({ route, method, data, token }) => {
    const response = await fetch(`/api/v1${route}`, {
      method, headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: data === undefined ? undefined : JSON.stringify(data),
    })
    return { status: response.status, body: await response.json() }
  }, { route, method, data, token })
  assert(result.status >= 200 && result.status < 300, `${method} ${route}: HTTP ${result.status}`)
  return result.body
}
async function open(route) {
  await page.goto(`${origin}/admin${route}`, { waitUntil: 'networkidle' })
  await page.locator('h1').first().waitFor()
}
// Playwright evaluates this function in the terminal page for both waits and assertions.
function terminalContains(text) {
  const buffer = window.term.buffer.active
  return Array.from({ length: buffer.length }, (_, i) => buffer.getLine(i)?.translateToString() ?? '')
    .join('\n').includes(text)
}
try {
  // A real ttyd session running the same Docker Compose project, with no logs
  // (the first-run logs contain a password). Files contain only example values.
  terminal = spawn('ttyd', [
    '-i', '127.0.0.1', '-p', '0', '-d', '7', '-O', '-W', '-o', '-w', folder,
    '-t', 'fontSize=18', '-t', 'rendererType=dom', '-t', 'screenReaderMode=true',
    '-t', 'theme={"background":"#101827","foreground":"#f1f5f9"}',
    '/bin/zsh', '-f',
  ], {
    env: { ...process.env, COMPOSE_FILE: 'compose.yaml:test.override.yaml',
      COMPOSE_PROJECT_NAME: `asproxy-${tool}`, PROMPT: 'audiosilo-setup % ' },
    stdio: ['ignore', 'ignore', 'pipe'],
  })
  // Wait for this child to bind its own random port. A fixed-port retry could
  // otherwise connect to somebody else's terminal if ttyd failed to start.
  const terminalPort = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('ttyd did not start')), 10000)
    const fail = error => { clearTimeout(timeout); reject(error) }
    terminal.once('error', fail)
    terminal.once('exit', (code, signal) => fail(new Error(`ttyd exited: ${code ?? signal}`)))
    let log = ''
    terminal.stderr.on('data', chunk => {
      log = (log + chunk.toString()).slice(-4000)
      const listening = /Listening on port: (\d+)/.exec(log)
      if (listening) { clearTimeout(timeout); resolve(Number(listening[1])) }
    })
  })
  const term = await context.newPage()
  await term.setViewportSize({ width: 1440, height: 620 })
  await term.goto(`http://127.0.0.1:${terminalPort}`, { waitUntil: 'networkidle', timeout: 10000 })
  await term.locator('.xterm-screen').waitFor()
  await term.waitForTimeout(500)
  await term.evaluate(() => { window.term.fit(); window.term.resize(125, 25) })
  await term.keyboard.type('clear; cat .env; docker compose config --services', { delay: 10 })
  await term.keyboard.press('Enter')
  await term.waitForFunction(terminalContains, 'AUDIOSILO_IP=')
  await term.waitForTimeout(700)
  assert(await term.evaluate(terminalContains, 'BOOKS_HOST=books.example.com'))
  await shot('files', term)
  await term.setViewportSize({ width: 1440, height: 400 })
  await term.evaluate(() => window.term.fit())
  await term.keyboard.type('clear; docker compose ps', { delay: 10 })
  await term.keyboard.press('Enter')
  await term.waitForFunction(terminalContains, 'asproxy-')
  await term.waitForTimeout(700)
  await shot('running', term)
  await term.close()

  await page.goto(`${origin}/admin/`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: 'Admin sign in' }).waitFor()
  await page.getByLabel('Username', { exact: true }).fill('admin')
  await shot('login')
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await page.getByRole('heading', { name: 'Admin sign in' }).waitFor({ state: 'hidden' })
  await page.locator('h1').first().waitFor()

  await open('/server?topic=network')
  await page.getByLabel('Listen address', { exact: true }).waitFor()
  await page.getByText('Set by AUDIOSILO_TLS_MODE', { exact: false }).first().waitFor()
  await shot('network')
  await open('/server')
  await page.getByLabel('Public address', { exact: true }).waitFor()
  assert.equal(await page.getByLabel('Public address', { exact: true }).inputValue(), origin)
  await shot('address')

  const libraries = (await api('/admin/libraries')).libraries ?? []
  await open('/library/libraries')
  await page.getByRole('button', { name: 'Add library', exact: true }).first().click()
  const dialog = page.getByRole('dialog', { name: 'Add a library' })
  await dialog.waitFor()
  await dialog.getByLabel('Name', { exact: true }).fill('Audiobooks')
  await dialog.getByLabel('Folder', { exact: true }).fill('/audiobooks')
  await shot('library')
  if (!libraries.some(library => library.root === '/audiobooks')) {
    await dialog.getByRole('button', { name: 'Add library and scan', exact: true }).click()
    await dialog.waitFor({ state: 'hidden' })
  } else {
    await page.keyboard.press('Escape')
  }

  // Invite the existing admin. Demonstrates that creating a second account is
  // unnecessary; the invite is later superseded by the API tests and destroyed.
  const me = await api('/me')
  const invite = await api(`/admin/users/${(me.user ?? me).id}/authcode`, 'POST', { max_uses: 5, ttl_days: 1 })
  const connect = await context.newPage()
  let pairing
  connect.on('response', async response => {
    if (response.url().endsWith('/api/v1/auth/redeem') && response.ok()) pairing = await response.json()
  })
  await connect.goto(invite.invite_url, { waitUntil: 'networkidle' })
  await connect.getByRole('heading', { name: 'Scan to pair' }).waitFor()
  assert(await connect.locator('#qr').getAttribute('src'), 'Pairing QR was not rendered')
  assert.equal(new URL(await connect.locator('#link-web').getAttribute('href')).origin, origin)
  assert(!connect.url().includes('code='), 'Invite code should be removed from the address bar')
  await shot('pairing', connect)
  await connect.getByRole('link', { name: 'Open web player', exact: true }).click()
  await connect.waitForURL(/\/web\//)
  await connect.waitForTimeout(2500)
  assert(!await connect.getByText('Connect to your audiobook server', { exact: true }).isVisible(),
    'Web-player pairing did not complete')
  await connect.getByText('Start listening', { exact: true }).click()
  // On a fresh account there is no previous listening position to resume, so
  // the ready screen opens Home. Choose the fixture book and start it there.
  await connect.waitForURL(url => !url.pathname.includes('/connect/'))
  await connect.getByText('Proxy setup sample', { exact: true }).first().click()
  await connect.getByRole('button', { name: 'Start listening', exact: true }).click()
  await connect.waitForFunction(() => window.__audios?.some(audio => !audio.paused && audio.currentTime > 0.2))
  await connect.evaluate(() => {
    const audio = window.__audios.find(audio => !audio.paused)
    audio.currentTime = 10
  })
  await connect.waitForFunction(() => window.__audios.some(audio => !audio.paused && audio.currentTime > 10.2))
  await shot('player', connect)
  assert(pairing?.pairing_token, 'Invite redemption was not observed')
  await writeFile(path.join(folder, 'browser-results.json'), JSON.stringify({
    screenshots: checks, playback: 'Real audio playback and seek confirmed',
  }, null, 2))
  console.log(`${tool}: ${checks.length} real screenshots captured; browser setup and pairing passed`)
} catch (error) {
  await page.screenshot({ path: path.join(folder, 'capture-failure.png') }).catch(() => {})
  await writeFile(path.join(folder, 'capture-failure.txt'), await page.locator('body').ariaSnapshot()).catch(() => {})
  const lastPage = context.pages().at(-1)
  if (lastPage && lastPage !== page) {
    await lastPage.screenshot({ path: path.join(folder, 'player-failure.png') }).catch(() => {})
    await writeFile(path.join(folder, 'player-failure.txt'), await lastPage.locator('body').ariaSnapshot()).catch(() => {})
  }
  throw error
} finally {
  terminal?.kill()
  await browser.close()
}
