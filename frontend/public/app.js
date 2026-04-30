const toolCatalog = {
  'jpg-to-pdf': {
    id: 'jpg-to-pdf',
    title: 'JPG para PDF',
    cardDescription: 'Converta uma ou mais imagens JPG ou JPEG em um único arquivo PDF.',
    cardHighlights: ['Aceita várias imagens', 'Entrega um PDF único'],
    detailDescription: 'Envie uma ou mais imagens JPG/JPEG e gere um PDF único em uma tela dedicada para esse fluxo.',
    note: 'A ordem final do PDF segue a ordem em que os arquivos forem enviados nesta etapa.',
    section: 'active',
    kicker: 'Conversão ativa',
    helper: 'Envie uma ou mais imagens JPG/JPEG para montar um PDF único.',
    available: true,
    status: 'Disponível agora',
    endpoint: '/upload/jpg-to-pdf',
    fieldName: 'files',
    accept: '.jpg,.jpeg,image/jpeg,image/jpg',
    allowMultiple: true,
    chooseLabel: 'Selecionar imagens JPG',
    idleSubtitle: 'Ou solte imagens JPG/JPEG aqui',
    lockedSubtitle: 'Esta ferramenta ainda não está disponível',
    processingMessage: 'Enviando as imagens e montando o PDF final...',
    successMessage: 'Conversão concluída. O PDF foi baixado automaticamente.',
    readyMessage: (fileCount) => `${fileCount} imagem(ns) pronta(s) para conversão.`,
    receivedMessage: (fileCount) => `${fileCount} imagem(ns) recebida(s). A conversão começa agora.`,
    defaultDownloadName: 'resultado-convertido.pdf',
    badges: [
      { type: 'jpg', label: 'JPG' },
      { type: 'pdf', label: 'PDF' }
    ]
  },
  'pdf-to-jpg': {
    id: 'pdf-to-jpg',
    title: 'PDF para JPG',
    cardDescription: 'Transforme seu PDF em imagens JPG e baixe tudo em um único arquivo ZIP.',
    cardHighlights: ['Recebe um PDF por vez', 'Baixa um ZIP com páginas JPG'],
    detailDescription: 'Envie um PDF por vez e receba um ZIP com todas as páginas convertidas em JPG.',
    note: 'Quando o PDF depender de fontes do sistema, a tela avisa para deixar claro quando a fidelidade tipográfica pode variar.',
    section: 'active',
    kicker: 'Conversão ativa',
    helper: 'Envie um PDF por vez e receba um ZIP com todas as páginas em JPG.',
    available: true,
    status: 'Disponível agora',
    endpoint: '/upload/pdf-to-jpg',
    fieldName: 'file',
    accept: '.pdf,application/pdf',
    allowMultiple: false,
    chooseLabel: 'Selecionar arquivo PDF',
    idleSubtitle: 'Ou solte um PDF aqui',
    lockedSubtitle: 'Esta ferramenta ainda não está disponível',
    processingMessage: 'Enviando o PDF e convertendo as páginas em JPG...',
    successMessage: 'Conversão concluída. O ZIP com as imagens foi baixado automaticamente.',
    readyMessage: () => 'PDF pronto para conversão.',
    receivedMessage: () => 'PDF recebido. A conversão começa agora.',
    defaultDownloadName: 'resultado-convertido.zip',
    badges: [
      { type: 'pdf', label: 'PDF' },
      { type: 'jpg', label: 'JPG' }
    ]
  },
  'remove-background': {
    id: 'remove-background',
    title: 'Remover Background',
    cardDescription: 'Recorte o fundo da imagem com alta qualidade e baixe o resultado em PNG transparente.',
    cardHighlights: ['Aceita JPG, PNG e WebP', 'Entrega PNG transparente'],
    detailDescription: 'Envie uma imagem JPG, PNG ou WebP por vez para remover o fundo e baixar um PNG transparente, pronto para catálogos, miniaturas e design.',
    note: 'A saída final é gerada em PNG com transparência para preservar melhor o recorte.',
    section: 'active',
    kicker: 'Edição de imagem',
    helper: 'Envie uma imagem por vez e receba um PNG transparente sem o fundo.',
    available: true,
    status: 'Disponível agora',
    endpoint: '/upload/remove-background',
    fieldName: 'file',
    accept: '.jpg,.jpeg,.png,.webp,image/jpeg,image/jpg,image/png,image/webp',
    allowMultiple: false,
    chooseLabel: 'Selecionar imagem',
    idleSubtitle: 'Ou solte uma imagem JPG, PNG ou WebP aqui',
    lockedSubtitle: 'Esta ferramenta ainda não está disponível',
    processingMessage: 'Preparando o recorte no seu navegador e baixando os recursos da IA, se necessário...',
    successMessage: 'Recorte concluído. O PNG transparente foi baixado automaticamente.',
    readyMessage: () => 'Imagem pronta para recorte.',
    receivedMessage: () => 'Imagem recebida. O recorte será feito no seu navegador.',
    defaultDownloadName: 'imagem-sem-fundo-convertida.png',
    badges: [
      { type: 'image', label: 'IMG' },
      { type: 'png', label: 'PNG' }
    ]
  },
  'merge-pdf': {
    id: 'merge-pdf',
    title: 'Juntar PDF',
    cardDescription: 'Mescle dois ou mais arquivos PDF em um único documento final.',
    cardHighlights: ['Une dois ou mais PDFs', 'Permite reordenar antes de juntar'],
    detailDescription: 'Envie dois ou mais PDFs, ajuste a sequência na lista e receba um arquivo final unificado em uma tela dedicada à montagem do documento.',
    note: 'A junção respeita a ordem mostrada na lista, que você pode reorganizar antes de enviar.',
    section: 'organize',
    kicker: 'Organizar PDF',
    helper: 'Envie dois ou mais PDFs, reorganize a sequência e gere um arquivo final único.',
    available: true,
    status: 'Disponível agora',
    endpoint: '/upload/merge-pdf',
    fieldName: 'files',
    accept: '.pdf,application/pdf',
    allowMultiple: true,
    manualSubmit: true,
    submitLabel: 'Juntar PDFs',
    chooseLabel: 'Selecionar arquivos PDF',
    idleSubtitle: 'Ou solte dois ou mais PDFs aqui',
    lockedSubtitle: 'Esta ferramenta ainda não está disponível',
    processingMessage: 'Enviando os PDFs e juntando as páginas...',
    successMessage: 'Junção concluída. O PDF final foi baixado automaticamente.',
    readyMessage: (fileCount) => `${fileCount} PDF(s) pronto(s) para junção.`,
    receivedMessage: (fileCount) => `${fileCount} PDF(s) recebido(s). A junção começa agora.`,
    defaultDownloadName: 'pdfs-unidos-convertido.pdf',
    badges: [
      { type: 'pdf', label: 'PDF' },
      { type: 'pdf', label: 'PDF', marker: '+' }
    ]
  },
  'split-pdf': {
    id: 'split-pdf',
    title: 'Dividir PDF',
    cardDescription: 'Separe um PDF por páginas e baixe tudo organizado em um único ZIP.',
    cardHighlights: ['Separa página por página', 'Entrega tudo em ZIP'],
    detailDescription: 'Envie um PDF por vez e receba um ZIP com um arquivo PDF separado para cada página do documento.',
    note: 'Cada página do PDF original será exportada como um arquivo individual dentro do ZIP final.',
    section: 'organize',
    kicker: 'Organizar PDF',
    helper: 'Envie um PDF por vez para gerar um ZIP com cada página em um arquivo PDF separado.',
    available: true,
    status: 'Disponível agora',
    endpoint: '/upload/split-pdf',
    fieldName: 'file',
    accept: '.pdf,application/pdf',
    allowMultiple: false,
    chooseLabel: 'Selecionar arquivo PDF',
    idleSubtitle: 'Ou solte um PDF aqui',
    lockedSubtitle: 'Esta ferramenta ainda não está disponível',
    processingMessage: 'Enviando o PDF e separando as páginas em arquivos individuais...',
    successMessage: 'Divisão concluída. O ZIP com os PDFs foi baixado automaticamente.',
    readyMessage: () => 'PDF pronto para divisão.',
    receivedMessage: () => 'PDF recebido. A divisão começa agora.',
    defaultDownloadName: 'pdf-dividido-convertido.zip',
    badges: [
      { type: 'pdf', label: 'PDF' },
      { type: 'pdf', label: 'PDF', marker: '/' }
    ]
  },
  'word-to-pdf': {
    id: 'word-to-pdf',
    title: 'Word para PDF',
    cardDescription: 'Converta documentos Word em PDF com um fluxo direto e pronto para download.',
    cardHighlights: ['Recebe um DOC ou DOCX por vez', 'Entrega um PDF único'],
    detailDescription: 'Envie um arquivo DOC ou DOCX por vez. Quando o backend tiver o LibreOffice disponível, o PDF sai com mais fidelidade; sem ele, o DOCX ainda pode usar um fallback textual.',
    note: 'No deploy com LibreOffice, o backend faz a conversão real do documento. Se esse binário não estiver disponível, apenas DOCX pode cair no fallback textual.',
    section: 'future',
    kicker: 'Converter para PDF',
    helper: 'Envie um arquivo DOC ou DOCX por vez para gerar um PDF único.',
    available: true,
    status: 'Disponível agora',
    endpoint: '/upload/word-to-pdf',
    fieldName: 'file',
    accept: '.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    allowMultiple: false,
    chooseLabel: 'Selecionar arquivo Word',
    idleSubtitle: 'Ou solte um arquivo DOC ou DOCX aqui',
    lockedSubtitle: 'Esta ferramenta ainda não está disponível',
    processingMessage: 'Enviando o arquivo Word e montando o PDF final...',
    successMessage: 'Conversão concluída. O PDF foi baixado automaticamente.',
    readyMessage: () => 'Arquivo Word pronto para conversão.',
    receivedMessage: () => 'Arquivo Word recebido. A conversão começa agora.',
    defaultDownloadName: 'word-convertido.pdf',
    badges: [
      { type: 'word', label: 'DOC' },
      { type: 'pdf', label: 'PDF' }
    ]
  },
  'powerpoint-to-pdf': {
    id: 'powerpoint-to-pdf',
    title: 'PowerPoint para PDF',
    cardDescription: 'Converta apresentações PowerPoint em PDF mantendo a leitura slide a slide.',
    cardHighlights: ['Recebe um PPT ou PPTX por vez', 'Entrega um PDF único'],
    detailDescription: 'Envie um arquivo PPT ou PPTX por vez. Quando o backend tiver o LibreOffice disponível, o PDF sai com mais fidelidade; sem ele, o PPTX ainda pode usar um fallback textual.',
    note: 'No deploy com LibreOffice, o backend faz a conversão real dos slides. Se esse binário não estiver disponível, apenas PPTX pode cair no fallback textual.',
    section: 'future',
    kicker: 'Converter para PDF',
    helper: 'Envie um arquivo PPT ou PPTX por vez para gerar um PDF único.',
    available: true,
    status: 'Disponível agora',
    endpoint: '/upload/powerpoint-to-pdf',
    fieldName: 'file',
    accept: '.ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation',
    allowMultiple: false,
    chooseLabel: 'Selecionar arquivo PowerPoint',
    idleSubtitle: 'Ou solte um arquivo PPT ou PPTX aqui',
    lockedSubtitle: 'Esta ferramenta ainda não está disponível',
    processingMessage: 'Enviando o arquivo PowerPoint e montando o PDF final...',
    successMessage: 'Conversão concluída. O PDF foi baixado automaticamente.',
    readyMessage: () => 'Arquivo PowerPoint pronto para conversão.',
    receivedMessage: () => 'Arquivo PowerPoint recebido. A conversão começa agora.',
    defaultDownloadName: 'slides-convertidos.pdf',
    badges: [
      { type: 'powerpoint', label: 'PPT' },
      { type: 'pdf', label: 'PDF' }
    ]
  }
};

