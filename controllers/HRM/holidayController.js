const Holiday = require("../../models/HRMmodels/holidayModel");

// ✅ Create a new holiday
exports.createHoliday = async (req, res) => {
  try {
    const { name, date, description, status } = req.body;

    const holiday = await Holiday.create({ name, date, description, status });
    res.status(201).json({ message: "Holiday created successfully", holiday });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating holiday", error: err.message });
  }
};

// ✅ Get all holidays
exports.getAllHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find().sort({ date: 1 });
    res.status(200).json(holidays);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching holidays", error: err.message });
  }
};

// ✅ Get single holiday by ID
exports.getHolidayById = async (req, res) => {
  try {
    const holiday = await Holiday.findById(req.params.id);
    if (!holiday) return res.status(404).json({ message: "Holiday not found" });

    res.status(200).json(holiday);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching holiday", error: err.message });
  }
};

// ✅ Update holiday
exports.updateHoliday = async (req, res) => {
  try {
    const { name, date, description, status } = req.body;

    const holiday = await Holiday.findByIdAndUpdate(
      req.params.id,
      { name, date, description, status },
      { new: true, runValidators: true }
    );

    if (!holiday) return res.status(404).json({ message: "Holiday not found" });

    res.status(200).json({ message: "Holiday updated successfully", holiday });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating holiday", error: err.message });
  }
};

// ✅ Delete holiday
exports.deleteHoliday = async (req, res) => {
  try {
    const holiday = await Holiday.findByIdAndDelete(req.params.id);
    if (!holiday) return res.status(404).json({ message: "Holiday not found" });

    res.status(200).json({ message: "Holiday deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting holiday", error: err.message });
  }
};
