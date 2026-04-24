const path = require('path');
const fs = require('fs');
const { convertWordToPdf } = require('./backend/src/services/conversionService');

process.env.LIBREOFFICE_PATH = 'C:/Program Files/LibreOffice/program/soffice.exe';

async function runTest() {
  const testDocx = path.join(process.cwd(), 'test_temp.docx');
  const outPdf = path.join(process.cwd(), 'test_temp.pdf');
  
  // Como não temos uma biblioteca para criar DOCX real aqui rapidamente, vamos tentar usar um arquivo DOCX mínimo se existir ou criar um arquivo de texto e renomear (o LibreOffice costuma aceitar se o conteúdo for compatível ou falhar graciosamente)
  // Mas para um smoke test real de "convertWordToPdf" que usa LibreOffice, o arquivo deve ser minimamente válido.
  // Vamos criar um buffer que simule o objeto "file" esperado pelo serviço
  
  // Mock do objeto file que o serviço espera (provavelmente vindo do multer)
  const file = {
    path: testDocx,
    originalname: 'test_temp.docx'
  };

  // Criar um arquivo DOCX falso (ou apenas texto) para testar se o LibreOffice é chamado
  fs.writeFileSync(testDocx, 'Teste de conversao LibreOffice');

  try {
    console.log('Iniciando conversao...');
    const result = await convertWordToPdf(file);
    console.log('Resultado da conversao:', result);
    
    if (result && result.pdfPath && fs.existsSync(result.pdfPath)) {
        const stats = fs.statSync(result.pdfPath);
        console.log('PDF gerado com sucesso! Tamanho:', stats.size);
        // Limpeza
        if(fs.existsSync(result.pdfPath)) fs.unlinkSync(result.pdfPath);
    } else {
        console.log('PDF nao foi gerado ou caminho invalido.');
    }
  } catch (err) {
    console.error('Erro durante o smoke test:', err);
  } finally {
    if(fs.existsSync(testDocx)) fs.unlinkSync(testDocx);
  }
}

runTest();
