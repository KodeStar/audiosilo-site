#!/usr/bin/env python3
"""Exercise the published Compose recipes with isolated local TLS certificates.

No production domain, DNS changes, host trust-store changes or public ACME
requests. Only local test projects are created and removed. See README.md.
"""
import argparse
from datetime import datetime, timezone
import hashlib
import http.client
import json
import os
from pathlib import Path
import re
import shutil
import socket
import ssl
import subprocess
import time
from urllib.parse import urlencode

HERE = Path(__file__).resolve().parent
SITE = HERE.parent.parent
CACHE = HERE / '.cache'
RECIPES = SITE / 'public/downloads/reverse-proxy'
DOMAIN = 'books.example.com'
HTTPS_PORT = 28443
HTTP_PORT = 28080
ORIGIN = f'https://{DOMAIN}:{HTTPS_PORT}'
PROXIES = ('caddy', 'swag', 'traefik')


def run(*args, cwd=None, check=True):
    result = subprocess.run(args, cwd=cwd, capture_output=True, text=True)
    if check and result.returncode:
        raise RuntimeError(f'{args[0]} failed: {result.stderr[-2000:]}')
    return result.stdout


def compose(folder, *args, local=True):
    files = ['-f', 'compose.yaml']
    if local:
        files += ['-f', 'test.override.yaml']
    return run('docker', 'compose', '-p', f'asproxy-{folder.name}', *files, *args, cwd=folder)


def certificates():
    certs = CACHE / 'certs'
    certs.mkdir(parents=True, exist_ok=True)
    fresh = (certs / 'fullchain.pem').exists() and (certs / 'root.cnf').exists()
    if fresh:
        fresh = subprocess.run(['openssl', 'x509', '-checkend', '86400', '-noout',
                                '-in', str(certs / 'fullchain.pem')], capture_output=True).returncode == 0
    if not fresh:
        (certs / 'root.cnf').write_text(
            '[req]\ndistinguished_name=dn\nx509_extensions=ca\nprompt=no\n'
            '[dn]\nCN=AudioSilo local proxy verification CA\n'
            '[ca]\nbasicConstraints=critical,CA:TRUE\nkeyUsage=critical,keyCertSign,cRLSign\n'
            'subjectKeyIdentifier=hash\nauthorityKeyIdentifier=keyid:always\n')
        run('openssl', 'req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', '7',
            '-keyout', str(certs / 'ca.key'), '-out', str(certs / 'ca.pem'),
            '-config', str(certs / 'root.cnf'))
        run('openssl', 'req', '-newkey', 'rsa:2048', '-nodes',
            '-keyout', str(certs / 'privkey.pem'), '-out', str(certs / 'leaf.csr'),
            '-subj', f'/CN={DOMAIN}')
        (certs / 'leaf.ext').write_text(
            f'subjectAltName=DNS:{DOMAIN},IP:127.0.0.1\n'
            'basicConstraints=critical,CA:FALSE\nkeyUsage=critical,digitalSignature,keyEncipherment\n'
            'subjectKeyIdentifier=hash\nauthorityKeyIdentifier=keyid:always\nextendedKeyUsage=serverAuth\n')
        run('openssl', 'x509', '-req', '-in', str(certs / 'leaf.csr'),
            '-CA', str(certs / 'ca.pem'), '-CAkey', str(certs / 'ca.key'),
            '-CAcreateserial', '-days', '7', '-out', str(certs / 'fullchain.pem'),
            '-extfile', str(certs / 'leaf.ext'))
    return certs


