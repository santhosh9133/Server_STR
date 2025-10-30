const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Admin = require('../models/adminModel');
const SuperAdmin = require('../models/superAdminModel');

// Middleware to verify JWT token
const auth = async (req, res, next) => {

    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user by id
        const user = await User.findById(decoded.id);
        
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. User not found or inactive'
            });
        }

        // Add user to request object
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired.'
            });
        } else {
            return res.status(500).json({
                success: false,
                message: 'Server error during authentication.'
            });
        }
    }
};

// Middleware to verify admin JWT token
const adminTokenAuth = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if token is for admin
        if (decoded.type !== 'admin') {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Admin token required.'
            });
        }
        
        // Find admin by id
        const admin = await Admin.findById(decoded.id);
        
        if (!admin || !admin.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. Admin not found or inactive.'
            });
        }

        // Add admin to request object
        req.admin = admin;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired.'
            });
        } else {
            return res.status(500).json({
                success: false,
                message: 'Server error during authentication.'
            });
        }
    }
};

// Middleware to check if user is admin
const adminAuth = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error during authorization.'
        });
    }
};

// const superAdminAuth = async (req, res, next) => {
//     try {
//         if (req.user.role !== 'super_admin') {
//             return res.status(403).json({
//                 success: false,
//                 message: 'Access denied. Super Admin privileges required.'
//             });
//         }
//         next();
//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: 'Server error during authorization.'
//         });
//     }
// };

const superAdminTokenAuth = async (req, res, next) => {
  try {
    const rawToken = req.header('Authorization');
    if (!rawToken) {
      return res.status(401).json({ success: false, message: 'No token provided.' });
    }

    const token = rawToken.replace(/^Bearer\s*/, '').replace(/^[,\s]+/, '').trim();
    console.log('Cleaned token:', token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== 'super_admin') {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Super admin token required.'
      });
    }

    // Use the model SuperAdmin (not superAdmin)
    const foundSuperAdmin = await SuperAdmin.findById(decoded.id);

    if (!foundSuperAdmin || !foundSuperAdmin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Super admin not found or inactive.'
      });
    }

    req.superAdmin = foundSuperAdmin;
    next();

  } catch (error) {
    console.error('Authentication error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired.' });
    } else {
      return res.status(500).json({ success: false, message: 'Server error during authentication.' });
    }
  }
};



// Optional auth middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
            
            if (user && user.isActive) {
                req.user = user;
            }
        }
        
        next();
    } catch (error) {
        // Continue without authentication if token is invalid
        next();
    }
};

module.exports = {
    auth,
    superAdminTokenAuth,
    adminTokenAuth,
    adminAuth,
    optionalAuth
};
