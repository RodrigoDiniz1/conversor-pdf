const fs = require('node:fs/promises');
const nodeFs = require('node:fs');
const path = require('node:path');

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
const REMOVE_BG_API_URL = 'https://api.remove.bg/v1.0/removebg';
const REMOVE_BG_API_KEY_ENV = 'REMOVE_BG_API_KEY';
const REMOVE_BG_SIZE_ENV = 'REMOVE_BG_SIZE';
const REMOVE_BG_TIMEOUT_ENV = 'REMOVE_BG_TIMEOUT_MS';
const REMOVE_BG_EDGE_CLEANUP_ENV = 'REMOVE_BG_EDGE_CLEANUP';
const REMOVE_BG_EDGE_CLEAR_ALPHA_ENV = 'REMOVE_BG_EDGE_CLEAR_ALPHA';
const REMOVE_BG_EDGE_RADIUS_ENV = 'REMOVE_BG_EDGE_RADIUS';
const REMOVE_BG_EDGE_BLEND_ENV = 'REMOVE_BG_EDGE_BLEND';
const REMOVE_BG_EDGE_ALPHA_REDUCTION_ENV = 'REMOVE_BG_EDGE_ALPHA_REDUCTION';
const REMOVE_BG_DEFAULT_SIZE = 'auto';
const REMOVE_BG_DEFAULT_TIMEOUT_MS = 240000;
const REMOVE_BG_DEFAULT_EDGE_CLEAR_ALPHA = 26;
const REMOVE_BG_DEFAULT_EDGE_RADIUS = 3;
const REMOVE_BG_DEFAULT_EDGE_BLEND = 0.85;
const REMOVE_BG_DEFAULT_EDGE_ALPHA_REDUCTION = 0.16;
const EDGE_INTERIOR_ALPHA_THRESHOLD = 230;
const DEFAULT_IMAGE_DENSITY = 72;
const LOSSLESS_PNG_COMPRESSION_LEVEL = 9;
const LOSSLESS_PNG_EFFORT = 10;
const INVALID_BACKGROUND_REMOVAL_OUTPUT_MESSAGE = 'A saida gerada nao e um PNG valido.';
const BACKGROUND_REMOVAL_RUNTIME_UNAVAILABLE_MESSAGE = 'O processamento de imagem nao esta disponivel neste servidor no momento.';
const REMOVE_BG_MISSING_API_KEY_MESSAGE = `A chave da remove.bg nao esta configurada. Configure ${REMOVE_BG_API_KEY_ENV} no servidor.`;

ensureDirectory(outputRoot);

let imageProcessingRuntime;

const getEnvValue = (name) => String(process.env[name] || '').trim();

const clamp = (value, minimum, maximum) => Math.min(Math.max(value, minimum), maximum);

const getBoundedEnvInteger = (name, fallback, minimum, maximum) => {
  const parsedValue = Number.parseInt(getEnvValue(name), 10);

  if (!Number.isFinite(parsedValue)) {
    return fallback;
  }

  return clamp(parsedValue, minimum, maximum);
};

const getBoundedEnvNumber = (name, fallback, minimum, maximum) => {
  const parsedValue = Number.parseFloat(getEnvValue(name));

  if (!Number.isFinite(parsedValue)) {
    return fallback;
  }

  return clamp(parsedValue, minimum, maximum);
};

const getBooleanEnvValue = (name, fallback = true) => {
  const normalizedValue = getEnvValue(name).toLowerCase();

  if (!normalizedValue) {
    return fallback;
  }

  return !['0', 'false', 'no', 'off'].includes(normalizedValue);
};

const getRemoveBgApiKey = () => getEnvValue(REMOVE_BG_API_KEY_ENV);

const getRemoveBgSize = () => getEnvValue(REMOVE_BG_SIZE_ENV) || REMOVE_BG_DEFAULT_SIZE;

const getRemoveBgTimeoutMs = () => {
  const parsedTimeout = Number.parseInt(getEnvValue(REMOVE_BG_TIMEOUT_ENV), 10);
  return Number.isFinite(parsedTimeout) && parsedTimeout > 0
    ? parsedTimeout
    : REMOVE_BG_DEFAULT_TIMEOUT_MS;
};

const isRemoveBgEdgeCleanupEnabled = () => getBooleanEnvValue(REMOVE_BG_EDGE_CLEANUP_ENV, true);