def prepare(tool, certs):
    folder = CACHE / tool
    if folder.exists():
        # Only the named, disposable project and its own scratch files.
        # A failed preparation may not have reached the override-file write;
        # no containers can have been started from that incomplete directory.
        if (folder / 'test.override.yaml').exists():
            compose(folder, 'down', '-v', '--remove-orphans')
        shutil.rmtree(folder)
    shutil.copytree(RECIPES / tool, folder)
    source_hashes = {str(p.relative_to(RECIPES / tool)): hashlib.sha256(p.read_bytes()).hexdigest()
                     for p in (RECIPES / tool).rglob('*') if p.is_file()}
    library = folder / 'books' / 'AudioSilo' / 'Proxy setup sample'
    library.mkdir(parents=True)
    run('ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-f', 'lavfi',
        '-i', 'sine=frequency=440:duration=20', '-c:a', 'aac', '-b:a', '64k',
        '-metadata', 'title=Proxy setup sample', '-metadata', 'artist=AudioSilo',
        '-metadata', 'album=Proxy setup sample', str(library / 'Sample.m4b'))
    env = (folder / 'env.example').read_text().replace('/srv/audiobooks', str(folder / 'books'))
    env = env.replace('you@example.com', 'setup@example.com')
    (folder / '.env').write_text(env)
    original = json.loads(compose(folder, 'config', '--format', 'json', local=False))
    if original['services']['audiosilo'].get('ports'):
        raise AssertionError('AudioSilo exposes a host port')
    if original['services']['audiosilo']['environment']['AUDIOSILO_TLS_MODE'] != 'off':
        raise AssertionError('AudioSilo TLS mode must be off')
    overrides = {
        'services': {
            'audiosilo': {'environment': {'AUDIOSILO_PUBLIC_URL': ORIGIN,
                                         'AUDIOSILO_METADATA_ENABLED': 'false',
                                         'AUDIOSILO_UPDATE_CHECK': 'false'}},
            tool: {}
        }
    }
    if tool == 'caddy':
        text = (folder / 'Caddyfile').read_text()
        text = text.replace('    reverse_proxy',
                            '    tls /test-certs/fullchain.pem /test-certs/privkey.pem\n    reverse_proxy')
        (folder / 'Caddyfile.local').write_text(text)
        overrides['services'][tool]['volumes'] = [
            './Caddyfile.local:/etc/caddy/Caddyfile:ro', f'{certs}:/test-certs:ro']
    elif tool == 'traefik':
        overrides['services'][tool]['command'] = [c for c in original['services'][tool]['command']
                                                  if not c.startswith('--certificatesresolvers.')]
        dynamic = folder / 'dynamic/audiosilo.yaml'
        dynamic.write_text(dynamic.read_text().replace('tls:\n        certResolver: letsencrypt', 'tls: {}'))
        (folder / 'dynamic/local-tls.yaml').write_text(
            'tls:\n  certificates:\n    - certFile: /test-certs/fullchain.pem\n'
            '      keyFile: /test-certs/privkey.pem\n')
        overrides['services'][tool]['volumes'] = [f'{certs}:/test-certs:ro']
    elif tool == 'swag':
        # SWAG's unmodified init uses an existing certificate if present. This
        # exercises its actual nginx includes without requesting a public cert.
        keys = folder / f'swag/etc/letsencrypt/live/{DOMAIN}'
        keys.mkdir(parents=True)
        for name in ['fullchain.pem', 'privkey.pem']:
            shutil.copyfile(certs / name, keys / name)
    # Compose merges port sequences by default. !override keeps this lab off
    # the user's existing public HTTP/HTTPS listeners (Compose >= 2.24.4).
    out = 'services:\n'
    for name, service in overrides['services'].items():
        out += f'  {name}:\n'
        for key, value in service.items():
            out += f'    {key}: {json.dumps(value)}\n'
        if name == tool:
            ports = [f'127.0.0.1:{HTTP_PORT}:80', f'127.0.0.1:{HTTPS_PORT}:443']
            out += '    ports: !override ' + json.dumps(ports) + '\n'
    (folder / 'test.override.yaml').write_text(out)
    return folder, source_hashes


class Client:
    def __init__(self, certs):
        self.context = ssl.create_default_context(cafile=str(certs / 'ca.pem'))

    def request(self, path, method='GET', data=None, token=None, headers=None, tls=True):
        conn = (http.client.HTTPSConnection(DOMAIN, HTTPS_PORT, context=self.context, timeout=15)
                if tls else http.client.HTTPConnection('127.0.0.1', HTTP_PORT, timeout=15))
        if tls:
            # Preserve the real hostname for TLS SNI and certificate validation
            # while connecting only to the local, unpublished test endpoint.
            conn._create_connection = lambda address, timeout, source_address: socket.create_connection(
                ('127.0.0.1', HTTPS_PORT), timeout, source_address)
        hdr = {'Host': DOMAIN, **(headers or {})}
        if token:
            hdr['Authorization'] = 'Bearer ' + token
        if data is not None:
            hdr['Content-Type'] = 'application/json'
        conn.request(method, path, json.dumps(data) if data is not None else None, hdr)
        r = conn.getresponse()
        body = r.read()
        result = (r.status, dict(r.getheaders()), body)
        conn.close()
        return result

    def api(self, path, method='GET', data=None, token=None, headers=None):
        status, _, body = self.request('/api/v1' + path, method, data, token, headers)
        if not 200 <= status < 300:
            raise AssertionError(f'{method} {path}: HTTP {status}')
        return json.loads(body)


