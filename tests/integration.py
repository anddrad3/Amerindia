"""Exercise real PHP/SQLite HTTP behavior with harmless fixtures and isolated data."""
import http.cookiejar
import json
import os
from pathlib import Path
import re
import shutil
import socket
import sqlite3
import subprocess
import tempfile
import time
import unittest
import urllib.error
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
PHP = str(ROOT / '.tools/php/php.exe') if (ROOT / '.tools/php/php.exe').exists() else shutil.which('php')

class AppTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory(prefix='amerindia-test-')
        cls.env = {**os.environ, 'AMERINDIA_STORAGE': cls.tmp.name}
        with socket.socket() as sock:
            sock.bind(('127.0.0.1', 0)); port = sock.getsockname()[1]
        cls.base = f'http://127.0.0.1:{port}'
        cls.log = open(Path(cls.tmp.name) / 'php.log', 'w', encoding='utf-8')
        cls.server = subprocess.Popen([PHP, '-S', f'127.0.0.1:{port}', '-t', 'public', 'router.php'], cwd=ROOT, env=cls.env, stdout=cls.log, stderr=cls.log)
        cls.client = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
        for _ in range(80):
            try:
                status, _, html = cls.call('/contribuir')
                if status == 200: break
            except OSError: time.sleep(.1)
        else: raise RuntimeError('PHP did not start')
        cls.token = re.search(r'name="csrf" value="([a-f0-9]+)"', html.decode()).group(1)
    @classmethod
    def tearDownClass(cls):
        cls.server.terminate(); cls.server.wait(timeout=10); cls.log.close(); cls.tmp.cleanup()
    @classmethod
    def call(cls, path, body=None, headers=None, method=None):
        req = urllib.request.Request(cls.base + path, data=body, headers=headers or {}, method=method)
        try: response = cls.client.open(req, timeout=15)
        except urllib.error.HTTPError as error: response = error
        return response.status, response.headers, response.read()
    def setUp(self):
        self.connection = sqlite3.connect(Path(self.tmp.name) / 'amerindia.sqlite')
        self.connection.execute('DELETE FROM rate_limits'); self.connection.commit()
    def tearDown(self): self.connection.close()
    def payload(self, **changes):
        fields = {'csrf': self.token, 'kind': 'correction', 'name': 'Pessoa de teste', 'email': 'teste@example.com', 'title': 'Correção de referência', 'message': 'Solicito revisar esta referência a partir da fonte indicada.', 'privacy': '1', 'website': ''}
        fields.update(changes); return fields
    def post(self, fields, files=None, origin='http://127.0.0.1:8080'):
        boundary = '----amerindia-testing-boundary'; chunks = []
        for key, value in fields.items():
            chunks.append(f'--{boundary}\r\nContent-Disposition: form-data; name="{key}"\r\n\r\n{value}\r\n'.encode())
        for name, (filename, mime, data) in (files or {}).items():
            chunks.extend([f'--{boundary}\r\nContent-Disposition: form-data; name="{name}"; filename="{filename}"\r\nContent-Type: {mime}\r\n\r\n'.encode(), data, b'\r\n'])
        chunks.append(f'--{boundary}--\r\n'.encode())
        return self.call('/api/submissions', b''.join(chunks), {'Content-Type': f'multipart/form-data; boundary={boundary}', 'Origin': origin})
    def cli(self, *args):
        return subprocess.run([PHP, 'bin/console.php', *args], cwd=ROOT, env=self.env, text=True, capture_output=True, encoding='utf-8')
    def test_pages_headers_and_pdf(self):
        for path in ['/', '/acervo', '/territorios', '/contribuir', '/privacidade', '/sobre']:
            status, headers, _ = self.call(path); self.assertEqual(status, 200, path)
            self.assertIn("script-src 'self'", headers['Content-Security-Policy'])
            self.assertEqual(headers['X-Content-Type-Options'], 'nosniff')
        status, _, body = self.call('/documents/termo-submissao.pdf')
        self.assertEqual(status, 200); self.assertTrue(body.startswith(b'%PDF'))
    def test_private_files_are_inaccessible(self):
        for path in ['/storage/amerindia.sqlite', '/.git/config', '/config/local.php', '/src/Database.php', '/bin/console.php', '/../database/schema.sql', '/database/seed/research.json']:
            self.assertEqual(self.call(path)[0], 404, path)
    def test_research_details_and_authorized_download_import(self):
        items = json.loads(self.call('/api/catalog')[2])['research']
        book = next(item for item in items if item['id'] == 'queda-do-ceu')
        report = next(item for item in items if item['id'] == 'cnv')
        self.assertEqual(len(book['authors']), 2)
        self.assertFalse(book['download_url'])
        self.assertTrue(report['download_url'].startswith('https://www.gov.br/'))
        fixture = {**book, 'id': 'test-public-download', 'download_url': 'https://example.com/paper.pdf', 'download_label': 'Pesquisa PDF', 'rights_note': 'Autorização editorial de teste.'}
        path = Path(self.tmp.name) / 'research-details.json'
        path.write_text(json.dumps(fixture), encoding='utf-8')
        self.assertNotEqual(self.cli('research:import', str(path), '--editorial-reviewed').returncode, 0)
        fixture['download_authorized'] = True
        fixture['authors'][0]['url'] = 'javascript:alert(1)'
        path.write_text(json.dumps(fixture), encoding='utf-8')
        self.assertNotEqual(self.cli('research:import', str(path), '--editorial-reviewed').returncode, 0)
        fixture['authors'][0]['url'] = 'https://example.com/author'
        path.write_text(json.dumps(fixture), encoding='utf-8')
        result = self.cli('research:import', str(path), '--editorial-reviewed')
        self.assertEqual(result.returncode, 0, result.stderr)
        imported = next(item for item in json.loads(self.call('/api/catalog')[2])['research'] if item['id'] == fixture['id'])
        self.assertEqual(imported['download_url'], fixture['download_url'])
        self.assertEqual(imported['authors'], fixture['authors'])
    def test_csrf_and_origin(self):
        self.assertEqual(self.post(self.payload(csrf='invalid-test-token'))[0], 403)
        self.assertEqual(self.post(self.payload(), origin='https://other.example')[0], 403)
    def test_method_and_year_validation(self):
        self.assertEqual(self.call('/api/catalog', method='DELETE')[0], 405)
        for year in ['abc', '2026%20unexpected', '2101', '1499', '2026.0']:
            self.assertEqual(self.call('/api/territories?year=' + year)[0], 422)
        self.assertEqual(len(json.loads(self.call('/api/territories?year=2026')[2])['features']), 4)
        self.assertEqual(json.loads(self.call('/api/territories?year=1800')[2])['features'], [])
    def test_literal_text_is_stored_privately(self):
        title = "D'Ávila & <b>referências de teste</b>"
        status, _, response = self.post(self.payload(title=title)); self.assertEqual(status, 201)
        protocol = json.loads(response)['protocol']
        row = self.connection.execute('SELECT title,status FROM submissions WHERE id=?', (protocol,)).fetchone()
        self.assertEqual(row, (title, 'pending'))
        self.assertEqual(self.connection.execute('SELECT COUNT(*) FROM research').fetchone()[0], 4)
        self.assertNotIn(title.encode(), self.call('/api/catalog')[2])
    def test_honeypot_privacy_and_email(self):
        for fields in [self.payload(website='not-empty'), self.payload(privacy='0'), self.payload(email='invalid'), self.payload(message='short')]:
            self.assertEqual(self.post(fields)[0], 422)
    def test_rate_limit(self):
        for _ in range(5): self.assertEqual(self.post(self.payload())[0], 201)
        status, headers, _ = self.post(self.payload())
        self.assertEqual(status, 429); self.assertEqual(headers['Retry-After'], '3600')
    def test_research_quarantine_and_review(self):
        pdf = (ROOT / 'public/documents/termo-submissao.pdf').read_bytes()
        fields = self.payload(kind='research', voice='indigena', voice_consent='1', responsibility='1', adult='1')
        files = {'paper': ('research.pdf', 'application/pdf', pdf), 'declaration': ('unsigned-test.pdf', 'application/pdf', pdf)}
        status, _, body = self.post(fields, files); self.assertEqual(status, 201)
        protocol = json.loads(body)['protocol']
        stored = self.connection.execute('SELECT stored_name,bytes FROM attachments WHERE submission_id=?', (protocol,)).fetchall()
        self.assertEqual(len(stored), 2)
        self.assertIsNone(self.connection.execute('SELECT signature_verified_at FROM submissions WHERE id=?', (protocol,)).fetchone()[0])
        for name, size in stored:
            self.assertEqual(size, len(pdf)); self.assertTrue((Path(self.tmp.name) / 'uploads' / name).exists())
            self.assertEqual(self.call('/uploads/' + name)[0], 404)
        self.assertNotEqual(self.cli('submissions:review', protocol, 'approved', 'Teste sem validação real').returncode, 0)
        result = self.cli('submissions:review', protocol, 'rejected', 'Documento de teste; não houve assinatura real')
        self.assertEqual(result.returncode, 0, result.stderr)
    def test_reject_non_pdf_and_missing_attachment_without_orphans(self):
        before = len(list((Path(self.tmp.name) / 'uploads').glob('*')))
        fields = self.payload(kind='research', voice='nao-informada', responsibility='1', adult='1')
        fake = {'paper': ('not-a-pdf.pdf', 'application/pdf', b'Harmless plain text fixture, not a PDF document.')}
        self.assertEqual(self.post(fields, fake)[0], 422)
        pdf = (ROOT / 'public/documents/termo-submissao.pdf').read_bytes()
        self.assertEqual(self.post(fields, {'paper': ('paper.pdf', 'application/pdf', pdf)})[0], 422)
        self.assertEqual(before, len(list((Path(self.tmp.name) / 'uploads').glob('*'))))
    def test_sensitive_classification_requires_explicit_consent(self):
        self.assertEqual(self.post(self.payload(kind='research', voice='indigena', responsibility='1', adult='1'))[0], 422)
    def test_upload_extension_and_size_limits(self):
        fields = self.payload(kind='research', voice='nao-informada', responsibility='1', adult='1')
        pdf = (ROOT / 'public/documents/termo-submissao.pdf').read_bytes()
        before = self.connection.execute('SELECT COUNT(*) FROM attachments').fetchone()[0]
        for filename, data in [('document.txt', pdf), ('oversized.pdf', pdf + b' ' * (5 * 1024 * 1024))]:
            files = {'paper': (filename, 'application/pdf', data), 'declaration': ('declaration.pdf', 'application/pdf', pdf)}
            self.assertEqual(self.post(fields, files)[0], 422)
        self.assertEqual(self.connection.execute('SELECT COUNT(*) FROM attachments').fetchone()[0], before)
    def test_historical_import_and_overlap(self):
        feature = {'type': 'Feature', 'properties': {'id': 'fixture-test', 'name': 'TESTE - não publicar', 'people': 'Fixture', 'region': 'Teste', 'description': 'Somente teste automatizado.', 'official_status': 'Teste', 'source_url': 'https://example.com/source', 'source_date': '1980-01-01', 'retrieved_at': '2026-10-18', 'valid_from': 1980, 'valid_to': 1985}, 'geometry': {'type': 'Polygon', 'coordinates': [[[-60, -3], [-59, -3], [-59, -2], [-60, -2], [-60, -3]]]}}
        path = Path(self.tmp.name) / 'fixture.geojson'; path.write_text(json.dumps(feature), encoding='utf-8')
        result = self.cli('territories:import', str(path)); self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(len(json.loads(self.call('/api/territories?year=1982')[2])['features']), 1)
        self.assertEqual(len(json.loads(self.call('/api/territories?year=1979')[2])['features']), 0)
        self.assertNotEqual(self.cli('territories:import', str(path)).returncode, 0)
        self.connection.execute("DELETE FROM territory_snapshots WHERE territory_id='fixture-test'")
        self.connection.execute("DELETE FROM territories WHERE id='fixture-test'"); self.connection.commit()

if __name__ == '__main__': unittest.main(verbosity=2)
