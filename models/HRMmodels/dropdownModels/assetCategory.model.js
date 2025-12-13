const mongoose = require("mongoose");

const assetCategorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: [true, "Asset category name is required"],
      trim: true,
      minlength: [2, "Category name must be at least 2 characters"],
      maxlength: [100, "Category name cannot exceed 100 characters"],
      unique: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

// Index
assetCategorySchema.index({ categoryName: 1 });

const AssetCategory = mongoose.model("AssetCategory", assetCategorySchema);

module.exports = AssetCategory;
