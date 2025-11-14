const express = require("express");
const router = express.Router();
const holidayController = require("../controllers/holidayController");

// ✅ Routes
router.post("/", holidayController.createHoliday); // Create new holiday
router.get("/", holidayController.getAllHolidays); // Get all holidays
router.get("/:id", holidayController.getHolidayById); // Get single holiday
router.put("/:id", holidayController.updateHoliday); // Update holiday
router.delete("/:id", holidayController.deleteHoliday); // Delete holiday

module.exports = router;
