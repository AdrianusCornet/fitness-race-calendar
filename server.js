const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 4173;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function serveFile(res, filePath) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      sendJson(res, 404, { error: 'Bestand niet gevonden' });
      return;
    }

    const extension = path.extname(filePath);
    const contentType = MIME_TYPES[extension] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

function sanitizePath(urlPath) {
  const target = urlPath === '/' ? '/index.html' : urlPath;
  const normalized = path.normalize(target).replace(/^\.+/, '');
  return path.join(ROOT, normalized);
}

const server = http.createServer((req, res) => {
  if (!req.url) {
    sendJson(res, 400, { error: 'Ongeldige request' });
    return;
  }

  if (req.url === '/api/events') {
    fs.readFile(path.join(ROOT, 'events.json'), 'utf-8', (error, raw) => {
      if (error) {
        sendJson(res, 500, { error: 'Kon events niet laden' });
        return;
      }

      try {
        const events = JSON.parse(raw);
        sendJson(res, 200, events);
      } catch (parseError) {
        sendJson(res, 500, { error: 'Eventdata is ongeldig JSON-formaat' });
      }
    });
    return;
  }

  const filePath = sanitizePath(req.url.split('?')[0]);
  if (!filePath.startsWith(ROOT)) {
    sendJson(res, 403, { error: 'Toegang geweigerd' });
    return;
  }

  serveFile(res, filePath);
});

server.listen(PORT, () => {
  console.log(`Fitness Race Kalender server draait op http://localhost:${PORT}`);
});