const toolSections = {
  active: ['jpg-to-pdf', 'pdf-to-jpg', 'remove-background'],
  organize: ['merge-pdf', 'split-pdf'],
  future: ['word-to-pdf', 'powerpoint-to-pdf']
};

const toolExperienceCatalog = {
  'jpg-to-pdf': {
    accent: '#d7a113',
    soft: 'rgba(244, 197, 57, 0.14)',
    border: 'rgba(244, 197, 57, 0.28)'
  },
  'pdf-to-jpg': {
    accent: '#df572c',
    soft: 'rgba(255, 109, 61, 0.12)',
    border: 'rgba(255, 109, 61, 0.24)'
  },
  'remove-background': {
    accent: '#0d9488',
    soft: 'rgba(13, 148, 136, 0.12)',
    border: 'rgba(13, 148, 136, 0.24)'
  },
  'merge-pdf': {
    accent: '#4067bf',
    soft: 'rgba(92, 128, 220, 0.12)',
    border: 'rgba(92, 128, 220, 0.24)'
  },
  'split-pdf': {
    accent: '#d76b35',
    soft: 'rgba(237, 139, 87, 0.12)',
    border: 'rgba(237, 139, 87, 0.24)'
  },
  'word-to-pdf': {
    accent: '#5c80dc',
    soft: 'rgba(92, 128, 220, 0.12)',
    border: 'rgba(92, 128, 220, 0.24)'
  },
  'powerpoint-to-pdf': {
    accent: '#ed8b57',
    soft: 'rgba(237, 139, 87, 0.12)',
    border: 'rgba(237, 139, 87, 0.24)'
  }
};

const SERVER_UNAVAILABLE_MESSAGE = 'Não foi possível encontrar o servidor de conversão.';
const REQUEST_TIMEOUT_MESSAGE = 'O backend não respondeu a tempo de concluir o envio.';
const NETWORK_CONNECTION_MESSAGE = 'Não foi possível conectar ao servidor.';
const SERVER_UNAVAILABLE_HINTS = [
  'Confirme se o backend foi publicado ou se o servidor local está no ar.',
  'Verifique a URL da API e as configurações do ambiente antes do deploy.',
  'Se o servidor acabou de subir, espere alguns segundos e tente novamente.'
];
const DEFAULT_ACTIVE_TOOL_ID = toolSections.active[0];
const REMOVE_BACKGROUND_TOOL_ID = 'remove-background';
const MERGE_PDF_TOOL_ID = 'merge-pdf';
const MAX_FILE_SIZE_BYTES = 1024 * 1024 * 1024;
const MAX_FILE_SIZE_LABEL = '1GB';
const BROWSER_BACKGROUND_REMOVAL_WORKER_URL = new URL('./background-removal-worker.js', window.location.href).href;
const BROWSER_BACKGROUND_REMOVAL_PRIMARY_MODEL = 'isnet_fp16';
const BROWSER_BACKGROUND_REMOVAL_FALLBACK_MODEL = 'isnet_quint8';
const BROWSER_BACKGROUND_REMOVAL_DEFAULT_ERROR = 'Não foi possível concluir o recorte neste navegador.';
const BROWSER_BACKGROUND_REMOVAL_NETWORK_ERROR = 'Não foi possível baixar os recursos do recorte no seu navegador.';
const BROWSER_BACKGROUND_REMOVAL_FALLBACK_WARNING = 'Seu navegador usou o modo compacto para concluir o recorte.';

