const pool = require('../models/db');

const getOrdenesPorTecnico = async (req, res) => {
  try {
    const tecnico = (req.query.tecnico || '').trim();
    if (!tecnico) return res.json([]);

    const [rows] = await pool.query(
      `SELECT m.id, m.estado, m.prioridad, m.descripcion_falla,
              maq.nombre AS maquinaria,
              t.nombre AS tecnico
       FROM mantenimiento m
       JOIN maquinaria maq ON maq.id = m.maquinaria_id
       JOIN tecnicos t ON t.id = m.tecnico_id
       WHERE t.nombre LIKE ?
       ORDER BY m.id DESC`,
      [`%${tecnico}%`]
    );

    res.json(rows);
  } catch (error) {
    console.error('ERROR getOrdenesPorTecnico:', error);
    res.status(500).json({ error: 'Error buscando órdenes' });
  }
};

module.exports = { getOrdenesPorTecnico };