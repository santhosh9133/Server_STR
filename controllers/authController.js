const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const path = require('path');
const User = require('../models/userModel');
const { authenticateUser } = require('../services/userService');
const fs = require('fs');
const validator = require('validator');

// Helper function to generate token + response
const generateTokenResponse = (user, userEntity = null) => {
  const token = user.generateAuthToken();
  const response = {
    success: true,
    message: 'Authentication successful',
    token,
    user: {
      id: user._id,
      userName: user.userName,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      mobile: user.mobile,
      profilePic: user.profilePic,
      role: user.role,
      userType: user.userType,
      isActive: user.isActive,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    },
  };

  if (userEntity) {
    response.userData = userEntity;
    response.user.role = user.userType;
  }

  return response;
};

// ======================== REGISTER ==========================
exports.register = async (req, res) => {
  try {
    const userData = req.body;

    // ✅ Parse nested JSON if sent as strings
    if (userData.emergencyContacts && typeof userData.emergencyContacts === 'string') {
      try {
        userData.emergencyContacts = JSON.parse(userData.emergencyContacts);
      } catch {
        userData.emergencyContacts = [];
      }
    }

    if (userData.bank && typeof userData.bank === 'string') {
      try {
        userData.bank = JSON.parse(userData.bank);
      } catch {
        userData.bank = {};
      }
    }

    // ✅ Handle uploaded file (if any)
    userData.profilePic = req.file ? `/uploads/profilePics/${req.file.filename}` : null;

    // ✅ Validation checks...
    if (!userData.email || !userData.password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    // ✅ Create user
    const user = new User(userData);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: user,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// get all users
// ======================== GET ALL USERS ==========================
exports.getAllUsers = async (req, res) => {
  try {
    // Optional: filter, search, pagination
    const { search, role, isActive } = req.query;

    // Build query dynamically
    const query = {};

    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
      ];
    }

    if (role) {
      query.userType = role;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Fetch all users except passwords
    const users = await User.find(query).select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Users fetched successfully',
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users',
      error: error.message,
    });
  }
};

// ======================== LOGIN ==========================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    const { user, userEntity } = await authenticateUser(email.toLowerCase(), password);
    const response = generateTokenResponse(user, userEntity);

    res.status(200).json(response);
  } catch (error) {
    console.error('Login error:', error);
    if (error.message === 'Invalid login credentials') {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// ======================== GET PROFILE ==========================
exports.getProfile = async (req, res) => {
  try {
    const user = req.user;
    let userData = null;

    try {
      const { getUserEntity } = require('../services/userService');
      userData = await getUserEntity(user);
    } catch (error) {
      console.log('No role-specific data found for user');
    }

    const response = {
      success: true,
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        mobile: user.mobile,
        profilePic: user.profilePic,
        role: user.userType,
        userType: user.userType,
        permissions: user.permissions,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };

    if (userData) response.userData = userData;

    res.status(200).json(response);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching profile' });
  }
};

// ======================== UPDATE PROFILE ==========================
exports.updateProfile = async (req, res) => {
  try {
    const { userName, firstName, lastName, mobile } = req.body;
    const userId = req.user._id;

    let updateData = { userName, firstName, lastName, mobile };

    // If a new profile image is uploaded
    if (req.file) {
      updateData.profilePic = `/uploads/profilePics/${req.file.filename}`;
    }

    // Check username taken
    if (userName) {
      const existingUser = await User.findOne({
        userName: userName.trim(),
        _id: { $ne: userId },
      });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Username already taken' });
      }
    }

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error while updating profile' });
  }
};

// ======================== CHANGE PASSWORD ==========================
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    const userId = req.user._id;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password, new password, and confirmation are required',
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ success: false, message: 'New passwords do not match' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long',
      });
    }

    const user = await User.findById(userId).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Server error while changing password' });
  }
};

// ======================== LOGOUT ==========================
exports.logout = async (req, res) => {
  try {
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, message: 'Server error during logout' });
  }
};
