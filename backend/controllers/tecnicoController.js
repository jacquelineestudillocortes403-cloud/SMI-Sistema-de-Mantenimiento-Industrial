const Tecnico = require('../models/tecnicos');

const getAllTecnicos = async (req, res, next) => {
  try {
    const rows = await Tecnico.findAll();
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

const getTecnicoById = async (req, res, next) => {
  try {
    const row = await Tecnico.findById(req.params.id);
    if (!row) return res.status(404).json({ message: 'Técnico no encontrado' });
    res.json(row);
  } catch (err) {
    next(err);
  }
};

const createTecnico = async (req, res, next) => {
  try {
    const { nombre, especialidad, telefono } = req.body;
    if (!nombre || !especialidad) {
      return res.status(400).json({ message: 'nombre y especialidad son obligatorios' });
    }
    const nuevo = await Tecnico.create({ nombre, especialidad, telefono });
    res.status(201).json(nuevo);
  } catch (err) {
    next(err);
  }
};

const updateTecnico = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { nombre, especialidad, telefono } = req.body;

    const exist = await Tecnico.findById(id);
    if (!exist) return res.status(404).json({ message: 'Técnico no encontrado' });

    const ok = await Tecnico.update(id, { nombre, especialidad, telefono });
    if (!ok) return res.status(400).json({ message: 'No se pudo actualizar' });

    res.json({ message: 'Técnico actualizado' });
  } catch (err) {
    next(err);
  }
};

const deleteTecnico = async (req, res, next) => {
  try {
    console.log('🗑️ DELETE tecnico ID:', req.params.id);

    const ok = await Tecnico.delete(req.params.id);
    if (!ok) return res.status(404).json({ success: false, message: 'Técnico no encontrado' });

    res.json({ success: true, message: 'Técnico eliminado', deletedId: req.params.id });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllTecnicos,
  getTecnicoById,
  createTecnico,
  updateTecnico,
  deleteTecnico
};