def verify(tool, certs, capture):
    folder, hashes = prepare(tool, certs)
    client = Client(certs)
    checks = []

    def check(label, condition=True):
        # Verification must also fail when PYTHONOPTIMIZE/-O disables asserts.
        if not condition:
            raise AssertionError(label)
        checks.append(label)
        print(f'  PASS {label}', flush=True)

    print(f'\n{tool}: starting the published recipe with local TLS/port overrides', flush=True)
    compose(folder, 'up', '-d')
    deadline = time.monotonic() + 150
    while time.monotonic() < deadline:
        try:
            if client.request('/api/v1/server')[0] == 200:
                break
        except (OSError, ssl.SSLError, http.client.HTTPException):
            pass
        time.sleep(2)
    else:
        logs = compose(folder, 'logs', '--no-color', tool)
        raise RuntimeError(f'{tool} was not ready: {logs[-2500:]}')
    check('HTTPS certificate verified against the local CA')
    for route in ['/', '/connect', '/admin/', '/web/', '/api/v1/server', '/healthz']:
        status, hdr, _ = client.request(route)
        check(f'{route} serves over HTTPS without a redirect loop', status == 200)
        check(f'{route} has no HTTPS :80 redirect', ':80/' not in hdr.get('Location', ''))
    status, hdr, _ = client.request('/', tls=False)
    check('HTTP redirects to HTTPS', status in [301, 302, 307, 308] and
          hdr.get('Location', '').startswith('https://' + DOMAIN))
    logs = compose(folder, 'logs', '--no-color', 'audiosilo')
    password = re.search(r'Admin password\s*:\s*(\S+)', logs).group(1)
    login = client.api('/auth/login', 'POST', {'username': 'admin', 'password': password,
                                            'device_name': f'{tool} setup verification'})
    token = login['token']
    check('First-run admin can sign in through the proxy')
    settings = client.api('/admin/settings', token=token)
    check('TLS mode is off', settings['network']['tls_mode'] == 'off')
    check('Public URL uses the external HTTPS address', settings['general']['public_url'] == ORIGIN)
    check('Only the proxy /32 is trusted', settings['network']['trusted_proxies'] == ['172.30.90.2/32'])
    for key, env in [('network.tls_mode', 'AUDIOSILO_TLS_MODE'),
                     ('general.public_url', 'AUDIOSILO_PUBLIC_URL'),
                     ('network.trusted_proxies', 'AUDIOSILO_TRUSTED_PROXIES')]:
        check(f'{env} overrides config.yaml and locks the UI', settings['locked'].get(key) == env)
    container = compose(folder, 'ps', '-q', 'audiosilo').strip()
    bindings = json.loads(run('docker', 'inspect', container))[0]['HostConfig']['PortBindings']
    check('AudioSilo has no host port binding', not bindings)
    state = {'tool': tool, 'origin': ORIGIN, 'password': password, 'token': token,
             'folder': str(folder)}
    (folder / 'session.json').write_text(json.dumps(state))
    os.chmod(folder / 'session.json', 0o600)
    if capture:
        run('node', str(HERE / 'capture.mjs'), str(folder / 'session.json'))
        check('Browser setup steps and screenshots captured')
        browser_result = json.loads((folder / 'browser-results.json').read_text())
        check('Real browser audio playback and seeking work', bool(browser_result.get('playback')))
    libs = client.api('/admin/libraries', token=token).get('libraries', [])
    if not libs:
        library = client.api('/admin/libraries', 'POST', {'name': 'Audiobooks', 'root': '/audiobooks'}, token)
    else:
        library = libs[0]
    deadline = time.monotonic() + 45
    books = []
    while time.monotonic() < deadline:
        books = client.api(f'/libraries/{library["id"]}/books', token=token).get('books', [])
        if books:
            break
        time.sleep(1)
    check('Mounted read-only audiobook library is browsable', bool(books))
    # The media API streams actual file paths. A range GET exercises seeking.
    path = 'AudioSilo/Proxy setup sample/Sample.m4b'
    stream = f'/api/v1/libraries/{library["id"]}/stream?' + urlencode({'path': path})
    status, hdr, body = client.request(stream, token=token, headers={'Range': 'bytes=0-1023'})
    sample = folder / 'books' / path
    check('Audio seeking returns 206 and the requested bytes', status == 206 and
          body == sample.read_bytes()[:1024] and
          hdr.get('Content-Range') == f'bytes 0-1023/{sample.stat().st_size}')
    me = client.api('/me', token=token)
    user_id = me.get('user', me)['id']
    invite = client.api(f'/admin/users/{user_id}/authcode', 'POST', {'max_uses': 5, 'ttl_days': 1}, token)
    check('Invite link points to the external HTTPS address', invite['invite_url'].startswith(ORIGIN + '/connect#code='))
    pairing = client.api('/auth/redeem', 'POST', {'code': invite['auth_code']})
    check('Pairing QR URL points to the external HTTPS address', pairing['web_url'].startswith(ORIGIN + '/web/connect?'))
    exchange = client.api('/auth/exchange', 'POST', {'pairing_token': pairing['pairing_token'],
                                                  'device_name': 'Pairing test'})
    check('Pairing code exchanges for a working device session', bool(client.api('/me', token=exchange['token'])))
    spoofed = client.api('/auth/login', 'POST', {'username': 'admin', 'password': password,
                                               'device_name': 'Forwarded header verification'},
                         headers={'X-Forwarded-For': '203.0.113.99'})
    devices = client.api('/me/devices', token=spoofed['token'])
    entries = devices.get('devices', [])
    spoof_device = next((d for d in entries if d.get('device_name') == 'Forwarded header verification' or
                         d.get('name') == 'Forwarded header verification'), None)
    check('Forged client IP is not accepted', spoof_device is not None and
          spoof_device.get('last_ip') not in ['203.0.113.99', '172.30.90.2', '', None])
    compose(folder, 'restart', 'audiosilo')
    for _ in range(30):
        try:
            if client.api('/me', token=token):
                break
        except (AssertionError, OSError, http.client.HTTPException):
            time.sleep(1)
    else:
        raise AssertionError('Session did not survive restart')
    persisted = client.api('/admin/settings', token=token)
    persisted_libs = client.api('/admin/libraries', token=token).get('libraries', [])
    check('Settings, library and sessions survive an AudioSilo restart',
          persisted['general']['public_url'] == ORIGIN and persisted['network']['tls_mode'] == 'off' and
          any(item['id'] == library['id'] for item in persisted_libs))
    if tool == 'caddy':
        compose(folder, 'exec', '-T', 'caddy', 'caddy', 'validate', '--config', '/etc/caddy/Caddyfile')
    if tool == 'swag':
        compose(folder, 'exec', '-T', 'swag', 'nginx', '-t')
    images = {}
    for service in ['audiosilo', tool]:
        cid = compose(folder, 'ps', '-q', service).strip()
        obj = json.loads(run('docker', 'inspect', cid))[0]
        images[service] = {'reference': obj['Config']['Image'], 'id': obj['Image']}
    result = {'proxy': tool, 'verified': datetime.now(timezone.utc).date().isoformat(), 'checks': checks,
              'source_sha256': hashes, 'images': images,
              'limits': ['Local test CA, not public Let\'s Encrypt issuance.',
                         f'HTTP/HTTPS host ports remapped to {HTTP_PORT}/{HTTPS_PORT}.',
                         'Native phone camera/app and real internet/router/DNS were not exercised.']}
    return result