const getRemoveBgEdgeCleanupConfig = () => ({
  clearAlpha: getBoundedEnvInteger(REMOVE_BG_EDGE_CLEAR_ALPHA_ENV, REMOVE_BG_DEFAULT_EDGE_CLEAR_ALPHA, 0, 120),
  radius: getBoundedEnvInteger(REMOVE_BG_EDGE_RADIUS_ENV, REMOVE_BG_DEFAULT_EDGE_RADIUS, 1, 8),
  blend: getBoundedEnvNumber(REMOVE_BG_EDGE_BLEND_ENV, REMOVE_BG_DEFAULT_EDGE_BLEND, 0, 1),
  alphaReduction: getBoundedEnvNumber(
    REMOVE_BG_EDGE_ALPHA_REDUCTION_ENV,
    REMOVE_BG_DEFAULT_EDGE_ALPHA_REDUCTION,
    0,
    0.75
  )
});

const getErrorDetail = (error) => String(error?.message || error || '').trim();

const createStatusError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const buildBackgroundRemovalRuntimeLoadError = (error) => {
  const runtimeError = new Error(getErrorDetail(error));
  runtimeError.backgroundRemovalRuntimeUnavailable = true;
  return runtimeError;
};

const loadImageProcessingRuntime = () => {
  if (imageProcessingRuntime) {
    return imageProcessingRuntime;
  }

  try {
    imageProcessingRuntime = {
      sharp: require('sharp')
    };

    return imageProcessingRuntime;
  } catch (error) {
    throw buildBackgroundRemovalRuntimeLoadError(error);
  }
};

const assertRemoveBgRuntimeAvailable = () => {
  if (
    typeof fetch !== 'function'
    || typeof FormData !== 'function'
    || typeof Blob !== 'function'
    || typeof AbortSignal === 'undefined'
    || typeof AbortSignal.timeout !== 'function'
  ) {
    throw createStatusError(503, 'O runtime do Node precisa de fetch, FormData, Blob e AbortSignal.timeout para chamar a remove.bg.');
  }
};

const normalizeDetail = (detail = '') => detail.trim().replace(/\s+/g, ' ');

const truncateDetail = (detail = '', maxLength = 320) => {
  const normalizedDetail = normalizeDetail(detail);

  if (normalizedDetail.length <= maxLength) {
    return normalizedDetail;
  }

  return `${normalizedDetail.slice(0, maxLength - 3)}...`;
};

const getRemoveBgJsonErrorDetail = (payload) => {
  if (Array.isArray(payload?.errors)) {
    return payload.errors
      .map((error) => [error.title, error.detail, error.code].filter(Boolean).join(' '))
      .filter(Boolean)
      .join(' ');
  }

  return payload?.message || payload?.error || '';
};

const getRemoveBgErrorDetail = async (response) => {
  const responseText = await response.text().catch(() => '');

  if (!responseText) {
    return '';
  }

  try {
    return truncateDetail(getRemoveBgJsonErrorDetail(JSON.parse(responseText)) || responseText);
  } catch (_error) {
    return truncateDetail(responseText);
  }
};

const getRemoveBgStatusMessage = (response) => {
  if (response.status === 400) {
    return 'A remove.bg recusou a imagem enviada. Envie uma imagem JPG, PNG ou WebP valida.';
  }

  if (response.status === 401 || response.status === 403) {
    return `A chave da remove.bg foi recusada. Verifique ${REMOVE_BG_API_KEY_ENV}.`;
  }

  if (response.status === 402) {
    return 'A conta da remove.bg esta sem creditos disponiveis.';
  }

  if (response.status === 429) {
    return 'A remove.bg limitou as requisicoes. Tente novamente em instantes.';
  }

  return `A remove.bg retornou HTTP ${response.status}${response.statusText ? ` (${response.statusText})` : ''}.`;
};

const buildRemoveBgResponseError = async (response) => {
  const detail = await getRemoveBgErrorDetail(response);
  const baseMessage = getRemoveBgStatusMessage(response, detail);
  const message = detail ? `${baseMessage} Detalhe: ${detail}` : baseMessage;
  const statusCode = response.status === 400 ? 400 : 502;
  return createStatusError(statusCode, message);
};

const createImageUploadBlob = async (file) => {
  const type = file.mimetype || 'application/octet-stream';

  if (typeof nodeFs.openAsBlob === 'function') {
    return nodeFs.openAsBlob(file.path, { type });
  }

  return new Blob([await fs.readFile(file.path)], { type });
};

