const toolCatalog = {
  'jpg-to-pdf': {
    id: 'jpg-to-pdf',
    title: 'JPG para PDF',
    cardDescription: 'Agrupe uma ou mais imagens JPG/JPEG e monte um PDF unico com esse material.',
    cardHighlights: ['Aceita varias imagens', 'Entrega um PDF unico'],
    detailDescription: 'Envie uma ou mais imagens JPG/JPEG e gere um PDF unico em uma tela dedicada para esse fluxo.',
    note: 'A ordem final do PDF segue a ordem em que os arquivos forem enviados nesta etapa.',
    section: 'active',
    kicker: 'Conversao ativa',
    helper: 'Envie uma ou mais imagens JPG/JPEG para montar um PDF unico.',
    available: true,
    status: 'Disponivel agora',
    endpoint: '/upload/jpg-to-pdf',
    fieldName: 'files',
    accept: '.jpg,.jpeg,image/jpeg,image/jpg',
    allowMultiple: true,
    chooseLabel: 'ESCOLHER IMAGENS',
    idleSubtitle: 'Ou solte imagens JPG/JPEG aqui',
    lockedSubtitle: 'Esta ferramenta ainda nao esta disponivel',
    processingMessage: 'Enviando as imagens e montando o PDF final...',
    successMessage: 'Conversao concluida. O PDF foi baixado automaticamente.',
    readyMessage: (fileCount) => `${fileCount} imagem(ns) pronta(s) para conversao.`,
    receivedMessage: (fileCount) => `${fileCount} imagem(ns) recebida(s). A conversao comeca agora.`,
    defaultDownloadName: 'resultado-convertido.pdf',
    badges: [
      { type: 'jpg', label: 'JPG' },
      { type: 'pdf', label: 'PDF' }
    ]
  },
  'pdf-to-jpg': {
    id: 'pdf-to-jpg',
    title: 'PDF para JPG',
    cardDescription: 'Receba um ZIP com as paginas convertidas em imagens JPG em um fluxo pronto para uso.',
    cardHighlights: ['Recebe 1 PDF por vez', 'Baixa um ZIP com paginas JPG'],
    detailDescription: 'Envie um PDF por vez e receba um ZIP com todas as paginas convertidas em JPG.',
    note: 'Quando o PDF depender de fontes do sistema, a tela avisa para deixar claro quando a fidelidade tipografica pode variar.',
    section: 'active',
    kicker: 'Conversao ativa',
    helper: 'Envie 1 PDF por vez e receba um ZIP com todas as paginas em JPG.',
    available: true,
    status: 'Disponivel agora',
    endpoint: '/upload/pdf-to-jpg',
    fieldName: 'file',
    accept: '.pdf,application/pdf',
    allowMultiple: false,
    chooseLabel: 'ESCOLHER PDF',
    idleSubtitle: 'Ou solte um PDF aqui',
    lockedSubtitle: 'Esta ferramenta ainda nao esta disponivel',
    processingMessage: 'Enviando o PDF e convertendo as paginas em JPG...',
    successMessage: 'Conversao concluida. O ZIP com as imagens foi baixado automaticamente.',
    readyMessage: () => 'PDF pronto para conversao.',
    receivedMessage: () => 'PDF recebido. A conversao comeca agora.',
    defaultDownloadName: 'resultado-convertido.zip',
    badges: [
      { type: 'pdf', label: 'PDF' },
      { type: 'jpg', label: 'JPG' }
    ]
  },
  'merge-pdf': {
    id: 'merge-pdf',
    title: 'Juntar PDF',
    cardDescription: 'Mesclar arquivos PDF em uma unica saida, organizando a ordem antes da exportacao.',
    cardHighlights: ['Une dois ou mais PDFs', 'Mantem a ordem enviada'],
    detailDescription: 'Envie dois ou mais PDFs e receba um arquivo final unificado em uma tela dedicada a montagem do documento.',
    note: 'A juncao respeita a ordem em que os arquivos forem enviados nesta etapa.',
    section: 'organize',
    kicker: 'Organizar PDF',
    helper: 'Envie dois ou mais PDFs para juntar tudo em um unico arquivo final.',
    available: true,
    status: 'Disponivel agora',
    endpoint: '/upload/merge-pdf',
    fieldName: 'files',
    accept: '.pdf,application/pdf',
    allowMultiple: true,
    chooseLabel: 'ESCOLHER PDFS',
    idleSubtitle: 'Ou solte dois ou mais PDFs aqui',
    lockedSubtitle: 'Esta ferramenta ainda nao esta disponivel',
    processingMessage: 'Enviando os PDFs e juntando as paginas...',
    successMessage: 'Juncao concluida. O PDF final foi baixado automaticamente.',
    readyMessage: (fileCount) => `${fileCount} PDF(s) pronto(s) para juncao.`,
    receivedMessage: (fileCount) => `${fileCount} PDF(s) recebido(s). A juncao comeca agora.`,
    defaultDownloadName: 'pdfs-unidos-convertido.pdf',
    badges: [
      { type: 'pdf', label: 'PDF' },
      { type: 'pdf', label: 'PDF', marker: '+' }
    ]
  },
  'split-pdf': {
    id: 'split-pdf',
    title: 'Dividir PDF',
    cardDescription: 'Separar um PDF em arquivos individuais por pagina e baixar tudo em um unico ZIP.',
    cardHighlights: ['Separa pagina por pagina', 'Entrega tudo em ZIP'],
    detailDescription: 'Envie um PDF por vez e receba um ZIP com um arquivo PDF separado para cada pagina do documento.',
    note: 'Cada pagina do PDF original sera exportada como um arquivo individual dentro do ZIP final.',
    section: 'organize',
    kicker: 'Organizar PDF',
    helper: 'Envie 1 PDF por vez para gerar um ZIP com cada pagina em um arquivo PDF separado.',
    available: true,
    status: 'Disponivel agora',
    endpoint: '/upload/split-pdf',
    fieldName: 'file',
    accept: '.pdf,application/pdf',
    allowMultiple: false,
    chooseLabel: 'ESCOLHER PDF',
    idleSubtitle: 'Ou solte um PDF aqui',
    lockedSubtitle: 'Esta ferramenta ainda nao esta disponivel',
    processingMessage: 'Enviando o PDF e separando as paginas em arquivos individuais...',
    successMessage: 'Divisao concluida. O ZIP com os PDFs foi baixado automaticamente.',
    readyMessage: () => 'PDF pronto para divisao.',
    receivedMessage: () => 'PDF recebido. A divisao comeca agora.',
    defaultDownloadName: 'pdf-dividido-convertido.zip',
    badges: [
      { type: 'pdf', label: 'PDF' },
      { type: 'pdf', label: 'PDF', marker: '/' }
    ]
  },
  'word-to-pdf': {
    id: 'word-to-pdf',
    title: 'Word para PDF',
    cardDescription: 'Converta um arquivo DOC ou DOCX em PDF com renderizacao real via LibreOffice quando o backend estiver preparado para isso.',
    cardHighlights: ['Recebe 1 DOC ou DOCX por vez', 'Entrega um PDF unico'],
    detailDescription: 'Envie um arquivo DOC ou DOCX por vez. Quando o backend tiver LibreOffice, o PDF sai com bem mais fidelidade; sem ele, DOCX ainda pode usar um fallback textual.',
    note: 'No deploy com LibreOffice, o backend faz a conversao real do documento. Se esse binario nao estiver disponivel, apenas DOCX pode cair no fallback textual.',
    section: 'future',
    kicker: 'Converter para PDF',
    helper: 'Envie 1 arquivo DOC ou DOCX por vez para gerar um PDF unico.',
    available: true,
    status: 'Disponivel agora',
    endpoint: '/upload/word-to-pdf',
    fieldName: 'file',
    accept: '.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    allowMultiple: false,
    chooseLabel: 'ESCOLHER WORD',
    idleSubtitle: 'Ou solte um arquivo DOC ou DOCX aqui',
    lockedSubtitle: 'Esta ferramenta ainda nao esta disponivel',
    processingMessage: 'Enviando o arquivo Word e montando o PDF final...',
    successMessage: 'Conversao concluida. O PDF foi baixado automaticamente.',
    readyMessage: () => 'Arquivo Word pronto para conversao.',
    receivedMessage: () => 'Arquivo Word recebido. A conversao comeca agora.',
    defaultDownloadName: 'word-convertido.pdf',
    badges: [
      { type: 'word', label: 'DOC' },
      { type: 'pdf', label: 'PDF' }
    ]
  },
  'powerpoint-to-pdf': {
    id: 'powerpoint-to-pdf',
    title: 'PowerPoint para PDF',
    cardDescription: 'Converta um arquivo PPT ou PPTX em PDF com renderizacao real via LibreOffice quando o backend estiver preparado para isso.',
    cardHighlights: ['Recebe 1 PPT ou PPTX por vez', 'Entrega um PDF unico'],
    detailDescription: 'Envie um arquivo PPT ou PPTX por vez. Quando o backend tiver LibreOffice, o PDF sai com bem mais fidelidade; sem ele, PPTX ainda pode usar um fallback textual.',
    note: 'No deploy com LibreOffice, o backend faz a conversao real dos slides. Se esse binario nao estiver disponivel, apenas PPTX pode cair no fallback textual.',
    section: 'future',
    kicker: 'Converter para PDF',
    helper: 'Envie 1 arquivo PPT ou PPTX por vez para gerar um PDF unico.',
    available: true,
    status: 'Disponivel agora',
    endpoint: '/upload/powerpoint-to-pdf',
    fieldName: 'file',
    accept: '.ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation',
    allowMultiple: false,
    chooseLabel: 'ESCOLHER POWERPOINT',
    idleSubtitle: 'Ou solte um arquivo PPT ou PPTX aqui',
    lockedSubtitle: 'Esta ferramenta ainda nao esta disponivel',
    processingMessage: 'Enviando o arquivo PowerPoint e montando o PDF final...',
    successMessage: 'Conversao concluida. O PDF foi baixado automaticamente.',
    readyMessage: () => 'Arquivo PowerPoint pronto para conversao.',
    receivedMessage: () => 'Arquivo PowerPoint recebido. A conversao comeca agora.',
    defaultDownloadName: 'slides-convertidos.pdf',
    badges: [
      { type: 'powerpoint', label: 'PPT' },
      { type: 'pdf', label: 'PDF' }
    ]
  }
};