const state = {
  view: 'home',
  activeToolId: null,
  files: [],
  isBusy: false,
  lastResult: null,
  lastError: null
};

const LOCAL_API_PORT = '3000';
let preferredApiBaseUrl = null;
let browserBackgroundRemovalWorker = null;
let browserBackgroundRemovalWorkerRequestId = 0;
let browserBackgroundRemovalModel = BROWSER_BACKGROUND_REMOVAL_PRIMARY_MODEL;
let browserBackgroundRemovalPreloadPromise = null;
let browserBackgroundRemovalPreloadModel = null;
let browserBackgroundRemovalPreloadedModel = null;
const browserBackgroundRemovalWorkerPendingRequests = new Map();

const buildUniqueOrigins = (origins) => Array.from(new Set(origins.filter(Boolean)));

const eventHasFiles = (event) => Array.from(event.dataTransfer?.types || []).includes('Files');

const includesAnyMessage = (message = '', expectedMessages = []) => (
  expectedMessages.some((expectedMessage) => message.includes(expectedMessage))
);

const createUploadFailure = (kind, message, extra = {}) => ({ kind, message, ...extra });

const normalizeApiBaseUrl = (value = '') => value.trim().replace(/\/+$/, '');

const getConfiguredApiBaseUrl = () => normalizeApiBaseUrl(window.APP_CONFIG?.API_BASE_URL || '');

const getServerUnavailableMessage = () => {
  const configuredApiBaseUrl = getConfiguredApiBaseUrl();

  if (!configuredApiBaseUrl) {
    return `${SERVER_UNAVAILABLE_MESSAGE} Verifique se a API do backend está no ar.`;
  }

  return `${SERVER_UNAVAILABLE_MESSAGE} Verifique se a API configurada em ${configuredApiBaseUrl} está no ar.`;
};

const brandHomeButton = document.getElementById('brand-home-button');
const homeView = document.getElementById('home-view');
const toolView = document.getElementById('tool-view');
const successView = document.getElementById('success-view');
const errorView = document.getElementById('error-view');
const comingSoonView = document.getElementById('coming-soon-view');
const toolStage = document.getElementById('tool-stage');
const activeToolsGrid = document.getElementById('active-tools-grid');
const organizeToolsGrid = document.getElementById('organize-tools-grid');
const futureToolsGrid = document.getElementById('future-tools-grid');
const backHomeButton = document.getElementById('back-home-button');
const toolKicker = document.getElementById('tool-kicker');
const toolTitle = document.getElementById('tool-title');
const toolDescription = document.getElementById('tool-description');
const toolStatusChip = document.getElementById('tool-status-chip');
const modeHelper = document.getElementById('mode-helper');
const toolBadgePrimary = document.getElementById('tool-badge-primary');
const toolBadgeSecondary = document.getElementById('tool-badge-secondary');
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('file-input');
const chooseButtonText = document.getElementById('choose-button-text');
const dropzoneSubtitle = document.getElementById('dropzone-subtitle');
const selectionMeta = document.getElementById('selection-meta');
const previewList = document.getElementById('preview-list');
const clearButton = document.getElementById('clear-button');
const submitButton = document.getElementById('submit-button');
const progressWrapper = document.getElementById('progress-wrapper');
const progressFill = document.getElementById('progress-fill');
const progressLabel = document.getElementById('progress-label');
const statusMessage = document.getElementById('status-message');
const successBackButton = document.getElementById('success-back-button');
const successTitle = document.getElementById('success-title');
const successDescription = document.getElementById('success-description');
const successFileName = document.getElementById('success-file-name');
const successNote = document.getElementById('success-note');
const successDownloadButton = document.getElementById('success-download-button');
const successAgainButton = document.getElementById('success-again-button');
const successHomeButton = document.getElementById('success-home-button');
const errorBackButton = document.getElementById('error-back-button');
const errorTitle = document.getElementById('error-title');
const errorDescription = document.getElementById('error-description');
const errorDetail = document.getElementById('error-detail');
const errorRetryButton = document.getElementById('error-retry-button');
const errorHomeButton = document.getElementById('error-home-button');
const comingSoonBackButton = document.getElementById('coming-soon-back-button');
const comingSoonBadgeStack = document.getElementById('coming-soon-badge-stack');
const comingSoonKicker = document.getElementById('coming-soon-kicker');
const comingSoonTitle = document.getElementById('coming-soon-title');
const comingSoonDescription = document.getElementById('coming-soon-description');
const comingSoonHomeButton = document.getElementById('coming-soon-home-button');
const comingSoonActiveButton = document.getElementById('coming-soon-active-button');

const toolGridBySection = {
  active: activeToolsGrid,
  organize: organizeToolsGrid,
  future: futureToolsGrid
};

const viewRegistry = {
  home: homeView,
  tool: toolView,
  success: successView,
  error: errorView,
  comingSoon: comingSoonView
};

const getCurrentTool = () => toolCatalog[state.activeToolId] || null;
const getCurrentToolExperience = () => toolExperienceCatalog[state.activeToolId] || {};
const toolValidation = window.ToolValidation;
const isClientSideTool = (tool) => tool?.id === REMOVE_BACKGROUND_TOOL_ID;
const isManualSubmitTool = (tool) => Boolean(tool?.manualSubmit);

if (!toolValidation?.getValidatedFilesForTool) {
  throw new Error('Tool validation runtime is not available.');
}

const getManualSubmitReadyMessage = (tool) => {
  if (!tool) {
    return '';
  }

  if (tool.id === MERGE_PDF_TOOL_ID) {
    return 'Organize a sequência dos PDFs e clique em Juntar PDFs.';
  }

  return tool.readyMessage(state.files.length);
};

const assertFilesWithinSizeLimit = (files) => {
  const oversizedFile = files.find((file) => file.size > MAX_FILE_SIZE_BYTES);

  if (!oversizedFile) {
    return files;
  }

  throw new Error(`O limite máximo por arquivo é de ${MAX_FILE_SIZE_LABEL}. ${oversizedFile.name} tem ${formatSize(oversizedFile.size)}.`);
};

const isServerUnavailableError = (message = '') => (
  includesAnyMessage(message, [
    SERVER_UNAVAILABLE_MESSAGE,
    REQUEST_TIMEOUT_MESSAGE,
    NETWORK_CONNECTION_MESSAGE
  ])
);

const getErrorDescriptionForMessage = (message = '') => {
  if (message.includes(REQUEST_TIMEOUT_MESSAGE)) {
    return REQUEST_TIMEOUT_MESSAGE;
  }

  if (includesAnyMessage(message, [SERVER_UNAVAILABLE_MESSAGE, NETWORK_CONNECTION_MESSAGE])) {
    return 'Não foi possível se conectar ao backend para iniciar a conversão.';
  }

  return 'Não foi possível concluir a comunicação com o backend.';
};

