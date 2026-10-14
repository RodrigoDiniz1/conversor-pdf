const path = require('path');

const { loadEnvFile } = require('./utils/envFile');

loadEnvFile();

const app = require('./app');
const { pruneTemporaryArtifacts } = require('./utils/fileUtils');

const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || 3000;
const REQUEST_TIMEOUT_MS = 2 * 60 * 60 * 1000;
const tempRoot = path.join(__dirname, '..', 'tmp');

const logStartupCleanup = (summary) => {
  if (!summary || summary.totalRemoved === 0) {
    return;
  }

  console.log(`Limpeza inicial concluida. ${summary.totalRemoved} artefato(s) temporario(s) antigo(s) removido(s).`);
};

const logStartupCleanupError = (error) => {
  console.error('Falha ao limpar artefatos temporarios na inicializacao.', error);
};

const server = app.listen(PORT, HOST, () => {
  console.log(`Servidor rodando em http://${HOST}:${PORT}`);

  void pruneTemporaryArtifacts({ rootPath: tempRoot })
    .then(logStartupCleanup)
    .catch(logStartupCleanupError);
});

server.requestTimeout = REQUEST_TIMEOUT_MS;

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`A porta ${PORT} ja esta em uso. Se a aplicacao ja estiver aberta, acesse http://localhost:${PORT}.`);
    process.exit(1);
    return;
  }

  console.error('Falha ao iniciar o servidor.', error);
  process.exit(1);
});
