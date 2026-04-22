const express = require('express');
const path = require('path');

const uploadRoutes = require('./routes/uploadRoutes');

const app = express();
const publicPath = path.join(__dirname, '..', 'public');
const imagesPath = path.join(__dirname, '..', 'images');
const localOriginPattern = /^https?:\/\/(?:localhost|127(?:\.\d{1,3}){3}|\[::1\])(?::\d+)?$/i;

const staticOptions = {
  etag: false,
  lastModified: false,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
};

const applyLocalCors = (req, res, next) => {
  const origin = req.get('origin');

  if (origin && (origin === 'null' || localOriginPattern.test(origin))) {
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
app.use(applyLocalCors);
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