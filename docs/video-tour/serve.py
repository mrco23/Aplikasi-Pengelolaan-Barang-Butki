"""Server lokal untuk komposer video tour: menyajikan folder ini dan menyimpan MP4 hasil ekspor.
python serve.py   lalu buka http://localhost:8791/"""
import http.server, os, re, sys
from urllib.parse import urlparse, parse_qs

ROOT = os.path.dirname(os.path.abspath(__file__))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8791


class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def do_POST(self):
        u = urlparse(self.path)
        name = parse_qs(u.query).get('name', [''])[0]
        if u.path != '/upload' or not re.fullmatch(r'[\w.-]+\.mp4', name):
            self.send_error(400); return
        n = int(self.headers.get('Content-Length', 0))
        with open(os.path.join(ROOT, name), 'wb') as f:
            left = n
            while left > 0:
                chunk = self.rfile.read(min(left, 1 << 20))
                if not chunk: break
                f.write(chunk); left -= len(chunk)
        print('tersimpan', name, n, 'byte', flush=True)
        self.send_response(200); self.end_headers(); self.wfile.write(b'ok')


http.server.ThreadingHTTPServer(('127.0.0.1', PORT), H).serve_forever()
