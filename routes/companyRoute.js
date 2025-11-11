// routes/productRoutes/companyRoute.js

const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const {
  registerCompany,
  loginCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
} = require("../controllers/companyController");
// const { verifyAdminToken } = require("../middleware/verifyToken");

// CREATE (Register Company) - form-data
router.post("/", upload.single("companyImg"), registerCompany);

// LOGIN Company - JSON body
router.post("/login", loginCompany);

// GET All Companies
router.get("/",  getAllCompanies);

// GET Company by ID
router.get("/:id", getCompanyById);

// UPDATE Company (form-data)
router.put("/:id", upload.single("companyImg"), updateCompany);

// DELETE Company
router.delete("/:id", deleteCompany);

module.exports = router;
