const express = require('express');
const path = require('path');

const uploadRoutes = require('./routes/uploadRoutes');

const app = express();
const publicPath = path.join(__dirname, '..', '..', 'frontend', 'public');
const imagesPath = path.join(__dirname, '..', '..', 'frontend', 'images');

const isLoopbackHostname = (hostname) => ['localhost', '127.0.0.1', '::1', '[::1]'].includes(hostname);

const isPrivateIpv4Hostname = (hostname) => {
  const parts = hostname.split('.').map((value) => Number.parseInt(value, 10));

  if (parts.length !== 4 || parts.some((value) => Number.isNaN(value) || value < 0 || value > 255)) {
    return false;
  }

  return (
    parts[0] === 10
    || parts[0] === 127
    || (parts[0] === 169 && parts[1] === 254)
    || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31)
    || (parts[0] === 192 && parts[1] === 168)
  );
};

const isLocalNetworkHostname = (hostname) => {
  const normalizedHostname = hostname.toLowerCase();

  if (isLoopbackHostname(normalizedHostname) || normalizedHostname === '0.0.0.0') {
    return true;
  }

  if (isPrivateIpv4Hostname(normalizedHostname) || normalizedHostname.endsWith('.local')) {
    return true;
  }

  return !normalizedHostname.includes('.') && /^[a-z0-9-]+$/i.test(normalizedHostname);
};

const isAllowedLocalOrigin = (origin) => {
  if (origin === 'null') {
    return true;
  }

  try {
    const { protocol, hostname } = new URL(origin);

    if (protocol !== 'http:' && protocol !== 'https:') {
      return false;
    }

    return isLocalNetworkHostname(hostname);
  } catch (_error) {
    return false;
  }
};

const normalizeOrigin = (origin = '') => origin.trim().replace(/\/+$/, '');

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const configuredAllowedOriginPatterns = (process.env.CORS_ALLOWED_ORIGINS || process.env.FRONTEND_ORIGIN || '')
  .split(',')
  .map(normalizeOrigin)
  .filter(Boolean)
  .map((pattern) => new RegExp(`^${escapeRegExp(pattern).replace(/\\\*/g, '.*')}$`, 'i'));

const isAllowedConfiguredOrigin = (origin) => {
  if (!origin) {
    return false;
  }

  const normalizedOrigin = normalizeOrigin(origin);
  return configuredAllowedOriginPatterns.some((pattern) => pattern.test(normalizedOrigin));
};

const isAllowedOrigin = (origin) => isAllowedLocalOrigin(origin) || isAllowedConfiguredOrigin(origin);

const staticOptions = {
  etag: false,
  lastModified: false,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
};

const applyCors = (req, res, next) => {
  const origin = req.get('origin');

  if (origin && isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, X-Conversion-Warning');
  }

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(applyCors);
app.use(express.static(publicPath, staticOptions));
app.use('/images', express.static(imagesPath, staticOptions));

app.use('/upload', uploadRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use((err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;

  if (statusCode >= 500) {
    console.error('Erro interno na requisicao.', err);
  }

  res.status(statusCode).json({
    message: err.message || 'Erro interno no servidor.'
  });
});

module.exports = app;