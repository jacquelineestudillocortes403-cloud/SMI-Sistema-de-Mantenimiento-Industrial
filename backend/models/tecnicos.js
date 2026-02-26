const db = require('./db');

class Tecnico {
  static async findAll() {
    const [rows] = await db.query(
      'SELECT * FROM tecnicos ORDER BY id DESC'
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query(
      'SELECT * FROM tecnicos WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async create({ nombre, especialidad, telefono }) {
    const [result] = await db.query(
      'INSERT INTO tecnicos (nombre, especialidad, telefono) VALUES (?, ?, ?)',
      [nombre, especialidad, telefono]
    );
    return { id: result.insertId, nombre, especialidad, telefono };
  }

  static async update(id, { nombre, especialidad, telefono }) {
    const [result] = await db.query(
      'UPDATE tecnicos SET nombre = ?, especialidad = ?, telefono = ? WHERE id = ?',
      [nombre, especialidad, telefono, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.query(
      'DELETE FROM tecnicos WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Tecnico;