const formatSize = (bytes) => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  if (bytes < MAX_FILE_SIZE_BYTES) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(bytes / MAX_FILE_SIZE_BYTES).toFixed(2)} GB`;
};

const getToolDropzoneSubtitle = (tool) => {
  if (state.isBusy) {
    return 'Seus arquivos estão sendo processados';
  }

  if (!tool.available) {
    return tool.lockedSubtitle;
  }

  if (state.files.length > 0) {
    return isManualSubmitTool(tool)
      ? getManualSubmitReadyMessage(tool)
      : tool.readyMessage(state.files.length);
  }

  return tool.idleSubtitle;
};

const buildClientSidePngName = (fileName = 'imagem') => {
  const baseName = fileName.replace(/\.[^.]+$/u, '') || 'imagem';
  return `${baseName}-sem-fundo-convertido.png`;
};

const getBackgroundRemovalErrorDetail = (error) => String(error?.message || error || '').trim();

const isBackgroundRemovalNetworkError = (error) => {
  const detail = getBackgroundRemovalErrorDetail(error).toLowerCase();

  return includesAnyMessage(detail, [
    'failed to fetch',
    'load failed',
    'networkerror',
    'resource metadata not found',
    'importing a module script failed'
  ]);
};

const shouldRetryBackgroundRemovalWithFallbackModel = (error) => {
  if (isBackgroundRemovalNetworkError(error)) {
    return false;
  }

  const detail = getBackgroundRemovalErrorDetail(error).toLowerCase();

  if (!detail) {
    return true;
  }

  return includesAnyMessage(detail, [
    'out of memory',
    'failed to create session',
    'not enough memory',
    'abort(',
    'wasm',
    'simd',
    'webassembly'
  ]);
};

const getBackgroundRemovalClientErrorMessage = (error) => {
  if (isBackgroundRemovalNetworkError(error)) {
    return `${BROWSER_BACKGROUND_REMOVAL_NETWORK_ERROR} Verifique sua conexão e tente novamente.`;
  }

  const detail = getBackgroundRemovalErrorDetail(error);

  if (!detail) {
    return `${BROWSER_BACKGROUND_REMOVAL_DEFAULT_ERROR} Tente outra imagem ou um navegador mais atual.`;
  }

  const normalizedDetail = detail.toLowerCase();

  if (includesAnyMessage(normalizedDetail, ['out of memory', 'failed to create session', 'not enough memory', 'abort(', 'wasm'])) {
    return `${BROWSER_BACKGROUND_REMOVAL_DEFAULT_ERROR} Este dispositivo não conseguiu carregar o modelo de recorte.`;
  }

  return `${BROWSER_BACKGROUND_REMOVAL_DEFAULT_ERROR} ${detail}`;
};

const setStatus = (message, type = '') => {
  statusMessage.textContent = message;
  statusMessage.className = 'status-message';

  if (type) {
    statusMessage.classList.add(`is-${type}`);
  }
};

const resetProgress = () => {
  progressFill.style.width = '0%';
  progressLabel.textContent = '0%';
  progressWrapper.classList.add('is-hidden');
  progressWrapper.setAttribute('aria-hidden', 'true');
};

const updateProgress = (value) => {
  const percentage = Math.max(0, Math.min(100, Math.round(value)));
  progressWrapper.classList.remove('is-hidden');
  progressWrapper.setAttribute('aria-hidden', 'false');
  progressFill.style.width = `${percentage}%`;
  progressLabel.textContent = `${percentage}%`;
};

const updateBackgroundRemovalProgress = (key, current, total) => {
  const safeTotal = Math.max(total || 0, 1);

  if (key.startsWith('compute:')) {
    updateProgress(88 + ((current / safeTotal) * 12));
    setStatus('Processando o recorte no seu navegador...');
    return;
  }

  updateProgress(12 + ((current / safeTotal) * 68));

  if (key.includes('/models/')) {
    setStatus('Baixando o modelo de recorte para o seu navegador...');
    return;
  }

  setStatus('Preparando o motor de recorte no seu navegador...');
};

const setBackgroundRemovalPreloadStatus = (message = '') => {
  if (state.view !== 'tool' || state.isBusy || state.files.length > 0 || !isClientSideTool(getCurrentTool())) {
    return;
  }

  setStatus(message);
};

const getBackgroundRemovalWorkerErrorDetail = (error) => {
  if (!error) {
    return '';
  }

  const directMessage = String(
    error.error?.message
    || error.reason?.message
    || error.data?.message
    || error.message
    || ''
  ).trim();

  if (directMessage && directMessage !== '[object Event]') {
    return directMessage;
  }

  if (error.type === 'error') {
    return 'Falha ao inicializar o motor de recorte no navegador.';
  }

  if (error.type === 'messageerror') {
    return 'Falha ao comunicar com o motor de recorte no navegador.';
  }

  return '';
};

const getBackgroundRemovalWorkerError = (error) => {
  const message = getBackgroundRemovalWorkerErrorDetail(error);
  return new Error(message || BROWSER_BACKGROUND_REMOVAL_DEFAULT_ERROR);
};

const resetBackgroundRemovalWorker = () => {
  if (browserBackgroundRemovalWorker) {
    browserBackgroundRemovalWorker.terminate();
    browserBackgroundRemovalWorker = null;
  }

  browserBackgroundRemovalWorkerPendingRequests.clear();
};

const handleBackgroundRemovalWorkerFailure = (error) => {
  const workerError = getBackgroundRemovalWorkerError(error);

  browserBackgroundRemovalWorkerPendingRequests.forEach(({ reject }) => reject(workerError));
  resetBackgroundRemovalWorker();
};

const ensureBackgroundRemovalWorker = () => {
  if (browserBackgroundRemovalWorker) {
    return browserBackgroundRemovalWorker;
  }

  const worker = new Worker(BROWSER_BACKGROUND_REMOVAL_WORKER_URL, { type: 'module' });

  worker.addEventListener('message', (event) => {
    const { type, requestId, result, message, key, current, total } = event.data || {};
    const pendingRequest = browserBackgroundRemovalWorkerPendingRequests.get(requestId);

    if (!pendingRequest) {
      return;
    }

    if (type === 'progress') {
      pendingRequest.onProgress?.(key, current, total);
      return;
    }

    browserBackgroundRemovalWorkerPendingRequests.delete(requestId);

    if (type === 'completed') {
      pendingRequest.resolve(result || {});
      return;
    }

    pendingRequest.reject(getBackgroundRemovalWorkerError(message));
  });

  worker.addEventListener('error', (event) => {
    handleBackgroundRemovalWorkerFailure(event);
  });

  worker.addEventListener('messageerror', (event) => {
    handleBackgroundRemovalWorkerFailure(event);
  });

  browserBackgroundRemovalWorker = worker;
  return worker;
};

const requestBackgroundRemovalWorker = ({ type, model, file, onProgress }) => new Promise((resolve, reject) => {
  const worker = ensureBackgroundRemovalWorker();
  const requestId = ++browserBackgroundRemovalWorkerRequestId;

  browserBackgroundRemovalWorkerPendingRequests.set(requestId, {
    resolve,
    reject,
    onProgress
  });

  try {
    worker.postMessage({
      type,
      requestId,
      model,
      file
    });
  } catch (error) {
    browserBackgroundRemovalWorkerPendingRequests.delete(requestId);
    reject(getBackgroundRemovalWorkerError(error));
  }
});

const preloadBackgroundRemovalResources = async (model = browserBackgroundRemovalModel) => {
  if (browserBackgroundRemovalPreloadedModel === model) {
    return;
  }

  if (browserBackgroundRemovalPreloadPromise && browserBackgroundRemovalPreloadModel === model) {
    return browserBackgroundRemovalPreloadPromise;
  }

  browserBackgroundRemovalPreloadModel = model;
  browserBackgroundRemovalPreloadPromise = (async () => {
    setBackgroundRemovalPreloadStatus('Preparando a IA de recorte no seu navegador...');
    await requestBackgroundRemovalWorker({ type: 'preload', model });
    browserBackgroundRemovalPreloadedModel = model;
  })()
    .catch((error) => {
      if (browserBackgroundRemovalPreloadModel === model) {
        browserBackgroundRemovalPreloadPromise = null;
        browserBackgroundRemovalPreloadModel = null;
      }

      throw error;
    })
    .finally(() => {
      if (browserBackgroundRemovalPreloadModel === model) {
        browserBackgroundRemovalPreloadPromise = null;
        browserBackgroundRemovalPreloadModel = null;
      }

      setBackgroundRemovalPreloadStatus('');
    });

  return browserBackgroundRemovalPreloadPromise;
};

const runBackgroundRemovalInBrowser = async (file, model = browserBackgroundRemovalModel) => {
  await preloadBackgroundRemovalResources(model).catch(() => undefined);
  const result = await requestBackgroundRemovalWorker({
    type: 'remove',
    model,
    file,
    onProgress: updateBackgroundRemovalProgress
  });

  return result.blob;
};

const runClientSideTool = async (tool) => {
  if (!isClientSideTool(tool)) {
    throw new Error('Ferramenta client-side inválida.');
  }

  const [file] = state.files;

  try {
    const blob = await runBackgroundRemovalInBrowser(file, browserBackgroundRemovalModel);

    return {
      blob,
      fileName: buildClientSidePngName(file.name),
      warningMessage: browserBackgroundRemovalModel === BROWSER_BACKGROUND_REMOVAL_FALLBACK_MODEL
        ? BROWSER_BACKGROUND_REMOVAL_FALLBACK_WARNING
        : ''
    };
  } catch (error) {
    if (
      browserBackgroundRemovalModel === BROWSER_BACKGROUND_REMOVAL_PRIMARY_MODEL
      && shouldRetryBackgroundRemovalWithFallbackModel(error)
    ) {
      browserBackgroundRemovalModel = BROWSER_BACKGROUND_REMOVAL_FALLBACK_MODEL;

      const blob = await runBackgroundRemovalInBrowser(file, browserBackgroundRemovalModel);

      return {
        blob,
        fileName: buildClientSidePngName(file.name),
        warningMessage: BROWSER_BACKGROUND_REMOVAL_FALLBACK_WARNING
      };
    }

    throw new Error(getBackgroundRemovalClientErrorMessage(error));
  }
};

const runClientSideToolWithFallback = async (tool) => {
  try {
    return await runClientSideTool(tool);
  } catch (error) {
    if (!shouldUseServerFallbackForClientTool(tool)) {
      throw error;
    }

    resetBackgroundRemovalWorker();
    setStatus('O recorte no navegador falhou. Tentando concluir pelo servidor...');
    resetProgress();
    updateProgress(5);

    try {
      return await uploadWithProgress();
    } catch (serverError) {
      if (isServerUnavailableError(serverError.message)) {
        throw error;
      }

      throw serverError;
    }
  }
};

const clearPreviews = () => {
  previewList.innerHTML = '';
};

const fileIconThemeByType = {
  pdf: {
    label: 'PDF',
    accent: '#ff6d3d',
    accentDark: '#df572c',
    border: '#f7b8a4',
    fold: '#ffd8cb',
    text: '#ffffff'
  },
  jpg: {
    label: 'JPG',
    accent: '#f4c539',
    accentDark: '#d7a113',
    border: '#ecd687',
    fold: '#fff0bf',
    text: '#5d4600'
  },
  image: {
    label: 'IMG',
    accent: '#14b8a6',
    accentDark: '#0d9488',
    border: '#8fe0d6',
    fold: '#d7fbf6',
    text: '#053d38'
  },
  png: {
    label: 'PNG',
    accent: '#0f766e',
    accentDark: '#115e59',
    border: '#86d7cf',
    fold: '#d4f7f3',
    text: '#ffffff'
  },
  word: {
    label: 'DOC',
    accent: '#5c80dc',
    accentDark: '#3f61c0',
    border: '#b9caf5',
    fold: '#dfe7ff',
    text: '#ffffff'
  },
  powerpoint: {
    label: 'PPT',
    accent: '#ed8b57',
    accentDark: '#d76b35',
    border: '#f2c09f',
    fold: '#ffe3d5',
    text: '#ffffff'
  }
};

const badgeImageByType = {
  pdf: '../images/pdf-svgrepo-com.svg',
  word: '../images/word-svgrepo-com.svg',
  powerpoint: '../images/powerpoint-svgrepo-com.svg'
};

const getBadgeTheme = (badgeType) => fileIconThemeByType[badgeType] || fileIconThemeByType.pdf;
const getBadgeImagePath = (badgeType) => badgeImageByType[badgeType] || null;

const getFileTypeIconMarkup = (badgeConfig) => {
  const imagePath = getBadgeImagePath(badgeConfig.type);

  if (imagePath) {
    return `<img class="tool-icon-image" src="${imagePath}" alt="" />`;
  }

  const theme = getBadgeTheme(badgeConfig.type);
  const label = badgeConfig.label || theme.label;

  return `
    <svg class="tool-icon-svg" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <path d="M15 5h24l14 14v36a4 4 0 0 1-4 4H15a4 4 0 0 1-4-4V9a4 4 0 0 1 4-4z" fill="#ffffff" stroke="${theme.border}" stroke-width="2" />
      <path d="M39 5v14h14" fill="${theme.fold}" />
      <path d="M39 5v10a4 4 0 0 0 4 4h10" fill="${theme.fold}" />
      <rect x="17" y="31" width="30" height="15" rx="7.5" fill="${theme.accent}" />
      <path d="M17 39h30v7a6 6 0 0 1-6 6H23a6 6 0 0 1-6-6z" fill="${theme.accentDark}" opacity="0.35" />
      <path d="M21 18h14" stroke="#d4d8e6" stroke-width="2.4" stroke-linecap="round" />
      <path d="M21 23h20" stroke="#d4d8e6" stroke-width="2.4" stroke-linecap="round" />
      <text x="32" y="41.5" text-anchor="middle" font-size="10.5" font-weight="800" fill="${theme.text}" font-family="Sora, sans-serif">${label}</text>
    </svg>
  `;
};

const getBadgeVisualMarkup = (badgeConfig, size) => {
  const visualClass = size === 'large' ? 'tool-badge-visual' : 'tool-mini-badge-visual';

  return `<span class="${visualClass}">${getFileTypeIconMarkup(badgeConfig)}</span>`;
};

const getBadgeMarkerMarkup = (badgeConfig, size) => {
  if (!badgeConfig.marker) {
    return '';
  }

  const markerClass = size === 'large' ? 'tool-badge-marker' : 'tool-mini-badge-marker';
  return `<span class="${markerClass}" aria-hidden="true">${badgeConfig.marker}</span>`;
};

const getToolBadgeMarkup = (badgeConfig, extraClass = '') => {
  return `
    <span class="tool-mini-badge ${extraClass}" aria-hidden="true">
      ${getBadgeVisualMarkup(badgeConfig, 'mini')}
      ${getBadgeMarkerMarkup(badgeConfig, 'mini')}
    </span>
  `;
};

const createToolCardMarkup = (tool) => `
  <button class="tool-card ${tool.available ? 'is-active' : 'is-locked'}" type="button" data-tool-id="${tool.id}">
    <span class="card-badge-stack">
      ${getToolBadgeMarkup(tool.badges[0])}
      ${getToolBadgeMarkup(tool.badges[1], 'is-secondary')}
    </span>
    <h3 class="tool-card-title">${tool.title}</h3>
    <p class="tool-card-description">${tool.cardDescription}</p>
  </button>
