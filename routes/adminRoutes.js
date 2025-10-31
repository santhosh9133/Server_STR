const express = require('express');
const Admin = require('../models/Admin');
const router = express.Router();

// POST /api/admin/register - Register new admin
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, userName, email, mobile, profilePic, password, role, permissions, createdBy } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !mobile || !password) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, email, mobile, and password are required'
      });
    }
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      $or: [{ email }, { userName }, { mobile }]
    });
    
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this email, username, or mobile number already exists'
      });
    }
    
    // Create new admin
    const adminData = {
      firstName,
      lastName,
      userName,
      email,
      mobile,
      profilePic,
      password,
      role: role || 'admin',
      permissions: permissions || ['read', 'write', 'delete']
    };
    
    if (createdBy) {
      adminData.createdBy = createdBy;
    }
    
    const admin = new Admin(adminData);
    await admin.save();
    
    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      data: admin
    });
  } catch (error) {
    console.error('Error registering admin:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error registering admin',
      error: error.message
    });
  }
});

// POST /api/admin/login - Admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Find admin by email
    const admin = await Admin.findOne({ email, isActive: true });
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check password
    const isPasswordValid = await admin.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Update last login
    await admin.updateLastLogin();
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        admin: {
          id: admin._id,
          firstName: admin.firstName,
          lastName: admin.lastName,
          userName: admin.userName,
          email: admin.email,
          mobile: admin.mobile,
          role: admin.role,
          permissions: admin.permissions,
          lastLogin: admin.lastLogin
        }
      }
    });
  } catch (error) {
    console.error('Error during admin login:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
});

// GET /api/admin - Get all admins
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, isActive } = req.query;
    
    // Build query object
    const query = {};
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      query.role = role;
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    // Execute query with pagination
    const admins = await Admin.find(query)
      .select('-password')
      .populate('createdBy', 'firstName lastName username email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const total = await Admin.countDocuments(query);
    
    res.json({
      success: true,
      data: admins,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admins',
      error: error.message
    });
  }
});

// GET /api/admin/:id - Get admin by ID
router.get('/:id', async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id)
      .select('-password')
      .populate('createdBy', 'firstName lastName username email');
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }
    
    res.json({
      success: true,
      data: admin
    });
  } catch (error) {
    console.error('Error fetching admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin',
      error: error.message
    });
  }
});

// PUT /api/admin/:id - Update admin profile
router.put('/:id', async (req, res) => {
  try {
    const { firstName, lastName, userName, email, mobile, profilePic, role, permissions, isActive } = req.body;
    
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (userName) updateData.userName = userName;
    if (email) updateData.email = email;
    if (mobile) updateData.mobile = mobile;
    if (profilePic !== undefined) updateData.profilePic = profilePic;
    if (role) updateData.role = role;
    if (permissions) updateData.permissions = permissions;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Admin updated successfully',
      data: admin
    });
  } catch (error) {
    console.error('Error updating admin:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating admin',
      error: error.message
    });
  }
});

// PUT /api/admin/:id/password - Change admin password
router.put('/:id/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }
    
    const admin = await Admin.findById(req.params.id);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }
    
    // Verify current password
    const isCurrentPasswordValid = await admin.comparePassword(currentPassword);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Update password
    admin.password = newPassword;
    await admin.save();
    
    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating password',
      error: error.message
    });
  }
});

// DELETE /api/admin/:id - Deactivate admin
router.delete('/:id', async (req, res) => {
  try {
    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password');
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Admin deactivated successfully',
      data: admin
    });
  } catch (error) {
    console.error('Error deactivating admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error deactivating admin',
      error: error.message
    });
  }
});

// PUT /api/admin/:id/activate - Activate admin
router.put('/:id/activate', async (req, res) => {
  try {
    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    ).select('-password');
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Admin activated successfully',
      data: admin
    });
  } catch (error) {
    console.error('Error activating admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error activating admin',
      error: error.message
    });
  }
});

// POST /api/admin/setup-super-admin - Create initial super admin
router.post('/setup-super-admin', async (req, res) => {
  try {
    const { firstName, lastName, mobile, userName, email, password } = req.body;
    
    const superAdmin = await Admin.createSuperAdmin({
      firstName,
      lastName,
      mobile,
      userName,
      email,
      password
    });
    
    res.status(201).json({
      success: true,
      message: 'Super admin created successfully',
      data: superAdmin
    });
  } catch (error) {
    console.error('Error creating super admin:', error);
    
    if (error.message === 'Super admin already exists') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating super admin',
      error: error.message
    });
  }
});

// GET /api/admin/stats/overview - Get admin statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const totalAdmins = await Admin.countDocuments();
    const activeAdmins = await Admin.countDocuments({ isActive: true });
    const inactiveAdmins = await Admin.countDocuments({ isActive: false });
    
    // Role-wise count
    const roleStats = await Admin.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Recent registrations (last 30 days)
    const recentRegistrations = await Admin.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      isActive: true
    });
    
    res.json({
      success: true,
      data: {
        totalAdmins,
        activeAdmins,
        inactiveAdmins,
        recentRegistrations,
        roleStats
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin statistics',
      error: error.message
    });
  }
});

module.exports = router;