const db = require('./db');

class Usuario {
  static async findAll() {
    const [rows] = await db.query(
      'SELECT id, nombre, correo, rol FROM usuario ORDER BY id DESC'
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query(
      'SELECT id, nombre, correo, rol FROM usuario WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async create({ nombre, correo, contrasena, rol }) {
    const [result] = await db.query(
      'INSERT INTO usuario (nombre, correo, contrasena, rol) VALUES (?, ?, ?, ?)',
      [nombre, correo, contrasena, rol]
    );
    return { id: result.insertId, nombre, correo, rol };
  }

  static async update(id, { nombre, correo, contrasena, rol }) {
    // Si contrasena viene vacía, NO la actualizamos
    if (contrasena) {
      const [result] = await db.query(
        'UPDATE usuario SET nombre = ?, correo = ?, contrasena = ?, rol = ? WHERE id = ?',
        [nombre, correo, contrasena, rol, id]
      );
      return result.affectedRows > 0;
    }

    const [result] = await db.query(
      'UPDATE usuario SET nombre = ?, correo = ?, rol = ? WHERE id = ?',
      [nombre, correo, rol, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.query(
      'DELETE FROM usuario WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Usuario;