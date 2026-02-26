const express = require('express');
const router = express.Router();
const maquinariaController = require('../controllers/maquinariaController');

router.get('/maquinaria', maquinariaController.getAllMaquinaria);
router.get('/maquinaria/:id', maquinariaController.getMaquinariaById);
router.post('/maquinaria', maquinariaController.createMaquinaria);
router.put('/maquinaria/:id', maquinariaController.updateMaquinaria);
router.delete('/maquinaria/:id', maquinariaController.deleteMaquinaria);

module.exports = router;