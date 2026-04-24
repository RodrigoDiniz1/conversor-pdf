import { build } from 'esbuild';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const frontendRoot = process.cwd();
const publicDir = path.join(frontendRoot, 'public');
const imagesDir = path.join(frontendRoot, 'images');
const distDir = path.join(frontendRoot, 'dist');
const distImagesDir = path.join(distDir, 'images');
const indexTemplatePath = path.join(publicDir, 'index.html');

const usedImageAssets = [
  'pdf-svgrepo-com.svg',
  'pdf.webp',
  'powerpoint-svgrepo-com.svg',
  'untitled_design_1.webp',
  'word-svgrepo-com.svg'
];

const normalizeApiBaseUrl = (value = '') => value.trim().replace(/\/+$/, '');

const apiBaseUrl = normalizeApiBaseUrl(
  process.env.APP_API_BASE_URL
  || process.env.VITE_API_BASE_URL
  || process.env.API_BASE_URL
  || ''
);

const createStaticIndexHtml = () => {
  const indexHtml = readFileSync(indexTemplatePath, 'utf8');

  return indexHtml
    .replace(/styles\.css\?v=[^\"]+/g, 'styles.css')
    .replace(/config\.js\?v=[^\"]+/g, 'config.js')
    .replace(/app\.js\?v=[^\"]+/g, 'app.js')
    .replace(/\.\.\/images\//g, './images/');
};

const rewriteDistAssetPaths = (fileName) => {
  const filePath = path.join(distDir, fileName);
  const content = readFileSync(filePath, 'utf8');

  writeFileSync(filePath, content.replace(/\.\.\/images\//g, './images/'), 'utf8');
};

rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });

await build({
  entryPoints: [
    path.join(publicDir, 'app.js'),
    path.join(publicDir, 'styles.css')
  ],
  outdir: distDir,
  bundle: true,
  minify: true,
  charset: 'utf8',
  legalComments: 'none',
  platform: 'browser',
  target: ['es2020']
});

writeFileSync(path.join(distDir, 'index.html'), createStaticIndexHtml(), 'utf8');
rewriteDistAssetPaths('app.js');

if (existsSync(imagesDir)) {
  mkdirSync(distImagesDir, { recursive: true });

  usedImageAssets.forEach((assetName) => {
    const sourcePath = path.join(imagesDir, assetName);

    if (!existsSync(sourcePath)) {
      return;
    }

    cpSync(sourcePath, path.join(distImagesDir, assetName));
  });
}

writeFileSync(
  path.join(distDir, 'config.js'),
  `window.APP_CONFIG=Object.freeze({API_BASE_URL:${JSON.stringify(apiBaseUrl)}});\n`,
  'utf8'
);