const callRemoveBgApi = async (file) => {
  const apiKey = getRemoveBgApiKey();

  if (!apiKey) {
    throw createStatusError(503, REMOVE_BG_MISSING_API_KEY_MESSAGE);
  }

  assertRemoveBgRuntimeAvailable();

  const formData = new FormData();
  formData.append('size', getRemoveBgSize());
  formData.append('format', 'png');
  formData.append('image_file', await createImageUploadBlob(file), file.originalname || path.basename(file.path));

  const response = await fetch(REMOVE_BG_API_URL, {
    method: 'POST',
    headers: {
      'X-Api-Key': apiKey
    },
    body: formData,
    signal: AbortSignal.timeout(getRemoveBgTimeoutMs())
  });

  if (!response.ok) {
    throw await buildRemoveBgResponseError(response);
  }

  return Buffer.from(await response.arrayBuffer());
};

const buildBackgroundRemovalError = (error) => {
  if (error?.statusCode) {
    return error;
  }

  const detail = getErrorDetail(error);
  const failureMessage = 'Falha ao remover o fundo da imagem.';

  if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
    return {
      statusCode: 504,
      message: 'A remove.bg nao respondeu dentro do tempo limite. Tente novamente em instantes.'
    };
  }

  if (error?.backgroundRemovalRuntimeUnavailable) {
    return {
      statusCode: 503,
      message: BACKGROUND_REMOVAL_RUNTIME_UNAVAILABLE_MESSAGE
    };
  }

  if (error instanceof TypeError) {
    return {
      statusCode: 502,
      message: detail ? `${failureMessage} ${detail}` : failureMessage
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

const getPixelIndex = (x, y, width) => y * width + x;

const getPixelOffset = (x, y, width) => getPixelIndex(x, y, width) * 4;

const getLuminance = (red, green, blue) => (red * 0.2126) + (green * 0.7152) + (blue * 0.0722);

const hasTransparentNeighbor = (alphaByPixel, x, y, width, height, clearAlpha) => {
  for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
    for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
      if (offsetX === 0 && offsetY === 0) {
        continue;
      }

      const neighborX = x + offsetX;
      const neighborY = y + offsetY;

      if (neighborX < 0 || neighborY < 0 || neighborX >= width || neighborY >= height) {
        return true;
      }

      if (alphaByPixel[getPixelIndex(neighborX, neighborY, width)] <= clearAlpha) {
        return true;
      }
    }
  }

  return false;
};

const buildEdgeMaps = (data, width, height, clearAlpha) => {
  const alphaByPixel = new Uint8Array(width * height);
  const edgeByPixel = new Uint8Array(width * height);

  for (let pixelIndex = 0; pixelIndex < alphaByPixel.length; pixelIndex += 1) {
    alphaByPixel[pixelIndex] = data[(pixelIndex * 4) + 3];
  }

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixelIndex = getPixelIndex(x, y, width);
      const alpha = alphaByPixel[pixelIndex];

      if (alpha <= clearAlpha) {
        continue;
      }

      if (alpha < EDGE_INTERIOR_ALPHA_THRESHOLD || hasTransparentNeighbor(alphaByPixel, x, y, width, height, clearAlpha)) {
        edgeByPixel[pixelIndex] = 1;
      }
    }
  }

  return {
    alphaByPixel,
    edgeByPixel
  };
};

const findInteriorColor = (data, edgeByPixel, x, y, width, height, radius) => {
  for (let currentRadius = 1; currentRadius <= radius; currentRadius += 1) {
    let redTotal = 0;
    let greenTotal = 0;
    let blueTotal = 0;
    let pixelCount = 0;

    for (let offsetY = -currentRadius; offsetY <= currentRadius; offsetY += 1) {
      for (let offsetX = -currentRadius; offsetX <= currentRadius; offsetX += 1) {
        const neighborX = x + offsetX;
        const neighborY = y + offsetY;

        if (
          neighborX < 0
          || neighborY < 0
          || neighborX >= width
          || neighborY >= height
          || (offsetX === 0 && offsetY === 0)
        ) {
          continue;
        }

        const pixelIndex = getPixelIndex(neighborX, neighborY, width);
        const pixelOffset = pixelIndex * 4;

        if (data[pixelOffset + 3] < EDGE_INTERIOR_ALPHA_THRESHOLD || edgeByPixel[pixelIndex]) {
          continue;
        }

        redTotal += data[pixelOffset];
        greenTotal += data[pixelOffset + 1];
        blueTotal += data[pixelOffset + 2];
        pixelCount += 1;
      }
    }

    if (pixelCount > 0) {
      return {
        red: redTotal / pixelCount,
        green: greenTotal / pixelCount,
        blue: blueTotal / pixelCount
      };
    }
  }

  return null;
};

