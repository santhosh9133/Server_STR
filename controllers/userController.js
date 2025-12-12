const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//
// REGISTER USER
//
exports.registerUser = async (req, res) => {
  try {
    let userData = { ...req.body };

    // Check if email exists
    const existingEmail = await User.findOne({ email: userData.email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Check mobile number exists (optional)
    if (userData.mobile) {
      const existingMobile = await User.findOne({ mobile: userData.mobile });
      if (existingMobile) {
        return res.status(400).json({
          success: false,
          message: "Mobile number already exists",
        });
      }
    }

    // Parse arrays (like emergencyContacts[])
    if (req.body.emergencyContacts) {
      userData.emergencyContacts = JSON.parse(req.body.emergencyContacts);
    }

    // Parse nested bank object
    if (req.body.bank) {
      userData.bank = JSON.parse(req.body.bank);
    }

    // File upload
    if (req.file) {
      userData.profilePic = req.file.filename;
    }

    const user = await User.create(userData);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, message: error.message });
  }
};

//
// LOGIN - Unified for both Users and Companies
//
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // First, try to find and authenticate as a User
    try {
      const user = await User.findByCredentials(email, password);
      const token = user.generateAuthToken();
      return res.json({ success: true, token, user });
    } catch (userError) {
      // If user not found or password incorrect, try Company
    }

    // If not a user, try to find and authenticate as a Company
    const Company = require("../models/companyModel");
    try {
      const company = await Company.findByCredentials(email, password);
      const token = company.generateAuthToken();
      return res.json({ success: true, token, user: company });
    } catch (companyError) {
      // If neither user nor company found
      throw new Error("Invalid login credentials");
    }
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

//
// GET ALL USERS
//
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//
// GET USER BY ID
//
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.json({ success: true, user });
  } catch (error) {
    res.status(404).json({ message: "User not found" });
  }
};

//
// UPDATE USER
//
exports.updateUser = async (req, res) => {
  try {
    let updateData = { ...req.body };

    // Fix emergencyContacts if string (form-data)
    if (req.body.emergencyContacts) {
      updateData.emergencyContacts = JSON.parse(req.body.emergencyContacts);
    }

    // Fix bank object
    if (req.body.bank) {
      updateData.bank = JSON.parse(req.body.bank);
    }

    // profilePic update
    if (req.file) {
      updateData.profilePic = req.file.filename;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, message: error.message });
  }
};

//
// DELETE USER
//
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User deleted" });
  } catch (error) {
    res.status(404).json({ message: "User not found" });
  }
};

//
// GET ACTIVE USERS
//
exports.getActiveUsers = async (req, res) => {
  try {
    const users = await User.findActiveUsers();
    res.json({ success: true, users });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//
// GET USERS BY DEPARTMENT
//
exports.getUsersByDepartment = async (req, res) => {
  try {
    const users = await User.findByDepartment(req.params.department);
    res.json({ success: true, users });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
