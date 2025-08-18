// routes/admin.routes.js
import mysql from "mysql2/promise";
import { dbConfig } from "../config/config.js";

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