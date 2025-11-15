const Role = require("../models/roleModel");

// Create a new role
exports.createRole = async (req, res) => {
  try {
    const { name, status, permissions } = req.body;

    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res.status(400).json({ message: "Role name already exists" });
    }

    const newRole = await Role.create({ name, status, permissions });
    res.status(201).json({ success: true, data: newRole });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error creating role",
        error: error.message,
      });
  }
};

// Get all roles
exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    res.status(200).json({ success: true, data: roles });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching roles",
        error: error.message,
      });
  }
};

// Get role by ID
exports.getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role)
      return res
        .status(404)
        .json({ success: false, message: "Role not found" });

    res.status(200).json({ success: true, data: role });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching role",
        error: error.message,
      });
  }
};

// Update role and permissions
exports.updateRole = async (req, res) => {
  try {
    const { name, status, permissions } = req.body;

    const updatedRole = await Role.findByIdAndUpdate(
      req.params.id,
      { name, status, permissions },
      { new: true, runValidators: true }
    );

    if (!updatedRole) {
      return res
        .status(404)
        .json({ success: false, message: "Role not found" });
    }

    res
      .status(200)
      .json({
        success: true,
        message: "Role updated successfully",
        data: updatedRole,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error updating role",
        error: error.message,
      });
  }
};

// Delete role
exports.deleteRole = async (req, res) => {
  try {
    const deletedRole = await Role.findByIdAndDelete(req.params.id);
    if (!deletedRole)
      return res
        .status(404)
        .json({ success: false, message: "Role not found" });

    res
      .status(200)
      .json({ success: true, message: "Role deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error deleting role",
        error: error.message,
      });
  }
};
