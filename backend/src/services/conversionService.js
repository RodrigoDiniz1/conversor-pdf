const { AsyncLocalStorage } = require('async_hooks');
const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const { fileURLToPath, pathToFileURL } = require('url');
const fontkit = require('fontkit');
const { PDFDocument } = require('pdf-lib');
const { GlobalFonts } = require('@napi-rs/canvas');

const { createZipFromDirectory } = require('../utils/archiveUtils');
const {
  createFriendlyName,
  createJobId,
  ensureDirectory,
  normalizeBaseName
} = require('../utils/fileUtils');

const outputRoot = path.join(__dirname, '..', '..', 'tmp', 'output');
const PDF_RENDER_SCALE = 3;
const JPEG_ENCODING = 'jpeg';
const JPEG_ENCODING_QUALITY = 100;
const JPG_TO_PDF_PADDING = 24;
const DEFAULT_PDF_PAGE_WIDTH = 595.28;
const DEFAULT_PDF_PAGE_HEIGHT = 841.89;
const PDF_SIGNATURE = '%PDF-';
const PDF_SIGNATURE_SEARCH_BYTES = 1024;
const JPEG_SIGNATURE = [0xff, 0xd8, 0xff];
const FONT_FILE_EXTENSIONS = new Set(['.ttf', '.otf', '.ttc', '.otc']);
const PDF_LOADING_OPTIONS = {
  cMapPacked: true,
  disableFontFace: false,
  useSystemFonts: true,
  useWorkerFetch: false,
  isEvalSupported: false,
  verbosity: 0
};

ensureDirectory(outputRoot);

let pdfJsModulePromise;
let pdfJsAssetUrls;
let pdfJsOwnerDocument;
let systemFontFileIndexPromise;
const fontDiagnosticsStorage = new AsyncLocalStorage();

const createFontDiagnostics = () => ({
  embeddedFamilies: new Set(),
  substitutionFamilies: new Set(),
  substitutionSources: new Set()
});

const getFontDiagnostics = () => fontDiagnosticsStorage.getStore();

const normalizeFontFamilyName = (family) => family.trim().replace(/\s+/g, ' ').toLowerCase();

const buildFontLookupKeys = (name) => {
  if (!name || typeof name !== 'string') {
    return [];
  }

  const normalizedName = normalizeFontFamilyName(name);
  const compactName = normalizedName.replace(/[\s._-]+/g, '');

  return Array.from(new Set([normalizedName, compactName].filter(Boolean)));
};

const getFontRecordCandidateNames = (fontRecord) => {
  const names = [
    fontRecord?.familyName,
    fontRecord?.fullName,
    fontRecord?.postscriptName
  ];

  if (fontRecord?.familyName && fontRecord?.subfamilyName) {
    names.push(`${fontRecord.familyName} ${fontRecord.subfamilyName}`);
    names.push(`${fontRecord.familyName}-${fontRecord.subfamilyName}`);
  }

  return Array.from(new Set(names.filter(Boolean)));
};

const addFontFileToIndex = (index, familyName, fontPath) => {
  const lookupKeys = buildFontLookupKeys(familyName);

  if (lookupKeys.length === 0) {
    return;
  }

  for (const lookupKey of lookupKeys) {
    const currentPaths = index.get(lookupKey) || [];

    if (!currentPaths.includes(fontPath)) {
      currentPaths.push(fontPath);
      index.set(lookupKey, currentPaths);
    }
  }
};

const getSystemFontDirectories = () => {
  const homeDirectory = os.homedir();

  if (process.platform === 'win32') {
    const windowsDirectory = process.env.WINDIR || 'C:\\Windows';

    return [
      path.join(windowsDirectory, 'Fonts'),
      path.join(homeDirectory, 'AppData', 'Local', 'Microsoft', 'Windows', 'Fonts')
    ];
  }

  if (process.platform === 'darwin') {
    return [
      '/System/Library/Fonts',
      '/Library/Fonts',
      path.join(homeDirectory, 'Library', 'Fonts')
    ];
  }

  return [
    '/usr/share/fonts',
    '/usr/local/share/fonts',
    path.join(homeDirectory, '.fonts'),
    path.join(homeDirectory, '.local', 'share', 'fonts')
  ];
};

const collectFontFiles = async (directoryPath, bucket = []) => {
  let entries;

  try {
    entries = await fs.readdir(directoryPath, { withFileTypes: true });
  } catch (_error) {
    return bucket;
  }

  for (const entry of entries) {
    const entryPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      await collectFontFiles(entryPath, bucket);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const extension = path.extname(entry.name).toLowerCase();

    if (FONT_FILE_EXTENSIONS.has(extension)) {
      bucket.push(entryPath);
    }
  }

  return bucket;
};

