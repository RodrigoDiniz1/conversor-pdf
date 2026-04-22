const path = require('path');

const app = require('./app');
const { pruneTemporaryArtifacts } = require('./utils/fileUtils');

const PORT = process.env.PORT || 3000;
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

const server = app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);

  void pruneTemporaryArtifacts({ rootPath: tempRoot })
    .then(logStartupCleanup)
    .catch(logStartupCleanupError);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`A porta ${PORT} ja esta em uso. Se a aplicacao ja estiver aberta, acesse http://localhost:${PORT}.`);
    process.exit(1);
    return;
  }

  console.error('Falha ao iniciar o servidor.', error);
  process.exit(1);
});