const User = require('../models/userModel');
// const Employee = require('../models/employeeModels/employeeModel');
// const Admin = require('../models/adminModel');
// const SuperAdmin = require('../models/superAdminModel');

// Service to create a user when an employee/admin/super admin is created
const createUserForEntity = async (entityData, userType) => {
  try {
    let email, userName, password, userTypeId;
    
    switch (userType) {
      case 'employee':
        email = entityData.email;
        userName = entityData.empCode; // Use employee code as username
        password = entityData.password || 'Employee@123'; // Default password or provided
        userTypeId = entityData._id;
        break;
        
      case 'admin':
        email = entityData.email;
        userName = entityData.userName;
        password = entityData.password;
        userTypeId = entityData._id;
        break;
        
      case 'super_admin':
        email = entityData.email;
        userName = entityData.userName;
        password = entityData.password;
        userTypeId = entityData._id;
        break;
        
      default:
        throw new Error('Invalid user type');
    }
    
    // Create user
    const user = await User.createUser({
      userType,
      userTypeId,
      email,
      userName,
      password
    });
    
    return user;
  } catch (error) {
    console.error('Error creating user for entity:', error);
    throw error;
  }
};

// Service to get the actual user entity (employee/admin/super admin)
const getUserEntity = async (user) => {
  try {
    switch (user.userType) {
      case 'employee':
        return await Employee.findById(user.userTypeId);
      case 'admin':
        return await Admin.findById(user.userTypeId);
      case 'super_admin':
        return await SuperAdmin.findById(user.userTypeId);
      default:
        throw new Error('Invalid user type');
    }
  } catch (error) {
    console.error('Error getting user entity:', error);
    throw error;
  }
};

// Service to authenticate user and return user entity
const authenticateUser = async (email, password) => {
  try {
    // Find user by credentials
    const user = await User.findByCredentials(email, password);
    
    let userEntity = null;
    try {
      // Get the actual user entity
      userEntity = await getUserEntity(user);
    } catch (entityError) {
      console.log('User entity not found, continuing with user data only');
      userEntity = null;
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    return { user, userEntity };
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
};

module.exports = {
  createUserForEntity,
  getUserEntity,
  authenticateUser
};