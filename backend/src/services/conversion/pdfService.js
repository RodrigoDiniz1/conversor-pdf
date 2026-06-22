const { AsyncLocalStorage } = require('node:async_hooks');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { fileURLToPath, pathToFileURL } = require('node:url');
const fontkit = require('fontkit');
const { PDFDocument } = require('pdf-lib');

const { createZipFromDirectory } = require('../../utils/archiveUtils');
const {
  createFriendlyName,
  createJobId,
  ensureDirectory,
  normalizeBaseName
} = require('../../utils/fileUtils');
const {
  assertValidJpgFile,
  assertValidPdfFile,
  assertValidPngFile
} = require('./shared/fileValidation');

const outputRoot = path.join(__dirname, '..', '..', '..', 'tmp', 'output');
const PDF_RENDER_SCALE = 3;
const PDF_RENDER_MAX_PIXELS = 24_000_000;
const PDF_RENDER_MAX_DIMENSION = 8192;
const JPEG_ENCODING = 'jpeg';
const PNG_ENCODING = 'png';
const JPEG_ENCODING_QUALITY = 100;
const IMAGE_TO_PDF_PADDING = 0;
const FONT_FILE_EXTENSIONS = new Set(['.ttf', '.otf', '.ttc', '.otc']);
const PDF_LOADING_OPTIONS = {
  cMapPacked: true,
  disableFontFace: false,
  useSystemFonts: true,
  useWorkerFetch: false,
  isEvalSupported: false,
  verbosity: 0
};
const PDF_IMAGE_EXPORTS = Object.freeze({
  jpg: {
    extension: 'jpg',
    encoding: JPEG_ENCODING,
    encodingQuality: JPEG_ENCODING_QUALITY
  },
  png: {
    extension: 'png',
    encoding: PNG_ENCODING
  }
});
const PDF_RENDER_RUNTIME_UNAVAILABLE_MESSAGE = 'A conversão de PDF em imagens não está disponível neste servidor no momento.';

ensureDirectory(outputRoot);

let pdfJsModulePromise;
let pdfJsAssetUrls;
let pdfJsOwnerDocument;
let systemFontFileIndexPromise;
let canvasRuntime;
const fontDiagnosticsStorage = new AsyncLocalStorage();

const createFontDiagnostics = () => ({
  embeddedFamilies: new Set(),
  substitutionFamilies: new Set(),
  substitutionSources: new Set()
});

const getFontDiagnostics = () => fontDiagnosticsStorage.getStore();

const buildPdfCanvasRuntimeLoadError = (error) => {
  const runtimeError = new Error(String(error?.message || error || '').trim());
  runtimeError.pdfCanvasRuntimeUnavailable = true;
  return runtimeError;
};

