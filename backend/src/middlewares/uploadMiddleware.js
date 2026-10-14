const multer = require('multer');
const path = require('path');

const { ensureDirectory, createJobId } = require('../utils/fileUtils');

const uploadDir = path.join(__dirname, '..', '..', 'tmp', 'uploads');
const maxFileSizeMb = 20 * 1024;
const maxFileSize = maxFileSizeMb * 1024 * 1024;
const maxFileSizeLabel = '20GB';
const imageExtensions = new Set(['.jpg', '.jpeg', '.jfif', '.png', '.webp']);
const imageMimeTypes = new Set(['image/jpeg', 'image/jpg', 'image/pjpeg', 'image/jfif', 'image/png', 'image/x-png', 'image/webp']);
const jpgExtensions = new Set(['.jpg', '.jpeg', '.jfif']);
const jpgMimeTypes = new Set(['image/jpeg', 'image/jpg', 'image/pjpeg', 'image/jfif']);
const pngExtensions = new Set(['.png']);
const pngMimeTypes = new Set(['image/png', 'image/x-png']);
const wordExtensions = new Set(['.doc', '.docx']);
const wordMimeTypes = new Set([
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]);
const powerpointExtensions = new Set(['.ppt', '.pptx']);
const powerpointMimeTypes = new Set([
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation'
]);

ensureDirectory(uploadDir);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${createJobId()}${extension}`);
  }
});

const createUploader = (fileFilter) => multer({
  storage,
  limits: { fileSize: maxFileSize },
  fileFilter
});

const getFileExtension = (file) => path.extname(file.originalname).toLowerCase();

const fileRules = {
  pdf: {
    errorMessage: 'Envie um arquivo PDF válido.',
    isValid: (file) => file.mimetype === 'application/pdf' || getFileExtension(file) === '.pdf'
  },
  image: {
    errorMessage: 'Envie uma imagem JPG, PNG ou WebP válida.',
    isValid: (file) => imageExtensions.has(getFileExtension(file)) || imageMimeTypes.has(file.mimetype)
  },
  jpg: {
    errorMessage: 'Envie apenas imagens JPG ou JPEG válidas.',
    isValid: (file) => jpgExtensions.has(getFileExtension(file)) || jpgMimeTypes.has(file.mimetype)
  },
  png: {
    errorMessage: 'Envie apenas imagens PNG validas.',
    isValid: (file) => pngExtensions.has(getFileExtension(file)) || pngMimeTypes.has(file.mimetype)
  },
  word: {
    errorMessage: 'Envie um arquivo DOC ou DOCX válido.',
    isValid: (file) => wordExtensions.has(getFileExtension(file)) || wordMimeTypes.has(file.mimetype)
  },
  powerpoint: {
    errorMessage: 'Envie um arquivo PPT ou PPTX válido.',
    isValid: (file) => (
      powerpointExtensions.has(getFileExtension(file)) || powerpointMimeTypes.has(file.mimetype)
    )
  }
};

const createFileFilter = ({ errorMessage, isValid }) => (_req, file, cb) => {
  if (!isValid(file)) {
    cb(new Error(errorMessage));
    return;
  }

  cb(null, true);
};

const toUploadError = (error) => {
  if (!error) {
    return null;
  }

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return { statusCode: 400, message: `O limite máximo por arquivo é de ${maxFileSizeLabel}.` };
    }

    return { statusCode: 400, message: error.message };
  }

  return { statusCode: 400, message: error.message };
};

const createUploadHandler = ({ fieldName, maxCount = 1, multiple = false, rule }) => {
  const uploader = createUploader(createFileFilter(rule));
  const middleware = multiple ? uploader.array(fieldName, maxCount) : uploader.single(fieldName);

  return (req, res, next) => {
    middleware(req, res, (error) => {
      const uploadError = toUploadError(error);

      if (uploadError) {
        next(uploadError);
        return;
      }

      next();
    });
  };
};

module.exports = {
  handlePdfUpload: createUploadHandler({
    fieldName: 'file',
    rule: fileRules.pdf
  }),
  handleImageUpload: createUploadHandler({
    fieldName: 'file',
    rule: fileRules.image
  }),
  handleMergePdfUpload: createUploadHandler({
    fieldName: 'files',
    maxCount: 20,
    multiple: true,
    rule: fileRules.pdf
  }),
  handleJpgUpload: createUploadHandler({
    fieldName: 'files',
    maxCount: 20,
    multiple: true,
    rule: fileRules.jpg
  }),
  handlePngUpload: createUploadHandler({
    fieldName: 'files',
    maxCount: 20,
    multiple: true,
    rule: fileRules.png
  }),
  handleWordUpload: createUploadHandler({
    fieldName: 'file',
    rule: fileRules.word
  }),
  handlePowerpointUpload: createUploadHandler({
    fieldName: 'file',
    rule: fileRules.powerpoint
  })
};
