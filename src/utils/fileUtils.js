const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const RETRYABLE_FS_ERROR_CODES = new Set(['EBUSY', 'EMFILE', 'ENFILE', 'ENOTEMPTY', 'EPERM']);
const CLEANUP_RETRY_DELAYS_MS = [80, 160, 320, 640];
const TEMP_ARTIFACT_MAX_AGE_MS = 1000 * 60 * 45;
const TMP_OUTPUT_DIRECTORY_NAME = 'output';
const TMP_UPLOADS_DIRECTORY_NAME = 'uploads';

const ensureDirectory = (targetPath) => {
  if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath, { recursive: true });
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
  createJobId,
  normalizeBaseName,
  createFriendlyName,
  pruneTemporaryArtifacts,
  removeFiles,
  removePath
};