const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
     firstName: { 
    type: String, 
    required: [true, 'First name is required'], 
    trim: true, 
    minlength: [2, 'First name must be at least 2 characters long'], 
    maxlength: [50, 'First name cannot exceed 50 characters'] 
  }, 
  lastName: { 
    type: String, 
    required: [true, 'Last name is required'], 
    trim: true, 
    minlength: [2, 'Last name must be at least 2 characters long'], 
    maxlength: [50, 'Last name cannot exceed 50 characters'] 
  }, 
  mobile: { 
    type: String, 
    required: [true, 'Mobile number is required'], 
    trim: true, 
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number'] 
  }, 
  profilePic: {
    type: String, 
    default: null, 
    trim: true 
  }, 
  // Common fields for all user types
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    validate: {
      validator: function(password) {
        // Check for at least one uppercase letter, one number, and one symbol
        const hasUpperCase = /[A-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
        return hasUpperCase && hasNumber && hasSymbol;
      },
      message: 'Password must contain at least one uppercase letter, one number, and one symbol'
    }
  },
  // User type and role
  userType: {
    type: String,
    enum: ['employee', 'admin', 'super_admin'],
    required: true
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'hr_admin'], 
    default: 'admin'
  },
  
  // Reference to the actual user document
  userTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'userType'
  },
  
  // Company reference
  CompanyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  
  // Common fields
  userName: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  lastLogin: {
    type: Date,
    default: null
  },
  
  permissions: { 
    type: [String], 
    default: ['read', 'write', 'delete'] 
  },
  
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Admin', 
    default: null 
  }
  },
  { timestamps: true }
);

//
// 🔐 HASH PASSWORD BEFORE SAVE
//
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

//
// 🧠 INSTANCE METHOD – Generate JWT
//
userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ _id: this._id, role: this.userType }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

//
// 🧩 INSTANCE METHOD – Compare Password
//
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

//
// 🧰 STATIC METHOD – Find user by credentials (⚠️ this was missing)
//
userSchema.statics.findByCredentials = async function (email, password) {
  const user = await this.findOne({ email }).select('+password');
  if (!user) throw new Error('Invalid login credentials');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Invalid login credentials');

  return user;
};

//
// 🧰 STATIC METHOD – Create new user
//
userSchema.statics.createUser = async function (userData) {
  const user = new this(userData);
  await user.save();
  return user;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
