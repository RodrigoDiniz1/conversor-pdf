const express = require('express');

const uploadController = require('../controllers/uploadController');
const {
  handlePdfUpload,
  handleMergePdfUpload,
  handleJpgUpload,
  handleWordUpload,
  handlePowerpointUpload
} = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.post('/pdf-to-jpg', handlePdfUpload, uploadController.pdfToJpg);
router.post('/jpg-to-pdf', handleJpgUpload, uploadController.jpgToPdf);
router.post('/merge-pdf', handleMergePdfUpload, uploadController.mergePdf);
router.post('/split-pdf', handlePdfUpload, uploadController.splitPdf);
router.post('/word-to-pdf', handleWordUpload, uploadController.wordToPdf);
router.post('/powerpoint-to-pdf', handlePowerpointUpload, uploadController.powerpointToPdf);

module.exports = router;