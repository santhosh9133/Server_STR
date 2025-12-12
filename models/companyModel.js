// models/company.model.js

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const companySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      minlength: [2, "Company name must be at least 2 characters"],
      maxlength: [100, "Company name cannot exceed 100 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Enter a valid email",
      ],
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^[0-9]{10}$/, "Phone number must be 10 digits"],
    },

    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      minlength: [5, "Address must be at least 5 characters long"],
    },

    gstNumber: {
      type: String,
      required: [true, "GST number is required"],
      unique: true,
      trim: true,
      uppercase: true,
      match: [
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/,
        "Invalid GST number format",
      ],
    },
    role: {
      type: String,
      default: "Company",
    },

    companyImg: {
      type: String, // Stores the filename or full image URL
      required: false,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false, // Exclude from query results
    },

    confirmPassword: {
      type: String,
      required: [true, "Confirm password is required"],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords do not match",
      },
    },
    modulePermissions: {
      HRM: { type: Boolean, default: false },
      CRM: { type: Boolean, default: false },
      RECRUITMENT: { type: Boolean, default: false },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// 🔒 Pre-save hook to hash password and remove confirmPassword
companySchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

//
// Static Method – Find By Credentials
//
companySchema.statics.findByCredentials = async function (email, password) {
  const company = await this.findOne({ email }).select("+password");
  if (!company) throw new Error("Invalid login credentials");

  const isMatch = await bcrypt.compare(password, company.password);
  if (!isMatch) throw new Error("Invalid login credentials");

  return company;
};

//
// Instance Method – Generate JWT Token
//
companySchema.methods.generateAuthToken = function () {
  const payload = {
    id: this._id,
    email: this.email,
    role: this.role,
    companyName: this.companyName,
  };
  return jwt.sign(payload, process.env.JWT_SECRET || "secretkey", {
    expiresIn: "7d",
  });
};

// Indexes
companySchema.index({ email: 1 });
companySchema.index({ gstNumber: 1 });
companySchema.index({ companyName: 1 });

const Company = mongoose.model("Company", companySchema);

module.exports = Company;
