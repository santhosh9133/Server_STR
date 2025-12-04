const express = require('express');
const shiftController = require('../../../controllers/HRM/dropdownControllers/shiftController');
const { verifyAdminToken } = require('../../../middleware/verifyToken');
const router = express.Router();

router.post('/', shiftController.createShift);

router.get('/', shiftController.getAllShifts);

router.get('/active', shiftController.getActiveShifts);

router.get('/:id', shiftController.getShiftById);

router.put('/:id', shiftController.updateShift);

router.delete('/:id', shiftController.deleteShift);

router.put('/:id/toggle-status', shiftController.toggleShiftStatus);

module.exports = router;
