const toolCatalog = {
  'jpg-to-pdf': {
    id: 'jpg-to-pdf',
    title: 'JPG para PDF',
    cardDescription: 'Agrupe uma ou mais imagens JPG/JPEG e monte um PDF unico com esse material.',
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
    cardDescription: 'Tela preparada para DOC e DOCX com instrucoes, upload e status dedicados a esse fluxo.',
    detailDescription: 'Essa ferramenta vai converter arquivos Word para PDF mantendo um fluxo proprio, com contexto e mensagens especificas.',
    note: 'Esse card ja abre uma pagina contextualizada. Falta ligar o motor de conversao para documentos Word.',
    section: 'future',
    kicker: 'Converter para PDF',
    helper: 'Fluxo planejado para receber arquivos DOC e DOCX e exportar um PDF final.',
    available: false,
    status: 'Em breve',
    lockedMessage: 'Word para PDF ainda nao esta disponivel. A navegacao ja foi preparada para esse fluxo.',
    lockedSubtitle: 'Fluxo em breve',
    chooseLabel: 'EM BREVE',
    badges: [
      { type: 'word', label: 'DOC' },
      { type: 'pdf', label: 'PDF' }
    ]
  },
  'powerpoint-to-pdf': {
    id: 'powerpoint-to-pdf',
    title: 'PowerPoint para PDF',
    cardDescription: 'Tela dedicada para receber apresentacoes e manter o mesmo modelo de pagina contextualizada.',
    detailDescription: 'Essa opcao vai abrir o caminho para converter apresentacoes para PDF usando um fluxo proprio e mensagens adequadas.',
    note: 'A estrutura da tela ja existe. O proximo passo sera integrar o conversor para arquivos de apresentacao.',
    section: 'future',
    kicker: 'Converter para PDF',
    helper: 'Fluxo planejado para receber arquivos PPT e PPTX e gerar um PDF final.',
    available: false,
    status: 'Em breve',
    lockedMessage: 'PowerPoint para PDF ainda nao esta disponivel. A pagina contextualizada ja esta preparada.',
    lockedSubtitle: 'Fluxo em breve',
    chooseLabel: 'EM BREVE',
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

const state = {
  view: 'home',
  activeToolId: null,
  files: [],
  isBusy: false
};

const LOCAL_API_PORT = '3000';
let preferredApiBaseUrl = null;

const buildUniqueOrigins = (origins) => Array.from(new Set(origins.filter(Boolean)));

const brandHomeButton = document.getElementById('brand-home-button');
const homeView = document.getElementById('home-view');
const toolView = document.getElementById('tool-view');
const activeToolsGrid = document.getElementById('active-tools-grid');
const organizeToolsGrid = document.getElementById('organize-tools-grid');
const futureToolsGrid = document.getElementById('future-tools-grid');
const backHomeButton = document.getElementById('back-home-button');
const toolKicker = document.getElementById('tool-kicker');
const toolTitle = document.getElementById('tool-title');
const toolDescription = document.getElementById('tool-description');
const toolNote = document.getElementById('tool-note');
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

const getCurrentTool = () => toolCatalog[state.activeToolId] || null;

const isPdfFile = (file) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

const isJpgFile = (file) => ['image/jpeg', 'image/jpg'].includes(file.type) || /\.jpe?g$/i.test(file.name);

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
      <text x="32" y="41.5" text-anchor="middle" font-size="10.5" font-weight="800" fill="${theme.text}" font-family="Montserrat, sans-serif">${label}</text>
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
  activeToolsGrid.innerHTML = toolSections.active.map((toolId) => createToolCardMarkup(toolCatalog[toolId])).join('');
  organizeToolsGrid.innerHTML = toolSections.organize.map((toolId) => createToolCardMarkup(toolCatalog[toolId])).join('');
  futureToolsGrid.innerHTML = toolSections.future.map((toolId) => createToolCardMarkup(toolCatalog[toolId])).join('');
};

const applyToolBadge = (badgeElement, badgeConfig) => {
  const positionClass = badgeElement.id === 'tool-badge-secondary' ? 'tool-badge-secondary' : 'tool-badge-primary';

  badgeElement.className = `tool-badge ${positionClass}`;
  badgeElement.innerHTML = `${getBadgeVisualMarkup(badgeConfig, 'large')}${getBadgeMarkerMarkup(badgeConfig, 'large')}`;
};

const syncView = () => {
  const isHomeView = state.view === 'home';

  homeView.classList.toggle('is-hidden', !isHomeView);
  toolView.classList.toggle('is-hidden', isHomeView);
  document.title = isHomeView ? 'Central de Ferramentas PDF' : `${getCurrentTool()?.title || 'Ferramenta'} | Central de Ferramentas PDF`;
};

const syncToolView = () => {
  const tool = getCurrentTool();

  if (!tool) {
    return;
  }

  toolKicker.textContent = tool.kicker;
  toolTitle.textContent = tool.title;
  toolDescription.textContent = tool.detailDescription;
  toolNote.textContent = tool.note;
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
  chooseButtonText.textContent = state.isBusy ? 'PROCESSANDO...' : tool.chooseLabel;
  dropzoneSubtitle.textContent = state.isBusy ? 'Seus arquivos estao sendo processados' : (tool.available ? tool.idleSubtitle : tool.lockedSubtitle);
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
  resetSelection();
  syncView();
};

const openTool = (toolId) => {
  state.activeToolId = toolId;
  state.view = 'tool';
  resetSelection();
  syncView();

  const tool = getCurrentTool();
  if (!tool.available) {
    setStatus(tool.lockedMessage, 'warning');
  }
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
    visual.src = '../images/pdf.webp';
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

  throw new Error('Nao foi possivel encontrar o servidor da conversao. Verifique se o backend esta rodando em http://localhost:3000.');
};

const getValidatedFilesForCurrentTool = (files) => {
  const tool = getCurrentTool();
  const pdfFiles = files.filter(isPdfFile);
  const jpgFiles = files.filter(isJpgFile);

  if (!tool?.available) {
    throw new Error(tool?.lockedMessage || 'Esta ferramenta ainda nao esta disponivel.');
  }

  if (tool.id === 'pdf-to-jpg') {
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
  }

  if (tool.id === 'jpg-to-pdf') {
    if (jpgFiles.length === files.length && jpgFiles.length > 0) {
      return files;
    }

    if (pdfFiles.length > 0) {
      throw new Error('Esta tela esta em JPG para PDF. Escolha o card PDF para JPG se quiser enviar um PDF.');
    }

    throw new Error('Selecione apenas imagens JPG/JPEG validas.');
  }

  if (tool.id === 'merge-pdf') {
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
  }

  if (tool.id === 'split-pdf') {
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
    setStatus(
      warningMessage ? `${tool.successMessage} ${warningMessage}` : tool.successMessage,
      warningMessage ? 'warning' : 'success'
    );
    dropzoneSubtitle.textContent = 'Selecione novos arquivos para converter novamente';
  } catch (error) {
    resetProgress();
    setStatus(error.message, 'error');
    dropzoneSubtitle.textContent = tool.idleSubtitle;
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

activeToolsGrid.addEventListener('click', handleToolCardClick);
organizeToolsGrid.addEventListener('click', handleToolCardClick);
futureToolsGrid.addEventListener('click', handleToolCardClick);

brandHomeButton.addEventListener('click', goHome);
backHomeButton.addEventListener('click', goHome);

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