const toolSections = {
  active: ['jpg-to-pdf', 'pdf-to-jpg'],
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

const SERVER_UNAVAILABLE_MESSAGE = 'Nao foi possivel encontrar o servidor da conversao.';
const SERVER_UNAVAILABLE_HINTS = [
  'Confirme se o backend foi publicado ou se o servidor local esta no ar.',
  'Verifique a URL da API e as configuracoes do ambiente antes do deploy.',
  'Se o servidor acabou de subir, espere alguns segundos e tente novamente.'
];
const DEFAULT_ACTIVE_TOOL_ID = toolSections.active[0];

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

const buildUniqueOrigins = (origins) => Array.from(new Set(origins.filter(Boolean)));

const normalizeApiBaseUrl = (value = '') => value.trim().replace(/\/+$/, '');

const getConfiguredApiBaseUrl = () => normalizeApiBaseUrl(window.APP_CONFIG?.API_BASE_URL || '');

const getServerUnavailableMessage = () => {
  const configuredApiBaseUrl = getConfiguredApiBaseUrl();

  if (!configuredApiBaseUrl) {
    return `${SERVER_UNAVAILABLE_MESSAGE} Verifique se a API do backend esta no ar.`;
  }

  return `${SERVER_UNAVAILABLE_MESSAGE} Verifique se a API configurada em ${configuredApiBaseUrl} esta no ar.`;
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
const progressWrapper = document.getElementById('progress-wrapper');
const progressFill = document.getElementById('progress-fill');
const progressLabel = document.getElementById('progress-label');
const statusMessage = document.getElementById('status-message');
const successBackButton = document.getElementById('success-back-button');
const successTitle = document.getElementById('success-title');
const successDescription = document.getElementById('success-description');
const successFileName = document.getElementById('success-file-name');
const successNote = document.getElementById('success-note');
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

const isPdfFile = (file) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

const isJpgFile = (file) => ['image/jpeg', 'image/jpg'].includes(file.type) || /\.jpe?g$/i.test(file.name);

const isWordFile = (file) => (
  ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)
  || /\.docx?$/i.test(file.name)
);

const isPowerpointFile = (file) => (
  ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'].includes(file.type)
  || /\.pptx?$/i.test(file.name)
);

const isServerUnavailableError = (message = '') => (
  message.includes(SERVER_UNAVAILABLE_MESSAGE)
  || message.includes('Nao foi possivel conectar ao servidor.')
);

const formatSize = (bytes) => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
    <span class="tool-card-footer">
      <span class="tool-card-pill ${tool.available ? 'is-available' : 'is-locked'}">${tool.status}</span>
    </span>
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
    return `Servidor indisponivel | ${tool?.title || 'Ferramenta'}`;
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
  dropzone.classList.toggle('is-busy', state.isBusy);
  dropzone.classList.toggle('is-locked', !tool.available);
  dropzone.setAttribute('aria-disabled', String(!tool.available));
  dropzone.setAttribute('aria-busy', String(state.isBusy));
  chooseButtonText.textContent = state.isBusy ? 'PROCESSANDO...' : tool.chooseLabel;
  dropzoneSubtitle.textContent = state.isBusy ? 'Seus arquivos estao sendo processados' : (tool.available ? tool.idleSubtitle : tool.lockedSubtitle);
};

