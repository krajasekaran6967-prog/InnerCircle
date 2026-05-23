// Must be required before any app modules so DB_PATH is set first.
process.env.DB_PATH = ":memory:";

const http = require("node:http");
const app = require("../backend/app");

let server;
let baseUrl;

function start() {
  return new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
}

function stop() {
  return new Promise((resolve) => server.close(resolve));
}

// Minimal fetch-like helper that also handles cookies for session tests.
function request(method, path, { body, cookie } = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const payload = body ? JSON.stringify(body) : null;
    const headers = { "Content-Type": "application/json" };
    if (cookie) headers["Cookie"] = cookie;
    if (payload) headers["Content-Length"] = Buffer.byteLength(payload);

    const req = http.request(
      { hostname: url.hostname, port: url.port, path: url.pathname + url.search, method, headers },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data ? JSON.parse(data) : null,
            cookie: res.headers["set-cookie"]?.[0] ?? null,
          });
        });
      }
    );
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

module.exports = { start, stop, request };
