// routes/admin.routes.js
import mysql from "mysql2/promise";
import { dbConfig } from "../config/config.js";
import bcryptjs from "bcryptjs"; // Make sure this matches your usage
// Función para obtener usuarios
export const getUsuarios = async (req, res) => {
  const conn = await mysql.createConnection(dbConfig);
  const [rows] = await conn.execute("SELECT id, nombre, apellido, email, privilegio_id FROM usuarios");
  res.json(rows);
};

// Función para obtener notas
export const getNotas = async (req, res) => {
  const conn = await mysql.createConnection(dbConfig);
  const [rows] = await conn.execute("SELECT * FROM notas");
  res.json(rows);
};

// Función para obtener privilegios
export const getPrivilegios = async (req, res) => {
  const conn = await mysql.createConnection(dbConfig);
  const [rows] = await conn.execute("SELECT * FROM privilegios");
  res.json(rows);
};

export const getUsuarioById = async (req, res) => {
  const conn = await mysql.createConnection(dbConfig);
  const [rows] = await conn.execute(
    "SELECT id, nombre, apellido, email, privilegio_id FROM usuarios WHERE id=?", 
    [req.params.id]
  );
  res.json(rows[0] || {});
};

export const createUsuario = async (req, res) => {
  const { nombre, apellido, email, password, privilegio_id } = req.body;
  const salt = await bcryptjs.genSalt(10);
  const hashedPassword = await bcryptjs.hash(password, salt);
  const conn = await mysql.createConnection(dbConfig);
  await conn.execute(
    "INSERT INTO usuarios (nombre, apellido, email, password, privilegio_id) VALUES (?, ?, ?, ?, ?)",
    [nombre, apellido, email, hashedPassword, privilegio_id]
  );
  res.json({ success: true });
};

export const updateUsuario = async (req, res) => {
  const { nombre, apellido, email, privilegio_id } = req.body;
  const conn = await mysql.createConnection(dbConfig);
  await conn.execute(
    "UPDATE usuarios SET nombre=?, apellido=?, email=?, privilegio_id=? WHERE id=?",
    [nombre, apellido, email, privilegio_id, req.params.id]
  );
  res.json({ success: true });
};

export const deleteUsuario = async (req, res) => {
  const conn = await mysql.createConnection(dbConfig);
  await conn.execute("DELETE FROM usuarios WHERE id=?", [req.params.id]);
  res.json({ success: true });
};