const mongoose = require("mongoose");

const socialLinkSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Social link name is required"],
      trim: true,
    },
    href: {
      type: String,
      required: [true, "Social link URL is required"],
      trim: true,
    },
    svgPath: {
      type: String,
      required: [true, "SVG path data is required"],
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

socialLinkSchema.index({ order: 1 });

module.exports = mongoose.model("SocialLink", socialLinkSchema);
