const express = require("express");
const Project = require("../models/Project");
const auth = require("../middleware/auth");
const { uploadProjectImage, deleteFile, deleteDir, moveProjectFiles } = require("../middleware/upload");

const router = express.Router();

// GET /api/projects — List all active projects (public)
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find({ isActive: true }).sort({ order: 1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

// GET /api/projects/all — List all projects including inactive (admin)
router.get("/all", auth, async (req, res) => {
  try {
    const projects = await Project.find().sort({ order: 1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

// GET /api/projects/:id — Get single project
router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

// POST /api/projects — Create a new project (admin only)
router.post("/", auth, uploadProjectImage.single("image"), async (req, res) => {
  try {
    const { title, description, badges, link, features, techStack, order, isActive } = req.body;

    // Parse JSON strings from form data
    const parsedBadges = badges ? JSON.parse(badges) : [];
    const parsedFeatures = features ? JSON.parse(features) : [];
    const parsedTechStack = techStack ? JSON.parse(techStack) : [];

    const project = new Project({
      title,
      description,
      badges: parsedBadges,
      link,
      features: parsedFeatures,
      techStack: parsedTechStack,
      order: order || 0,
      isActive: isActive !== undefined ? isActive === "true" || isActive === true : true,
    });

    // Save first to get the ID
    await project.save();

    // Move image from temp to project folder
    if (req.file) {
      const imagePath = moveProjectFiles("temp", project._id.toString());
      if (imagePath) {
        project.image = imagePath;
        await project.save();
      }
    }

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

// PUT /api/projects/:id — Update a project (admin only)
router.put("/:id", auth, uploadProjectImage.single("image"), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    const { title, description, badges, link, features, techStack, order, isActive } = req.body;

    // Update fields
    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;
    if (badges !== undefined) project.badges = JSON.parse(badges);
    if (link !== undefined) project.link = link;
    if (features !== undefined) project.features = JSON.parse(features);
    if (techStack !== undefined) project.techStack = JSON.parse(techStack);
    if (order !== undefined) project.order = order;
    if (isActive !== undefined) project.isActive = isActive === "true" || isActive === true;

    // Handle image replacement
    if (req.file) {
      // Delete old image if it exists
      if (project.image) {
        deleteFile(project.image);
      }

      // New image is already in the right directory (multer uses params.id)
      project.image = `uploads/projects/${project._id}/${req.file.filename}`;
    }

    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

// PUT /api/projects/reorder — Reorder projects (admin only)
router.put("/reorder/batch", auth, async (req, res) => {
  try {
    const { orders } = req.body; // [{ id: "...", order: 0 }, ...]

    if (!Array.isArray(orders)) {
      return res.status(400).json({ message: "Orders must be an array." });
    }

    const updatePromises = orders.map(({ id, order }) =>
      Project.findByIdAndUpdate(id, { order })
    );

    await Promise.all(updatePromises);
    res.json({ message: "Projects reordered successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

// DELETE /api/projects/:id — Delete a project (admin only)
router.delete("/:id", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    // Delete project upload directory
    deleteDir(`uploads/projects/${project._id}`);

    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: "Project deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

module.exports = router;
