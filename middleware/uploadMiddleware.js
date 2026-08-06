/*
MIT License

Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
Mindoro State University - Philippines

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import multer from "multer";
import path from "path";
import fs from "fs";

// Create upload directories if they don't exist
const uploadDirs = ["uploads/profiles", "uploads/documents", "uploads/resumes"];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = "uploads/documents";

    if (file.fieldname === "profilePicture") {
      uploadPath = "uploads/profiles";
    } else if (file.fieldname === "resume" || file.fieldname === "document") {
      uploadPath = "uploads/documents";
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for different upload types
const fileFilter = (req, file, cb) => {
  // Common allowed MIME types for documents and resumes
  const allowedMimes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document.macroEnabled.12",
    "application/vnd.ms-word.document.macroEnabled.12",
    "application/x-msword",
    "text/plain",
    "text/rtf",
    "application/rtf",
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/jpg",
    "application/octet-stream"  // Fallback for unknown types
  ];

  // For profile pictures, only allow images
  if (file.fieldname === "profilePicture") {
    const imageMimes = ["image/jpeg", "image/png", "image/gif", "image/jpg"];
    if (imageMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type for profile picture. Allowed: JPG, PNG, GIF`));
    }
  } else {
    // For all other fields (resume, document, doc_*, etc.), allow common document types
    // VERY lenient: Check MIME type first, then file extension as fallback
    const hasValidMime = allowedMimes.includes(file.mimetype);
    const hasValidExtension = file.originalname && 
      file.originalname.match(/\.(pdf|doc|docx|txt|rtf|jpg|jpeg|png|gif|xls|xlsx|ppt|pptx)$/i);
    
    if (hasValidMime || hasValidExtension) {
      cb(null, true);
    } else {
      console.warn(`File rejected: ${file.fieldname}, MIME: ${file.mimetype}, Name: ${file.originalname}`);
      cb(null, true);  // Allow all files for document uploads - better UX than rejecting
    }
  }
};

// Create upload instances for different file types
export const uploadProfilePicture = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}).single("profilePicture");

export const uploadDocument = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB
}).single("document");

export const uploadResume = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
}).single("resume");

export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
}).array("files", 5); // Max 5 files

// Accept any file fields (useful when field names vary per-job)
export const uploadAny = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
}).any();

// Error handling middleware for multer
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "FILE_TOO_LARGE") {
      return res.status(400).json({ success: false, message: "File too large" });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({ success: false, message: "Too many files" });
    }
  }
  if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
};

// Validate file upload
export const validateFileUpload = (req, res, next) => {
  if (!req.file && !req.files) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }
  next();
};

// Clean up uploaded file on error
export const cleanupOnError = (err, req, res, next) => {
  if (err && req.file) {
    fs.unlink(req.file.path, (unlinkErr) => {
      if (unlinkErr) console.error("Error deleting file:", unlinkErr);
    });
  }
  next(err);
};

export default {
  uploadProfilePicture,
  uploadDocument,
  uploadResume,
  uploadMultiple,
  handleUploadError,
  validateFileUpload,
  cleanupOnError
};
