const express = require('express');
const { upload, deleteImage } = require('../config/s3');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const path = require('path');

const router = express.Router();

// POST /api/upload/image - Upload image to S3 (admin only)
router.post('/image', [authenticateToken, requireAdmin, upload.single('image')], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Handle different storage types
    // - S3 (multer-s3) sets `req.file.location`
    // - Local disk storage uses `req.file.filename`
    const imageUrl = req.file.location
      ? req.file.location
      : `${req.protocol}://${req.get('host')}/uploads/${path.basename(req.file.filename)}`;

    res.json({
      message: 'Image uploaded successfully',
      imageUrl: imageUrl,
      key: req.file.key || req.file.filename
    });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading image', error: error.message });
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