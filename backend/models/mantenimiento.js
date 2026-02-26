const db = require('./db');

class Mantenimiento {
  static async findAll() {
    const [rows] = await db.query(
      `SELECT m.*,
              u.nombre AS usuario_nombre,
              maq.nombre AS maquinaria_nombre,
              t.nombre AS tecnico_nombre
       FROM mantenimiento m
       JOIN usuario u ON u.id = m.usuario_id
       JOIN maquinaria maq ON maq.id = m.maquinaria_id
       LEFT JOIN tecnicos t ON t.id = m.tecnico_id
       ORDER BY m.id DESC`
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query(
      `SELECT m.*,
              u.nombre AS usuario_nombre,
              maq.nombre AS maquinaria_nombre,
              t.nombre AS tecnico_nombre
       FROM mantenimiento m
       JOIN usuario u ON u.id = m.usuario_id
       JOIN maquinaria maq ON maq.id = m.maquinaria_id
       LEFT JOIN tecnicos t ON t.id = m.tecnico_id
       WHERE m.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async create({ usuario_id, maquinaria_id, tecnico_id, descripcion_falla, prioridad, estado }) {
    const [result] = await db.query(
      `INSERT INTO mantenimiento
       (usuario_id, maquinaria_id, tecnico_id, descripcion_falla, prioridad, estado)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [usuario_id, maquinaria_id, tecnico_id || null, descripcion_falla, prioridad, estado]
    );
    return { id: result.insertId };
  }

  static async update(id, { usuario_id, maquinaria_id, tecnico_id, descripcion_falla, prioridad, estado, fecha_atencion }) {
    const [result] = await db.query(
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
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.query(
      'DELETE FROM mantenimiento WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // Órdenes por nombre de técnico (para tu sección "Órdenes")
  static async findByTecnicoNombre(nombreTecnico) {
    const [rows] = await db.query(
      `SELECT m.id,
              m.estado,
              m.prioridad,
              m.descripcion_falla,
              maq.nombre AS maquinaria,
              t.nombre AS tecnico
       FROM mantenimiento m
       JOIN maquinaria maq ON maq.id = m.maquinaria_id
       JOIN tecnicos t ON t.id = m.tecnico_id
       WHERE t.nombre LIKE ?
       ORDER BY m.id DESC`,
      [`%${nombreTecnico}%`]
    );
    return rows;
  }
}

module.exports = Mantenimiento;