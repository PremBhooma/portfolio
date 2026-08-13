const express = require("express");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const auth = require("../middleware/auth");

const router = express.Router();

// POST /api/auth/seed — Create initial admin (only works if no admin exists)
router.post("/seed", async (req, res) => {
  try {
    const existingAdmin = await Admin.findOne();
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists. Seed is disabled." });
    }

    const admin = new Admin({
      email: "admin@astrodev.com",
      password: "admin123",
    });

    await admin.save();
    res.status(201).json({ message: "Admin created successfully.", email: admin.email });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

// POST /api/auth/login — Admin login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      message: "Login successful.",
      token,
      admin: {
        id: admin._id,
        email: admin.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

// GET /api/auth/me — Validate token & return admin profile
router.get("/me", auth, async (req, res) => {
  try {
    res.json({ admin: req.admin });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

module.exports = router;