const syncSuccessView = () => {
  const tool = getCurrentTool();
  const result = state.lastResult || {};

  if (!tool) {
    return;
  }

  successTitle.textContent = `${tool.title} concluido`;
  successDescription.textContent = tool.successMessage || 'Seu arquivo foi gerado e o download ja foi iniciado.';
  successFileName.textContent = result.fileName || tool.defaultDownloadName;
  successNote.textContent = result.warningMessage || '';
  successNote.classList.toggle('is-hidden', !successNote.textContent);
};

const syncErrorView = () => {
  const tool = getCurrentTool();

  errorTitle.textContent = `Nao foi possivel concluir ${tool?.title || 'essa conversao'}`;
  errorDescription.textContent = 'O backend nao respondeu a tempo para concluir o envio.';
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
  comingSoonDescription.textContent = experience.comingSoonDescription || 'Esse fluxo ainda nao esta disponivel.';
};

const showToolView = () => {
  state.view = 'tool';
  syncToolView();
  renderPreviews();
  syncView();
};

const showSuccessView = (result) => {
  state.lastResult = result;
  resetSelection({ keepStatus: true });
  setStatus('');
  state.view = 'success';
  syncSuccessView();
  syncView();
};

const showErrorView = (message) => {
  const tool = getCurrentTool();

  state.lastError = {
    message,
    toolId: tool?.id || null
  };

  if (tool) {
    dropzoneSubtitle.textContent = tool.readyMessage(state.files.length);
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

const resetSelection = ({ keepStatus = false } = {}) => {
  state.files = [];
  fileInput.value = '';
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
  state.lastResult = null;
  state.lastError = null;
  resetSelection();
  syncView();
};

const openTool = (toolId) => {
  state.activeToolId = toolId;
  state.lastResult = null;
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

const renderPreview = (file) => {
  const tool = getCurrentTool();
  const item = document.createElement('article');
  item.className = 'preview-item';

  const visual = document.createElement('img');
  visual.alt = '';

  if (tool?.id === 'jpg-to-pdf') {
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
  meta.innerHTML = `<strong>${file.name}</strong><span>${formatSize(file.size)}</span>`;
  item.appendChild(meta);

  previewList.appendChild(item);
};

const renderPreviews = () => {
  clearPreviews();
  state.files.forEach(renderPreview);
  selectionMeta.classList.toggle('is-hidden', state.files.length === 0);
};

const triggerDownload = (blob, fileName) => {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
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
  let message = `Falha na conversao (HTTP ${xhr.status || 'sem status'}).`;

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
    message = `Falha na conversao (HTTP ${xhr.status || 'sem status'}).`;
  }

  return message;
};

const sendUploadRequest = ({ apiBaseUrl, tool }) => new Promise((resolve, reject) => {
  const xhr = new XMLHttpRequest();
  const formData = new FormData();

  state.files.forEach((file) => formData.append(tool.fieldName, file));

  xhr.open('POST', `${apiBaseUrl}${tool.endpoint}`, true);
  xhr.responseType = 'blob';

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

    reject({
      kind: 'http',
      statusCode: xhr.status,
      message: await parseUploadErrorMessage(xhr)
    });
  });

  xhr.addEventListener('error', () => {
    reject({
      kind: 'network',
      message: 'Nao foi possivel conectar ao servidor.'
    });
  });

  xhr.send(formData);
});

const uploadWithProgress = async () => {
  const tool = getCurrentTool();
  let lastFailure = null;

  for (const apiBaseUrl of getOrderedApiOriginCandidates()) {
    try {
      const result = await sendUploadRequest({ apiBaseUrl, tool });
      preferredApiBaseUrl = result.apiBaseUrl;
      return result;
    } catch (error) {
      lastFailure = error;

      if (error.kind === 'http' && !shouldRetryWithNextOrigin(error.statusCode)) {
        throw new Error(error.message);
      }
    }
  }

  if (lastFailure?.kind === 'http' && !shouldRetryWithNextOrigin(lastFailure.statusCode)) {
    throw new Error(lastFailure.message);
  }

  throw new Error(getServerUnavailableMessage());
};

const toolFileValidators = {
  'pdf-to-jpg': (files, { pdfFiles, jpgFiles }) => {
    if (pdfFiles.length === 1 && pdfFiles.length === files.length) {
      return [pdfFiles[0]];
    }

    if (pdfFiles.length > 1) {
      throw new Error('Para converter PDF em JPG, envie apenas um PDF por vez.');
    }

    if (jpgFiles.length > 0) {
      throw new Error('Esta tela esta em PDF para JPG. Escolha o card JPG para PDF se quiser enviar imagens.');
    }

    throw new Error('Selecione um arquivo PDF valido.');
  },
  'jpg-to-pdf': (files, { pdfFiles, jpgFiles }) => {
    if (jpgFiles.length === files.length && jpgFiles.length > 0) {
      return files;
    }

    if (pdfFiles.length > 0) {
      throw new Error('Esta tela esta em JPG para PDF. Escolha o card PDF para JPG se quiser enviar um PDF.');
    }

    throw new Error('Selecione apenas imagens JPG/JPEG validas.');
  },
  'merge-pdf': (files, { pdfFiles, jpgFiles }) => {
    if (pdfFiles.length === files.length && pdfFiles.length >= 2) {
      return files;
    }

    if (jpgFiles.length > 0) {
      throw new Error('Esta tela esta em Juntar PDF. Envie apenas arquivos PDF para montar o documento final.');
    }

    if (pdfFiles.length === 1) {
      throw new Error('Envie ao menos dois arquivos PDF para juntar.');
    }

    throw new Error('Selecione apenas arquivos PDF validos.');
  },
  'split-pdf': (files, { pdfFiles, jpgFiles }) => {
    if (pdfFiles.length === 1 && pdfFiles.length === files.length) {
      return [pdfFiles[0]];
    }

    if (pdfFiles.length > 1) {
      throw new Error('Para dividir PDF, envie apenas um PDF por vez.');
    }

    if (jpgFiles.length > 0) {
      throw new Error('Esta tela esta em Dividir PDF. Envie apenas um arquivo PDF valido.');
    }

    throw new Error('Selecione um arquivo PDF valido.');
  },
  'word-to-pdf': (files, { wordFiles }) => {
    if (wordFiles.length === 1 && wordFiles.length === files.length) {
      return [wordFiles[0]];
    }

    if (files.length > 1) {
      throw new Error('Para converter Word em PDF, envie apenas um arquivo DOC ou DOCX por vez.');
    }

    throw new Error('Selecione um arquivo DOC ou DOCX valido.');
  },
  'powerpoint-to-pdf': (files, { powerpointFiles }) => {
    if (powerpointFiles.length === 1 && powerpointFiles.length === files.length) {
      return [powerpointFiles[0]];
    }

    if (files.length > 1) {
      throw new Error('Para converter PowerPoint em PDF, envie apenas um arquivo PPT ou PPTX por vez.');
    }

    throw new Error('Selecione um arquivo PPT ou PPTX valido.');
  }
};

const getValidatedFilesForCurrentTool = (files) => {
  const tool = getCurrentTool();
  const pdfFiles = files.filter(isPdfFile);
  const jpgFiles = files.filter(isJpgFile);
  const wordFiles = files.filter(isWordFile);
  const powerpointFiles = files.filter(isPowerpointFile);

  if (!tool?.available) {
    throw new Error(tool?.lockedMessage || 'Esta ferramenta ainda nao esta disponivel.');
  }

  const validateFiles = toolFileValidators[tool.id];

  if (validateFiles) {
    return validateFiles(files, {
      pdfFiles,
      jpgFiles,
      wordFiles,
      powerpointFiles
    });
  }

  throw new Error(tool.lockedMessage || 'Esta ferramenta ainda nao esta disponivel.');
};

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
    const { blob, fileName, warningMessage } = await uploadWithProgress();
    updateProgress(100);
    triggerDownload(blob, fileName);
    showSuccessView({ fileName, warningMessage });
  } catch (error) {
    resetProgress();

    if (isServerUnavailableError(error.message)) {
      showErrorView(error.message);
    } else {
      setStatus(error.message, 'error');
      dropzoneSubtitle.textContent = tool.idleSubtitle;
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

    state.files = getValidatedFilesForCurrentTool(files);
    renderPreviews();

    const tool = getCurrentTool();
    dropzoneSubtitle.textContent = tool.receivedMessage(state.files.length);
    setStatus(tool.readyMessage(state.files.length));

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
successAgainButton.addEventListener('click', () => {
  state.lastResult = null;
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

dropzone.addEventListener('click', (event) => {
  const tool = getCurrentTool();

  if (!tool) {
    event.preventDefault();
    return;
  }

  if (!tool.available) {
    event.preventDefault();
    setStatus(tool.lockedMessage, 'warning');
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
    setStatus(tool?.lockedMessage || 'Esta ferramenta ainda nao esta disponivel.', 'warning');
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