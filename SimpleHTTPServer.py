#!/usr/bin/env python3

# Python http.server that sets Access-Control-Allow-Origin header
# and acts as a reverse proxy for /v1/ API paths to bypass local CORS issues.

import sys
import http.server
import socketserver
import urllib.request
import urllib.error

PORT = 8080
API_TARGET = "http://localhost:8000"

class HTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def do_POST(self):
        if self.path.startswith('/v1/'):
            self.proxy_request('POST')
        else:
            super().do_POST()

    def do_GET(self):
        if self.path.startswith('/v1/'):
            self.proxy_request('GET')
        else:
            super().do_GET()

    def proxy_request(self, method):
        target_url = f"{API_TARGET}{self.path}"
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length) if content_length > 0 else None

        # Clean headers to forward to target
        headers = {}
        for key, val in self.headers.items():
            if key.lower() not in ('host', 'content-length', 'connection'):
                headers[key] = val

        req = urllib.request.Request(
            target_url,
            data=body,
            headers=headers,
            method=method
        )

        try:
            with urllib.request.urlopen(req) as response:
                self.send_response(response.status)
                # Forward response headers
                for key, val in response.getheaders():
                    if key.lower() not in ('transfer-encoding', 'content-length', 'connection', 'access-control-allow-origin'):
                        self.send_header(key, val)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(response.read())
        except urllib.error.HTTPError as e:
            self.send_response(e.code)
            for key, val in e.headers.items():
                if key.lower() not in ('transfer-encoding', 'content-length', 'connection', 'access-control-allow-origin'):
                    self.send_header(key, val)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(e.read())
        except urllib.error.URLError as e:
            self.send_response(502) # Bad Gateway
            self.send_header('Content-Type', 'text/plain')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            err_msg = f"CORS Proxy Error connecting to API backend at {API_TARGET}:\n{str(e)}\n\nPlease ensure your dice rolling backend server is running locally on port 8000."
            self.wfile.write(err_msg.encode())

def server(port):
    # Allow socket reuse to prevent port-in-use errors on restart
    socketserver.TCPServer.allow_reuse_address = True
    httpd = socketserver.TCPServer(('', port), HTTPRequestHandler)
    return httpd

if __name__ == "__main__":
    port = PORT
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print("Usage: python3 SimpleHTTPServer.py [port_number]")
            sys.exit(1)

    httpd = None
    # Try to find a bindable port
    for p in range(port, port + 10):
        try:
            httpd = server(p)
            port = p
            break
        except OSError as e:
            if e.errno == 98: # Address already in use
                print(f"Port {p} is currently in use.")
                continue
            else:
                raise e

    if not httpd:
        print(f"\nError: Could not bind to any ports between {port} and {port+9}.")
        print("To free port 8080, run the following command to terminate the previous process:")
        print("  fuser -k 8080/tcp  OR  kill -9 $(lsof -t -i:8080)")
        sys.exit(1)

    print(f"Server started at http://localhost:{port}/mRoller.html")
    print(f"CORS Proxying requests starting with /v1/ to backend API at {API_TARGET}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n...shutting down http server")
        httpd.shutdown()
        sys.exit()