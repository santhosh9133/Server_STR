const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const upload = require("../middleware/uploadMiddleware");

// REGISTER with profile pic
router.post(
  "/",
  upload.single("profilePic"), // form-data: profilePic file
  userController.registerUser
);

// LOGIN
router.post("/login", userController.loginUser);

// CRUD
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);

// UPDATE (with file upload)
router.put(
  "/:id",
  upload.single("profilePic"), // update profilePic
  userController.updateUser
);

// DELETE
router.delete("/:id", userController.deleteUser);

// EXTRA ENDPOINTS
router.get("/active/list", userController.getActiveUsers);
router.get("/department/:department", userController.getUsersByDepartment);

module.exports = router;
