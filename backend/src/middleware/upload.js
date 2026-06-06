import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import ApiError from '../utils/ApiError.js';

// ES-module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Resolved upload path: backend/uploads/events/
// Created eagerly so the server never fails on first upload due to a missing directory.
const UPLOAD_DIR = path.join(__dirname, '../../uploads/events');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  /**
   * Generate a collision-safe filename:  <timestamp>-<random><ext>
   * The original filename is intentionally discarded — user-supplied names
   * can contain path-traversal characters or be longer than the OS limit.
   */
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, '');
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const ALLOWED_MIMETYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIMETYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
  }
};

const multerUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter,
}).single('cover_image');

/**
 * Express middleware that handles a single optional `cover_image` file upload.
 *
 * Wraps multer so every error — MulterError (size/field limits) and custom
 * fileFilter errors — is converted into an ApiError instance before being
 * forwarded to the central error handler.  This guarantees consistent 4xx
 * responses rather than unhandled 500s.
 *
 * No file is fine: `req.file` will simply be undefined and `req.body` is
 * still populated with all text fields.
 */
export const uploadEventCover = (req, res, next) => {
  multerUpload(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(ApiError.badRequest('Cover image must be 5 MB or smaller'));
    }
    return next(ApiError.badRequest(err.message ?? 'Invalid file upload'));
  });
};
