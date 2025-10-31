const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const multer = require('multer');
const path = require('path');
const connectDB = require("./config/database");

require('dotenv').config();

// Import database connection
connectDB();

// Import routes
const userRoutes = require('./routes/userRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const adminRoutes = require('./routes/adminRoutes');
const companyRoutes = require('./routes/companyRoute');
const departmentRoutes = require('./routes/dropdownRoutes/departmentRoute');
const designationRoutes = require('./routes/dropdownRoutes/designationRoute');
const shiftRoutes = require('./routes/dropdownRoutes/shiftRoute');

const app = express();
const PORT = process.env.PORT || 5000;

// // Middleware
// app.use(helmet({
//   contentSecurityPolicy: {
//     directives: {
//       ...helmet.contentSecurityPolicy.getDefaultDirectives(),
//       "img-src": ["'self'", "data:", "http://localhost:5000", "http://localhost:5173"]
//     }
//   }
// })); // Security headers with custom CSP

app.use(cors()); // Enable CORS

app.use(express.json({ limit: '10mb' })); // Parse JSON bodies

app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Serve static files from uploads directory
app.use("/uploads", express.static("uploads"));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: "Backend connected!",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
// app.use('*', (req, res) => {
//   res.status(404).json({
//     error: 'Route not found',
//     message: `Cannot ${req.method} ${req.originalUrl}`
//   });
// });

// Routes
app.use('/api/users', userRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/designations', designationRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/shifts', shiftRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to MongoDB Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      users: '/api/users',
      employees: '/api/employees',
      admin: '/api/admin'
    }
  });
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(error.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(` Server is running on port ${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/health`);
  console.log(` API base URL: http://localhost:${PORT}/api`);
});