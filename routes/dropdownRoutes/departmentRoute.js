const express = require('express');
const router = express.Router();
const departmentController = require('../../controllers/dropdownControllers/departmentController');
const { verifyAdminToken } = require('../../middleware/verifyToken');
const {auth, adminTokenAuth} = require('../../middleware/auth');

// Route Definitions
router.get('/', auth, departmentController.getDepartments);
router.get('/active', auth, departmentController.getActiveDepartments);
router.get('/:id', auth, departmentController.getDepartmentById);
router.post('/', auth, departmentController.createDepartment);
router.put('/:id', auth, departmentController.updateDepartment);
router.delete('/:id', auth, departmentController.deleteDepartment);
router.put('/:id/toggle-status', auth, departmentController.toggleDepartmentStatus);
router.get('/:id/employees', auth, departmentController.getDepartmentEmployees);
router.put('/update-employee-counts', auth, departmentController.updateEmployeeCounts);

module.exports = router;
