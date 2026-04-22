const express = require('express');

const uploadController = require('../controllers/uploadController');
const {
  handlePdfUpload,
  handleMergePdfUpload,
  handleJpgUpload
} = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.post('/pdf-to-jpg', handlePdfUpload, uploadController.pdfToJpg);
router.post('/jpg-to-pdf', handleJpgUpload, uploadController.jpgToPdf);
router.post('/merge-pdf', handleMergePdfUpload, uploadController.mergePdf);

module.exports = router;