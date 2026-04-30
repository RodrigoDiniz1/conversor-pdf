const fs = require('node:fs/promises');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const sharp = require('sharp');

const BACKGROUND_REMOVAL_SESSION_OPTIONS = Object.freeze({
  executionMode: 'sequential',
  graphOptimizationLevel: 'all',
  interOpNumThreads: 1,
  intraOpNumThreads: 1
});

const BACKGROUND_REMOVAL_RUNTIME_UNAVAILABLE_MESSAGE = 'O motor de recorte não está disponível neste servidor no momento.';

let backgroundRemovalRuntime;

const ensureBackgroundRemovalRuntimeCompatibility = (ort) => {
  if (!ort?.InferenceSession?.create) {
    return;
  }

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
const BACKGROUND_REMOVAL_PRIMARY_MODEL = 'medium';
const BACKGROUND_REMOVAL_FALLBACK_MODEL = 'small';
const DEFAULT_IMAGE_DENSITY = 72;
const LOSSLESS_PNG_COMPRESSION_LEVEL = 9;
const LOSSLESS_PNG_EFFORT = 10;
const INVALID_BACKGROUND_REMOVAL_OUTPUT_MESSAGE = 'A saída gerada não é um PNG válido.';
const BACKGROUND_REMOVAL_RESOURCE_LIMIT_TOKENS = [
  'failed to create session',
  'pthread_create failed',
  'resource temporarily unavailable'
];

ensureDirectory(outputRoot);

let backgroundRemovalAssetUrl;
let backgroundRemovalModel = BACKGROUND_REMOVAL_PRIMARY_MODEL;

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

const getBackgroundRemovalConfig = (model = backgroundRemovalModel) => ({
  model,
  publicPath: getBackgroundRemovalAssetUrl(),
  output: {
    format: 'image/png',
    quality: 1,
    type: 'foreground'
  }
});

const getBackgroundRemovalErrorDetail = (error) => String(error?.message || error || '').trim();

const buildBackgroundRemovalRuntimeLoadError = (error) => {
  const runtimeError = new Error(getBackgroundRemovalErrorDetail(error));
  runtimeError.backgroundRemovalRuntimeUnavailable = true;
  return runtimeError;
};

const loadBackgroundRemovalRuntime = () => {
  if (backgroundRemovalRuntime) {
    return backgroundRemovalRuntime;
  }

  try {
    const ort = require('onnxruntime-node');
    ensureBackgroundRemovalRuntimeCompatibility(ort);

    const { removeBackground } = require('@imgly/background-removal-node');

    backgroundRemovalRuntime = {
      removeBackgroundImage: removeBackground
    };

    return backgroundRemovalRuntime;
  } catch (error) {
    throw buildBackgroundRemovalRuntimeLoadError(error);
  }
};

const isBackgroundRemovalResourceLimitError = (error) => {
  const normalizedDetail = getBackgroundRemovalErrorDetail(error).toLowerCase();
  return BACKGROUND_REMOVAL_RESOURCE_LIMIT_TOKENS.some((token) => normalizedDetail.includes(token));
};

const buildBackgroundRemovalError = (error) => {
  if (error?.statusCode) {
    return error;
  }

  const detail = getBackgroundRemovalErrorDetail(error);
  const failureMessage = 'Falha ao remover o fundo da imagem.';

  if (isBackgroundRemovalResourceLimitError(error)) {
    return {
      statusCode: 503,
      message: 'O servidor atual não conseguiu iniciar o motor de recorte da imagem. Tente novamente em instantes.'
    };
  }

  if (error?.backgroundRemovalRuntimeUnavailable) {
    return {
      statusCode: 503,
      message: BACKGROUND_REMOVAL_RUNTIME_UNAVAILABLE_MESSAGE
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

const runBackgroundRemoval = async (file, model = backgroundRemovalModel) => {
  const { removeBackgroundImage } = loadBackgroundRemovalRuntime();
  const resultBlob = await removeBackgroundImage(createBackgroundRemovalSource(file), getBackgroundRemovalConfig(model));
  return Buffer.from(await resultBlob.arrayBuffer());
};

const getBackgroundRemovalRawBuffer = async (file) => {
  try {
    return await runBackgroundRemoval(file, backgroundRemovalModel);
  } catch (error) {
    if (backgroundRemovalModel === BACKGROUND_REMOVAL_FALLBACK_MODEL || !isBackgroundRemovalResourceLimitError(error)) {
      throw error;
    }

    backgroundRemovalModel = BACKGROUND_REMOVAL_FALLBACK_MODEL;
    return runBackgroundRemoval(file, backgroundRemovalModel);
  }
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