def main():
    parser = argparse.ArgumentParser()
    def proxy_name(value):
        if value not in PROXIES:
            raise argparse.ArgumentTypeError(f'choose from {", ".join(PROXIES)}')
        return value

    parser.add_argument('proxies', nargs='*', default=list(PROXIES), type=proxy_name,
                        metavar='PROXY', help='caddy, swag or traefik (default: all three)')
    parser.add_argument('--capture', action='store_true')
    parser.add_argument('--keep', action='store_true', help='leave the final disposable stack running')
    args = parser.parse_args()
    proxies = list(dict.fromkeys(args.proxies))
    CACHE.mkdir(mode=0o700, parents=True, exist_ok=True)
    CACHE.chmod(0o700)
    # A requested rerun supersedes its old report, including when setup or
    # teardown fails. Reports for proxies not requested are left alone.
    for tool in proxies:
        (HERE / f'{tool}-results.json').unlink(missing_ok=True)
    certs = certificates()
    for index, tool in enumerate(proxies):
        folder = CACHE / tool
        try:
            result = verify(tool, certs, args.capture)
        finally:
            keep = args.keep and index == len(proxies) - 1
            if (folder / 'test.override.yaml').exists() and not keep:
                compose(folder, 'down', '-v', '--remove-orphans')
        # Publish success only after verification and any required teardown.
        (HERE / f'{tool}-results.json').write_text(json.dumps(result, indent=2) + '\n')


if __name__ == '__main__':
    main()