const getFontRecords = (openedFont) => (Array.isArray(openedFont?.fonts) ? openedFont.fonts : [openedFont]);

const buildSystemFontFileIndex = async () => {
  const fontIndex = new Map();
  const fontDirectories = getSystemFontDirectories();
  const fontFiles = [];

  for (const fontDirectory of fontDirectories) {
    await collectFontFiles(fontDirectory, fontFiles);
  }

  for (const fontPath of fontFiles) {
    try {
      const openedFont = fontkit.openSync(fontPath);

      for (const fontRecord of getFontRecords(openedFont)) {
        const candidateNames = getFontRecordCandidateNames(fontRecord);

        candidateNames.forEach((candidateName) => {
          addFontFileToIndex(fontIndex, candidateName, fontPath);
        });
      }
    } catch (_error) {
      // Ignore unsupported or malformed font files while building the local index.
    }
  }

  return fontIndex;
};

const getSystemFontPathsByFamily = async (familyName) => {
  if (!systemFontFileIndexPromise) {
    systemFontFileIndexPromise = buildSystemFontFileIndex();
  }

  const fontIndex = await systemFontFileIndexPromise;
  const matchedPaths = new Set();

  buildFontLookupKeys(familyName).forEach((lookupKey) => {
    const currentPaths = fontIndex.get(lookupKey) || [];
    currentPaths.forEach((fontPath) => matchedPaths.add(fontPath));
  });

  return Array.from(matchedPaths);
};

const recordEmbeddedFont = (family) => {
  const diagnostics = getFontDiagnostics();

  if (diagnostics && family) {
    diagnostics.embeddedFamilies.add(family);
  }
};

const recordSystemFontSubstitution = (family, source) => {
  const diagnostics = getFontDiagnostics();

  if (!diagnostics) {
    return;
  }

  if (family) {
    diagnostics.substitutionFamilies.add(family);
  }

  if (source) {
    diagnostics.substitutionSources.add(source);
  }
};

const buildFontWarningMessage = (diagnostics) => {
  if (!diagnostics || diagnostics.substitutionFamilies.size === 0) {
    return null;
  }

  const sourceFamilies = Array.from(diagnostics.substitutionSources).filter(Boolean);

  if (sourceFamilies.length === 0) {
    return 'Aviso: este PDF usou substituicao de fontes do sistema. O resultado pode nao ficar 100% fiel ao original.';
  }

  const visibleFamilies = sourceFamilies.slice(0, 3);
  const suffix = sourceFamilies.length > visibleFamilies.length ? ' e outras' : '';

  return `Aviso: este PDF usou substituicao de fontes do sistema (${visibleFamilies.join(', ')}${suffix}). O resultado pode nao ficar 100% fiel ao original.`;
};

class CanvasFontFace {
  constructor(family, source, descriptors = {}) {
    this.family = family;
    this.source = source;
    this.descriptors = descriptors;
    this._fontKeys = [];
    this._loadPromise = null;
    this.loaded = this.load();
  }

  async load() {
    if (!this._loadPromise) {
      this._loadPromise = Promise.resolve().then(async () => {
        await this._registerSource();
        return this;
      });
    }

    return this._loadPromise;
  }

  unload() {
    if (this._fontKeys.length > 0) {
      GlobalFonts.removeBatch(this._fontKeys);
      this._fontKeys = [];
    }
  }

  async _registerSource() {
    if (Buffer.isBuffer(this.source) || ArrayBuffer.isView(this.source) || this.source instanceof ArrayBuffer) {
      this._registerBuffer(this.source);
      return;
    }

    if (typeof this.source === 'string') {
      await this._registerCssSource(this.source);
    }
  }

  _registerBuffer(source) {
    const fontBuffer = Buffer.isBuffer(source)
      ? source
      : source instanceof ArrayBuffer
        ? Buffer.from(source)
        : Buffer.from(source.buffer, source.byteOffset, source.byteLength);

    const fontKey = GlobalFonts.register(fontBuffer, this.family);

    if (fontKey) {
      this._fontKeys.push(fontKey);
      recordEmbeddedFont(this.family);
    }
  }

  async _registerCssSource(source) {
    const localMatches = [...source.matchAll(/local\(([^)]+)\)/g)];

