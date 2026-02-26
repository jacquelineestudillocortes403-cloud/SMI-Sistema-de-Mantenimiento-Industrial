const Maquinaria = require('../models/maquinaria');

const getAllMaquinaria = async (req, res, next) => {
  try {
    const rows = await Maquinaria.findAll();
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

const getMaquinariaById = async (req, res, next) => {
  try {
    const row = await Maquinaria.findById(req.params.id);
    if (!row) return res.status(404).json({ message: 'Maquinaria no encontrada' });
    res.json(row);
  } catch (err) {
    next(err);
  }
};

const createMaquinaria = async (req, res, next) => {
  try {
    const { nombre, modelo, area, estado } = req.body;
    if (!nombre || !modelo || !area || !estado) {
      return res.status(400).json({ message: 'nombre, modelo, area y estado son obligatorios' });
    }
    const nuevo = await Maquinaria.create({ nombre, modelo, area, estado });
    res.status(201).json(nuevo);
  } catch (err) {
    next(err);
  }
};

const updateMaquinaria = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { nombre, modelo, area, estado } = req.body;
    const exist = await Maquinaria.findById(id);

    if (!exist) return res.status(404).json({ message: 'Maquinaria no encontrada' });
    const ok = await Maquinaria.update(id, { nombre, modelo, area, estado });
    if (!ok) return res.status(400).json({ message: 'No se pudo actualizar' });

    res.json({ message: 'Maquinaria actualizada' });
  } catch (err) {
    next(err);
  }
};

const deleteMaquinaria = async (req, res, next) => {
  try {
    console.log('🗑️ DELETE maquinaria ID:', req.params.id);
    const ok = await Maquinaria.delete(req.params.id);
    if (!ok) return res.status(404).json({ success: false, message: 'Maquinaria no encontrada' });
    res.json({ success: true, message: 'Maquinaria eliminada', deletedId: req.params.id });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllMaquinaria,
  getMaquinariaById,
  createMaquinaria,
  updateMaquinaria,
  deleteMaquinaria
};