`;

const renderToolCards = () => {
  Object.entries(toolSections).forEach(([sectionId, toolIds]) => {
    const targetGrid = toolGridBySection[sectionId];

    if (!targetGrid) {
      return;
    }

    targetGrid.innerHTML = toolIds.map((toolId) => createToolCardMarkup(toolCatalog[toolId])).join('');
  });
};

const applyToolBadge = (badgeElement, badgeConfig) => {
  const positionClass = badgeElement.id === 'tool-badge-secondary' ? 'tool-badge-secondary' : 'tool-badge-primary';

  badgeElement.className = `tool-badge ${positionClass}`;
  badgeElement.innerHTML = `${getBadgeVisualMarkup(badgeConfig, 'large')}${getBadgeMarkerMarkup(badgeConfig, 'large')}`;
};

const getStateBadgeStackMarkup = (badges = []) => badges.map((badgeConfig, index) => `
  <span class="tool-badge ${index === 1 ? 'tool-badge-secondary' : 'tool-badge-primary'}" aria-hidden="true">
    ${getBadgeVisualMarkup(badgeConfig, 'large')}
    ${getBadgeMarkerMarkup(badgeConfig, 'large')}
  </span>
`).join('');

const applyToolStageTheme = (experience) => {
  toolStage.style.setProperty('--tool-screen-accent', experience.accent || '#ec6238');
  toolStage.style.setProperty('--tool-screen-soft', experience.soft || 'rgba(244, 111, 72, 0.12)');
  toolStage.style.setProperty('--tool-screen-border', experience.border || 'rgba(244, 111, 72, 0.18)');
};

const getDocumentTitle = () => {
  const tool = getCurrentTool();

  if (state.view === 'home') {
    return 'Central de Ferramentas PDF';
  }

  if (state.view === 'success') {
    return `Download pronto | ${tool?.title || 'Ferramenta'}`;
  }

  if (state.view === 'error') {
    return `Servidor indisponível | ${tool?.title || 'Ferramenta'}`;
  }

  if (state.view === 'comingSoon') {
    return `Em breve | ${tool?.title || 'Ferramenta'}`;
  }

  return `${tool?.title || 'Ferramenta'} | Central de Ferramentas PDF`;
};

const syncView = () => {
  Object.entries(viewRegistry).forEach(([viewName, viewElement]) => {
    viewElement.classList.toggle('is-hidden', state.view !== viewName);
  });

  document.body.dataset.view = state.view;
  document.title = getDocumentTitle();
};

const syncToolView = () => {
  const tool = getCurrentTool();
  const experience = getCurrentToolExperience();

  if (!tool) {
    return;
  }

  applyToolStageTheme(experience);
  toolKicker.textContent = tool.kicker;
  toolTitle.textContent = tool.title;
  toolDescription.textContent = tool.detailDescription || tool.cardDescription;
  toolStatusChip.textContent = tool.status;
  toolStatusChip.className = `tool-status-chip ${tool.available ? 'is-available' : 'is-locked'}`;
  modeHelper.textContent = tool.helper;

  applyToolBadge(toolBadgePrimary, tool.badges[0]);
  applyToolBadge(toolBadgeSecondary, tool.badges[1]);

  fileInput.accept = tool.accept || '';
  fileInput.multiple = Boolean(tool.allowMultiple);
  fileInput.disabled = state.isBusy || !tool.available;
  clearButton.disabled = state.isBusy || !tool.available;
  submitButton.disabled = state.isBusy || !tool.available || state.files.length === 0;
  submitButton.textContent = state.isBusy ? 'PROCESSANDO...' : (tool.submitLabel || 'Iniciar conversão');
  submitButton.classList.toggle('is-hidden', !isManualSubmitTool(tool) || state.files.length === 0);
  dropzone.classList.toggle('is-busy', state.isBusy);
  dropzone.classList.toggle('is-locked', !tool.available);
  dropzone.setAttribute('aria-disabled', String(!tool.available));
  dropzone.setAttribute('aria-busy', String(state.isBusy));
  chooseButtonText.textContent = state.isBusy ? 'PROCESSANDO...' : tool.chooseLabel;
  dropzoneSubtitle.textContent = getToolDropzoneSubtitle(tool);
};

const syncSuccessView = () => {
  const tool = getCurrentTool();
  const result = state.lastResult || {};

  if (!tool) {
    return;
  }

  successTitle.textContent = `${tool.title} concluído`;
  successDescription.textContent = tool.successMessage || 'Seu arquivo foi gerado e o download já foi iniciado.';
  successFileName.textContent = result.fileName || tool.defaultDownloadName;
  successNote.textContent = result.warningMessage || '';
  successNote.classList.toggle('is-hidden', !successNote.textContent);
  successDownloadButton.disabled = !result.downloadUrl;
  successDownloadButton.classList.toggle('is-hidden', !result.downloadUrl);
};

const syncErrorView = () => {
  const tool = getCurrentTool();

  errorTitle.textContent = `Não foi possível concluir ${tool?.title || 'essa conversão'}`;
  errorDescription.textContent = state.lastError?.description || getErrorDescriptionForMessage(state.lastError?.message || '');
  errorDetail.textContent = state.lastError?.message || SERVER_UNAVAILABLE_MESSAGE;
};

const syncComingSoonView = () => {
  const tool = getCurrentTool();
  const experience = getCurrentToolExperience();

  if (!tool) {
    return;
  }

  comingSoonBadgeStack.innerHTML = getStateBadgeStackMarkup(tool.badges);
  comingSoonKicker.textContent = tool.kicker;
  comingSoonTitle.textContent = experience.comingSoonTitle || `${tool.title} chega em breve`;
  comingSoonDescription.textContent = experience.comingSoonDescription || 'Esse fluxo ainda não está disponível.';
};

const showToolView = () => {
  state.view = 'tool';
  syncToolView();
  renderPreviews();
  syncView();

  if (isClientSideTool(getCurrentTool())) {
    void preloadBackgroundRemovalResources().catch(() => {
      setBackgroundRemovalPreloadStatus('');
    });
  }
};

const clearLastResult = () => {
  if (state.lastResult?.downloadUrl) {
    URL.revokeObjectURL(state.lastResult.downloadUrl);
  }

  state.lastResult = null;
};

const showSuccessView = (result) => {
  clearLastResult();
  state.lastResult = result;
  state.lastError = null;
  clearSelectionState();
  clearPreviews();
  selectionMeta.classList.add('is-hidden');
  resetProgress();
  dropzone.classList.remove('is-dragging');
  setStatus('');
  state.view = 'success';
  syncSuccessView();
  syncView();
};

const showErrorView = (message) => {
  const tool = getCurrentTool();

  state.lastError = {
    message,
    description: getErrorDescriptionForMessage(message),
    toolId: tool?.id || null
  };

  if (tool) {
    dropzoneSubtitle.textContent = getToolDropzoneSubtitle(tool);
  }

  setStatus('');
  state.view = 'error';
  syncErrorView();
  syncView();
};

const setBusy = (isBusy) => {
  state.isBusy = isBusy;
  syncToolView();
};

const clearSelectionState = () => {
  state.files = [];
  fileInput.value = '';
};

const resetSelection = ({ keepStatus = false } = {}) => {
  clearSelectionState();
  clearPreviews();
  selectionMeta.classList.add('is-hidden');
  resetProgress();
  dropzone.classList.remove('is-dragging');
  syncToolView();

  if (!keepStatus) {
    setStatus('');
  }
};

const goHome = () => {
  state.view = 'home';
  state.activeToolId = null;
  clearLastResult();
  state.lastError = null;
  resetSelection();
  syncView();
};

const openTool = (toolId) => {
  state.activeToolId = toolId;
  clearLastResult();
  state.lastError = null;
  resetSelection();

  const tool = getCurrentTool();
  if (!tool) {
    return;
  }

  if (!tool.available) {
    state.view = 'comingSoon';
    syncComingSoonView();
    syncView();
    return;
  }

  showToolView();
};

const renderPreview = (file, index) => {
  const tool = getCurrentTool();
  const item = document.createElement('article');
  item.className = 'preview-item';
  const isSequenceEditable = isManualSubmitTool(tool);

  if (isSequenceEditable) {
    item.classList.add('is-sortable');

    const orderBadge = document.createElement('span');
    orderBadge.className = 'preview-order';
    orderBadge.textContent = String(index + 1).padStart(2, '0');
    item.appendChild(orderBadge);
  }

  const visual = document.createElement('img');
  visual.alt = '';

  if (tool?.id === 'jpg-to-pdf' || tool?.id === 'remove-background') {
    visual.className = 'preview-thumb';
    visual.src = URL.createObjectURL(file);
    visual.addEventListener('load', () => URL.revokeObjectURL(visual.src), { once: true });
  } else {
    visual.className = 'preview-icon';
    visual.src = getBadgeImagePath(tool?.badges?.[0]?.type) || '../images/pdf.webp';
  }

  item.appendChild(visual);

  const meta = document.createElement('div');
  meta.className = 'preview-meta';

  const fileName = document.createElement('strong');
  fileName.textContent = file.name;

  const fileSize = document.createElement('span');
  fileSize.textContent = formatSize(file.size);

  meta.append(fileName, fileSize);
  item.appendChild(meta);

  if (isSequenceEditable) {
    const actions = document.createElement('div');
    actions.className = 'preview-actions';

    const moveUpButton = document.createElement('button');
    moveUpButton.type = 'button';
    moveUpButton.className = 'preview-move-button';
    moveUpButton.dataset.move = 'up';
    moveUpButton.dataset.index = String(index);
    moveUpButton.textContent = 'Subir';
    moveUpButton.disabled = index === 0;
    moveUpButton.setAttribute('aria-label', `Mover ${file.name} para cima`);

    const moveDownButton = document.createElement('button');
    moveDownButton.type = 'button';
    moveDownButton.className = 'preview-move-button';
    moveDownButton.dataset.move = 'down';
    moveDownButton.dataset.index = String(index);
    moveDownButton.textContent = 'Descer';
    moveDownButton.disabled = index === state.files.length - 1;
    moveDownButton.setAttribute('aria-label', `Mover ${file.name} para baixo`);

    actions.append(moveUpButton, moveDownButton);
    item.appendChild(actions);
  }

  previewList.appendChild(item);
};

const renderPreviews = () => {
  clearPreviews();
  previewList.classList.toggle('is-sortable', isManualSubmitTool(getCurrentTool()));
  state.files.forEach(renderPreview);
  selectionMeta.classList.toggle('is-hidden', state.files.length === 0);
};

const moveSelectedFile = (fromIndex, toIndex) => {
  if (
    state.isBusy
    || fromIndex === toIndex
    || fromIndex < 0
    || toIndex < 0
    || fromIndex >= state.files.length
    || toIndex >= state.files.length
  ) {
    return;
  }

  const nextFiles = [...state.files];
  const [file] = nextFiles.splice(fromIndex, 1);
  nextFiles.splice(toIndex, 0, file);
  state.files = nextFiles;
  syncToolView();
  renderPreviews();
  setStatus('');
};

const triggerDownload = (downloadUrl, fileName) => {
  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
};

const parseFileName = (contentDisposition, fallbackName) => {
  if (!contentDisposition) {
    return fallbackName;
  }

  const utfMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utfMatch) {
    return decodeURIComponent(utfMatch[1]);
  }

  const plainMatch = contentDisposition.match(/filename="?([^\"]+)"?/i);
  return plainMatch ? plainMatch[1] : fallbackName;
};

const isLoopbackHostname = (hostname) => ['localhost', '127.0.0.1', '::1', '[::1]'].includes(hostname);

const isPrivateIpv4Hostname = (hostname) => {
  const parts = hostname.split('.').map((value) => Number.parseInt(value, 10));

  if (parts.length !== 4 || parts.some((value) => Number.isNaN(value) || value < 0 || value > 255)) {
    return false;
  }

  return (
    parts[0] === 10
    || parts[0] === 127
    || (parts[0] === 169 && parts[1] === 254)
    || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31)
    || (parts[0] === 192 && parts[1] === 168)
  );
};

const isLocalNetworkHostname = (hostname = '') => {
  const normalizedHostname = hostname.trim().toLowerCase();

  if (!normalizedHostname) {
    return false;
  }

  if (isLoopbackHostname(normalizedHostname) || normalizedHostname === '0.0.0.0') {
    return true;
  }

  if (isPrivateIpv4Hostname(normalizedHostname) || normalizedHostname.endsWith('.local')) {
    return true;
  }

  return !normalizedHostname.includes('.') && /^[a-z0-9-]+$/i.test(normalizedHostname);
};

const isLocalApiFallbackOrigin = (origin) => {
  if (!origin) {
    return false;
  }

  try {
    const { protocol, hostname } = new URL(origin, window.location.href);

    if (protocol === 'file:') {
      return true;
    }

    if (protocol !== 'http:' && protocol !== 'https:') {
      return false;
    }

    return isLocalNetworkHostname(hostname);
  } catch (_error) {
    return false;
  }
};

const shouldUseServerFallbackForClientTool = (tool) => {
  return tool?.id === REMOVE_BACKGROUND_TOOL_ID;
};

const buildLocalApiOrigins = () => {
  const localOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];

  if (window.location.protocol !== 'http:' && window.location.protocol !== 'https:') {
    return localOrigins;
  }

  const { hostname, protocol } = window.location;
  const normalizedHostname = hostname === '::1' ? '[::1]' : hostname;
  const sameHostApiOrigin = `${protocol}//${normalizedHostname}:${LOCAL_API_PORT}`;

  if (isLoopbackHostname(hostname)) {
    return buildUniqueOrigins([sameHostApiOrigin, ...localOrigins]);
  }

  return buildUniqueOrigins([sameHostApiOrigin, ...localOrigins]);
};

