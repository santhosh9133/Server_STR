const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const { auth } = require("../middleware/auth");
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
} = require("../controllers/authController");

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (form-data)
 * @access  Public
 */
router.post("/register", upload.single("profilePic"), register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post("/login", login);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/profile", auth, getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile (form-data)
 * @access  Private
 */
router.put("/profile", auth, upload.single("profilePic"), updateProfile);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put("/change-password", auth, changePassword);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client should remove token)
 * @access  Private
 */
router.post("/logout", auth, logout);

module.exports = router;
