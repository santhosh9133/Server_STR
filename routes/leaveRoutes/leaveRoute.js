const express = require("express");
const router = express.Router();
const leaveController = require("../../controllers/leaveControllers/leaveController");

// Create leave
router.post("/", leaveController.createLeave);

// Get all leaves
router.get("/", leaveController.getAllLeaves);

// Get leave by ID
router.get("/:id", leaveController.getLeaveById);

// Update leave
router.put("/:id", leaveController.updateLeave);

// Delete leave
router.delete("/:id", leaveController.deleteLeave);

module.exports = router;
