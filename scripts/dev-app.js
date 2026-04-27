const http = require('http');
const path = require('path');
const { spawn } = require('child_process');

const DEFAULT_PORT = 3000;
const HEALTH_PATH = '/health';
const HEALTH_TIMEOUT_MS = 30000;
const HEALTH_INTERVAL_MS = 500;

const projectRoot = path.resolve(__dirname, '..');
const nodemonCliPath = path.join(projectRoot, 'node_modules', 'nodemon', 'bin', 'nodemon.js');
const serverEntryPath = path.join(projectRoot, 'backend', 'src', 'server.js');

const parsedPort = Number.parseInt(process.env.PORT || '', 10);
const port = Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : DEFAULT_PORT;
const appUrl = process.env.DEV_APP_URL || `http://localhost:${port}`;
const healthUrl = new URL(HEALTH_PATH, `http://127.0.0.1:${port}`);
let browserOpened = false;

const isBrowserAutoOpenDisabled = () => {
  const value = String(process.env.NO_OPEN_BROWSER || '').trim().toLowerCase();
  return value === '1' || value === 'true' || process.env.CI === 'true';
};

const wait = (delayMs) => new Promise((resolve) => {
  setTimeout(resolve, delayMs);
});

const checkHealth = () => new Promise((resolve) => {
  const request = http.get(healthUrl, (response) => {
    response.resume();
    resolve(response.statusCode >= 200 && response.statusCode < 300);
  });

  request.setTimeout(2000, () => {
    request.destroy();
    resolve(false);
  });

  request.on('error', () => resolve(false));
});

const waitForHealthcheck = async () => {
  const deadline = Date.now() + HEALTH_TIMEOUT_MS;

  while (Date.now() < deadline) {
    if (await checkHealth()) {
      return true;
    }

    await wait(HEALTH_INTERVAL_MS);
  }

  return false;
};

const openBrowser = (url) => {
  if (process.platform === 'win32') {
    return spawn('cmd', ['/c', 'start', '', url], {
      cwd: projectRoot,
      detached: true,
      stdio: 'ignore'
    });
  }

  if (process.platform === 'darwin') {
    return spawn('open', [url], {
      cwd: projectRoot,
      detached: true,
      stdio: 'ignore'
    });
  }

  return spawn('xdg-open', [url], {
    cwd: projectRoot,
    detached: true,
    stdio: 'ignore'
  });
};

const devServerProcess = spawn(process.execPath, [nodemonCliPath, serverEntryPath], {
  cwd: projectRoot,
  stdio: 'inherit',
  env: process.env
});

const shutdownChild = (signal) => {
  if (!devServerProcess.killed) {
    devServerProcess.kill(signal);
  }
};

['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => {
    shutdownChild(signal);
  });
});

devServerProcess.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code || 0);
});

waitForHealthcheck()
  .then((isHealthy) => {
    if (!isHealthy) {
      console.error(`Nao foi possivel confirmar a aplicacao em ${appUrl} dentro do tempo esperado.`);
      return;
    }

    console.log(`Aplicacao pronta em ${appUrl}`);

    if (browserOpened || isBrowserAutoOpenDisabled()) {
      return;
    }

    browserOpened = true;
    const browserProcess = openBrowser(appUrl);
    browserProcess.unref();
  })
  .catch((error) => {
    console.error('Falha ao preparar o ambiente de desenvolvimento.', error);
    shutdownChild('SIGTERM');
    process.exit(1);
  });