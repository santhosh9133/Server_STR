const express = require('express');
const { verifyAdminToken } = require('../../../middleware/verifyToken');
const designationController = require('../../../controllers/HRM/dropdownControllers/designationController');
const router = express.Router();

router.get('/', designationController.getAllDesignations);
router.get('/active', designationController.getActiveDesignations);
router.get('/:id', designationController.getDesignationById);
router.post('/', designationController.createDesignation);
router.put('/:id', designationController.updateDesignation);
router.delete('/:id', designationController.deleteDesignation);
router.put('/:id/toggle-status', designationController.toggleDesignationStatus);

module.exports = router;
