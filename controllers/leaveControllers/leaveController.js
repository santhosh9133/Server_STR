const Leave = require("../../models/leaveModels/leaveModel");
const User = require("../../models/userModel");

// CREATE Leave
exports.createLeave = async (req, res) => {
  try {
    const { fromDate, toDate } = req.body;

    // Convert to Date objects
    const start = new Date(fromDate);
    const end = new Date(toDate);

    // Calculate number of days (inclusive)
    const diffTime = Math.abs(end - start);
    const noOfDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Add number of days into body automatically
    req.body.noOfDays = noOfDays;

    const leave = await Leave.create(req.body);

    res.status(201).json({
      message: "Leave applied successfully",
      leave,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET all Leaves
exports.getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate("companyId")
      .populate("employeeId")
      .populate("approvedBy");
    res.status(200).json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET Leave by ID
exports.getLeaveById = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate("companyId")
      .populate("employeeId")
      .populate("approvedBy");

    if (!leave) return res.status(404).json({ message: "Leave not found" });

    res.status(200).json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE Leave
exports.updateLeave = async (req, res) => {
  try {
    const leave = await Leave.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!leave) return res.status(404).json({ message: "Leave not found" });

    res.status(200).json({ message: "Leave updated successfully", leave });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE Leave
exports.deleteLeave = async (req, res) => {
  try {
    const leave = await Leave.findByIdAndDelete(req.params.id);

    if (!leave) return res.status(404).json({ message: "Leave not found" });

    res.status(200).json({ message: "Leave deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
