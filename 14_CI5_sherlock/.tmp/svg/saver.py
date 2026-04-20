"""Tiny HTTP server that accepts POSTed PNGs and saves them to disk.

Endpoints:
  GET  /jobs          → returns jobs.json (work plan), filtering out entries whose PNG already exists
  POST /save?path=X   → saves PNG bytes at site/img/X
  POST /log           → appends the body (one JSON line) to capture_log.jsonl
"""
import base64, json, pathlib, re
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

PROJECT = pathlib.Path(r"C:\project\CI5 sherlock")
BASE = PROJECT / "site" / "img"
JOBS_FILE = PROJECT / ".tmp" / "svg" / "jobs.json"
LOG_FILE = PROJECT / ".tmp" / "svg" / "capture_log.jsonl"
PORT = 8766

class Handler(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(204); self._cors(); self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/jobs":
            jobs = json.loads(JOBS_FILE.read_text(encoding="utf-8"))
            qs = parse_qs(parsed.query)
            only_missing = qs.get("only_missing", ["1"])[0] == "1"
            skip_logged = qs.get("skip_logged", ["1"])[0] == "1"
            skipped = set()
            if skip_logged and LOG_FILE.exists():
                for line in LOG_FILE.read_text(encoding="utf-8").splitlines():
                    line = line.strip()
                    if not line:
                        continue
                    try:
                        row = json.loads(line)
                    except Exception:
                        continue
                    key = (row.get("cancer"), row.get("id"))
                    # Skip if already logged — either success or terminal failure
                    skipped.add(key)
            if only_missing:
                jobs = [j for j in jobs if not (BASE / j["filename"]).exists()]
            if skipped:
                jobs = [j for j in jobs if (j["cancer"], j["id"]) not in skipped]
            payload = json.dumps(jobs).encode("utf-8")
            self.send_response(200); self._cors()
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers(); self.wfile.write(payload); return
        self.send_response(404); self._cors(); self.end_headers()

    def do_POST(self):
        parsed = urlparse(self.path)
        n = int(self.headers.get("Content-Length", "0"))
        body = self.rfile.read(n)
        if parsed.path == "/log":
            LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
            with LOG_FILE.open("a", encoding="utf-8") as fh:
                fh.write(body.decode("utf-8").rstrip("\n") + "\n")
            self.send_response(200); self._cors(); self.end_headers()
            self.wfile.write(b"logged"); return
        if parsed.path == "/save":
            qs = parse_qs(parsed.query)
            rel = qs.get("path", [""])[0]
            if not rel or ".." in rel:
                self.send_response(400); self._cors(); self.end_headers()
                self.wfile.write(b"bad path"); return
            body_str = body.decode("latin1")
            m = re.match(r"data:image/png;base64,(.+)", body_str, re.DOTALL)
            b64 = m.group(1) if m else body_str
            png = base64.b64decode(b64)
            out = BASE / rel
            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_bytes(png)
            self.send_response(200); self._cors(); self.end_headers()
            self.wfile.write(f"wrote {out} ({len(png)} bytes)".encode()); return
        self.send_response(404); self._cors(); self.end_headers()

    def log_message(self, *a, **k): pass

if __name__ == "__main__":
    with ThreadingHTTPServer(("127.0.0.1", PORT), Handler) as srv:
        print(f"saver on http://127.0.0.1:{PORT}")
        srv.serve_forever()
