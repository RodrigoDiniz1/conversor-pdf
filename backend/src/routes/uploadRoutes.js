const express = require('express');

const uploadController = require('../controllers/uploadController');
const {
  handlePdfUpload,
  handleImageUpload,
  handleMergePdfUpload,
  handleJpgUpload,
  handlePngUpload,
  handleWordUpload,
  handlePowerpointUpload
} = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.post('/pdf-to-jpg', handlePdfUpload, uploadController.pdfToJpg);
router.post('/pdf-to-png', handlePdfUpload, uploadController.pdfToPng);
router.post('/jpg-to-pdf', handleJpgUpload, uploadController.jpgToPdf);
router.post('/png-to-pdf', handlePngUpload, uploadController.pngToPdf);
router.post('/remove-background', handleImageUpload, uploadController.removeBackground);
router.post('/merge-pdf', handleMergePdfUpload, uploadController.mergePdf);
router.post('/split-pdf', handlePdfUpload, uploadController.splitPdf);
router.post('/word-to-pdf', handleWordUpload, uploadController.wordToPdf);
router.post('/powerpoint-to-pdf', handlePowerpointUpload, uploadController.powerpointToPdf);

module.exports = router;
