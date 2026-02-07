const express = require('express');
const { upload, deleteImage } = require('../config/s3');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const path = require('path');

const router = express.Router();

const runSingleUpload = (req, res) => {
  return new Promise((resolve, reject) => {
    upload.single('image')(req, res, (err) => {
      if (err) return reject(err);
      return resolve();
    });
  });
};

// POST /api/upload/image - Upload image (admin only)
router.post('/image', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    await runSingleUpload(req, res);

    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Handle different storage types
    // - S3 (multer-s3) sets `req.file.location`
    // - Local disk storage uses `req.file.filename`
    const imageUrl = req.file.location
      ? req.file.location
      : (() => {
          const forwardedProto = (req.get('x-forwarded-proto') || '').split(',')[0].trim();
          const protocol = forwardedProto || req.protocol;
          const host = req.get('x-forwarded-host') || req.get('host');
          return `${protocol}://${host}/uploads/${path.basename(req.file.filename)}`;
        })();

    res.json({
      message: 'Image uploaded successfully',
      imageUrl: imageUrl,
      key: req.file.key || req.file.filename
    });
  } catch (error) {
    const message = error?.message || 'Upload failed';

    // Common multer errors
    if (error?.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ message: 'File too large (max 5MB)' });
    }
    if (/images only/i.test(message)) {
      return res.status(400).json({ message: 'Images only (jpeg/jpg/png/gif/webp)' });
    }
    if (error?.code === 'ENOENT') {
      return res.status(500).json({ message: 'Upload storage path missing on server' });
    }

    res.status(500).json({ message: 'Error uploading image', error: message });
  }
});

// DELETE /api/upload/image - Delete image from S3 (admin only)
router.delete('/image', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { imageUrl, key } = req.body;

    const target = key || imageUrl;
    if (!target) {
      return res.status(400).json({ message: 'imageUrl or key is required' });
    }

    const deleted = await deleteImage(target);

    if (deleted) {
      res.json({ message: 'Image deleted successfully' });
    } else {
      res.status(500).json({ message: 'Error deleting image' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting image', error: error.message });
  }
});

module.exports = router;