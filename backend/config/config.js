//config.js
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
dotenv.config()
export  const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

export const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
};

export const getCookieConfig = (req) => ({
    httpOnly: process.env.COOKIE_HTTP_ONLY === "true",
    secure: process.env.COOKIE_SECURE === "true",
    path: process.env.COOKIE_PATH || "/",
    sameSite: 'lax'
});

if (!JWT_SECRET || !dbConfig.host || !dbConfig.user || !dbConfig.database) {
  throw new Error('Faltan variables de entorno críticas');
}

export function getRedirectUrlByRole(privilegioId) {
    switch (privilegioId) {
        case 1: return '/admin';
        case 2: return '/profes';
        case 3: return '/secretaria';
        case 4: return '/alumnos';
        default: return '/error';
    }
}

const pool = mysql.createPool(dbConfig);
export { pool };