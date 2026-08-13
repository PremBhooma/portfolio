const mongoose = require("mongoose");

const featureSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  { _id: false }
);

const techStackSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    items: { type: String, required: true },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Project description is required"],
    },
    badges: {
      type: [String],
      default: [],
    },
    image: {
      type: String,
      default: "",
    },
    link: {
      type: String,
      default: "",
    },
    features: {
      type: [featureSchema],
      default: [],
    },
    techStack: {
      type: [techStackSchema],
      default: [],
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Sort by order ascending by default
projectSchema.index({ order: 1 });

module.exports = mongoose.model("Project", projectSchema);
