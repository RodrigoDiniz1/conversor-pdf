const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const { constants: bufferConstants } = require('buffer');

const RETRYABLE_FS_ERROR_CODES = new Set(['EBUSY', 'EMFILE', 'ENFILE', 'ENOTEMPTY', 'EPERM']);
const READ_CHUNK_SIZE_BYTES = 64 * 1024 * 1024;
const CLEANUP_RETRY_DELAYS_MS = [80, 160, 320, 640];
const TEMP_ARTIFACT_MAX_AGE_MS = 1000 * 60 * 45;
const TMP_OUTPUT_DIRECTORY_NAME = 'output';
const TMP_UPLOADS_DIRECTORY_NAME = 'uploads';

const ensureDirectory = (targetPath) => {
  if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath, { recursive: true });
  }
};

/**
 * Le um arquivo inteiro para memoria sem o teto de 2 GiB do fs.readFile.
 *
 * O fs.readFile recusa arquivos maiores que 2 GiB com ERR_FS_FILE_TOO_LARGE,
 * o que inviabilizava processar uploads grandes. A leitura aqui e feita por
 * descritor, em blocos, dentro de um Buffer unico dimensionado pelo tamanho real.
 */
const readFileAsBuffer = async (filePath) => {
  const fileHandle = await fsp.open(filePath, 'r');

  try {
    const { size } = await fileHandle.stat();

    if (size === 0) {
      return Buffer.alloc(0);
    }

    if (size > bufferConstants.MAX_LENGTH) {
      const error = new RangeError('O arquivo excede o tamanho maximo que este processo consegue carregar em memoria.');
      error.code = 'ERR_FILE_TOO_LARGE_FOR_MEMORY';
      throw error;
    }

    const buffer = Buffer.allocUnsafe(size);
    let offset = 0;

    while (offset < size) {
      const chunkLength = Math.min(READ_CHUNK_SIZE_BYTES, size - offset);
      const { bytesRead } = await fileHandle.read(buffer, offset, chunkLength, offset);

      if (bytesRead === 0) {
        throw new Error('A leitura do arquivo terminou antes do tamanho esperado.');
      }

      offset += bytesRead;
    }

    return buffer;
  } finally {
    await fileHandle.close();
  }
};

const wait = (delayMs) => new Promise((resolve) => {
  setTimeout(resolve, delayMs);
});

const runFsCleanup = async (operation) => {
  for (let attempt = 0; attempt <= CLEANUP_RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      await operation();
      return;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return;
      }

      const retryDelay = CLEANUP_RETRY_DELAYS_MS[attempt];
      const canRetry = retryDelay !== undefined && RETRYABLE_FS_ERROR_CODES.has(error.code);

      if (!canRetry) {
        throw error;
      }

      await wait(retryDelay);
    }
  }
};

const createJobId = () => crypto.randomUUID();

const normalizeBaseName = (filename) => path.basename(filename, path.extname(filename))
  .toLowerCase()
  .replace(/[^a-z0-9-_]+/g, '-')
  .replace(/^-+|-+$/g, '') || 'arquivo';

const createFriendlyName = (baseName, extension) => `${baseName}-convertido.${extension}`;

const getEntryTimestampMs = (stats) => stats.mtimeMs;

const listDirectoryEntries = async (directoryPath) => {
  try {
    return await fsp.readdir(directoryPath, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }

    throw error;
  }
};

const shouldPruneEntry = (stats, maxAgeMs) => (Date.now() - getEntryTimestampMs(stats)) > maxAgeMs;

const pruneDirectoryEntries = async (directoryPath, { maxAgeMs, preserveNames = [] } = {}) => {
  const preservedNames = new Set(preserveNames);
  const entries = await listDirectoryEntries(directoryPath);
  let removedCount = 0;

  for (const entry of entries) {
    if (preservedNames.has(entry.name)) {
      continue;
    }

    const entryPath = path.join(directoryPath, entry.name);
    let stats;

    try {
      stats = await fsp.stat(entryPath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        continue;
      }

      throw error;
    }

    if (!shouldPruneEntry(stats, maxAgeMs)) {
      continue;
    }

    await removePath(entryPath);
    removedCount += 1;
  }

  return removedCount;
};

const pruneTemporaryArtifacts = async ({
  rootPath,
  maxAgeMs = TEMP_ARTIFACT_MAX_AGE_MS
}) => {
  const outputPath = path.join(rootPath, TMP_OUTPUT_DIRECTORY_NAME);
  const uploadsPath = path.join(rootPath, TMP_UPLOADS_DIRECTORY_NAME);

  ensureDirectory(rootPath);
  ensureDirectory(outputPath);
  ensureDirectory(uploadsPath);

  const [rootRemoved, outputRemoved, uploadsRemoved] = await Promise.all([
    pruneDirectoryEntries(rootPath, {
      maxAgeMs,
      preserveNames: [TMP_OUTPUT_DIRECTORY_NAME, TMP_UPLOADS_DIRECTORY_NAME]
    }),
    pruneDirectoryEntries(outputPath, { maxAgeMs }),
    pruneDirectoryEntries(uploadsPath, { maxAgeMs })
  ]);

  return {
    rootRemoved,
    outputRemoved,
    uploadsRemoved,
    totalRemoved: rootRemoved + outputRemoved + uploadsRemoved
  };
};

const removeFiles = async (paths) => {
  const tasks = paths
    .filter(Boolean)
    .map((filePath) => runFsCleanup(() => fsp.unlink(filePath)));

  await Promise.all(tasks);
};

const removePath = async (targetPath) => {
  if (!targetPath) {
    return;
  }

  await runFsCleanup(() => fsp.rm(targetPath, { recursive: true, force: true }));
};

module.exports = {
  ensureDirectory,
  readFileAsBuffer,
  createJobId,
  normalizeBaseName,
  createFriendlyName,
  pruneTemporaryArtifacts,
  removeFiles,
  removePath
};