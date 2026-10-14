const os = require('os');

// Limite de upload configurado em uploadMiddleware.
const MAX_UPLOAD_BYTES = 20 * 1024 * 1024 * 1024;

// Medido em teste real: juntar PDFs consome cerca de 1,9x o tamanho total de entrada
// como pico de memoria residente (2,81 GiB de entrada -> 5,23 GiB de pico).
const MERGE_MEMORY_FACTOR = 1.9;

// Fatia da memoria total que a juncao pode ocupar, deixando margem para o
// sistema operacional e para os outros processos da maquina.
const MERGE_MEMORY_BUDGET_RATIO = 0.5;

/**
 * Teto de tamanho total para juntar PDFs nesta maquina.
 *
 * A juncao carrega os arquivos em memoria, entao o limite real e de RAM e nao
 * o limite de upload: o teto e o menor valor entre o limite de upload e o que
 * a memoria da maquina suporta com margem de seguranca.
 */
const getMergeMaxBytes = () => {
  const memoryBudgetBytes = os.totalmem() * MERGE_MEMORY_BUDGET_RATIO;
  const memoryBoundBytes = Math.floor(memoryBudgetBytes / MERGE_MEMORY_FACTOR);

  return Math.max(0, Math.min(MAX_UPLOAD_BYTES, memoryBoundBytes));
};

module.exports = {
  MAX_UPLOAD_BYTES,
  getMergeMaxBytes
};
