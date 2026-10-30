#!/usr/bin/env python3
"""
Feedback form backend for simakoov.ru (stdlib only, no pip installs).

Listens on 127.0.0.1:8787, nginx proxies https://simakoov.ru/api/feedback here.
Accepts the JSON the site's form already sends and delivers it to
  - email, via SMTP (Gmail app password), and/or
  - Telegram, via a bot.
Answers {"success": true} when at least one channel delivered the letter.

Settings come from environment variables (see feedback.env.example).
"""
import html
import json
import os
import smtplib
import ssl
import sys
import threading
import time
import urllib.parse
import urllib.request
from email.message import EmailMessage
from email.utils import formataddr
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

HOST = os.environ.get("FEEDBACK_HOST", "127.0.0.1")
PORT = int(os.environ.get("FEEDBACK_PORT", "8787"))

MAIL_TO = os.environ.get("MAIL_TO", "thesimakov@gmail.com")
SMTP_HOST = os.environ.get("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "465"))
SMTP_USER = os.environ.get("SMTP_USER", "")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "").replace(" ", "")

TG_BOT_TOKEN = os.environ.get("TG_BOT_TOKEN", "")
TG_CHAT_ID = os.environ.get("TG_CHAT_ID", "")

ALLOWED_ORIGINS = {
    o.strip()
    for o in os.environ.get(
        "ALLOWED_ORIGINS",
        "https://simakoov.ru,https://www.simakoov.ru,https://lemnity.github.io,http://localhost:5173",
    ).split(",")
    if o.strip()
}

MAX_BODY = 20_000
# Field name -> max length. Anything else in the payload is ignored.
FIELDS = {"name": 200, "contact": 200, "topic": 500, "message": 5000, "language": 10, "page": 500, "_subject": 300}
LABELS = {"name": "Имя", "contact": "Контакт", "topic": "Тема", "message": "Сообщение", "language": "Язык", "page": "Страница"}

# Simple per-IP rate limit: RATE_MAX requests per RATE_WINDOW seconds.
RATE_MAX, RATE_WINDOW = 5, 600
_hits: dict[str, list[float]] = {}
_hits_lock = threading.Lock()


def log(*args):
    print(*args, file=sys.stderr, flush=True)


def rate_limited(ip: str) -> bool:
    now = time.time()
    with _hits_lock:
        recent = [t for t in _hits.get(ip, []) if now - t < RATE_WINDOW]
        limited = len(recent) >= RATE_MAX
        if not limited:
            recent.append(now)
        _hits[ip] = recent
        return limited


def clean(data: dict) -> dict:
    out = {}
    for key, limit in FIELDS.items():
        value = data.get(key)
        out[key] = str(value).strip()[:limit] if value is not None else ""
    return out


def send_email(f: dict) -> None:
    if not (SMTP_USER and SMTP_PASSWORD):
        raise RuntimeError("SMTP is not configured")
    msg = EmailMessage()
    msg["Subject"] = " ".join((f["_subject"] or f"Заявка с сайта SIMAKOOV — {f['name']}").split())
    msg["From"] = formataddr(("Сайт SIMAKOOV", SMTP_USER))
    msg["To"] = MAIL_TO
    contact = f["contact"]
    if "@" in contact and not any(c.isspace() for c in contact) and not contact.startswith("@"):
        msg["Reply-To"] = contact
    lines = [f"{LABELS[k]}: {f[k] or '—'}" for k in LABELS if k != "message"]
    msg.set_content("\n".join(lines) + f"\n\n{LABELS['message']}:\n{f['message']}\n")
    rows = "".join(
        f"<tr><td style='padding:6px 12px;color:#888;vertical-align:top'>{LABELS[k]}</td>"
        f"<td style='padding:6px 12px;white-space:pre-wrap'>{html.escape(f[k] or '—')}</td></tr>"
        for k in LABELS
    )
    msg.add_alternative(f"<table style='font:14px sans-serif;border-collapse:collapse'>{rows}</table>", subtype="html")
    ctx = ssl.create_default_context()
    if SMTP_PORT == 465:
        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, context=ctx, timeout=10) as s:
            s.login(SMTP_USER, SMTP_PASSWORD)
            s.send_message(msg)
    else:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as s:
            s.starttls(context=ctx)
            s.login(SMTP_USER, SMTP_PASSWORD)
            s.send_message(msg)


def send_telegram(f: dict) -> None:
    if not (TG_BOT_TOKEN and TG_CHAT_ID):
        raise RuntimeError("Telegram is not configured")
    text = "<b>Новая заявка с сайта</b>\n\n" + "\n".join(
        f"<b>{LABELS[k]}:</b> {html.escape(f[k][:600] or '—')}" for k in LABELS if k != "message"
    ) + f"\n\n<b>{LABELS['message']}:</b>\n{html.escape(f['message'][:3000])}"
    body = urllib.parse.urlencode(
        {"chat_id": TG_CHAT_ID, "text": text, "parse_mode": "HTML", "disable_web_page_preview": "true"}
    ).encode()
    req = urllib.request.Request(f"https://api.telegram.org/bot{TG_BOT_TOKEN}/sendMessage", data=body)
    with urllib.request.urlopen(req, timeout=10) as res:
        if not json.load(res).get("ok"):
            raise RuntimeError("Telegram answered ok=false")


def deliver(f: dict) -> bool:
    delivered = False
    for name, fn in (("email", send_email), ("telegram", send_telegram)):
        try:
            fn(f)
            delivered = True
        except Exception as e:  # one channel failing must not hide the other
            log(f"[feedback] {name} failed: {e!r}")
    return delivered


class Handler(BaseHTTPRequestHandler):
    server_version = "feedback"

    def _cors(self):
        origin = self.headers.get("Origin", "")
        if origin in ALLOWED_ORIGINS:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
            self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type, Accept")
            self.send_header("Access-Control-Max-Age", "86400")

    def _json(self, code: int, payload: dict):
        body = json.dumps(payload).encode()
        self.send_response(code)
        self._cors()
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_POST(self):
        if self.path.split("?")[0].rstrip("/") != "/api/feedback":
            return self._json(404, {"success": False})
        ip = self.headers.get("X-Real-IP") or self.client_address[0]
        try:
            length = int(self.headers.get("Content-Length") or 0)
        except ValueError:
            length = 0
        if length <= 0 or length > MAX_BODY:
            return self._json(413, {"success": False})
        try:
            data = json.loads(self.rfile.read(length))
            if not isinstance(data, dict):
                raise ValueError
        except ValueError:
            return self._json(400, {"success": False})
        # Honeypot filled → pretend success, drop silently.
        if str(data.get("_honey") or "").strip():
            return self._json(200, {"success": True})
        f = clean(data)
        if not (f["name"] and f["contact"] and len(f["message"]) >= 10):
            return self._json(400, {"success": False, "error": "invalid"})
        if rate_limited(ip):
            return self._json(429, {"success": False, "error": "rate_limited"})
        if deliver(f):
            log(f"[feedback] delivered from {ip}")
            return self._json(200, {"success": True})
        return self._json(502, {"success": False, "error": "delivery_failed"})

    def log_message(self, fmt, *args):
        log(f"[http] {self.address_string()} {fmt % args}")


if __name__ == "__main__":
    log(f"[feedback] listening on {HOST}:{PORT}, email={'on' if SMTP_USER else 'off'}, telegram={'on' if TG_BOT_TOKEN else 'off'}")
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()
