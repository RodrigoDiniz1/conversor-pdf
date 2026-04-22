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

const pdfToJpg = async (req, res, next) => {
  if (!req.file) {
    next(badRequest('Nenhum arquivo PDF foi enviado.'));
    return;
  }

  let conversion;

  try {
    conversion = await conversionService.convertPdfToZip(req.file);

    sendDownload(req, res, next, conversion.zipPath, conversion.downloadName, () => cleanupPdfArtifacts({
      uploadPath: req.file.path,
      zipPath: conversion.zipPath,
      jobDir: conversion.jobDir
    }), {
      'X-Conversion-Warning': conversion.warningMessage
    });
  } catch (error) {
    await runCleanupSafely(() => cleanupPdfArtifacts({
      uploadPath: req.file.path,
      zipPath: conversion?.zipPath,
      jobDir: conversion?.jobDir
    }));

    next(error);
  }
};

const jpgToPdf = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    next(badRequest('Envie ao menos uma imagem JPG ou JPEG.'));
    return;
  }

  const uploadPaths = req.files.map((file) => file.path);
  let conversion;

  try {
    conversion = await conversionService.convertJpgsToPdf(req.files);

    sendDownload(req, res, next, conversion.pdfPath, conversion.downloadName, () => cleanupPdfOutputArtifacts({
      uploadPaths,
      pdfPath: conversion.pdfPath
    }));
  } catch (error) {
    await runCleanupSafely(() => cleanupPdfOutputArtifacts({
      uploadPaths,
      pdfPath: conversion?.pdfPath
    }));

    next(error);
  }
};

const mergePdf = async (req, res, next) => {
  if (!req.files || req.files.length < 2) {
    next(badRequest('Envie ao menos dois arquivos PDF para juntar.'));
    return;
  }

  const uploadPaths = req.files.map((file) => file.path);
  let conversion;

  try {
    conversion = await conversionService.mergePdfs(req.files);

    sendDownload(req, res, next, conversion.pdfPath, conversion.downloadName, () => cleanupPdfOutputArtifacts({
      uploadPaths,
      pdfPath: conversion.pdfPath
    }));
  } catch (error) {
    await runCleanupSafely(() => cleanupPdfOutputArtifacts({
      uploadPaths,
      pdfPath: conversion?.pdfPath
    }));

    next(error);
  }
};

module.exports = {
  pdfToJpg,
  jpgToPdf,
  mergePdf
};