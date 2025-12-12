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
      role,
      gstNumber,
      password,
      confirmPassword,
    } = req.body;

    // Check for existing company
    const existing = await Company.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already registered" });

    // DEBUG LOG
    console.log("Register Company Request Body:", JSON.stringify(req.body, null, 2));

    // Helper to safely parse boolean
    const isTrue = (val) => {
      if (typeof val === 'boolean') return val;
      if (typeof val === 'string') return val.toLowerCase() === 'true';
      return false;
    };

    // Parse permissions
    let modulePermissions = { HRM: false, CRM: false, RECRUITMENT: false };
    
    // 1. Check if sent as a JSON string or Object under 'modulePermissions'
    if (req.body.modulePermissions) {
      if (typeof req.body.modulePermissions === 'string') {
        try {
          // Check if it's double stringified or just a regular JSON string
          const parsed = JSON.parse(req.body.modulePermissions);
          if (typeof parsed === 'string') {
             // Handle double stringified case
             const deepParsed = JSON.parse(parsed);
             modulePermissions = { ...modulePermissions, ...deepParsed };
          } else {
             modulePermissions = { ...modulePermissions, ...parsed };
          }
        } catch (e) {
          console.error("Error parsing modulePermissions string:", e);
        }
      } else if (typeof req.body.modulePermissions === 'object') {
        modulePermissions = { ...modulePermissions, ...req.body.modulePermissions };
      }
    }

    // 2. Check for flattened keys (Bracket notation & Dot notation)
    // Bracket: modulePermissions[HRM]
    if (req.body['modulePermissions[HRM]'] !== undefined) modulePermissions.HRM = isTrue(req.body['modulePermissions[HRM]']);
    if (req.body['modulePermissions[CRM]'] !== undefined) modulePermissions.CRM = isTrue(req.body['modulePermissions[CRM]']);
    if (req.body['modulePermissions[RECRUITMENT]'] !== undefined) modulePermissions.RECRUITMENT = isTrue(req.body['modulePermissions[RECRUITMENT]']);

    // Dot: modulePermissions.HRM
    if (req.body['modulePermissions.HRM'] !== undefined) modulePermissions.HRM = isTrue(req.body['modulePermissions.HRM']);
    if (req.body['modulePermissions.CRM'] !== undefined) modulePermissions.CRM = isTrue(req.body['modulePermissions.CRM']);
    if (req.body['modulePermissions.RECRUITMENT'] !== undefined) modulePermissions.RECRUITMENT = isTrue(req.body['modulePermissions.RECRUITMENT']);

    console.log("Final modulePermissions:", modulePermissions);

    // Prepare new company data
    const newCompany = new Company({
      companyName,
      email,
      phone,
      address,
      role,
      gstNumber,
      password,
      confirmPassword,
      modulePermissions,
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

    if (!company) return res.status(404).json({ message: "Company not found" });

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
    const updateData = { ...req.body };

    console.log("Update Company Request Body:", JSON.stringify(req.body, null, 2));

    // Helper to safely parse boolean
    const isTrue = (val) => {
      if (typeof val === 'boolean') return val;
      if (typeof val === 'string') return val.toLowerCase() === 'true';
      return false;
    };

    // Handle permissions
    // Priority 1: JSON String or Object
    if (req.body.modulePermissions) {
      if (typeof req.body.modulePermissions === 'string') {
        try {
          const parsed = JSON.parse(req.body.modulePermissions);
          if (typeof parsed === 'string') {
             updateData.modulePermissions = JSON.parse(parsed);
          } else {
             updateData.modulePermissions = parsed;
          }
        } catch (e) {
          console.error("Error parsing modulePermissions:", e);
        }
      } else if (typeof req.body.modulePermissions === 'object') {
        updateData.modulePermissions = req.body.modulePermissions;
      }
    } else {
      // Priority 2: Flat keys (Bracket or Dot notation)
      // We use dot notation for updateData to allow partial updates
      
      // Bracket: modulePermissions[HRM]
      if (req.body['modulePermissions[HRM]'] !== undefined) {
        updateData['modulePermissions.HRM'] = isTrue(req.body['modulePermissions[HRM]']);
        delete updateData['modulePermissions[HRM]'];
      }
      if (req.body['modulePermissions[CRM]'] !== undefined) {
        updateData['modulePermissions.CRM'] = isTrue(req.body['modulePermissions[CRM]']);
        delete updateData['modulePermissions[CRM]'];
      }
      if (req.body['modulePermissions[RECRUITMENT]'] !== undefined) {
        updateData['modulePermissions.RECRUITMENT'] = isTrue(req.body['modulePermissions[RECRUITMENT]']);
        delete updateData['modulePermissions[RECRUITMENT]'];
      }

      // Dot: modulePermissions.HRM (Ensure boolean conversion)
      if (req.body['modulePermissions.HRM'] !== undefined) {
        updateData['modulePermissions.HRM'] = isTrue(req.body['modulePermissions.HRM']);
      }
      if (req.body['modulePermissions.CRM'] !== undefined) {
        updateData['modulePermissions.CRM'] = isTrue(req.body['modulePermissions.CRM']);
      }
      if (req.body['modulePermissions.RECRUITMENT'] !== undefined) {
        updateData['modulePermissions.RECRUITMENT'] = isTrue(req.body['modulePermissions.RECRUITMENT']);
      }
    }

    // Password update only when provided
    if (req.body.password && req.body.password.trim() !== "") {
      // Manually check if passwords match
      if (req.body.password !== req.body.confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
      }
      // Hash the new password
      const hashedPassword = await bcrypt.hash(req.body.password, 12);
      updateData.password = hashedPassword;
      // Remove confirmPassword from update data
      delete updateData.confirmPassword;
    } else {
      // Remove password fields so validation doesn't trigger
      delete updateData.password;
      delete updateData.confirmPassword;
    }

    if (req.file) {
      updateData.companyImg = req.file.filename;
    }

    const company = await Company.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: false, // Disable validators to avoid confirmPassword validation issue
    });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json({ success: true, company });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
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

exports.getCompanyStats = async (req, res) => {
  try {
    const total = await Company.countDocuments();
    const active = await Company.countDocuments({ isActive: true });
    const inactive = await Company.countDocuments({ isActive: false });

    return res.json({
      total,
      active,
      inactive,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
