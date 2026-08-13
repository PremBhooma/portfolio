const express = require("express");
const Resume = require("../models/Resume");
const auth = require("../middleware/auth");
const { uploadResume, deleteFile } = require("../middleware/upload");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// GET /api/resume — Get current resume info (public)
router.get("/", async (req, res) => {
  try {
    const resume = await Resume.findOne().sort({ uploadedAt: -1 });
    if (!resume) {
      return res.status(404).json({ message: "No resume uploaded." });
    }
    res.json(resume);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

// GET /api/resume/download — Download resume file (public)
router.get("/download", async (req, res) => {
  try {
    const resume = await Resume.findOne().sort({ uploadedAt: -1 });
    if (!resume) {
      return res.status(404).json({ message: "No resume uploaded." });
    }

    const filePath = path.join(__dirname, "..", resume.filePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Resume file not found on disk." });
    }

    res.download(filePath, resume.originalName);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

// POST /api/resume — Upload new resume (admin only, deletes old)
router.post("/", auth, uploadResume.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    // Delete existing resume(s)
    const existingResumes = await Resume.find();
    for (const existing of existingResumes) {
      deleteFile(existing.filePath);
    }
    await Resume.deleteMany();

    // Save new resume record
    const resume = new Resume({
      fileName: req.file.filename,
      filePath: `uploads/resume/${req.file.filename}`,
      originalName: req.file.originalname,
      uploadedAt: new Date(),
    });

    await resume.save();
    res.status(201).json(resume);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

// DELETE /api/resume — Delete current resume (admin only)
router.delete("/", auth, async (req, res) => {
  try {
    const resume = await Resume.findOne();
    if (!resume) {
      return res.status(404).json({ message: "No resume to delete." });
    }

    deleteFile(resume.filePath);
    await Resume.deleteMany();

    res.json({ message: "Resume deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

module.exports = router;
