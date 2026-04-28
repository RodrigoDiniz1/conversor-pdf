(() => {
  if (window.ToolValidation) {
    return;
  }

  const isPdfFile = (file) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

  const isJpgFile = (file) => ['image/jpeg', 'image/jpg'].includes(file.type) || /\.jpe?g$/i.test(file.name);

  const isImageFile = (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)
    || /\.(jpe?g|png|webp)$/i.test(file.name);

  const isWordFile = (file) => (
    ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)
    || /\.docx?$/i.test(file.name)
  );

  const isPowerpointFile = (file) => (
    ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'].includes(file.type)
    || /\.pptx?$/i.test(file.name)
  );

  const toolFileValidators = Object.freeze({
    'pdf-to-jpg': (files, { pdfFiles, jpgFiles }) => {
      if (pdfFiles.length === 1 && pdfFiles.length === files.length) {
        return [pdfFiles[0]];
      }

      if (pdfFiles.length > 1) {
        throw new Error('Para converter PDF em JPG, envie apenas um PDF por vez.');
      }

      if (jpgFiles.length > 0) {
        throw new Error('Esta tela é de PDF para JPG. Escolha JPG para PDF se quiser enviar imagens.');
      }

      throw new Error('Selecione um arquivo PDF válido.');
    },
    'jpg-to-pdf': (files, { pdfFiles, jpgFiles }) => {
      if (jpgFiles.length === files.length && jpgFiles.length > 0) {
        return files;
      }

      if (pdfFiles.length > 0) {
        throw new Error('Esta tela é de JPG para PDF. Escolha PDF para JPG se quiser enviar um PDF.');
      }

      throw new Error('Selecione apenas imagens JPG/JPEG válidas.');
    },
    'remove-background': (files, { pdfFiles, imageFiles }) => {
      if (imageFiles.length === 1 && imageFiles.length === files.length) {
        return [imageFiles[0]];
      }

      if (pdfFiles.length > 0) {
        throw new Error('Esta tela é de Remover Background. Envie uma imagem JPG, PNG ou WebP, não um PDF.');
      }

      if (files.length > 1) {
        throw new Error('Para remover o background, envie apenas uma imagem por vez.');
      }

      throw new Error('Selecione uma imagem JPG, PNG ou WebP válida.');
    },
    'merge-pdf': (files, { pdfFiles, jpgFiles }) => {
      if (pdfFiles.length === files.length && pdfFiles.length >= 2) {
        return files;
      }

      if (jpgFiles.length > 0) {
        throw new Error('Esta tela é de Juntar PDF. Envie apenas arquivos PDF para montar o documento final.');
      }

      if (pdfFiles.length === 1) {
        throw new Error('Envie ao menos dois arquivos PDF para juntar.');
      }

      throw new Error('Selecione apenas arquivos PDF válidos.');
    },
    'split-pdf': (files, { pdfFiles, jpgFiles }) => {
      if (pdfFiles.length === 1 && pdfFiles.length === files.length) {
        return [pdfFiles[0]];
      }

      if (pdfFiles.length > 1) {
        throw new Error('Para dividir PDF, envie apenas um PDF por vez.');
      }

      if (jpgFiles.length > 0) {
        throw new Error('Esta tela é de Dividir PDF. Envie apenas um arquivo PDF válido.');
      }

      throw new Error('Selecione um arquivo PDF válido.');
    },
    'word-to-pdf': (files, { wordFiles }) => {
      if (wordFiles.length === 1 && wordFiles.length === files.length) {
        return [wordFiles[0]];
      }

      if (files.length > 1) {
        throw new Error('Para converter Word em PDF, envie apenas um arquivo DOC ou DOCX por vez.');
      }

      throw new Error('Selecione um arquivo DOC ou DOCX válido.');
    },
    'powerpoint-to-pdf': (files, { powerpointFiles }) => {
      if (powerpointFiles.length === 1 && powerpointFiles.length === files.length) {
        return [powerpointFiles[0]];
      }

      if (files.length > 1) {
        throw new Error('Para converter PowerPoint em PDF, envie apenas um arquivo PPT ou PPTX por vez.');
      }

      throw new Error('Selecione um arquivo PPT ou PPTX válido.');
    }
  });

  const getValidatedFilesForTool = (tool, files) => {
    const pdfFiles = files.filter(isPdfFile);
    const jpgFiles = files.filter(isJpgFile);
    const imageFiles = files.filter(isImageFile);
    const wordFiles = files.filter(isWordFile);
    const powerpointFiles = files.filter(isPowerpointFile);

    if (!tool?.available) {
      throw new Error(tool?.lockedMessage || 'Esta ferramenta ainda não está disponível.');
    }

    const validateFiles = toolFileValidators[tool.id];

    if (!validateFiles) {
      throw new Error(tool.lockedMessage || 'Esta ferramenta ainda não está disponível.');
    }

    return validateFiles(files, {
      pdfFiles,
      jpgFiles,
      imageFiles,
      wordFiles,
      powerpointFiles
    });
  };

  window.ToolValidation = Object.freeze({
    getValidatedFilesForTool,
    predicates: Object.freeze({
      isImageFile,
      isJpgFile,
      isPdfFile,
      isPowerpointFile,
      isWordFile
    }),
    toolFileValidators
  });
})();