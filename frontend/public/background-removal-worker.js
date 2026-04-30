import backgroundRemovalModule, {
  preload,
  removeBackground as namedRemoveBackground
} from './vendor/background-removal/dist/index.mjs';

const removeBackground = namedRemoveBackground || backgroundRemovalModule;
const DEFAULT_WORKER_ERROR_MESSAGE = 'Nao foi possivel concluir o recorte neste navegador.';
const BACKGROUND_REMOVAL_OUTPUT = Object.freeze({
  format: 'image/png',
  quality: 1,
  type: 'foreground'
});

const normalizeErrorMessage = (error) => {
  const message = String(error?.message || error || '').trim();
  return message || DEFAULT_WORKER_ERROR_MESSAGE;
};

const createBackgroundRemovalConfig = (model, progress) => ({
  debug: false,
  device: 'cpu',
  model,
  output: BACKGROUND_REMOVAL_OUTPUT,
  ...(typeof progress === 'function' ? { progress } : {})
});

self.addEventListener('message', async (event) => {
  const { type, requestId, model, file } = event.data || {};

  const reportProgress = (key, current, total) => {
    self.postMessage({
      type: 'progress',
      requestId,
      key,
      current,
      total
    });
  };

  try {
    if (type === 'preload') {
      if (typeof preload === 'function') {
        await preload(createBackgroundRemovalConfig(model));
      }

      self.postMessage({
        type: 'completed',
        requestId,
        result: {}
      });
      return;
    }

    if (type === 'remove') {
      const blob = await removeBackground(file, createBackgroundRemovalConfig(model, reportProgress));

      self.postMessage({
        type: 'completed',
        requestId,
        result: { blob }
      });
      return;
    }

    throw new Error('Operacao de recorte invalida.');
  } catch (error) {
    self.postMessage({
      type: 'failed',
      requestId,
      message: normalizeErrorMessage(error)
    });
  }
});