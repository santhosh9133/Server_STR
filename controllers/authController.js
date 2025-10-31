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
    const {
      userName,
      email,
      password,
      confirmPassword,
      userType = 'employee',
      firstName,
      lastName,
      mobile,
      CompanyId,
    } = req.body;

    // Handle profilePic from form-data (if uploaded)
    const profilePic = req.file ? `/uploads/profilePics/${req.file.filename}` : null;

    // Validation
    if (!userName || !email || !password || !firstName || !lastName || !mobile) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, password, first name, last name, and mobile are required',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long',
      });
    }

    // Check existing user
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { userName }, { mobile }],
    });

    if (existingUser) {
      const message =
        existingUser.email === email.toLowerCase()
          ? 'User with this email already exists'
          : existingUser.userName === userName
          ? 'Username already taken'
          : 'Mobile number already registered';
      return res.status(400).json({ success: false, message });
    }

    // Create placeholder userTypeId for now
    const userTypeId = new mongoose.Types.ObjectId();

    // Create user
    const user = await User.createUser({
      userType,
      userTypeId,
      email: email.toLowerCase().trim(),
      userName: userName.trim(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      mobile: mobile.trim(),
      profilePic,
      CompanyId,
    });

    const response = generateTokenResponse(user);
    return res.status(201).json(response);
  } catch (error) {
    console.error('Registration error:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }

    res.status(500).json({ success: false, message: 'Server error during registration' });
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
