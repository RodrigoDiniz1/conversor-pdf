const { convertPowerpointToPdf } = require('./backend/src/services/conversionService');
const fs = require('fs');
const path = require('path');

async function test() {
  const filePath = 'backend/tmp/generated-smoke.pptx';
  const originalname = 'generated-smoke.pptx';
  
  process.env.LIBREOFFICE_PATH = "C:/Program Files/LibreOffice/program/soffice.exe";
  
  console.log('Starting conversion...');
  try {
    const result = await convertPowerpointToPdf({ path: filePath, originalname });
    console.log('Conversion result:', result);
    
    // The result is an object based on previous output
    const pdfPath = result.pdfPath;
    
    if (fs.existsSync(pdfPath)) {
      const buffer = fs.readFileSync(pdfPath);
      const header = buffer.slice(0, 5).toString();
      console.log('File header:', header);
      if (header === '%PDF-') {
        console.log('Verification: File starts with %PDF-');
      } else {
        console.log('Verification: File DOES NOT start with %PDF-');
      }
      
      if (result.warningMessage === '') {
        console.log('Warning: Empty');
      } else {
        console.log('Warning:', result.warningMessage);
      }
      
      // Cleanup
      fs.unlinkSync(pdfPath);
      console.log('Cleaned up generated PDF.');
    } else {
      console.error('Generated PDF not found at', pdfPath);
    }
  } catch (err) {
    console.error('Error during conversion:', err);
  }
}

test();