const getGlobalFonts = () => {
  if (!canvasRuntime) {
    try {
      canvasRuntime = require('@napi-rs/canvas');
    } catch (error) {
      throw buildPdfCanvasRuntimeLoadError(error);
    }
  }

  return canvasRuntime.GlobalFonts;
};

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
    return 'Aviso: este PDF usou substituição de fontes do sistema. O resultado pode não ficar 100% fiel ao original.';
  }

  const visibleFamilies = sourceFamilies.slice(0, 3);
  const suffix = sourceFamilies.length > visibleFamilies.length ? ' e outras' : '';

  return `Aviso: este PDF usou substituição de fontes do sistema (${visibleFamilies.join(', ')}${suffix}). O resultado pode não ficar 100% fiel ao original.`;
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
      getGlobalFonts().removeBatch(this._fontKeys);
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
    const globalFonts = getGlobalFonts();
    const fontBuffer = Buffer.isBuffer(source)
      ? source
      : source instanceof ArrayBuffer
        ? Buffer.from(source)
        : Buffer.from(source.buffer, source.byteOffset, source.byteLength);

    const fontKey = globalFonts.register(fontBuffer, this.family);

    if (fontKey) {
      this._fontKeys.push(fontKey);
      recordEmbeddedFont(this.family);
    }
  }

  async _registerCssSource(source) {
    const globalFonts = getGlobalFonts();
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

      const fontKey = globalFonts.registerFromPath(fontPath, this.family);

      if (fontKey) {
        this._fontKeys.push(fontKey);
        recordSystemFontSubstitution(this.family, path.basename(fontPath, path.extname(fontPath)));
        return;
      }
    }
  }

  async _registerLocalSystemFontFamily(candidateName) {
    const globalFonts = getGlobalFonts();
    const systemFontPaths = await getSystemFontPathsByFamily(candidateName);

    for (const fontPath of systemFontPaths) {
      const fontKey = globalFonts.registerFromPath(fontPath, this.family);

      if (fontKey) {
        this._fontKeys.push(fontKey);
      }
    }

    if (this._fontKeys.length > 0) {
      recordSystemFontSubstitution(this.family, candidateName);
      return true;
    }

    if (globalFonts.has(candidateName)) {
      const aliasWasSet = globalFonts.setAlias(candidateName, this.family);

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
  if (error?.pdfCanvasRuntimeUnavailable) {
    return {
      statusCode: 503,
      message: PDF_RENDER_RUNTIME_UNAVAILABLE_MESSAGE
    };
  }

  if (error?.name === 'PasswordException') {
    return {
      statusCode: 400,
      message: 'Este PDF esta protegido por senha. Remova a senha do arquivo e tente converter novamente.'
    };
  }

  if (['InvalidPDFException', 'MissingPDFException'].includes(error?.name)) {
    return {
      statusCode: 400,
      message: 'O arquivo enviado nao parece ser um PDF valido ou esta corrompido.'
    };
  }

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

const createPdfToImageExportPaths = (file) => {
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

const createPdfPageImagePath = (imageDir, baseName, pageNumber, extension) => (
  path.join(imageDir, `${baseName}-pagina-${pageNumber}.${extension}`)
);

const getConstrainedRenderScale = (page) => {
  const unitViewport = page.getViewport({ scale: 1 });
  const pageWidth = Math.max(unitViewport.width, 1);
  const pageHeight = Math.max(unitViewport.height, 1);
  const dimensionScale = Math.min(
    PDF_RENDER_SCALE,
    PDF_RENDER_MAX_DIMENSION / pageWidth,
    PDF_RENDER_MAX_DIMENSION / pageHeight
  );
  const pixelScale = Math.sqrt(PDF_RENDER_MAX_PIXELS / (pageWidth * pageHeight));

  return Math.max(Math.min(dimensionScale, pixelScale), 0.1);
};

const encodeCanvasImage = (canvas, imageExport) => {
  if (imageExport.encodingQuality === undefined) {
    return canvas.encode(imageExport.encoding);
  }

  return canvas.encode(imageExport.encoding, imageExport.encodingQuality);
};

const renderPdfPageAsImage = async (page, imagePath, canvasFactory, imageExport) => {
  const viewport = page.getViewport({ scale: getConstrainedRenderScale(page) });
  let canvasAndContext;

  try {
    canvasAndContext = canvasFactory.create(viewport.width, viewport.height);

    canvasAndContext.context.fillStyle = '#ffffff';
    canvasAndContext.context.fillRect(0, 0, canvasAndContext.canvas.width, canvasAndContext.canvas.height);
    canvasAndContext.context.imageSmoothingEnabled = true;
    canvasAndContext.context.imageSmoothingQuality = 'high';

    const renderTask = page.render({
      canvasContext: canvasAndContext.context,
      viewport
    });

    await renderTask.promise;

    const imageBuffer = await encodeCanvasImage(canvasAndContext.canvas, imageExport);
    await fs.writeFile(imagePath, imageBuffer);
  } finally {
    page.cleanup();

    if (canvasAndContext) {
      canvasFactory.destroy(canvasAndContext);
    }
  }
};

const renderPdfDocumentPages = async (pdfDocument, imageDir, baseName, imageExport) => {
  const canvasFactory = pdfDocument.canvasFactory;
  const imagePaths = [];

  for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
    const page = await pdfDocument.getPage(pageNumber);
    const imagePath = createPdfPageImagePath(imageDir, baseName, pageNumber, imageExport.extension);

    await renderPdfPageAsImage(page, imagePath, canvasFactory, imageExport);
    imagePaths.push(imagePath);
  }

  return imagePaths;
};

const buildPdfImageExport = async ({ imagePaths, imageDir, baseName, zipPath, imageExport }) => {
  if (imagePaths.length === 1) {
    return {
      outputPath: imagePaths[0],
      downloadName: createFriendlyName(baseName, imageExport.extension),
      outputType: imageExport.extension
    };
  }

  await createZipFromDirectory(imageDir, zipPath);

  return {
    outputPath: zipPath,
    zipPath,
    downloadName: createFriendlyName(baseName, 'zip'),
    outputType: 'zip'
  };
};

const getPdfImageExport = (extension) => PDF_IMAGE_EXPORTS[extension] || PDF_IMAGE_EXPORTS.jpg;

const convertPdfToImages = async (file, extension = 'jpg') => {
  const imageExport = getPdfImageExport(extension);
  const { jobDir, imageDir, baseName, zipPath } = createPdfToImageExportPaths(file);
  const fontDiagnostics = createFontDiagnostics();
  let imagePaths = [];

  await assertValidPdfFile(file.path);

  const pdfData = new Uint8Array(await fs.readFile(file.path));

  await fs.mkdir(imageDir, { recursive: true });

  try {
    await fontDiagnosticsStorage.run(fontDiagnostics, async () => {
      const pdfjsLib = await loadPdfJs();
      const loadingTask = createPdfLoadingTask(pdfjsLib, pdfData);
      const pdfDocument = await loadingTask.promise;

      try {
        imagePaths = await renderPdfDocumentPages(pdfDocument, imageDir, baseName, imageExport);
      } finally {
        await pdfDocument.destroy();
      }
    });
  } catch (error) {
    throw buildPdfRenderError(error);
  }

  const exportResult = await buildPdfImageExport({
    imagePaths,
    imageDir,
    baseName,
    zipPath,
    imageExport
  });

  return {
    ...exportResult,
    jobDir,
    warningMessage: buildFontWarningMessage(fontDiagnostics)
  };
};

const convertPdfToJpg = (file) => convertPdfToImages(file, 'jpg');

const convertPdfToZip = (file) => convertPdfToJpg(file);

const convertPdfToPng = (file) => convertPdfToImages(file, 'png');

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
  imageWidth + padding * 2,
  imageHeight + padding * 2
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

const appendImagePage = async (pdfDoc, file, embedImage) => {
  const imageBytes = await fs.readFile(file.path);
  const image = await embedImage(pdfDoc, imageBytes);
  const { width: imageWidth, height: imageHeight } = getImageDimensions(image);
  const page = pdfDoc.addPage(createPdfPageSize(imageWidth, imageHeight, IMAGE_TO_PDF_PADDING));

  drawCenteredImage(page, image, imageWidth, imageHeight, IMAGE_TO_PDF_PADDING);
};

const convertImagesToPdf = async (files, {
  assertValidFile,
  embedImage,
  multipleBaseName
}) => {
  const pdfDoc = await PDFDocument.create();
  const { outputName, pdfPath } = createPdfOutputTarget(files, multipleBaseName);

  for (const file of files) {
    await assertValidFile(file.path);
    await appendImagePage(pdfDoc, file, embedImage);
  }

  const pdfBytes = await pdfDoc.save();
  await fs.writeFile(pdfPath, pdfBytes);

  return {
    pdfPath,
    downloadName: createFriendlyName(outputName, 'pdf')
  };
};

const convertJpgsToPdf = (files) => convertImagesToPdf(files, {
  assertValidFile: assertValidJpgFile,
  embedImage: (pdfDoc, imageBytes) => pdfDoc.embedJpg(imageBytes),
  multipleBaseName: 'imagens'
});

const convertPngsToPdf = (files) => convertImagesToPdf(files, {
  assertValidFile: assertValidPngFile,
  embedImage: (pdfDoc, imageBytes) => pdfDoc.embedPng(imageBytes),
  multipleBaseName: 'pngs'
});

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
  convertJpgsToPdf,
  convertPngsToPdf,
  convertPdfToPng,
  convertPdfToJpg,
  convertPdfToZip,
  mergePdfs,
  splitPdfToZip
};
