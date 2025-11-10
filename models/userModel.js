const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');

//
// Permission Schema
//
// const permissionSchema = new mongoose.Schema({
//   module: { type: String },
//   actions: {
//     view: { type: Boolean, default: false },
//     add: { type: Boolean, default: false },
//     update: { type: Boolean, default: false },
//     delete: { type: Boolean, default: false },
//   },
// });

//
// User Schema
//
const userSchema = new mongoose.Schema(
  {
    // Basic Details
    firstName: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    lastName: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    mobile: { type: String, required: true, trim: true, match: [/^[0-9]{10}$/, 'Enter valid 10-digit mobile number'] },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Enter a valid email'],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      validate: {
        validator: function (password) {
          const hasUpperCase = /[A-Z]/.test(password);
          const hasNumber = /\d/.test(password);
          const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
          return hasUpperCase && hasNumber && hasSymbol;
        },
        message: 'Password must contain at least one uppercase letter, one number, and one symbol',
      },
    },

    // Company and Role
    CompanyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', default: null }, 

    // Profile & Employment Info
    profilePic: { type: String, default: null, trim: true },
    empCode: { type: String, unique: true, sparse: true, trim: true },
    dateOfBirth: { type: Date },
    joiningDate: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    nationality: { type: String, trim: true },
    shift: { type: String, trim: true },
    department: { type: String, trim: true },
    designation: { type: String, trim: true },
    bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] },
    about: { type: String, maxlength: 60 },

    // Address
    address: { type: String, trim: true },
    country: { type: String, trim: true },
    state: { type: String, trim: true },
    city: { type: String, trim: true },
    zipcode: { type: String, trim: true },

    // Emergency Contacts
    emergencyContacts: [
      {
        name: { type: String, trim: true },
        relation: { type: String, trim: true },
        contactNumber: { type: String, trim: true },
      },
    ],

    // Bank Info
    bank: {
      bankName: { type: String, trim: true },
      accountNumber: { type: String, trim: true },
      ifsc: { type: String, trim: true },
      branch: { type: String, trim: true },
    },

    // Role & Permissions
    userType: { type: String, enum: ['employee', 'admin', 'super_admin'], required: true },
    role: { type: String, enum: ['super_admin', 'admin', 'hr_admin', 'employee'], default: 'admin' },
    userTypeId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'userType' },
    permissions: [ ],

    // Account Management
    userName: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  }
);

//
// Password Hash Middleware
//
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

//
// Compare Password
//
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

//
// Generate JWT
//
userSchema.methods.generateAuthToken = function () {
  const payload = {
    id: this._id,
    email: this.email,
    role: this.role,
    userType: this.userType,
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
};

//
// Virtuals
//
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
});

//
// Static Methods
//
userSchema.statics.findActiveUsers = function () {
  return this.find({ isActive: true });
};

userSchema.statics.findByDepartment = function (department) {
  return this.find({ department, isActive: true });
};

//
// 🧰 STATIC METHOD – Create new user
//
userSchema.statics.createUser = async function (userData) {
  const user = new this(userData);
  await user.save();
  return user;
};

//
// Model Export
//
const User = mongoose.model('User', userSchema);
module.exports = User;
