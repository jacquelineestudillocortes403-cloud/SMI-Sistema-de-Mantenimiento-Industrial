const pool = require('../models/db');

const getAllMantenimientos = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT m.*,
             u.nombre AS usuario_nombre,
             maq.nombre AS maquinaria_nombre,
             t.nombre AS tecnico_nombre
      FROM mantenimiento m
      JOIN usuario u ON u.id = m.usuario_id
      JOIN maquinaria maq ON maq.id = m.maquinaria_id
      LEFT JOIN tecnicos t ON t.id = m.tecnico_id
      ORDER BY m.id DESC
      LIMIT 200
    `);

    res.json(rows);
  } catch (error) {
    console.error('ERROR getAllMantenimientos:', error);
    res.status(500).json({ error: 'Error cargando mantenimientos' });
  }
};

const createMantenimiento = async (req, res) => {
  try {
    const { usuario_id, maquinaria_id, tecnico_id, descripcion_falla, prioridad, estado } = req.body;

    if (!usuario_id || !maquinaria_id || !descripcion_falla || !prioridad || !estado) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const [result] = await pool.query(
      `INSERT INTO mantenimiento 
        (usuario_id, maquinaria_id, tecnico_id, descripcion_falla, prioridad, estado)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [usuario_id, maquinaria_id, tecnico_id || null, descripcion_falla, prioridad, estado]
    );

    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error('ERROR createMantenimiento:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateMantenimiento = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { usuario_id, maquinaria_id, tecnico_id, descripcion_falla, prioridad, estado, fecha_atencion } = req.body;
    const [exist] = await pool.query('SELECT id FROM mantenimiento WHERE id = ?', [id]);
    if (exist.length === 0) {
      return res.status(404).json({ error: 'Mantenimiento no encontrado' });
    }

    const [result] = await pool.query(
      `UPDATE mantenimiento
       SET usuario_id = ?,
           maquinaria_id = ?,
           tecnico_id = ?,
           descripcion_falla = ?,
           prioridad = ?,
           estado = ?,
           fecha_atencion = ?
       WHERE id = ?`,
      [
        usuario_id,
        maquinaria_id,
        tecnico_id || null,
        descripcion_falla,
        prioridad,
        estado,
        fecha_atencion || null,
        id
      ]
    );

    res.json({ message: 'Mantenimiento actualizado' });
  } catch (error) {
    console.error('ERROR updateMantenimiento:', error);
    res.status(500).json({ error: error.message });
  }
};

const deleteMantenimiento = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [result] = await pool.query('DELETE FROM mantenimiento WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Mantenimiento no encontrado' });
    }
    
    res.json({ success: true, message: 'Mantenimiento eliminado', deletedId: id });
  } catch (error) {
    console.error('ERROR deleteMantenimiento:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllMantenimientos,
  createMantenimiento,
  updateMantenimiento,
  deleteMantenimiento
};