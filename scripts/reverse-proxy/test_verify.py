"""No-Docker regressions for the verification runner's failure and cleanup paths."""
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import Mock, patch

import verify


class RunnerTests(unittest.TestCase):
    def setUp(self):
        scratch = tempfile.TemporaryDirectory()
        self.addCleanup(scratch.cleanup)
        self.root = Path(scratch.name)
        self.reports = self.root / 'reports'
        self.reports.mkdir()
        self.cache = self.root / 'cache'
        for name, value in [('HERE', self.reports), ('CACHE', self.cache)]:
            replacement = patch.object(verify, name, value)
            replacement.start()
            self.addCleanup(replacement.stop)
        self.events = []
        self.active = set()

    def start_stack(self, tool, *_):
        self.assertFalse(self.active, 'Previous stack still occupies the shared ports/subnet')
        self.active.add(tool)
        self.events.append(('start', tool))
        folder = self.cache / tool
        folder.mkdir(parents=True)
        (folder / 'test.override.yaml').touch()
        return {'proxy': tool}

    def stop_stack(self, folder, *args):
        self.assertEqual(args, ('down', '-v', '--remove-orphans'))
        self.active.remove(folder.name)
        self.events.append(('stop', folder.name))

    def main(self, *args):
        with patch.object(sys, 'argv', ['verify.py', *args]), \
                patch.object(verify, 'certificates', return_value=None):
            verify.main()

    def test_default_invocation_runs_and_cleans_all_proxies(self):
        with patch.object(verify, 'verify', side_effect=self.start_stack), \
                patch.object(verify, 'compose', side_effect=self.stop_stack):
            self.main()
        self.assertFalse(self.active)
        for tool in verify.PROXIES:
            self.assertEqual(json.loads((self.reports / f'{tool}-results.json').read_text()), {'proxy': tool})

    def test_keep_releases_shared_ports_before_the_final_stack(self):
        with patch.object(verify, 'verify', side_effect=self.start_stack), \
                patch.object(verify, 'compose', side_effect=self.stop_stack):
            self.main('caddy', 'swag', '--keep')
        self.assertEqual(self.events, [('start', 'caddy'), ('stop', 'caddy'), ('start', 'swag')])
        self.assertEqual(self.active, {'swag'})

    def test_repeated_proxy_name_runs_one_project_once(self):
        with patch.object(verify, 'verify', side_effect=self.start_stack), \
                patch.object(verify, 'compose', side_effect=self.stop_stack):
            self.main('caddy', 'caddy', '--keep')
        self.assertEqual(self.events, [('start', 'caddy')])

    def test_failed_rerun_removes_requested_stale_reports(self):
        for tool in verify.PROXIES:
            (self.reports / f'{tool}-results.json').write_text('{"old": true}')

        def fail(tool, *args):
            result = self.start_stack(tool, *args)
            if tool == 'swag':
                raise RuntimeError('verification failed')
            return result

        with patch.object(verify, 'verify', side_effect=fail), \
                patch.object(verify, 'compose', side_effect=self.stop_stack):
            with self.assertRaisesRegex(RuntimeError, 'verification failed'):
                self.main('caddy', 'swag')
        self.assertFalse(self.active)
        self.assertEqual(json.loads((self.reports / 'caddy-results.json').read_text()), {'proxy': 'caddy'})
        self.assertFalse((self.reports / 'swag-results.json').exists())
        self.assertEqual(json.loads((self.reports / 'traefik-results.json').read_text()), {'old': True})

    def test_failed_teardown_does_not_publish_success(self):
        with patch.object(verify, 'verify', side_effect=self.start_stack), \
                patch.object(verify, 'compose', side_effect=RuntimeError('teardown failed')):
            with self.assertRaisesRegex(RuntimeError, 'teardown failed'):
                self.main('caddy')
        self.assertFalse((self.reports / 'caddy-results.json').exists())

    def test_preparation_can_retry_after_ffmpeg_failure(self):
        self.cache.mkdir()
        with patch.object(verify, 'run', side_effect=RuntimeError('ffmpeg failed')):
            with self.assertRaisesRegex(RuntimeError, 'ffmpeg failed'):
                verify.prepare('caddy', self.root / 'certs')
        self.assertFalse((self.cache / 'caddy/test.override.yaml').exists())
        config = {'services': {'audiosilo': {'environment': {'AUDIOSILO_TLS_MODE': 'off'}}}}
        with patch.object(verify, 'run'), patch.object(verify, 'compose', return_value=json.dumps(config)) as compose:
            folder, _ = verify.prepare('caddy', self.root / 'certs')
        self.assertTrue((folder / 'test.override.yaml').exists())
        self.assertEqual(compose.call_args_list[0].args[1:], ('config', '--format', 'json'))
        self.assertEqual(compose.call_count, 1, 'An incomplete preparation must not run Compose down')

    def test_failed_api_request_is_rejected_even_with_python_optimization(self):
        client = object.__new__(verify.Client)
        client.request = Mock(return_value=(401, {}, b'{}'))
        with self.assertRaisesRegex(AssertionError, 'HTTP 401'):
            client.api('/me')

    def test_unexpected_redirect_cannot_pass_verification(self):
        client = Mock()
        client.request.side_effect = [(200, {}, b'{}'), (301, {'Location': 'https://wrong.example/'}, b'')]
        with patch.object(verify, 'prepare', return_value=(self.cache / 'caddy', {})), \
                patch.object(verify, 'Client', return_value=client), patch.object(verify, 'compose'):
            with self.assertRaisesRegex(AssertionError, 'without a redirect loop'):
                verify.verify('caddy', None, False)


if __name__ == '__main__':
    unittest.main()
