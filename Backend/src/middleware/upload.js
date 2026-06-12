const multer = require('multer');

/**
 * In-memory storage — keeps uploaded files as Buffer in req.file.buffer.
 * We convert to base64 to send to Gemini Vision API.
 * No files are saved to disk.
 */
const storage = multer.memoryStorage();

/**
 * File type validation — only accept images.
 */
function fileFilter(_req, file, cb) {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(`Unsupported file type: ${file.mimetype}. Allowed: JPEG, PNG, WebP, GIF`),
      false
    );
  }
}

/**
 * Multer instance configured for single image upload.
 * Max size: 10 MB.
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

module.exports = { upload };
