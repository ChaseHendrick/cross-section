#!/usr/bin/env python3
"""Serve the Cross-Sections folder over loopback HTTP and open the portable edition.

Uses only Python's standard library. The portable dist/cross-sections.html also opens
directly from a file; the server avoids some browser restrictions on local files.
Close this window, or press Ctrl+C, to stop it.
"""

import functools
import http.server
import os
import socketserver
import sys
import threading
import urllib.parse
import webbrowser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGE = 'dist/cross-sections.html'


class Quiet(http.server.SimpleHTTPRequestHandler):
    """Serve only this folder's own files, only to this computer."""

    extensions_map = dict(http.server.SimpleHTTPRequestHandler.extensions_map, **{'.js': 'text/javascript'})

    def log_message(self, fmt, *args):
        pass

    def send_head(self):
        host = (self.headers.get('Host') or '').rsplit(':', 1)[0].strip('[]').lower()
        parts = [p for p in urllib.parse.unquote(urllib.parse.urlsplit(self.path).path).split('/') if p]
        if host not in ('127.0.0.1', 'localhost') or any(p.startswith('.') for p in parts):
            self.send_error(404)
            return None
        return super().send_head()

    def list_directory(self, path):
        self.send_error(404)
        return None


def main():
    dev = '--dev' in sys.argv
    page = 'index.html' if dev else PAGE
    if not os.path.exists(os.path.join(ROOT, page)):
        sys.exit(page + ' was not found. Keep run/ inside the complete Cross-Sections folder.')
    handler = functools.partial(Quiet, directory=ROOT)
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('127.0.0.1', 0), handler) as httpd:
        url = 'http://127.0.0.1:%d/%s' % (httpd.server_address[1], page)
        print('Cross-Sections is running at ' + url)
        print('Leave this window open. Press Ctrl+C to stop.')
        threading.Timer(0.6, webbrowser.open, (url,)).start()
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print('\nStopped.')


if __name__ == '__main__':
    main()
