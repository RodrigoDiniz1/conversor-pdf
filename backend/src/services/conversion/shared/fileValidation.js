const fs = require('node:fs/promises');
const path = require('node:path');

const PDF_SIGNATURE = Buffer.from('%PDF-');
const PDF_SIGNATURE_SEARCH_BYTES = 1024;
const JPEG_SIGNATURE = Buffer.from([0xff, 0xd8, 0xff]);
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const WEBP_RIFF_SIGNATURE = Buffer.from('RIFF');
const WEBP_FORMAT_SIGNATURE = Buffer.from('WEBP');
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const IMAGE_SIGNATURE_HEADER_BYTES = 12;
const INVALID_PDF_FILE_MESSAGE = 'O arquivo enviado não é um PDF válido.';
const INVALID_JPG_FILE_MESSAGE = 'O arquivo enviado não é uma imagem JPG/JPEG válida.';
const INVALID_IMAGE_FILE_MESSAGE = 'O arquivo enviado não é uma imagem JPG, PNG ou WebP válida.';

const buildInvalidFileError = (message) => ({
  statusCode: 400,
  message
});

const readFileHeader = async (filePath, byteCount) => {
  const fileHandle = await fs.open(filePath, 'r');
  const headerBuffer = Buffer.alloc(byteCount);

  try {
    const { bytesRead } = await fileHandle.read(headerBuffer, 0, byteCount, 0);
    return headerBuffer.subarray(0, bytesRead);
  } finally {
    await fileHandle.close();
  }
};

const matchesFixedSignature = (headerBuffer, signature) => signature.every((byte, index) => headerBuffer[index] === byte);

const matchesAsciiSignature = (headerBuffer, startIndex, signature) => (
  headerBuffer.subarray(startIndex, startIndex + signature.length).toString('ascii') === signature
);

const hasPdfSignature = (headerBuffer) => headerBuffer.indexOf(PDF_SIGNATURE) !== -1;

const hasJpegSignature = (headerBuffer) => matchesFixedSignature(headerBuffer, JPEG_SIGNATURE);

const hasPngSignature = (headerBuffer) => matchesFixedSignature(headerBuffer, PNG_SIGNATURE);

const hasWebpSignature = (headerBuffer) => (
  matchesAsciiSignature(headerBuffer, 0, WEBP_RIFF_SIGNATURE.toString('ascii'))
  && matchesAsciiSignature(headerBuffer, 8, WEBP_FORMAT_SIGNATURE.toString('ascii'))
);

const hasSupportedImageSignature = (headerBuffer) => (
  hasJpegSignature(headerBuffer)
  || hasPngSignature(headerBuffer)
  || hasWebpSignature(headerBuffer)
);

const assertFileSignature = async (filePath, {
  byteCount,
  isSupported,
  message
}) => {
  const headerBuffer = await readFileHeader(filePath, byteCount);

  if (!isSupported(headerBuffer)) {
    throw buildInvalidFileError(message);
  }

  return headerBuffer;
};

const assertValidPdfFile = async (filePath) => {
  await assertFileSignature(filePath, {
    byteCount: PDF_SIGNATURE_SEARCH_BYTES,
    isSupported: hasPdfSignature,
    message: INVALID_PDF_FILE_MESSAGE
  });
};

const assertValidJpgFile = async (filePath) => {
  await assertFileSignature(filePath, {
    byteCount: JPEG_SIGNATURE.length,
    isSupported: hasJpegSignature,
    message: INVALID_JPG_FILE_MESSAGE
  });
};

const assertSupportedImageExtension = (filename) => {
  if (!IMAGE_EXTENSIONS.has(path.extname(filename).toLowerCase())) {
    throw buildInvalidFileError(INVALID_IMAGE_FILE_MESSAGE);
  }
};

const assertValidImageFile = async (file) => {
  assertSupportedImageExtension(file.originalname);

  await assertFileSignature(file.path, {
    byteCount: IMAGE_SIGNATURE_HEADER_BYTES,
    isSupported: hasSupportedImageSignature,
    message: INVALID_IMAGE_FILE_MESSAGE
  });
};

const hasSupportedExtension = (filename, supportedExtensions) => (
  supportedExtensions.has(path.extname(filename).toLowerCase())
);

module.exports = {
  assertValidImageFile,
  assertValidJpgFile,
  assertValidPdfFile,
  buildInvalidFileError,
  hasPngSignature,
  hasSupportedExtension
};