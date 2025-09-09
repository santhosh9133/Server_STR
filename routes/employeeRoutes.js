const express = require('express');
const multer = require('multer');
const path = require('path');
const Employee = require('../models/Employee');
const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname))
  }
});

const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// GET /api/employees - Get all employees
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      department, 
      designation, 
      isActive, 
      gender,
      shift 
    } = req.query;
    
    // Build query object
    const query = {};
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { empCode: { $regex: search, $options: 'i' } },
        { contactNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (department) query.department = department;
    if (designation) query.designation = designation;
    if (gender) query.gender = gender;
    if (shift) query.shift = shift;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    // Execute query with pagination
    const employees = await Employee.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const total = await Employee.countDocuments(query);
    
    res.json({
      success: true,
      data: employees,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employees',
      error: error.message
    });
  }
});

// GET /api/employees/:id - Get employee by ID
router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).select('-password');
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    res.json({
      success: true,
      data: employee
    });
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employee',
      error: error.message
    });
  }
});

// GET /api/employees/code/:empCode - Get employee by employee code
router.get('/code/:empCode', async (req, res) => {
  try {
    const employee = await Employee.findOne({ empCode: req.params.empCode }).select('-password');
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    res.json({
      success: true,
      data: employee
    });
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employee',
      error: error.message
    });
  }
});

// POST /api/employees - Create new employee
router.post('/', async (req, res) => {
  try {
    const employeeData = req.body;
    
    // Check if employee already exists
    const existingEmployee = await Employee.findOne({
      $or: [{ email: employeeData.email }, { empCode: employeeData.empCode }]
    });
    
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: 'Employee with this email or employee code already exists'
      });
    }
    
    // Create new employee
    const employee = new Employee(employeeData);
    await employee.save();
    
    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating employee',
      error: error.message
    });
  }
});

// PUT /api/employees/:id - Update employee
router.put('/:id', async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // Remove password from update data if it's empty
    if (!updateData.password) {
      delete updateData.password;
    }
    
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: employee
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating employee',
      error: error.message
    });
  }
});

// DELETE /api/employees/:id - Delete employee (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password');
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Employee deactivated successfully',
      data: employee
    });
  } catch (error) {
    console.error('Error deactivating employee:', error);
    res.status(500).json({
      success: false,
      message: 'Error deactivating employee',
      error: error.message
    });
  }
});

// DELETE /api/employees/:id/permanent - Permanently delete employee
router.delete('/:id/permanent', async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Employee permanently deleted'
    });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting employee',
      error: error.message
    });
  }
});

// PUT /api/employees/:id/activate - Activate employee
router.put('/:id/activate', async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    ).select('-password');
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Employee activated successfully',
      data: employee
    });
  } catch (error) {
    console.error('Error activating employee:', error);
    res.status(500).json({
      success: false,
      message: 'Error activating employee',
      error: error.message
    });
  }
});

// GET /api/employees/stats/overview - Get employee statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ isActive: true });
    const inactiveEmployees = await Employee.countDocuments({ isActive: false });
    
    // Department-wise count
    const departmentStats = await Employee.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Designation-wise count
    const designationStats = await Employee.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$designation', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Gender distribution
    const genderStats = await Employee.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$gender', count: { $sum: 1 } } }
    ]);
    
    // Recent joinings (last 30 days)
    const recentJoinings = await Employee.countDocuments({
      joiningDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      isActive: true
    });
    
    res.json({
      success: true,
      data: {
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        recentJoinings,
        departmentStats,
        designationStats,
        genderStats
      }
    });
  } catch (error) {
    console.error('Error fetching employee stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employee statistics',
      error: error.message
    });
  }
});

// GET /api/employees/departments - Get all departments
router.get('/departments/list', async (req, res) => {
  try {
    const departments = await Employee.distinct('department', { isActive: true });
    
    res.json({
      success: true,
      data: departments.sort()
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching departments',
      error: error.message
    });
  }
});

// GET /api/employees/designations - Get all designations
router.get('/designations/list', async (req, res) => {
  try {
    const designations = await Employee.distinct('designation', { isActive: true });
    
    res.json({
      success: true,
      data: designations.sort()
    });
  } catch (error) {
    console.error('Error fetching designations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch designations',
      error: error.message
    });
  }
});

// POST /api/employees/upload-profile-image - Upload profile image
router.post('/upload-profile-image', upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Generate the image URL
    const imageUrl = `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        imageUrl: imageUrl,
        filename: req.file.filename
      }
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message
    });
  }
});

// POST /api/employees/login - Employee login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find employee by email
    const employee = await Employee.findOne({ email: email.toLowerCase() });
    if (!employee) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if employee is active
    if (!employee.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.'
      });
    }

    // Verify password
    const isPasswordValid = await employee.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    employee.lastLogin = new Date();
    await employee.save();

    // Return success response (excluding password)
    const employeeData = employee.toJSON();
    delete employeeData.password;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        employee: employeeData
      }
    });

  } catch (error) {
    console.error('Employee login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;