const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create upload directories if they don't exist
const uploadDirs = [
  'public/uploads/resumes',
  'public/uploads/documents',
  'public/uploads/photos'
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * File filter for documents (PDF, DOC, DOCX)
 */
const documentFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and Word documents are allowed'), false);
  }
};

/**
 * File filter for images
 */
const imageFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and GIF images are allowed'), false);
  }
};

/**
 * Storage configuration for resumes
 */
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/resumes');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `resume-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

/**
 * Storage configuration for documents
 */
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/documents');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `document-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

/**
 * Storage configuration for photos
 */
const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/photos');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `photo-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

/**
 * Multer upload configurations
 */
const uploadResume = multer({
  storage: resumeStorage,
  fileFilter: documentFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

const uploadDocument = multer({
  storage: documentStorage,
  fileFilter: documentFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

const uploadPhoto = multer({
  storage: photoStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});

/**
 * Multiple file upload for documents
 */
const uploadMultipleDocuments = multer({
  storage: documentStorage,
  fileFilter: documentFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

/**
 * Delete file utility
 */
const deleteFile = (filePath) => {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    return true;
  }
  return false;
};

/**
 * Get file info
 */
const getFileInfo = (filePath) => {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    return {
      size: stats.size,
      sizeInMB: (stats.size / (1024 * 1024)).toFixed(2),
      created: stats.birthtime,
      modified: stats.mtime
    };
  }
  return null;
};

/**
 * Validate file upload
 */
const validateFileUpload = (file) => {
  if (!file) {
    return { valid: false, message: 'No file provided' };
  }

  if (file.size === 0) {
    return { valid: false, message: 'File is empty' };
  }

  return { valid: true, message: 'File is valid' };
};

module.exports = {
  uploadResume,
  uploadDocument,
  uploadPhoto,
  uploadMultipleDocuments,
  deleteFile,
  getFileInfo,
  validateFileUpload,
  documentFilter,
  imageFilter
};
