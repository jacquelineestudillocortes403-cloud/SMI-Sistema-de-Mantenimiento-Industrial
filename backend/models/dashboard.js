const db = require('./db');

class Dashboard {
  static async getCounts() {
    const [[maq]] = await db.query('SELECT COUNT(*) AS total FROM maquinaria');
    const [[sol]] = await db.query('SELECT COUNT(*) AS total FROM mantenimiento');
    return { maquinarias: maq.total, solicitudes: sol.total };
  }
}

module.exports = Dashboard;