const getApiOriginCandidates = () => {
  const configuredApiBaseUrl = getConfiguredApiBaseUrl();

  if (configuredApiBaseUrl) {
    return [configuredApiBaseUrl];
  }

  const localOrigins = buildLocalApiOrigins();

  if (window.location.protocol !== 'http:' && window.location.protocol !== 'https:') {
    return localOrigins;
  }

  const currentOrigin = window.location.origin;
  return buildUniqueOrigins([currentOrigin, ...localOrigins]);
};

const getOrderedApiOriginCandidates = () => {
  const candidates = getApiOriginCandidates();

  if (!preferredApiBaseUrl) {
    return candidates;
  }

  return [preferredApiBaseUrl, ...candidates.filter((origin) => origin !== preferredApiBaseUrl)];
};

const shouldRetryWithNextOrigin = (statusCode) => statusCode === 404 || statusCode === 405;

const parseUploadErrorMessage = async (xhr) => {
  let message = `Falha na conversão (HTTP ${xhr.status || 'sem status'}).`;

  try {
    const responseBlob = xhr.response;
    const text = typeof responseBlob?.text === 'function'
      ? await responseBlob.text()
      : xhr.responseText;

    if (text) {
      try {
        const parsed = JSON.parse(text);
        message = parsed.message || message;
      } catch (_parseError) {
        const normalizedText = text.trim();
        message = normalizedText || message;
      }
    }
  } catch (_error) {
    message = `Falha na conversão (HTTP ${xhr.status || 'sem status'}).`;
  }

  return message;
};

