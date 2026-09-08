// Servidor estático minimalista, sin dependencias externas.
// Sirve index.html (y cualquier otro asset estático) para Railway.
const http = require('http');
const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

/* ================= META CONVERSIONS API (server-side) ================= */
// Placeholder: todavía no hay Meta Pixel conectado para este proyecto.
// Cuando lo tengas, pegá el Pixel ID acá (no es secreto, va también en el
// navegador) y agregá META_ACCESS_TOKEN como variable de entorno en Railway
// (ese sí es secreto — nunca lo hardcodees ni lo mandes al navegador).
const META_PIXEL_ID = process.env.META_PIXEL_ID || '';
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || '';

function sha256(v) {
  return crypto.createHash('sha256').update(String(v).trim().toLowerCase()).digest('hex');
}

function sendMetaCapiEvent(body, req) {
  if (!META_PIXEL_ID || !META_ACCESS_TOKEN) return; // no configurado todavia
  let data;
  try { data = JSON.parse(body); } catch (e) { return; }

  const xf = (req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const clientIp = xf || req.socket.remoteAddress || '';
  const userAgent = req.headers['user-agent'] || '';

  const userData = { client_user_agent: userAgent };
  if (clientIp) userData.client_ip_address = clientIp;
  if (data.email) userData.em = [sha256(data.email)];
  if (data.fbp) userData.fbp = data.fbp;
  if (data.fbc) userData.fbc = data.fbc;

  // Datos adicionales del quiz para mejorar la coincidencia de eventos (EMQ).
  // Meta exige TODOS estos campos hasheados con SHA256 (igual que el email).
  if (data.phone) {
    const digits = String(data.phone).replace(/[^0-9]/g, '');
    if (digits) userData.ph = [sha256(digits)];
  }
  if (data.name) {
    const parts = String(data.name).trim().split(/\s+/);
    if (parts[0]) userData.fn = [sha256(parts[0])];
    if (parts.length > 1) userData.ln = [sha256(parts.slice(1).join(' '))];
  }
  if (data.gender) {
    const g = String(data.gender).trim().toLowerCase();
    if (g === 'mujer') userData.ge = [sha256('f')];
    else if (g === 'hombre') userData.ge = [sha256('m')];
  }
  if (data.country) userData.country = [sha256(String(data.country).trim().toLowerCase())];

  const payload = JSON.stringify({
    data: [{
      event_name: data.eventName || 'Lead',
      event_time: Math.floor(Date.now() / 1000),
      event_id: data.eventId || undefined,
      action_source: 'website',
      event_source_url: data.url || '',
      user_data: userData,
    }],
  });

  const options = {
    hostname: 'graph.facebook.com',
    path: `/v20.0/${META_PIXEL_ID}/events?access_token=${encodeURIComponent(META_ACCESS_TOKEN)}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
  };
  const capiReq = https.request(options, (capiRes) => { capiRes.on('data', () => {}); });
  capiReq.on('error', () => { /* fallo silencioso: no debe romper el quiz */ });
  capiReq.write(payload);
  capiReq.end();
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);

  if (req.method === 'POST' && urlPath === '/api/capi-event') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; if (body.length > 1e5) req.destroy(); });
    req.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end('{"ok":true}');
      sendMetaCapiEvent(body, req); // fire-and-forget, no bloquea la respuesta
    });
    return;
  }

  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.normalize(path.join(ROOT, urlPath));

  // Evita path traversal fuera del directorio del proyecto.
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // SPA fallback: cualquier ruta no encontrada devuelve index.html
      fs.readFile(path.join(ROOT, 'index.html'), (err2, data2) => {
        if (err2) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        res.writeHead(200, { 'Content-Type': MIME['.html'] });
        res.end(data2);
      });
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Glúteos Pro quiz corriendo en el puerto ${PORT}`);
});
