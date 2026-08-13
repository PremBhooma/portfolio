const express = require("express");
const Content = require("../models/Content");
const auth = require("../middleware/auth");

const router = express.Router();

// GET /api/content/:section — Get content by section (public)
router.get("/:section", async (req, res) => {
  try {
    const { section } = req.params;
    if (!["hero", "contact"].includes(section)) {
      return res.status(400).json({ message: "Invalid section. Must be 'hero' or 'contact'." });
    }

    const content = await Content.findOne({ section });
    if (!content) {
      return res.status(404).json({ message: `No content found for section: ${section}` });
    }

    res.json(content);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

// PUT /api/content/:section — Update section content (admin only, upsert)
router.put("/:section", auth, async (req, res) => {
  try {
    const { section } = req.params;
    if (!["hero", "contact"].includes(section)) {
      return res.status(400).json({ message: "Invalid section. Must be 'hero' or 'contact'." });
    }

    const { data } = req.body;
    if (!data) {
      return res.status(400).json({ message: "Data is required." });
    }

    const content = await Content.findOneAndUpdate(
      { section },
      { section, data },
      { upsert: true, new: true, runValidators: true }
    );

    res.json(content);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

module.exports = router;