    for (const match of localMatches) {
      const candidateName = match[1].trim().replace(/^['"]|['"]$/g, '');

      if (candidateName && await this._registerLocalSystemFontFamily(candidateName)) {
        return;
      }
    }

    const urlMatches = [...source.matchAll(/url\(([^)]+)\)/g)];

    for (const match of urlMatches) {
      const rawValue = match[1].trim().replace(/^['"]|['"]$/g, '');
      const fontPath = this._resolveFontPath(rawValue);

      if (!fontPath) {
        continue;
      }

      const fontKey = GlobalFonts.registerFromPath(fontPath, this.family);

      if (fontKey) {
        this._fontKeys.push(fontKey);
        recordSystemFontSubstitution(this.family, path.basename(fontPath, path.extname(fontPath)));
        return;
      }
    }
  }

  async _registerLocalSystemFontFamily(candidateName) {
    const systemFontPaths = await getSystemFontPathsByFamily(candidateName);

    for (const fontPath of systemFontPaths) {
      const fontKey = GlobalFonts.registerFromPath(fontPath, this.family);

      if (fontKey) {
        this._fontKeys.push(fontKey);
      }
    }

    if (this._fontKeys.length > 0) {
      recordSystemFontSubstitution(this.family, candidateName);
      return true;
    }

    if (GlobalFonts.has(candidateName)) {
      const aliasWasSet = GlobalFonts.setAlias(candidateName, this.family);

      if (aliasWasSet) {
        recordSystemFontSubstitution(this.family, candidateName);
        return true;
      }
    }

    return false;
  }

  _resolveFontPath(rawValue) {
    if (!rawValue) {
      return null;
    }

    if (rawValue.startsWith('file://')) {
      return fileURLToPath(rawValue);
    }

    if (path.isAbsolute(rawValue)) {
      return rawValue;
    }

    return null;
  }
}

const createPdfJsOwnerDocument = () => ({
  fonts: {
    add: () => {},
    delete: (fontFace) => {
      if (typeof fontFace?.unload === 'function') {
        fontFace.unload();
      }
    }
  }
});

const ensurePdfJsFontRuntime = () => {
  if (!pdfJsOwnerDocument) {
    pdfJsOwnerDocument = createPdfJsOwnerDocument();
  }

  if (typeof globalThis.FontFace === 'undefined') {
    globalThis.FontFace = CanvasFontFace;
  }

  return pdfJsOwnerDocument;
};

const loadPdfJs = async () => {
  if (!pdfJsModulePromise) {
    pdfJsModulePromise = import('pdfjs-dist/legacy/build/pdf.mjs');
  }

  return pdfJsModulePromise;
};

const toDirectoryUrl = (directoryPath) => {
  const href = pathToFileURL(directoryPath).href;
  return href.endsWith('/') ? href : `${href}/`;
};

const getPdfJsAssetUrls = () => {
  if (!pdfJsAssetUrls) {
    const pdfJsRoot = path.dirname(require.resolve('pdfjs-dist/package.json'));

    pdfJsAssetUrls = {
      cMapUrl: toDirectoryUrl(path.join(pdfJsRoot, 'cmaps')),
      standardFontDataUrl: toDirectoryUrl(path.join(pdfJsRoot, 'standard_fonts'))
    };
  }

  return pdfJsAssetUrls;
};

const buildPdfRenderError = (error) => {
  const baseMessage = 'Falha ao converter o PDF em imagens.';
  const detail = String(error.message || error);

  return {
    statusCode: 500,
    message: `${baseMessage} ${detail}`
  };
};

const buildPdfMergeError = (error) => {
  if (error?.statusCode) {
    return error;
  }

  const baseMessage = 'Falha ao juntar os arquivos PDF.';
  const detail = String(error.message || error);

  return {
    statusCode: 500,
    message: `${baseMessage} ${detail}`
  };
};

const buildInvalidFileError = (message) => ({
  statusCode: 400,
  message
});

const readFileHeader = async (filePath, headerLength) => {
  const fileHandle = await fs.open(filePath, 'r');
  const headerBuffer = Buffer.alloc(headerLength);

  try {
    const { bytesRead } = await fileHandle.read(headerBuffer, 0, headerLength, 0);
    return headerBuffer.subarray(0, bytesRead);
  } finally {
    await fileHandle.close();
  }
};

const hasPdfSignature = (headerBuffer) => headerBuffer.indexOf(Buffer.from(PDF_SIGNATURE, 'utf8')) !== -1;

const hasJpegSignature = (headerBuffer) => JPEG_SIGNATURE.every((byte, index) => headerBuffer[index] === byte);

const assertValidPdfFile = async (filePath) => {
  const headerBuffer = await readFileHeader(filePath, PDF_SIGNATURE_SEARCH_BYTES);

  if (!hasPdfSignature(headerBuffer)) {
    throw buildInvalidFileError('O arquivo enviado nao e um PDF valido.');
  }
};

const assertValidJpgFile = async (filePath) => {
  const headerBuffer = await readFileHeader(filePath, JPEG_SIGNATURE.length);

  if (!hasJpegSignature(headerBuffer)) {
    throw buildInvalidFileError('O arquivo enviado nao e uma imagem JPG/JPEG valida.');
  }
};

const createPdfToZipPaths = (file) => {
  const jobId = createJobId();
  const jobDir = path.join(outputRoot, jobId);
  const imageDir = path.join(jobDir, 'images');
  const baseName = normalizeBaseName(file.originalname);

  return {
    jobDir,
    imageDir,
    baseName,
    zipPath: path.join(jobDir, `${baseName}.zip`)
  };
};

const createPdfLoadingTask = (pdfjsLib, pdfData) => {
  const assetUrls = getPdfJsAssetUrls();
  const ownerDocument = ensurePdfJsFontRuntime();

  return pdfjsLib.getDocument({
    ...PDF_LOADING_OPTIONS,
    data: pdfData,
    cMapUrl: assetUrls.cMapUrl,
    ownerDocument,
    standardFontDataUrl: assetUrls.standardFontDataUrl
  });
};

const createPdfPageImagePath = (imageDir, baseName, pageNumber) => (
  path.join(imageDir, `${baseName}-pagina-${pageNumber}.jpg`)
);

const renderPdfPageAsJpg = async (page, imagePath, canvasFactory) => {
  const viewport = page.getViewport({ scale: PDF_RENDER_SCALE });
  const canvasAndContext = canvasFactory.create(viewport.width, viewport.height);

  canvasAndContext.context.fillStyle = '#ffffff';
  canvasAndContext.context.fillRect(0, 0, canvasAndContext.canvas.width, canvasAndContext.canvas.height);
  canvasAndContext.context.imageSmoothingEnabled = true;
  canvasAndContext.context.imageSmoothingQuality = 'high';

  const renderTask = page.render({
    canvasContext: canvasAndContext.context,
    viewport
  });

  await renderTask.promise;

  const imageBuffer = await canvasAndContext.canvas.encode(JPEG_ENCODING, JPEG_ENCODING_QUALITY);
  await fs.writeFile(imagePath, imageBuffer);

  page.cleanup();
  canvasFactory.destroy(canvasAndContext);
};

const renderPdfDocumentPages = async (pdfDocument, imageDir, baseName) => {
  const canvasFactory = pdfDocument.canvasFactory;

  for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
    const page = await pdfDocument.getPage(pageNumber);
    const imagePath = createPdfPageImagePath(imageDir, baseName, pageNumber);

    await renderPdfPageAsJpg(page, imagePath, canvasFactory);
  }
};

const convertPdfToZip = async (file) => {
  const { jobDir, imageDir, baseName, zipPath } = createPdfToZipPaths(file);
  const fontDiagnostics = createFontDiagnostics();

  await assertValidPdfFile(file.path);

  const pdfData = new Uint8Array(await fs.readFile(file.path));

  await fs.mkdir(imageDir, { recursive: true });

  try {
    await fontDiagnosticsStorage.run(fontDiagnostics, async () => {
      const pdfjsLib = await loadPdfJs();
      const loadingTask = createPdfLoadingTask(pdfjsLib, pdfData);
      const pdfDocument = await loadingTask.promise;

      await renderPdfDocumentPages(pdfDocument, imageDir, baseName);
    });

    await createZipFromDirectory(imageDir, zipPath);
  } catch (error) {
    throw buildPdfRenderError(error);
  }

  return {
    zipPath,
    jobDir,
    downloadName: createFriendlyName(baseName, 'zip'),
    warningMessage: buildFontWarningMessage(fontDiagnostics)
  };
};

const getImageDimensions = (image) => {
  const { width, height } = image.scale(1);
  return { width, height };
};

const fitImageToPage = (imageWidth, imageHeight, pageWidth, pageHeight, padding) => {
  const maxWidth = pageWidth - padding * 2;
  const maxHeight = pageHeight - padding * 2;
  const ratio = Math.min(maxWidth / imageWidth, maxHeight / imageHeight, 1);

  return {
    width: imageWidth * ratio,
    height: imageHeight * ratio
  };
};

const createPdfOutputTarget = (files, multipleBaseName = 'arquivos') => {
  const outputName = files.length === 1 ? normalizeBaseName(files[0].originalname) : `${multipleBaseName}-${createJobId()}`;

  return {
    outputName,
    pdfPath: path.join(outputRoot, `${outputName}.pdf`)
  };
};

const createPdfPageSize = (imageWidth, imageHeight, padding) => ([
  Math.max(imageWidth + padding * 2, DEFAULT_PDF_PAGE_WIDTH),
  Math.max(imageHeight + padding * 2, DEFAULT_PDF_PAGE_HEIGHT)
]);

const drawCenteredImage = (page, image, imageWidth, imageHeight, padding) => {
  const { width: pageWidth, height: pageHeight } = page.getSize();
  const fitted = fitImageToPage(imageWidth, imageHeight, pageWidth, pageHeight, padding);

  page.drawImage(image, {
    x: (pageWidth - fitted.width) / 2,
    y: (pageHeight - fitted.height) / 2,
    width: fitted.width,
    height: fitted.height
  });
};

const appendJpgPage = async (pdfDoc, file) => {
  const imageBytes = await fs.readFile(file.path);
  const image = await pdfDoc.embedJpg(imageBytes);
  const { width: imageWidth, height: imageHeight } = getImageDimensions(image);
  const page = pdfDoc.addPage(createPdfPageSize(imageWidth, imageHeight, JPG_TO_PDF_PADDING));

  drawCenteredImage(page, image, imageWidth, imageHeight, JPG_TO_PDF_PADDING);
};

const convertJpgsToPdf = async (files) => {
  const pdfDoc = await PDFDocument.create();
  const { outputName, pdfPath } = createPdfOutputTarget(files, 'imagens');

  for (const file of files) {
    await assertValidJpgFile(file.path);
    await appendJpgPage(pdfDoc, file);
  }

  const pdfBytes = await pdfDoc.save();
  await fs.writeFile(pdfPath, pdfBytes);

  return {
    pdfPath,
    downloadName: createFriendlyName(outputName, 'pdf')
  };
};

const appendPdfFilePages = async (targetPdfDoc, file) => {
  await assertValidPdfFile(file.path);

  const sourcePdfBytes = await fs.readFile(file.path);
  const sourcePdf = await PDFDocument.load(sourcePdfBytes);
  const copiedPages = await targetPdfDoc.copyPages(sourcePdf, sourcePdf.getPageIndices());

  copiedPages.forEach((page) => {
    targetPdfDoc.addPage(page);
  });
};

const mergePdfs = async (files) => {
  const pdfDoc = await PDFDocument.create();
  const { outputName, pdfPath } = createPdfOutputTarget(files, 'pdfs-unidos');

  try {
    for (const file of files) {
      await appendPdfFilePages(pdfDoc, file);
    }
  } catch (error) {
    throw buildPdfMergeError(error);
  }

  const pdfBytes = await pdfDoc.save();
  await fs.writeFile(pdfPath, pdfBytes);

  return {
    pdfPath,
    downloadName: createFriendlyName(outputName, 'pdf')
  };
};

const buildSplitPdfPageName = (baseName, pageIndex) => {
  const pageLabel = String(pageIndex + 1).padStart(3, '0');
  return `${baseName}-pagina-${pageLabel}`;
};

const splitPdfToZip = async (file) => {
  await assertValidPdfFile(file.path);

  const inputBytes = await fs.readFile(file.path);
  const sourcePdf = await PDFDocument.load(inputBytes);
  const outputName = normalizeBaseName(file.originalname);
  const jobDir = path.join(outputRoot, createJobId());
  const zipPath = path.join(outputRoot, `${outputName}-dividido.zip`);

  await ensureDirectory(jobDir);

  for (const pageIndex of sourcePdf.getPageIndices()) {
    const splitPdf = await PDFDocument.create();
    const [copiedPage] = await splitPdf.copyPages(sourcePdf, [pageIndex]);

    splitPdf.addPage(copiedPage);

    const splitPdfBytes = await splitPdf.save();
    const pageName = buildSplitPdfPageName(outputName, pageIndex);
    await fs.writeFile(path.join(jobDir, `${pageName}.pdf`), splitPdfBytes);
  }

  await createZipFromDirectory(jobDir, zipPath);

  return {
    zipPath,
    jobDir,
    downloadName: createFriendlyName(`${outputName}-dividido`, 'zip')
  };
};

module.exports = {
  convertPdfToZip,
  convertJpgsToPdf,
  mergePdfs,
  splitPdfToZip
};