const blendEdgeColor = (outputData, sourceData, pixelOffset, targetColor, alpha, blend) => {
  const sourceRed = sourceData[pixelOffset];
  const sourceGreen = sourceData[pixelOffset + 1];
  const sourceBlue = sourceData[pixelOffset + 2];
  const sourceLuminance = getLuminance(sourceRed, sourceGreen, sourceBlue);
  const targetLuminance = getLuminance(targetColor.red, targetColor.green, targetColor.blue);
  const isLikelyLightSpill = sourceLuminance > targetLuminance + 8;
  const alphaWeight = 1 - (alpha / 255);
  const blendWeight = isLikelyLightSpill
    ? 0.7 + (alphaWeight * 0.3)
    : 0.25 + (alphaWeight * 0.4);
  const edgeBlend = clamp(blend * blendWeight, 0, 0.95);

  outputData[pixelOffset] = Math.round((sourceRed * (1 - edgeBlend)) + (targetColor.red * edgeBlend));
  outputData[pixelOffset + 1] = Math.round((sourceGreen * (1 - edgeBlend)) + (targetColor.green * edgeBlend));
  outputData[pixelOffset + 2] = Math.round((sourceBlue * (1 - edgeBlend)) + (targetColor.blue * edgeBlend));
};

const reduceEdgeAlpha = (outputData, pixelOffset, alpha, alphaReduction) => {
  if (alpha >= 255 || alphaReduction <= 0) {
    return;
  }

  const alphaWeight = 1 - (alpha / 255);
  outputData[pixelOffset + 3] = Math.round(alpha * (1 - (alphaReduction * alphaWeight)));
};

const cleanRgbaEdgePixels = (data, width, height, config) => {
  const { clearAlpha, radius, blend, alphaReduction } = config;
  const sourceData = Buffer.from(data);
  const outputData = Buffer.from(data);
  const { alphaByPixel, edgeByPixel } = buildEdgeMaps(sourceData, width, height, clearAlpha);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixelIndex = getPixelIndex(x, y, width);
      const pixelOffset = pixelIndex * 4;
      const alpha = alphaByPixel[pixelIndex];

      if (alpha <= clearAlpha) {
        outputData[pixelOffset] = 0;
        outputData[pixelOffset + 1] = 0;
        outputData[pixelOffset + 2] = 0;
        outputData[pixelOffset + 3] = 0;
        continue;
      }

      if (!edgeByPixel[pixelIndex]) {
        continue;
      }

      const targetColor = findInteriorColor(sourceData, edgeByPixel, x, y, width, height, radius);

      if (targetColor) {
        blendEdgeColor(outputData, sourceData, pixelOffset, targetColor, alpha, blend);
      }

      reduceEdgeAlpha(outputData, pixelOffset, alpha, alphaReduction);
    }
  }

  return outputData;
};

const cleanBackgroundRemovalEdges = async (imageBuffer) => {
  if (!isRemoveBgEdgeCleanupEnabled()) {
    return imageBuffer;
  }

  const { sharp } = loadImageProcessingRuntime();
  const { data, info } = await sharp(imageBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const cleanedData = cleanRgbaEdgePixels(data, info.width, info.height, getRemoveBgEdgeCleanupConfig());

  return sharp(cleanedData, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  })
    .png({
      compressionLevel: LOSSLESS_PNG_COMPRESSION_LEVEL,
      adaptiveFiltering: true,
      effort: LOSSLESS_PNG_EFFORT,
      palette: false
    })
    .toBuffer();
};

const encodeLosslessPngWithMetadata = async (imageBuffer, sourceFilePath) => {
  const { sharp } = loadImageProcessingRuntime();
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

const createBackgroundRemovalResult = ({ imagePath, downloadName }) => ({
  imagePath,
  downloadName
});

const removeImageBackground = async (file) => {
  await assertValidImageFile(file);

  const { imagePath, downloadName } = createImageOutputTarget(file);

  try {
    const rawResultBuffer = await callRemoveBgApi(file);
    const cleanedResultBuffer = await cleanBackgroundRemovalEdges(rawResultBuffer);
    const resultBuffer = assertValidBackgroundRemovalOutput(
      await encodeLosslessPngWithMetadata(cleanedResultBuffer, file.path)
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
