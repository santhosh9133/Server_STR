const mongoose = require('mongoose');
const Employee = require('./models/Employee');

mongoose.connect('mongodb://localhost:27017/employee_management')
  .then(async () => {
    console.log('Connected to database');
    const employees = await Employee.find({}, 'firstName lastName profilePhoto');
    console.log('\nEmployee profilePhoto values:');
    console.log('==============================');
    employees.forEach(emp => {
      console.log(`${emp.firstName} ${emp.lastName}: ${emp.profilePhoto || 'null'}`);
    });
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });