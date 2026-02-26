const pool = require('../models/db');

const getCounts = async (req, res) => {
  try {
    const [[maq]] = await pool.query('SELECT COUNT(*) AS total FROM maquinaria');
    const [[sol]] = await pool.query('SELECT COUNT(*) AS total FROM mantenimiento');

    res.json({
      maquinarias: maq.total,
      solicitudes: sol.total
    });
  } catch (error) {
    console.error('ERROR getCounts:', error);
    res.status(500).json({ error: 'Error cargando contadores' });
  }
};

module.exports = { getCounts };