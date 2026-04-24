const conversionService = require('../services/conversionService');
const { removeFiles, removePath } = require('../utils/fileUtils');

const badRequest = (message) => ({ statusCode: 400, message });

const logCleanupError = (error) => {
  console.error('Falha ao limpar arquivos temporarios.', error);
};

const runCleanupSafely = async (cleanup) => {
  try {
    await cleanup();
  } catch (error) {
    logCleanupError(error);
  }
};

const sendDownload = (req, res, next, filePath, downloadName, cleanup, responseHeaders = {}) => {
  Object.entries(responseHeaders).forEach(([headerName, headerValue]) => {
    if (headerValue) {
      res.setHeader(headerName, headerValue);
    }
  });

  res.download(filePath, downloadName, async (downloadError) => {
    await runCleanupSafely(cleanup);

    if (downloadError && !res.headersSent) {
      next(downloadError);
      return;
    }

    if (downloadError) {
      req.socket.destroy(downloadError);
      return;
    }
  });
};

const cleanupPdfArtifacts = async ({ uploadPath, zipPath, jobDir }) => {
  await removeFiles([uploadPath, zipPath]);
  await removePath(jobDir);
};

const cleanupPdfOutputArtifacts = async ({ uploadPaths = [], pdfPath }) => {
  await removeFiles(uploadPaths.concat(pdfPath));
};

const hasSingleFile = (req) => Boolean(req.file);

const hasMinimumFiles = (req, minimumCount) => Array.isArray(req.files) && req.files.length >= minimumCount;

const getUploadPaths = (files = []) => files.map((file) => file.path);

const createConversionHandler = ({
  isRequestValid,
  badRequestMessage,
  convert,
  buildDownload,
  buildErrorCleanup
}) => async (req, res, next) => {
  if (!isRequestValid(req)) {
    next(badRequest(badRequestMessage));
    return;
  }

  let conversion;

  try {
    conversion = await convert(req);

    const download = buildDownload(req, conversion);

    sendDownload(
      req,
      res,
      next,
      download.filePath,
      download.downloadName,
      download.cleanup,
      download.responseHeaders
    );
  } catch (error) {
    await runCleanupSafely(() => buildErrorCleanup(req, conversion));
    next(error);
  }
};

const pdfToJpg = createConversionHandler({
  isRequestValid: hasSingleFile,
  badRequestMessage: 'Nenhum arquivo PDF foi enviado.',
  convert: (req) => conversionService.convertPdfToZip(req.file),
  buildDownload: (req, conversion) => ({
    filePath: conversion.zipPath,
    downloadName: conversion.downloadName,
    cleanup: () => cleanupPdfArtifacts({
      uploadPath: req.file.path,
      zipPath: conversion.zipPath,
      jobDir: conversion.jobDir
    }),
    responseHeaders: {
      'X-Conversion-Warning': conversion.warningMessage
    }
  }),
  buildErrorCleanup: (req, conversion) => cleanupPdfArtifacts({
    uploadPath: req.file.path,
    zipPath: conversion?.zipPath,
    jobDir: conversion?.jobDir
  })
});

const jpgToPdf = createConversionHandler({
  isRequestValid: (req) => hasMinimumFiles(req, 1),
  badRequestMessage: 'Envie ao menos uma imagem JPG ou JPEG.',
  convert: (req) => conversionService.convertJpgsToPdf(req.files),
  buildDownload: (req, conversion) => ({
    filePath: conversion.pdfPath,
    downloadName: conversion.downloadName,
    cleanup: () => cleanupPdfOutputArtifacts({
      uploadPaths: getUploadPaths(req.files),
      pdfPath: conversion.pdfPath
    })
  }),
  buildErrorCleanup: (req, conversion) => cleanupPdfOutputArtifacts({
    uploadPaths: getUploadPaths(req.files),
    pdfPath: conversion?.pdfPath
  })
});

const mergePdf = createConversionHandler({
  isRequestValid: (req) => hasMinimumFiles(req, 2),
  badRequestMessage: 'Envie ao menos dois arquivos PDF para juntar.',
  convert: (req) => conversionService.mergePdfs(req.files),
  buildDownload: (req, conversion) => ({
    filePath: conversion.pdfPath,
    downloadName: conversion.downloadName,
    cleanup: () => cleanupPdfOutputArtifacts({
      uploadPaths: getUploadPaths(req.files),
      pdfPath: conversion.pdfPath
    })
  }),
  buildErrorCleanup: (req, conversion) => cleanupPdfOutputArtifacts({
    uploadPaths: getUploadPaths(req.files),
    pdfPath: conversion?.pdfPath
  })
});

const splitPdf = createConversionHandler({
  isRequestValid: hasSingleFile,
  badRequestMessage: 'Nenhum arquivo PDF foi enviado.',
  convert: (req) => conversionService.splitPdfToZip(req.file),
  buildDownload: (req, conversion) => ({
    filePath: conversion.zipPath,
    downloadName: conversion.downloadName,
    cleanup: () => cleanupPdfArtifacts({
      uploadPath: req.file.path,
      zipPath: conversion.zipPath,
      jobDir: conversion.jobDir
    })
  }),
  buildErrorCleanup: (req, conversion) => cleanupPdfArtifacts({
    uploadPath: req.file.path,
    zipPath: conversion?.zipPath,
    jobDir: conversion?.jobDir
  })
});

const wordToPdf = createConversionHandler({
  isRequestValid: hasSingleFile,
  badRequestMessage: 'Nenhum arquivo DOCX foi enviado.',
  convert: (req) => conversionService.convertWordToPdf(req.file),
  buildDownload: (req, conversion) => ({
    filePath: conversion.pdfPath,
    downloadName: conversion.downloadName,
    cleanup: () => cleanupPdfOutputArtifacts({
      uploadPaths: [req.file.path],
      pdfPath: conversion.pdfPath
    }),
    responseHeaders: {
      'X-Conversion-Warning': conversion.warningMessage
    }
  }),
  buildErrorCleanup: (req, conversion) => cleanupPdfOutputArtifacts({
    uploadPaths: [req.file.path],
    pdfPath: conversion?.pdfPath
  })
});

const powerpointToPdf = createConversionHandler({
  isRequestValid: hasSingleFile,
  badRequestMessage: 'Nenhum arquivo PPTX foi enviado.',
  convert: (req) => conversionService.convertPowerpointToPdf(req.file),
  buildDownload: (req, conversion) => ({
    filePath: conversion.pdfPath,
    downloadName: conversion.downloadName,
    cleanup: () => cleanupPdfOutputArtifacts({
      uploadPaths: [req.file.path],
      pdfPath: conversion.pdfPath
    }),
    responseHeaders: {
      'X-Conversion-Warning': conversion.warningMessage
    }
  }),
  buildErrorCleanup: (req, conversion) => cleanupPdfOutputArtifacts({
    uploadPaths: [req.file.path],
    pdfPath: conversion?.pdfPath
  })
});

module.exports = {
  pdfToJpg,
  jpgToPdf,
  mergePdf,
  splitPdf,
  wordToPdf,
  powerpointToPdf
};