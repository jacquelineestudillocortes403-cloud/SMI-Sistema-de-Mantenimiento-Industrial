const express = require('express');
const router = express.Router();
const ordenesController = require('../controllers/ordenesController');

router.get('/ordenes', ordenesController.getOrdenesPorTecnico);

module.exports = router;