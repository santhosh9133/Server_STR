const Shift = require('../../models/dropdownModels/shiftModel');

// For Create Shift
exports.createShift = async (req, res) => {
  try {
    const { CompanyId, name, startTime, endTime, weekOff, isActive } = req.body;

    // Basic validation
    if (!name || !startTime || !endTime || !weekOff) {
      return res.status(400).json({ message: 'name, startTime, endTime, and weekOff are required.' });
    }

    // Check if shift name already exists
    const existingShift = await Shift.findOne({ name });
    if (existingShift) {
      return res.status(409).json({ message: 'Shift name must be unique. A shift with this name already exists.' });
    }

    // Create new shift
    const shift = new Shift({
      CompanyId,
      name,
      startTime,
      endTime,
      weekOff,
      isActive // optional; if not provided, defaults to true
    });

    await shift.save();
    res.status(201).json({ message: 'Shift created successfully', shift });

  } catch (error) {
    console.error('Error creating shift:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



// Get all shifts (with optional pagination and search)
exports.getAllShifts = async (req, res) => {
  try {
    const { page = 1, limit = 100, search, isActive } = req.query;

    const query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const shifts = await Shift.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Shift.countDocuments(query);

    res.json({
      success: true,
      data: shifts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching shifts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shifts',
      error: error.message,
    });
  }
};

// Get single shift by ID
exports.getShiftById = async (req, res) => {
  try {
    const shift = await Shift.findById(req.params.id);
    if (!shift) {
      return res.status(404).json({ success: false, message: 'Shift not found' });
    }

    res.json({ success: true, data: shift });
  } catch (error) {
    console.error('Error fetching shift by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shift',
      error: error.message,
    });
  }
};

// Create new shift
// exports.createShift = async (req, res) => {
//   try {
//     const { name, startTime, endTime, isActive = true } = req.body;

//     if (!name || !startTime || !endTime) {
//       return res.status(400).json({
//         success: false,
//         message: 'Name, startTime, and endTime are required',
//       });
//     }

//     const existing = await Shift.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
//     if (existing) {
//       return res.status(400).json({ success: false, message: 'Shift with this name already exists' });
//     }

//     const newShift = new Shift({ name: name.trim(), startTime, endTime, isActive });
//     await newShift.save();

//     res.status(201).json({ success: true, message: 'Shift created successfully', data: newShift });
//   } catch (error) {
//     console.error('Error creating shift:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error creating shift',
//       error: error.message,
//     });
//   }
// };

// Update shift
exports.updateShift = async (req, res) => {
  try {
    const { name, startTime, endTime, weekOff, isActive } = req.body;
    const shift = await Shift.findById(req.params.id);

    if (!shift) {
      return res.status(404).json({ success: false, message: 'Shift not found' });
    }

    if (name && name !== shift.name) {
      const existing = await Shift.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') }, _id: { $ne: shift._id } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Another shift with this name already exists' });
      }
      shift.name = name.trim();
    }

    if (startTime) shift.startTime = startTime;
    if (endTime) shift.endTime = endTime;
    if (weekOff) shift.weekOff = weekOff;
    if (isActive !== undefined) shift.isActive = isActive;

    await shift.save();

    res.json({ success: true, message: 'Shift updated successfully', data: shift });
  } catch (error) {
    console.error('Error updating shift:', error);
    res.status(500).json({ success: false, message: 'Error updating shift', error: error.message });
  }
};

// Delete shift
exports.deleteShift = async (req, res) => {
  try {
    const shift = await Shift.findByIdAndDelete(req.params.id);
    if (!shift) {
      return res.status(404).json({ success: false, message: 'Shift not found' });
    }

    res.json({ success: true, message: 'Shift deleted successfully' });
  } catch (error) {
    console.error('Error deleting shift:', error);
    res.status(500).json({ success: false, message: 'Error deleting shift', error: error.message });
  }
};

// Toggle shift active/inactive
exports.toggleShiftStatus = async (req, res) => {
  try {
    const shift = await Shift.findById(req.params.id);
    if (!shift) {
      return res.status(404).json({ success: false, message: 'Shift not found' });
    }

    shift.isActive = !shift.isActive;
    await shift.save();

    res.json({
      success: true,
      message: `Shift ${shift.isActive ? 'activated' : 'deactivated'} successfully`,
      data: shift,
    });
  } catch (error) {
    console.error('Error toggling shift status:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling shift status',
      error: error.message,
    });
  }
};

// Get only active shifts
exports.getActiveShifts = async (req, res) => {
  try {
    const shifts = await Shift.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, data: shifts });
  } catch (error) {
    console.error('Error fetching active shifts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching active shifts',
      error: error.message,
    });
  }
};
