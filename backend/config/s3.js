const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const { getStorageDriver, buildObjectKey, deleteObject, createS3Client } = require('./mediaStorage');

// Check file type
const checkFileType = (file, cb) => {
  const filetypes = /jpeg|jpg|png|gif|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Images only!'));
  }
};

const driver = getStorageDriver();

let upload;
let deleteImage;

if (driver === 'local') {
  // Use local storage for development
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    },
  });

  upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
      checkFileType(file, cb);
    },
  });

  deleteImage = async () => true;
} else {
  // Production S3 configuration
  const s3Client = createS3Client();

  const sanitizeFolderField = (raw) => {
    if (!raw) return '';
    if (typeof raw !== 'string') return '';
    return raw;
  };

  upload = multer({
    storage: multerS3({
      s3: s3Client,
      bucket: process.env.S3_BUCKET_NAME,
      metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
      },
      key: (req, file, cb) => {
        const folder = sanitizeFolderField(req.body?.folder);
        const desiredBaseName = sanitizeFolderField(
          req.body?.baseName || req.body?.desiredBaseName || req.body?.filenameBase
        );
        cb(null, buildObjectKey({ folder, originalName: file.originalname, desiredBaseName }));
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
      checkFileType(file, cb);
    },
  });

  // Delete image from S3
  deleteImage = async (imageUrl) => {
    try {
      return await deleteObject(imageUrl);
    } catch (error) {
      console.error('Error deleting image from S3:', error);
      return false;
    }
  };
}

module.exports = { upload, deleteImage };