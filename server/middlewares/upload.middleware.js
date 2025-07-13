import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure required directories exist
const createRequiredDirs = () => {
  const dirs = ['./uploads', './temp'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createRequiredDirs();

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // Sanitize filename
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${Date.now()}-${sanitizedName}`);
  }
});

// Supported file extensions
const supportedExtensions = [
  '.js', '.ts', '.jsx', '.tsx',
  '.py', '.java', '.cpp', '.c',
  '.cs', '.php', '.html', '.css',
  '.go', '.rb'
];

// File filter for code files
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (!supportedExtensions.includes(ext)) {
    return cb(new Error(`Unsupported file type: ${ext}. Supported types: ${supportedExtensions.join(', ')}`), false);
  }

  // Check file size (5MB) - additional check to multer limits
  if (file.size > 5 * 1024 * 1024) {
    return cb(new Error('File too large. Maximum size is 5MB'), false);
  }

  cb(null, true);
};

// ZIP file filter
const zipFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (ext !== '.zip') {
    return cb(new Error('Only ZIP files are allowed'), false);
  }


  // Check ZIP file size (20MB)
  if (file.size > 20 * 1024 * 1024) {
    return cb(new Error('ZIP file too large. Maximum size is 20MB'), false);
  }

  cb(null, true);
};

// Configure multer for code files
const uploadFiles = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 10 // Max 10 files at once
  }
});

// Configure multer for ZIP files
const uploadZip = multer({
  storage: storage,
  fileFilter: zipFileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
    files: 1 // Only one ZIP at a time
  }
});

// Error handler middleware
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB for code files and 50MB for ZIP files'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum is 10 files at once'
      });
    }
  }
  next(err);
};

export { uploadFiles, uploadZip, handleUploadError, supportedExtensions };