const sendUploadRequest = ({ apiBaseUrl, tool }) => new Promise((resolve, reject) => {
  const xhr = new XMLHttpRequest();
  const formData = new FormData();

  state.files.forEach((file) => formData.append(tool.fieldName, file));

  xhr.open('POST', `${apiBaseUrl}${tool.endpoint}`, true);
  xhr.responseType = 'blob';
  xhr.timeout = 240000;

  xhr.upload.addEventListener('progress', (event) => {
    if (event.lengthComputable) {
      updateProgress((event.loaded / event.total) * 100);
    }
  });

  xhr.addEventListener('load', async () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      resolve({
        blob: xhr.response,
        fileName: parseFileName(xhr.getResponseHeader('Content-Disposition'), tool.defaultDownloadName),
        warningMessage: xhr.getResponseHeader('X-Conversion-Warning') || '',
        apiBaseUrl
      });
      return;
    }

    reject(createUploadFailure('http', await parseUploadErrorMessage(xhr), {
      statusCode: xhr.status
    }));
  });

  xhr.addEventListener('error', () => {
    reject(createUploadFailure('network', NETWORK_CONNECTION_MESSAGE));
  });

  xhr.addEventListener('timeout', () => {
    reject(createUploadFailure('timeout', REQUEST_TIMEOUT_MESSAGE));
  });

  xhr.send(formData);
});

