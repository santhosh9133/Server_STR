// controllers/companyController.js

const Company = require("../models/companyModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ✅ Register Company (form-data)
exports.registerCompany = async (req, res) => {
  try {
    const {
      companyName,
      email,
      phone,
      address,
      gstNumber,
      password,
      confirmPassword,
    } = req.body;

    // Check for existing company
    const existing = await Company.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already registered" });

    // Prepare new company data
    const newCompany = new Company({
      companyName,
      email,
      phone,
      address,
      gstNumber,
      password,
      confirmPassword,
      companyImg: req.file ? req.file.filename : undefined,
    });

    await newCompany.save();
    res.status(201).json({
      message: "Company registered successfully",
      company: {
        _id: newCompany._id,
        companyName: newCompany.companyName,
        email: newCompany.email,
        companyImg: newCompany.companyImg,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Login Company
exports.loginCompany = async (req, res) => {
  try {
    const { email, password } = req.body;
    const company = await Company.findOne({ email }).select("+password");

    if (!company)
      return res.status(404).json({ message: "Company not found" });

    const isMatch = await bcrypt.compare(password, company.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    // Generate JWT
    const token = jwt.sign(
      { id: company._id, email: company.email },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      company: {
        _id: company._id,
        companyName: company.companyName,
        email: company.email,
        companyImg: company.companyImg,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get All Companies
exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 });
    res.status(200).json(companies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get Company by ID
exports.getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: "Company not found" });
    res.status(200).json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update Company (form-data)
exports.updateCompany = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.file) updates.companyImg = req.file.filename;

    const company = await Company.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!company) return res.status(404).json({ message: "Company not found" });
    res.status(200).json({ message: "Company updated", company });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete Company
exports.deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) return res.status(404).json({ message: "Company not found" });
    res.status(200).json({ message: "Company deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
