const AssetCategory = require("../../../models/HRMmodels/dropdownModels/assetCategory.model");

//  Create Asset Category

exports.createAssetCategory = async (req, res) => {
  try {
    const { categoryName, description } = req.body;

    const exists = await AssetCategory.findOne({ categoryName });
    if (exists) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = await AssetCategory.create({
      categoryName,
      description,
    });

    res.status(201).json({
      message: "Asset category created successfully",
      category,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//
// ✅ Get All Asset Categories
//
exports.getAllAssetCategories = async (req, res) => {
  try {
    const categories = await AssetCategory.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//
// ✅ Get Asset Category By ID
//
exports.getAssetCategoryById = async (req, res) => {
  try {
    const category = await AssetCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Asset category not found" });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//
// ✅ Update Asset Category
//
exports.updateAssetCategory = async (req, res) => {
  try {
    const { categoryName, description, isActive } = req.body;

    const category = await AssetCategory.findByIdAndUpdate(
      req.params.id,
      { categoryName, description, isActive },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ message: "Asset category not found" });
    }

    res.json({
      message: "Asset category updated successfully",
      category,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//
// ✅ Delete Asset Category (Soft Delete)
//
exports.deleteAssetCategory = async (req, res) => {
  try {
    const category = await AssetCategory.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ message: "Asset category not found" });
    }

    res.json({
      message: "Asset category deactivated successfully",
      category,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//
// ✅ Get Asset Category Stats
//
exports.getAssetCategoryStats = async (req, res) => {
  try {
    const total = await AssetCategory.countDocuments();
    const active = await AssetCategory.countDocuments({ isActive: true });
    const inactive = await AssetCategory.countDocuments({ isActive: false });

    res.json({ total, active, inactive });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
