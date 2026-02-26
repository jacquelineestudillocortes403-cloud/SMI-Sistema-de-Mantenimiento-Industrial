const express = require('express');
const router = express.Router();
const mantenimientoController = require('../controllers/mantenimientoController');

router.get('/mantenimiento', mantenimientoController.getAllMantenimientos);
router.post('/mantenimiento', mantenimientoController.createMantenimiento);
router.put('/mantenimiento/:id', mantenimientoController.updateMantenimiento);
router.delete('/mantenimiento/:id', mantenimientoController.deleteMantenimiento);

module.exports = router;