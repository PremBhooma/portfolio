const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure directory exists
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Project image upload config
const projectStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // For new projects, use a temp dir; for updates, use the project ID
    const projectId = req.params.id || "temp";
    const uploadPath = path.join(__dirname, "..", "uploads", "projects", projectId);
    ensureDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `image-${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});

// Resume upload config
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "..", "uploads", "resume");
    ensureDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `resume-${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});

// File filter for images
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error("Only image files (jpeg, jpg, png, gif, webp, svg) are allowed."));
};

// File filter for resume (PDF, DOC, DOCX)
const resumeFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (extname) {
    return cb(null, true);
  }
  cb(new Error("Only PDF, DOC, and DOCX files are allowed for resumes."));
};

const uploadProjectImage = multer({
  storage: projectStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const uploadResume = multer({
  storage: resumeStorage,
  fileFilter: resumeFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Helper: delete a file from disk
const deleteFile = (filePath) => {
  const fullPath = path.join(__dirname, "..", filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

// Helper: delete a directory recursively
const deleteDir = (dirPath) => {
  const fullPath = path.join(__dirname, "..", dirPath);
  if (fs.existsSync(fullPath)) {
    fs.rmSync(fullPath, { recursive: true, force: true });
  }
};

// Helper: move temp uploaded files to the correct project directory
const moveProjectFiles = (tempDir, projectId) => {
  const sourcePath = path.join(__dirname, "..", "uploads", "projects", "temp");
  const destPath = path.join(__dirname, "..", "uploads", "projects", projectId);

  if (!fs.existsSync(sourcePath)) return null;

  ensureDir(destPath);

  const files = fs.readdirSync(sourcePath);
  let movedFilePath = null;

  for (const file of files) {
    const srcFile = path.join(sourcePath, file);
    const destFile = path.join(destPath, file);
    fs.renameSync(srcFile, destFile);
    movedFilePath = `uploads/projects/${projectId}/${file}`;
  }

  // Clean up temp directory
  if (fs.existsSync(sourcePath)) {
    fs.rmSync(sourcePath, { recursive: true, force: true });
  }

  return movedFilePath;
};

module.exports = {
  uploadProjectImage,
  uploadResume,
  deleteFile,
  deleteDir,
  moveProjectFiles,
  ensureDir,
};
