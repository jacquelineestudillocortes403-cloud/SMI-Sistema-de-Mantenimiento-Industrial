const Usuario = require('../models/usuarios');

const getAllUsuarios = async (req, res, next) => {
  try {
    const usuarios = await Usuario.findAll();
    res.json(usuarios);
  } catch (err) {
    next(err);
  }
};

const getUsuarioById = async (req, res, next) => {
  try {
    const user = await Usuario.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

const createUsuario = async (req, res, next) => {
  try {
    const { nombre, correo, contrasena, rol } = req.body;

    if (!nombre || !correo || !contrasena || !rol) {
      return res.status(400).json({ message: 'nombre, correo, contrasena y rol son obligatorios' });
    }

    const nuevo = await Usuario.create({ nombre, correo, contrasena, rol });
    res.status(201).json(nuevo);
  } catch (err) {
    next(err);
  }
};

const updateUsuario = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { nombre, correo, contrasena, rol } = req.body;

    const exist = await Usuario.findById(id);
    if (!exist) return res.status(404).json({ message: 'Usuario no encontrado' });

    const ok = await Usuario.update(id, { nombre, correo, contrasena, rol });
    if (!ok) return res.status(400).json({ message: 'No se pudo actualizar' });

    res.json({ message: 'Usuario actualizado' });
  } catch (err) {
    next(err);
  }
};

const deleteUsuario = async (req, res, next) => {
  try {
    console.log('🗑️ DELETE usuario ID:', req.params.id);

    const ok = await Usuario.delete(req.params.id);

    if (!ok) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    res.json({
      success: true,
      message: 'Usuario eliminado correctamente',
      deletedId: req.params.id
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario
};