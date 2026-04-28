const fs = require('node:fs/promises');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const ort = require('onnxruntime-node');
const sharp = require('sharp');

const BACKGROUND_REMOVAL_SESSION_OPTIONS = Object.freeze({
  executionMode: 'sequential',
  graphOptimizationLevel: 'all',
  interOpNumThreads: 1,
  intraOpNumThreads: 1
});

const ensureBackgroundRemovalRuntimeCompatibility = () => {
  if (ort.InferenceSession.create.__backgroundRemovalThreadLimitApplied) {
    return;
  }

  const originalCreate = ort.InferenceSession.create.bind(ort.InferenceSession);

  ort.InferenceSession.create = (...args) => {
    const optionsIndex = typeof args.at(-1) === 'object' && !ArrayBuffer.isView(args.at(-1)) ? args.length - 1 : -1;

    if (optionsIndex >= 0) {
      args[optionsIndex] = {
        ...args[optionsIndex],
        ...BACKGROUND_REMOVAL_SESSION_OPTIONS
      };
    } else {
      args.push(BACKGROUND_REMOVAL_SESSION_OPTIONS);
    }

    return originalCreate(...args);
  };
  ort.InferenceSession.create.__backgroundRemovalThreadLimitApplied = true;
};

ensureBackgroundRemovalRuntimeCompatibility();

const { removeBackground: removeBackgroundImage } = require('@imgly/background-removal-node');

const {
  createFriendlyName,
  ensureDirectory,
  normalizeBaseName
} = require('../../utils/fileUtils');
const {
  assertValidImageFile,
  hasPngSignature
} = require('./shared/fileValidation');

const outputRoot = path.join(__dirname, '..', '..', '..', 'tmp', 'output');
const BACKGROUND_REMOVAL_MODEL = 'medium';
const DEFAULT_IMAGE_DENSITY = 72;
const LOSSLESS_PNG_COMPRESSION_LEVEL = 9;
const LOSSLESS_PNG_EFFORT = 10;
const INVALID_BACKGROUND_REMOVAL_OUTPUT_MESSAGE = 'A saida gerada nao e um PNG valido.';
const BACKGROUND_REMOVAL_RESOURCE_LIMIT_TOKENS = [
  'failed to create session',
  'pthread_create failed',
  'resource temporarily unavailable'
];

ensureDirectory(outputRoot);

let backgroundRemovalAssetUrl;

const toDirectoryUrl = (directoryPath) => {
  const href = pathToFileURL(directoryPath).href;
  return href.endsWith('/') ? href : `${href}/`;
};

const getBackgroundRemovalAssetUrl = () => {
  if (!backgroundRemovalAssetUrl) {
    const backgroundRemovalDistPath = path.dirname(require.resolve('@imgly/background-removal-node'));
    backgroundRemovalAssetUrl = toDirectoryUrl(backgroundRemovalDistPath);
  }

  return backgroundRemovalAssetUrl;
};

const getBackgroundRemovalConfig = () => ({
  model: BACKGROUND_REMOVAL_MODEL,
  publicPath: getBackgroundRemovalAssetUrl(),
  output: {
    format: 'image/png',
    quality: 1,
    type: 'foreground'
  }
});

const buildBackgroundRemovalError = (error) => {
  if (error?.statusCode) {
    return error;
  }

  const detail = String(error?.message || error || '').trim();
  const normalizedDetail = detail.toLowerCase();
  const failureMessage = 'Falha ao remover o background da imagem.';

  if (BACKGROUND_REMOVAL_RESOURCE_LIMIT_TOKENS.some((token) => normalizedDetail.includes(token))) {
    return {
      statusCode: 503,
      message: 'O servidor atual nao conseguiu iniciar o motor de recorte de imagem. Tente novamente em instantes.'
    };
  }

  return {
    statusCode: 500,
    message: detail ? `${failureMessage} ${detail}` : failureMessage
  };
};

const createImageOutputTarget = (file, suffix = 'sem-fundo') => {
  const outputName = normalizeBaseName(file.originalname);
  const uploadedBaseName = path.basename(file.path, path.extname(file.path));
  const baseOutputName = suffix ? `${outputName}-${suffix}` : outputName;

  return {
    imagePath: path.join(outputRoot, `${uploadedBaseName}.png`),
    downloadName: createFriendlyName(baseOutputName, 'png')
  };
};

const getOutputImageDensity = (sourceMetadata) => {
  if (Number.isFinite(sourceMetadata?.density) && sourceMetadata.density > 0) {
    return sourceMetadata.density;
  }

  return DEFAULT_IMAGE_DENSITY;
};

const encodeLosslessPngWithMetadata = async (imageBuffer, sourceFilePath) => {
  const sourceMetadata = await sharp(sourceFilePath).metadata();

  return sharp(imageBuffer)
    .png({
      compressionLevel: LOSSLESS_PNG_COMPRESSION_LEVEL,
      adaptiveFiltering: true,
      effort: LOSSLESS_PNG_EFFORT,
      palette: false
    })
    .withMetadata({
      density: getOutputImageDensity(sourceMetadata)
    })
    .toBuffer();
};

const assertValidBackgroundRemovalOutput = (imageBuffer) => {
  if (!hasPngSignature(imageBuffer)) {
    throw new Error(INVALID_BACKGROUND_REMOVAL_OUTPUT_MESSAGE);
  }

  return imageBuffer;
};

const createBackgroundRemovalSource = (file) => pathToFileURL(file.path);

const getBackgroundRemovalRawBuffer = async (file) => {
  const resultBlob = await removeBackgroundImage(createBackgroundRemovalSource(file), getBackgroundRemovalConfig());
  return Buffer.from(await resultBlob.arrayBuffer());
};

const createBackgroundRemovalResult = ({ imagePath, downloadName }) => ({
  imagePath,
  downloadName
});

const removeImageBackground = async (file) => {
  await assertValidImageFile(file);

  const { imagePath, downloadName } = createImageOutputTarget(file);

  try {
    const rawResultBuffer = await getBackgroundRemovalRawBuffer(file);
    const resultBuffer = assertValidBackgroundRemovalOutput(
      await encodeLosslessPngWithMetadata(rawResultBuffer, file.path)
    );

    await fs.writeFile(imagePath, resultBuffer);

    return createBackgroundRemovalResult({ imagePath, downloadName });
  } catch (error) {
    throw buildBackgroundRemovalError(error);
  }
};

module.exports = {
  removeImageBackground
};