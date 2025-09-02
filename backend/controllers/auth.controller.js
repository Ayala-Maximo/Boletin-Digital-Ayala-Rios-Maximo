//auth.controller.js
import { 
  JWT_SECRET,
  JWT_EXPIRES_IN,
  getCookieConfig,
  getRedirectUrlByRole,
  pool
} from "../config/config.js";

import dotenv from 'dotenv';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import validator from 'validator';

dotenv.config();

// Middleware de rate limiting (protege login contra fuerza bruta)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo de intentos por IP
  message: { error: "Demasiados intentos fallidos, intente más tarde" }
});

// ---- Validación de inputs ----
function validarInput(data, type = "text") {
  if (typeof data !== "string") return false;
  const trimmed = data.trim();

  switch (type) {
    case "email":
      return validator.isEmail(trimmed);
    case "password":
      return validator.isLength(trimmed, { min: 6, max: 64 });
    case "name":
      return validator.isAlpha(trimmed, 'es-ES', { ignore: " " }) && trimmed.length >= 2;
    default:
      return trimmed.length > 0;
  }
}

// ---- CHECK SESSION ----
export async function checkSession(req, res) {
  try {
    const redirectUrl = getRedirectUrlByRole(req.privilegioId);

    res.json({
      loggedIn: true,
      user: {
        id: req.userId,
        privilegioId: req.privilegioId,
        nombre: req.nombre,
        apellido: req.apellido,
        email: req.email
      },
      redirectUrl
    });
  } catch (error) {
    console.error("Error en checkSession:", error);
    res.status(401).json({ loggedIn: false });
  }
}

// ---- REGISTRO ----
export async function registro(req, res) {
  let conn;
  try {
    const { email, password, nombre, apellido } = req.body;

    // Validaciones
    if (!validarInput(email, "email") ||
        !validarInput(password, "password") ||
        !validarInput(nombre, "name") ||
        !validarInput(apellido, "name")) {
      return res.status(400).json({ error: "Datos inválidos" });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    conn = await pool.getConnection();
    const [result] = await conn.execute(
      'INSERT INTO usuarios (email, password, nombre, apellido) VALUES (?, ?, ?, ?)',
      [email.trim(), hashedPassword, nombre.trim(), apellido.trim()]
    );

    res.status(201).json({
      message: "Usuario registrado con éxito",
      userId: result.insertId
    });

  } catch (error) {
    console.error("Error en registro:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "El email ya está registrado" });
    }

    res.status(500).json({
      error: "Error al registrar usuario",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  } finally {
    if (conn) conn.release();
  }
}

// ---- LOGIN ----
export async function login(req, res) {
  let conn;
  try {
    const { email, password } = req.body;

    if (!validarInput(email, "email") || !validarInput(password, "password")) {
      return res.status(400).json({ error: "Email o contraseña inválidos" });
    }

    conn = await pool.getConnection();
    const [users] = await conn.execute(
      'SELECT id, password, nombre, apellido, email, privilegio_id FROM usuarios WHERE email = ? LIMIT 1',
      [email.trim()]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
    }

    const user = users[0];
    const isMatch = await bcryptjs.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
    }

    const token = jwt.sign(
      { userId: user.id, privilegioId: user.privilegio_id,    nombre: user.nombre,apellido: user.apellido,email: user.email},
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.cookie("jwt", token, getCookieConfig(req));

    res.json({
      success: true,
      message: "Login exitoso",
      redirectUrl: getRedirectUrlByRole(user.privilegio_id),
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.privilegio_id
      }
    });

  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({
      error: "Error en el servidor",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  } finally {
    if (conn) conn.release();
  }
}

// ---- LOGOUT ----
export async function logout(req, res) {
  try {
    res.clearCookie("jwt", getCookieConfig(req));
    res.json({ success: true, message: "Sesión cerrada" });
  } catch (error) {
    console.error("Error en logout:", error);
    res.status(500).json({ error: "No se pudo cerrar la sesión" });
  }
}
