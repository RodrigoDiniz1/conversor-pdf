const fs = require('node:fs');
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
  let cleanupWasQueued = false;

  const queueCleanup = () => {
    if (cleanupWasQueued) {
      return;
    }

    cleanupWasQueued = true;
    void runCleanupSafely(cleanup);
  };

  Object.entries(responseHeaders).forEach(([headerName, headerValue]) => {
    if (headerValue) {
      res.setHeader(headerName, headerValue);
    }
  });

  res.attachment(downloadName);

  const fileStream = fs.createReadStream(filePath);

  res.once('finish', queueCleanup);
  res.once('close', queueCleanup);

  fileStream.once('error', (downloadError) => {
    queueCleanup();

    if (!res.headersSent) {
      next(downloadError);
      return;
    }

    res.end();
  });

  fileStream.pipe(res);
};

const cleanupPdfArtifacts = async ({ uploadPath, outputPath, zipPath, jobDir }) => {
  await removeFiles([uploadPath, outputPath, zipPath]);
  await removePath(jobDir);
};

const cleanupPdfOutputArtifacts = async ({ uploadPaths = [], pdfPath }) => {
  await removeFiles(uploadPaths.concat(pdfPath));
};

const cleanupSingleUploadOutputArtifacts = async ({ uploadPath, outputPath }) => {
  await removeFiles([uploadPath, outputPath]);
};

const buildSingleUploadPdfOutput = (req, conversion) => ({
  filePath: conversion.pdfPath,
  downloadName: conversion.downloadName,
  cleanup: () => cleanupPdfOutputArtifacts({
    uploadPaths: [req.file.path],
    pdfPath: conversion.pdfPath
  }),
  responseHeaders: {
    'X-Conversion-Warning': conversion.warningMessage
  }
});

const cleanupSingleUploadPdfOutput = (req, conversion) => cleanupPdfOutputArtifacts({
  uploadPaths: [req.file.path],
  pdfPath: conversion?.pdfPath
});

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

const createSingleOfficePdfHandler = ({ badRequestMessage, convert }) => createConversionHandler({
  isRequestValid: hasSingleFile,
  badRequestMessage,
  convert: (req) => convert(req.file),
  buildDownload: buildSingleUploadPdfOutput,
  buildErrorCleanup: cleanupSingleUploadPdfOutput
});

const pdfToJpg = createConversionHandler({
  isRequestValid: hasSingleFile,
  badRequestMessage: 'Nenhum arquivo PDF foi enviado.',
  convert: (req) => conversionService.convertPdfToJpg(req.file),
  buildDownload: (req, conversion) => ({
    filePath: conversion.outputPath,
    downloadName: conversion.downloadName,
    cleanup: () => cleanupPdfArtifacts({
      uploadPath: req.file.path,
      outputPath: conversion.outputPath,
      jobDir: conversion.jobDir
    }),
    responseHeaders: {
      'X-Conversion-Warning': conversion.warningMessage
    }
  }),
  buildErrorCleanup: (req, conversion) => cleanupPdfArtifacts({
    uploadPath: req.file.path,
    outputPath: conversion?.outputPath,
    jobDir: conversion?.jobDir
  })
});

const pdfToPng = createConversionHandler({
  isRequestValid: hasSingleFile,
  badRequestMessage: 'Nenhum arquivo PDF foi enviado.',
  convert: (req) => conversionService.convertPdfToPng(req.file),
  buildDownload: (req, conversion) => ({
    filePath: conversion.outputPath,
    downloadName: conversion.downloadName,
    cleanup: () => cleanupPdfArtifacts({
      uploadPath: req.file.path,
      outputPath: conversion.outputPath,
      jobDir: conversion.jobDir
    }),
    responseHeaders: {
      'X-Conversion-Warning': conversion.warningMessage
    }
  }),
  buildErrorCleanup: (req, conversion) => cleanupPdfArtifacts({
    uploadPath: req.file.path,
    outputPath: conversion?.outputPath,
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

const pngToPdf = createConversionHandler({
  isRequestValid: (req) => hasMinimumFiles(req, 1),
  badRequestMessage: 'Envie ao menos uma imagem PNG.',
  convert: (req) => conversionService.convertPngsToPdf(req.files),
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

const removeBackground = createConversionHandler({
  isRequestValid: hasSingleFile,
  badRequestMessage: 'Nenhuma imagem foi enviada.',
  convert: (req) => conversionService.removeImageBackground(req.file),
  buildDownload: (req, conversion) => ({
    filePath: conversion.imagePath,
    downloadName: conversion.downloadName,
    cleanup: () => cleanupSingleUploadOutputArtifacts({
      uploadPath: req.file.path,
      outputPath: conversion.imagePath
    })
  }),
  buildErrorCleanup: (req, conversion) => cleanupSingleUploadOutputArtifacts({
    uploadPath: req.file.path,
    outputPath: conversion?.imagePath
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
      outputPath: conversion.zipPath,
      jobDir: conversion.jobDir
    })
  }),
  buildErrorCleanup: (req, conversion) => cleanupPdfArtifacts({
    uploadPath: req.file.path,
    outputPath: conversion?.zipPath,
    jobDir: conversion?.jobDir
  })
});

const wordToPdf = createSingleOfficePdfHandler({
  badRequestMessage: 'Nenhum arquivo Word foi enviado.',
  convert: conversionService.convertWordToPdf
});

const powerpointToPdf = createSingleOfficePdfHandler({
  badRequestMessage: 'Nenhum arquivo PowerPoint foi enviado.',
  convert: conversionService.convertPowerpointToPdf
});

module.exports = {
  pdfToJpg,
  pdfToPng,
  jpgToPdf,
  pngToPdf,
  removeBackground,
  mergePdf,
  splitPdf,
  wordToPdf,
  powerpointToPdf
};
