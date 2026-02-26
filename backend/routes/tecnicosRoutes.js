const express = require('express');
const router = express.Router();
const tecnicoController = require('../controllers/tecnicoController');

router.get('/tecnicos', tecnicoController.getAllTecnicos);
router.get('/tecnicos/:id', tecnicoController.getTecnicoById);
router.post('/tecnicos', tecnicoController.createTecnico);
router.put('/tecnicos/:id', tecnicoController.updateTecnico);
router.delete('/tecnicos/:id', tecnicoController.deleteTecnico);

module.exports = router;