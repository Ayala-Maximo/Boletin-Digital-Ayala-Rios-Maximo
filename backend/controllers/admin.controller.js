import mysql from "mysql2/promise";
import { dbConfig } from "../config/config.js";
import bcryptjs from "bcryptjs";
import rateLimit from "express-rate-limit";

// Middleware de rate limiting
export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100, // máx 100 requests por IP
  message: { error: "Demasiadas solicitudes, intenta más tarde." }
});

// Validación simple de inputs
function validarUsuario({ nombre, apellido, email, password, privilegio_id }) {
  if (!nombre || typeof nombre !== "string") return "Nombre inválido";
  if (!apellido || typeof apellido !== "string") return "Apellido inválido";
  if (!email || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) return "Email inválido";
  if (password && password.length < 6) return "Password demasiado corto";
  if (privilegio_id && isNaN(privilegio_id)) return "Privilegio inválido";
  return null;
}

// Obtener usuarios (sin exponer password)
export const getUsuarios = async (req, res) => {
  let conn;
  try {
    conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute(
      "SELECT id, nombre, apellido, email, privilegio_id FROM usuarios"
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuarios" });
  } finally {
    if (conn) await conn.end();
  }
};

// Obtener notas (ejemplo: filtrar lo que expones)
export const getNotas = async (req, res) => {
  let conn;
  try {
    conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute("SELECT id, titulo, fecha, usuario_id FROM notas");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener notas" });
  } finally {
    if (conn) await conn.end();
  }
};

// Obtener privilegios
export const getPrivilegios = async (req, res) => {
  let conn;
  try {
    conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute("SELECT id, nombre FROM privilegios");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener privilegios" });
  } finally {
    if (conn) await conn.end();
  }
};

// Obtener usuario por ID
export const getUsuarioById = async (req, res) => {
  let conn;
  try {
    conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute(
      "SELECT id, nombre, apellido, email, privilegio_id FROM usuarios WHERE id=?",
      [req.params.id]
    );
    res.json(rows[0] || {});
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuario" });
  } finally {
    if (conn) await conn.end();
  }
};

// Crear usuario
export const createUsuario = async (req, res) => {
  const { nombre, apellido, email, password, privilegio_id } = req.body;
  const errorValidacion = validarUsuario({ nombre, apellido, email, password, privilegio_id });
  if (errorValidacion) return res.status(400).json({ error: errorValidacion });

  let conn;
  try {
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    conn = await mysql.createConnection(dbConfig);
    await conn.execute(
      "INSERT INTO usuarios (nombre, apellido, email, password, privilegio_id) VALUES (?, ?, ?, ?, ?)",
      [nombre.trim(), apellido.trim(), email.trim(), hashedPassword, privilegio_id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Error al crear usuario" });
  } finally {
    if (conn) await conn.end();
  }
};

// Actualizar usuario
export const updateUsuario = async (req, res) => {
  const { nombre, apellido, email, privilegio_id } = req.body;
  const errorValidacion = validarUsuario({ nombre, apellido, email, privilegio_id });
  if (errorValidacion) return res.status(400).json({ error: errorValidacion });

  let conn;
  try {
    conn = await mysql.createConnection(dbConfig);
    await conn.execute(
      "UPDATE usuarios SET nombre=?, apellido=?, email=?, privilegio_id=? WHERE id=?",
      [nombre.trim(), apellido.trim(), email.trim(), privilegio_id, req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar usuario" });
  } finally {
    if (conn) await conn.end();
  }
};

// Eliminar usuario
export const deleteUsuario = async (req, res) => {
  let conn;
  try {
    conn = await mysql.createConnection(dbConfig);
    await conn.execute("DELETE FROM usuarios WHERE id=?", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar usuario" });
  } finally {
    if (conn) await conn.end();
  }
};
