const db = require('./db');

class Maquinaria {
  static async findAll() {
    const [rows] = await db.query(
      'SELECT * FROM maquinaria ORDER BY id DESC'
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query(
      'SELECT * FROM maquinaria WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async create({ nombre, modelo, area, estado }) {
    const [result] = await db.query(
      'INSERT INTO maquinaria (nombre, modelo, area, estado) VALUES (?, ?, ?, ?)',
      [nombre, modelo, area, estado]
    );
    return { id: result.insertId, nombre, modelo, area, estado };
  }

  static async update(id, { nombre, modelo, area, estado }) {
    const [result] = await db.query(
      'UPDATE maquinaria SET nombre = ?, modelo = ?, area = ?, estado = ? WHERE id = ?',
      [nombre, modelo, area, estado, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.query(
      'DELETE FROM maquinaria WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Maquinaria;