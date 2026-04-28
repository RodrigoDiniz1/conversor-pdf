const { execFile } = require('node:child_process');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { promisify } = require('node:util');
const { pathToFileURL } = require('node:url');
const officeParser = require('officeparser');
const { PDFDocument, StandardFonts } = require('pdf-lib');

const {
  createFriendlyName,
  createJobId,
  ensureDirectory,
  normalizeBaseName,
  removePath
} = require('../../utils/fileUtils');
const {
  assertValidPdfFile,
  buildInvalidFileError,
  hasSupportedExtension
} = require('./shared/fileValidation');

const outputRoot = path.join(__dirname, '..', '..', '..', 'tmp', 'output');
const execFileAsync = promisify(execFile);
const DEFAULT_PDF_PAGE_WIDTH = 595.28;
const DEFAULT_PDF_PAGE_HEIGHT = 841.89;
const POWERPOINT_PAGE_SIZE = [DEFAULT_PDF_PAGE_HEIGHT, DEFAULT_PDF_PAGE_WIDTH];
const OFFICE_BINARY_NOT_FOUND_CODE = 'OFFICE_BINARY_NOT_FOUND';
const WORD_EXTENSIONS = new Set(['.doc', '.docx']);
const POWERPOINT_EXTENSIONS = new Set(['.ppt', '.pptx']);
const WORD_TEXT_FALLBACK_EXTENSIONS = new Set(['.docx']);
const POWERPOINT_TEXT_FALLBACK_EXTENSIONS = new Set(['.pptx']);
const OFFICE_CONVERSION_TIMEOUT_MS = (() => {
  const parsed = Number.parseInt(process.env.LIBREOFFICE_TIMEOUT_MS || '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 120000;
})();
const OFFICE_PAGE_MARGIN = 48;
const OFFICE_PAGE_MIN_Y = 36;
const OFFICE_PAGE_FOOTER_Y = 18;
const OFFICE_PAGE_TITLE_SIZE = 18;
const OFFICE_PAGE_TITLE_LINE_HEIGHT = 24;
const OFFICE_PAGE_RUNNING_TITLE_SIZE = 9;
const OFFICE_PAGE_RUNNING_TITLE_LINE_HEIGHT = 13;
const OFFICE_PAGE_SUBTITLE_SIZE = 10;
const OFFICE_BODY_FONT_SIZE = 11;
const OFFICE_BODY_LINE_HEIGHT = 16;
const OFFICE_PARAGRAPH_SPACING = 10;
const OFFICE_INVALID_FILE_TOKENS = [
  'invalid',
  'corrupt',
  'malformed',
  'unsupported',
  'zip',
  'central directory',
  'end of central directory',
  'parse'
];

ensureDirectory(outputRoot);

const buildOfficeBinaryUnavailableError = (message) => ({
  statusCode: 503,
  code: OFFICE_BINARY_NOT_FOUND_CODE,
  message
});

const isOfficeBinaryUnavailableError = (error) => error?.code === OFFICE_BINARY_NOT_FOUND_CODE;

const buildOfficeConversionError = (error, { invalidFileMessage, failureMessage }) => {
  if (error?.statusCode) {
    return error;
  }

  const detail = String(error?.message || error || '').trim();
  const normalizedDetail = detail.toLowerCase();
  const isInvalidFile = OFFICE_INVALID_FILE_TOKENS.some((token) => normalizedDetail.includes(token));

  if (isInvalidFile) {
    return buildInvalidFileError(invalidFileMessage);
  }

  return {
    statusCode: 500,
    message: detail ? `${failureMessage} ${detail}` : failureMessage
  };
};

const createOfficePdfOutputTarget = (file) => {
  const outputName = normalizeBaseName(file.originalname);
  const uploadedBaseName = path.basename(file.path, path.extname(file.path));

  return {
    outputName,
    pdfPath: path.join(outputRoot, `${uploadedBaseName}.pdf`)
  };
};

const getLibreOfficeCommandCandidates = () => Array.from(new Set([
  process.env.LIBREOFFICE_PATH,
  process.platform === 'win32' ? 'C:\\Program Files\\LibreOffice\\program\\soffice.exe' : null,
  process.platform === 'win32' ? 'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe' : null,
  'soffice',
  process.platform === 'win32' ? null : 'libreoffice'
].filter(Boolean)));

const isMissingOfficeBinaryError = (error, command) => {
  if (!['ENOENT', 'EACCES'].includes(error?.code)) {
    return false;
  }

  if (typeof error?.syscall === 'string' && error.syscall.startsWith('spawn')) {
    return true;
  }

  if (!error?.path || !command) {
    return false;
  }

  return path.normalize(error.path).toLowerCase() === path.normalize(command).toLowerCase();
};

const createLibreOfficeProfileDir = () => path.join(os.tmpdir(), `libreoffice-profile-${createJobId()}`);

const createLibreOfficeArguments = (file, outputDirectory, profileDir) => ([
  `-env:UserInstallation=${pathToFileURL(profileDir).href}`,
  '--headless',
  '--nologo',
  '--nofirststartwizard',
  '--nodefault',
  '--norestore',
  '--nolockcheck',
  '--invisible',
  '--convert-to',
  'pdf',
  '--outdir',
  outputDirectory,
  file.path
]);

const runLibreOfficeConversion = async (file, {
  invalidFileMessage,
  failureMessage,
  unavailableMessage
}) => {
  const { outputName, pdfPath } = createOfficePdfOutputTarget(file);
  const commandCandidates = getLibreOfficeCommandCandidates();

  await removePath(pdfPath);

  for (const command of commandCandidates) {
    const profileDir = createLibreOfficeProfileDir();

    try {
      await execFileAsync(command, createLibreOfficeArguments(file, outputRoot, profileDir), {
        windowsHide: true,
        timeout: OFFICE_CONVERSION_TIMEOUT_MS,
        maxBuffer: 1024 * 1024 * 8
      });

      await assertValidPdfFile(pdfPath);

      return {
        pdfPath,
        downloadName: createFriendlyName(outputName, 'pdf'),
        warningMessage: ''
      };
    } catch (error) {
      if (isMissingOfficeBinaryError(error, command)) {
        continue;
      }

      throw buildOfficeConversionError(error, {
        invalidFileMessage,
        failureMessage
      });
    } finally {
      await removePath(profileDir);
    }
  }

  throw buildOfficeBinaryUnavailableError(unavailableMessage);
};

const extractOfficePlainText = (ast) => {
  if (typeof ast?.toText === 'function') {
    return ast.toText();
  }

  if (typeof ast?.text === 'string') {
    return ast.text;
  }

  return '';
};

const normalizeOfficeText = (text) => String(text || '')
  .replace(/\r\n/g, '\n')
  .replace(/\r/g, '\n')
  .replace(/\u0000/g, '')
  .split('\n')
  .map((line) => line.trimEnd())
  .join('\n')
  .replace(/\n{3,}/g, '\n\n')
  .trim();

const createOfficeParagraphs = (text) => normalizeOfficeText(text)
  .split(/\n{2,}/)
  .map((paragraph) => paragraph.trim())
  .filter(Boolean);

const getOriginalDocumentTitle = (file) => (
  path.basename(file.originalname, path.extname(file.originalname)).trim() || 'Documento'
);

const findWrapIndex = (text, font, fontSize, maxWidth) => {
  for (let index = text.length; index > 1; index -= 1) {
    if (font.widthOfTextAtSize(text.slice(0, index), fontSize) <= maxWidth) {
      return index;
    }
  }

  return 1;
};

const splitTokenByWidth = (token, font, fontSize, maxWidth) => {
  if (font.widthOfTextAtSize(token, fontSize) <= maxWidth) {
    return [token];
  }

  const parts = [];
  let remaining = token;

  while (remaining) {
    const wrapIndex = findWrapIndex(remaining, font, fontSize, maxWidth);
    parts.push(remaining.slice(0, wrapIndex));
    remaining = remaining.slice(wrapIndex);
  }

  return parts;
};

const wrapTextToWidth = (text, font, fontSize, maxWidth) => {
  const wrappedLines = [];

  for (const rawLine of String(text).split('\n')) {
    const line = rawLine.replace(/\s+/g, ' ').trim();

    if (!line) {
      wrappedLines.push('');
      continue;
    }

    const words = line.split(' ');
    let currentLine = '';

    for (const word of words) {
      const wordParts = splitTokenByWidth(word, font, fontSize, maxWidth);

      for (let partIndex = 0; partIndex < wordParts.length; partIndex += 1) {
        const wordPart = wordParts[partIndex];
        const candidateLine = currentLine ? `${currentLine} ${wordPart}` : wordPart;

        if (font.widthOfTextAtSize(candidateLine, fontSize) <= maxWidth) {
          currentLine = candidateLine;
        } else {
          if (currentLine) {
            wrappedLines.push(currentLine);
          }

          currentLine = wordPart;
        }

        if (partIndex < wordParts.length - 1) {
          wrappedLines.push(currentLine);
          currentLine = '';
        }
      }
    }

    if (currentLine) {
      wrappedLines.push(currentLine);
    }
  }

  return wrappedLines;
};

const createOfficePageState = ({
  pdfDoc,
  pageSize,
  title,
  subtitle,
  regularFont,
  boldFont,
  pageNumber
}) => {
  const nextPageNumber = pageNumber + 1;
  const page = pdfDoc.addPage(pageSize);
  const { width, height } = page.getSize();
  const isFirstPage = nextPageNumber === 1;
  const titleFont = isFirstPage ? boldFont : regularFont;
  const titleSize = isFirstPage ? OFFICE_PAGE_TITLE_SIZE : OFFICE_PAGE_RUNNING_TITLE_SIZE;
  const titleLineHeight = isFirstPage
    ? OFFICE_PAGE_TITLE_LINE_HEIGHT
    : OFFICE_PAGE_RUNNING_TITLE_LINE_HEIGHT;
  const titleLines = wrapTextToWidth(title, titleFont, titleSize, width - OFFICE_PAGE_MARGIN * 2);
  let cursorY = height - OFFICE_PAGE_MARGIN;

  titleLines.forEach((line) => {
    page.drawText(line, {
      x: OFFICE_PAGE_MARGIN,
      y: cursorY,
      size: titleSize,
      font: titleFont
    });

    cursorY -= titleLineHeight;
  });

  if (isFirstPage && subtitle) {
    page.drawText(subtitle, {
      x: OFFICE_PAGE_MARGIN,
      y: cursorY,
      size: OFFICE_PAGE_SUBTITLE_SIZE,
      font: regularFont
    });

    cursorY -= OFFICE_PAGE_SUBTITLE_SIZE + OFFICE_PARAGRAPH_SPACING + 6;
  } else {
    cursorY -= 6;
  }

  const footerLabel = `Pagina ${nextPageNumber}`;
  page.drawText(footerLabel, {
    x: width - OFFICE_PAGE_MARGIN - regularFont.widthOfTextAtSize(footerLabel, 8),
    y: OFFICE_PAGE_FOOTER_Y,
    size: 8,
    font: regularFont
  });

  return {
    page,
    pageNumber: nextPageNumber,
    cursorY
  };
};

const renderOfficeParagraphsToPdf = async ({ pdfDoc, pageSize, title, subtitle, paragraphs }) => {
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  let pageState = createOfficePageState({
    pdfDoc,
    pageSize,
    title,
    subtitle,
    regularFont,
    boldFont,
    pageNumber: 0
  });

  for (const paragraph of paragraphs) {
    const maxWidth = pageState.page.getWidth() - OFFICE_PAGE_MARGIN * 2;
    const lines = wrapTextToWidth(paragraph, regularFont, OFFICE_BODY_FONT_SIZE, maxWidth);

    for (const line of lines) {
      if (pageState.cursorY - OFFICE_BODY_LINE_HEIGHT < OFFICE_PAGE_MIN_Y) {
        pageState = createOfficePageState({
          pdfDoc,
          pageSize,
          title,
          subtitle,
          regularFont,
          boldFont,
          pageNumber: pageState.pageNumber
        });
      }

      if (!line) {
        pageState.cursorY -= OFFICE_BODY_LINE_HEIGHT / 2;
        continue;
      }

      pageState.page.drawText(line, {
        x: OFFICE_PAGE_MARGIN,
        y: pageState.cursorY,
        size: OFFICE_BODY_FONT_SIZE,
        font: regularFont
      });

      pageState.cursorY -= OFFICE_BODY_LINE_HEIGHT;
    }

    pageState.cursorY -= OFFICE_PARAGRAPH_SPACING;
  }
};

const convertOfficeTextToPdf = async (file, {
  supportedExtensions,
  invalidFileMessage,
  failureMessage,
  textFallback
}) => {
  const {
    emptyContentMessage,
    subtitle,
    pageSize,
    parseConfig,
    warningMessage
  } = textFallback;

  if (!hasSupportedExtension(file.originalname, supportedExtensions)) {
    throw buildInvalidFileError(invalidFileMessage);
  }

  try {
    const ast = await officeParser.parseOffice(file.path, parseConfig);
    const paragraphs = createOfficeParagraphs(extractOfficePlainText(ast));

    if (paragraphs.length === 0) {
      throw buildInvalidFileError(emptyContentMessage);
    }

    const pdfDoc = await PDFDocument.create();
    const title = getOriginalDocumentTitle(file);
    const { outputName, pdfPath } = createOfficePdfOutputTarget(file);

    await removePath(pdfPath);

    await renderOfficeParagraphsToPdf({
      pdfDoc,
      pageSize,
      title,
      subtitle,
      paragraphs
    });

    const pdfBytes = await pdfDoc.save();
    await fs.writeFile(pdfPath, pdfBytes);

    return {
      pdfPath,
      downloadName: createFriendlyName(outputName, 'pdf'),
      warningMessage
    };
  } catch (error) {
    throw buildOfficeConversionError(error, {
      invalidFileMessage,
      failureMessage
    });
  }
};

const convertOfficeDocumentToPdf = async (file, {
  supportedExtensions,
  invalidFileMessage,
  failureMessage,
  unavailableMessage,
  textFallback
}) => {
  if (!hasSupportedExtension(file.originalname, supportedExtensions)) {
    throw buildInvalidFileError(invalidFileMessage);
  }

  try {
    return await runLibreOfficeConversion(file, {
      invalidFileMessage,
      failureMessage,
      unavailableMessage
    });
  } catch (error) {
    if (
      isOfficeBinaryUnavailableError(error)
      && hasSupportedExtension(file.originalname, textFallback.supportedExtensions)
    ) {
      return convertOfficeTextToPdf(file, {
        supportedExtensions: textFallback.supportedExtensions,
        invalidFileMessage,
        failureMessage,
        textFallback
      });
    }

    throw error;
  }
};

const createOfficeConverter = (profile) => async (file) => convertOfficeDocumentToPdf(file, profile);

const OFFICE_CONVERSION_PROFILES = Object.freeze({
  word: {
    supportedExtensions: WORD_EXTENSIONS,
    invalidFileMessage: 'Envie um arquivo DOC ou DOCX valido.',
    failureMessage: 'Falha ao converter o arquivo Word em PDF.',
    unavailableMessage: 'A conversao de arquivos Word exige LibreOffice no servidor. Configure o binario em LIBREOFFICE_PATH ou use a imagem de deploy com LibreOffice.',
    textFallback: {
      supportedExtensions: WORD_TEXT_FALLBACK_EXTENSIONS,
      emptyContentMessage: 'Nao foi possivel extrair texto do arquivo enviado. Quando o LibreOffice nao estiver disponivel, a conversao de Word para PDF so consegue recriar o PDF a partir do texto do DOCX.',
      subtitle: 'PDF recriado a partir do conteudo textual do arquivo DOCX.',
      pageSize: [DEFAULT_PDF_PAGE_WIDTH, DEFAULT_PDF_PAGE_HEIGHT],
      parseConfig: {
        includeBreakNodes: true,
        newlineDelimiter: '\n\n'
      },
      warningMessage: 'O LibreOffice nao estava disponivel. O PDF final foi recriado a partir do texto extraido do DOCX, por isso fontes, tabelas complexas, imagens e a diagramacao original podem variar.'
    }
  },
  powerpoint: {
    supportedExtensions: POWERPOINT_EXTENSIONS,
    invalidFileMessage: 'Envie um arquivo PPT ou PPTX valido.',
    failureMessage: 'Falha ao converter o arquivo PowerPoint em PDF.',
    unavailableMessage: 'A conversao de arquivos PowerPoint exige LibreOffice no servidor. Configure o binario em LIBREOFFICE_PATH ou use a imagem de deploy com LibreOffice.',
    textFallback: {
      supportedExtensions: POWERPOINT_TEXT_FALLBACK_EXTENSIONS,
      emptyContentMessage: 'Nao foi possivel extrair texto dos slides enviados. Quando o LibreOffice nao estiver disponivel, a conversao de PowerPoint para PDF so consegue recriar o PDF a partir do texto do PPTX.',
      subtitle: 'PDF recriado a partir do conteudo textual dos slides do arquivo PPTX.',
      pageSize: POWERPOINT_PAGE_SIZE,
      parseConfig: {
        ignoreNotes: true,
        newlineDelimiter: '\n\n'
      },
      warningMessage: 'O LibreOffice nao estava disponivel. O PDF final foi recriado a partir do texto extraido do PPTX, por isso imagens, transicoes, animacoes e o layout original dos slides podem variar.'
    }
  }
});

const convertWordToPdf = createOfficeConverter(OFFICE_CONVERSION_PROFILES.word);

const convertPowerpointToPdf = createOfficeConverter(OFFICE_CONVERSION_PROFILES.powerpoint);

module.exports = {
  convertPowerpointToPdf,
  convertWordToPdf
};