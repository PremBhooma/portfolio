const express = require("express");
const SocialLink = require("../models/SocialLink");
const auth = require("../middleware/auth");

const router = express.Router();

// GET /api/social — List all active social links (public)
router.get("/", async (req, res) => {
  try {
    const links = await SocialLink.find({ isActive: true }).sort({ order: 1 });
    res.json(links);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

// GET /api/social/all — List all social links (admin)
router.get("/all", auth, async (req, res) => {
  try {
    const links = await SocialLink.find().sort({ order: 1 });
    res.json(links);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

// POST /api/social — Add a social link (admin only)
router.post("/", auth, async (req, res) => {
  try {
    const { name, href, svgPath, order, isActive } = req.body;

    const link = new SocialLink({
      name,
      href,
      svgPath,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
    });

    await link.save();
    res.status(201).json(link);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

// PUT /api/social/:id — Update a social link (admin only)
router.put("/:id", auth, async (req, res) => {
  try {
    const link = await SocialLink.findById(req.params.id);
    if (!link) {
      return res.status(404).json({ message: "Social link not found." });
    }

    const { name, href, svgPath, order, isActive } = req.body;

    if (name !== undefined) link.name = name;
    if (href !== undefined) link.href = href;
    if (svgPath !== undefined) link.svgPath = svgPath;
    if (order !== undefined) link.order = order;
    if (isActive !== undefined) link.isActive = isActive;

    await link.save();
    res.json(link);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

// DELETE /api/social/:id — Delete a social link (admin only)
router.delete("/:id", auth, async (req, res) => {
  try {
    const link = await SocialLink.findById(req.params.id);
    if (!link) {
      return res.status(404).json({ message: "Social link not found." });
    }

    await SocialLink.findByIdAndDelete(req.params.id);
    res.json({ message: "Social link deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

module.exports = router;