const uploadWithProgress = async () => {
  const tool = getCurrentTool();
  let lastFailure = null;
  let timeoutFailure = null;

  for (const apiBaseUrl of getOrderedApiOriginCandidates()) {
    try {
      const result = await sendUploadRequest({ apiBaseUrl, tool });
      preferredApiBaseUrl = result.apiBaseUrl;
      return result;
    } catch (error) {
      lastFailure = error;

      if (error.kind === 'timeout') {
        timeoutFailure = error;
        continue;
      }

      if (error.kind === 'http' && !shouldRetryWithNextOrigin(error.statusCode)) {
        throw new Error(error.message);
      }
    }
  }

  if (timeoutFailure) {
    throw new Error(timeoutFailure.message);
  }

  if (lastFailure?.kind === 'http' && !shouldRetryWithNextOrigin(lastFailure.statusCode)) {
    throw new Error(lastFailure.message);
  }

  throw new Error(getServerUnavailableMessage());
};

const processCurrentTool = async (tool) => {
  if (isClientSideTool(tool)) {
    return runClientSideToolWithFallback(tool);
  }

  return uploadWithProgress();
};

const getValidatedFilesForCurrentTool = (files) => toolValidation.getValidatedFilesForTool(getCurrentTool(), files);

const startConversion = async () => {
  const tool = getCurrentTool();

  if (!tool?.available || state.files.length === 0 || state.isBusy) {
    return;
  }

  setBusy(true);
  resetProgress();
  updateProgress(5);
  setStatus(tool.processingMessage);

  try {
    const { blob, fileName, warningMessage } = await processCurrentTool(tool);
    updateProgress(100);
    const downloadUrl = URL.createObjectURL(blob);
    triggerDownload(downloadUrl, fileName);
    showSuccessView({ fileName, warningMessage, downloadUrl });
  } catch (error) {
    resetProgress();

    if (!isClientSideTool(tool) && isServerUnavailableError(error.message)) {
      showErrorView(error.message);
    } else {
      setStatus(error.message, 'error');
      dropzoneSubtitle.textContent = getToolDropzoneSubtitle(tool);
    }
  } finally {
    setBusy(false);
  }
};

const handleFiles = async (incomingFiles) => {
  if (state.isBusy) {
    return;
  }

  try {
    const files = Array.from(incomingFiles);
    fileInput.value = '';

    if (files.length === 0) {
      return;
    }

    state.files = assertFilesWithinSizeLimit(getValidatedFilesForCurrentTool(files));
    syncToolView();
    renderPreviews();

    const tool = getCurrentTool();
    setStatus(isManualSubmitTool(tool) ? '' : tool.readyMessage(state.files.length));

    if (isManualSubmitTool(tool)) {
      return;
    }

    await startConversion();
  } catch (error) {
    resetSelection({ keepStatus: true });
    setStatus(error.message, 'error');
  }
};

const handleToolCardClick = (event) => {
  const card = event.target.closest('[data-tool-id]');

  if (!card) {
    return;
  }

  openTool(card.dataset.toolId);
};

renderToolCards();
syncView();

homeView.addEventListener('click', handleToolCardClick);

brandHomeButton.addEventListener('click', goHome);
backHomeButton.addEventListener('click', goHome);
successBackButton.addEventListener('click', goHome);
successHomeButton.addEventListener('click', goHome);
successDownloadButton.addEventListener('click', () => {
  const tool = getCurrentTool();
  const downloadUrl = state.lastResult?.downloadUrl;

  if (!downloadUrl) {
    return;
  }

  triggerDownload(downloadUrl, state.lastResult?.fileName || tool?.defaultDownloadName || 'arquivo-gerado');
});
successAgainButton.addEventListener('click', () => {
  clearLastResult();
  resetSelection();
  showToolView();
});
errorBackButton.addEventListener('click', goHome);
errorHomeButton.addEventListener('click', goHome);
errorRetryButton.addEventListener('click', async () => {
  state.lastError = null;
  showToolView();
  await startConversion();
});
comingSoonBackButton.addEventListener('click', goHome);
comingSoonHomeButton.addEventListener('click', goHome);
comingSoonActiveButton.addEventListener('click', () => {
  openTool(DEFAULT_ACTIVE_TOOL_ID);
});

['dragenter', 'dragover', 'drop'].forEach((eventName) => {
  window.addEventListener(eventName, (event) => {
    if (!eventHasFiles(event)) {
      return;
    }

    event.preventDefault();

    if (eventName === 'drop' && !dropzone.contains(event.target)) {
      dropzone.classList.remove('is-dragging');
    }
  });
});

dropzone.addEventListener('click', (event) => {
  const tool = getCurrentTool();

  if (!tool) {
    event.preventDefault();
    return;
  }

  if (!tool.available) {
    event.preventDefault();
    setStatus(tool.lockedMessage || 'Esta ferramenta ainda não está disponível.', 'warning');
    return;
  }

  if (state.isBusy) {
    event.preventDefault();
  }
});

dropzone.addEventListener('dragover', (event) => {
  const tool = getCurrentTool();

  if (!tool?.available || state.isBusy) {
    return;
  }

  event.preventDefault();
  dropzone.classList.add('is-dragging');
});

dropzone.addEventListener('dragleave', () => {
  dropzone.classList.remove('is-dragging');
});

dropzone.addEventListener('drop', async (event) => {
  const tool = getCurrentTool();

  event.preventDefault();
  dropzone.classList.remove('is-dragging');

  if (!tool?.available) {
    setStatus(tool?.lockedMessage || 'Esta ferramenta ainda não está disponível.', 'warning');
    return;
  }

  await handleFiles(event.dataTransfer.files);
});

fileInput.addEventListener('change', async (event) => {
  await handleFiles(event.target.files);
});

clearButton.addEventListener('click', () => {
  if (!state.isBusy) {
    resetSelection();
  }
});

submitButton.addEventListener('click', async () => {
  await startConversion();
});

previewList.addEventListener('click', (event) => {
  const moveButton = event.target.closest('[data-move]');

  if (!moveButton) {
    return;
  }

  const currentIndex = Number(moveButton.dataset.index);
  const targetIndex = moveButton.dataset.move === 'up' ? currentIndex - 1 : currentIndex + 1;

  moveSelectedFile(currentIndex, targetIndex);
});