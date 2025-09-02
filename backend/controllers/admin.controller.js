//admin.controller.js
import { pool } from "../config/config.js";
import bcryptjs from "bcryptjs";
import rateLimit from "express-rate-limit";

// Middleware de rate limiting
export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
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

// Obtener usuarios
export const getUsuarios = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, nombre, apellido, email, privilegio_id FROM usuarios"
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

// Obtener notas
export const getNotas = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, titulo, fecha, usuario_id FROM notas"
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener notas" });
  }
};

// Obtener privilegios
export const getPrivilegios = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, nombre FROM privilegios");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener privilegios" });
  }
};

// Obtener usuario por ID
export const getUsuarioById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, nombre, apellido, email, privilegio_id FROM usuarios WHERE id=?",
      [req.params.id]
    );
    res.json(rows[0] || {});
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuario" });
  }
};

// Crear usuario
export const createUsuario = async (req, res) => {
  const { nombre, apellido, email, password, privilegio_id } = req.body;
  const errorValidacion = validarUsuario({ nombre, apellido, email, password, privilegio_id });
  if (errorValidacion) return res.status(400).json({ error: errorValidacion });

  try {
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    await pool.query(
      "INSERT INTO usuarios (nombre, apellido, email, password, privilegio_id) VALUES (?, ?, ?, ?, ?)",
      [nombre.trim(), apellido.trim(), email.trim(), hashedPassword, privilegio_id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Error al crear usuario" });
  }
};

// Actualizar usuario
export const updateUsuario = async (req, res) => {
  const { nombre, apellido, email, privilegio_id } = req.body;
  const errorValidacion = validarUsuario({ nombre, apellido, email, privilegio_id });
  if (errorValidacion) return res.status(400).json({ error: errorValidacion });

  try {
    await pool.query(
      "UPDATE usuarios SET nombre=?, apellido=?, email=?, privilegio_id=? WHERE id=?",
      [nombre.trim(), apellido.trim(), email.trim(), privilegio_id, req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
};

// Eliminar usuario
export const deleteUsuario = async (req, res) => {
  try {
    await pool.query("DELETE FROM usuarios WHERE id=?", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
};