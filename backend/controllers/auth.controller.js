import { JWT_SECRET,
    JWT_EXPIRES_IN,
    dbConfig,
    getCookieConfig,
}from "../config/config.js";
import dotenv from 'dotenv';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mysql from 'mysql2/promise';

dotenv.config()

function getRedirectUrlByRole(privilegioId) {
    switch (privilegioId) {
        case 1: return '/admin';
        case 2: return '/profes';
        case 3: return '/tutores';
        case 4: return '/alumnos';
        default: return '/index.html';
    }
}

export async function checkSession(req, res) {
    try {
        const redirectUrl = getRedirectUrlByRole(req.privilegioId);
        res.json({
            loggedIn: true,
            privilegioId: req.privilegioId,
            redirectUrl
        });
    } catch (error) {
        res.status(401).json({ loggedIn: false });
    }
}

// Lógica de registro


export async function registro(req, res)  {
    let conn;
    try {
    const { email, password, nombre, apellido } = req.body;

    // Validación básica
    if (!email || !password || !nombre || !apellido) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Hash con bcryptjs 
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);
    
    // Conexión y query
    conn = await mysql.createConnection(dbConfig);
    const [result] = await conn.execute(
        'INSERT INTO usuarios (email, password, nombre, apellido) VALUES (?, ?, ?, ?)',
        [email, hashedPassword, nombre, apellido]
    );
    
    // Respuesta exitosa
    res.status(201).json({ 
        message: 'Usuario registrado con éxito',
        userId: result.insertId
    });
    
    } catch (error) {
    console.error('Error en registro:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'El email ya está registrado' });
    }
    
    res.status(500).json({ 
        error: 'Error al registrar usuario',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
    } finally {if (conn) await conn.end();}
};


// Lógica de login


export async function login(req, res)  {
    let conn;
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos' });
        }

        conn = await mysql.createConnection(dbConfig);
        // Obtener más datos del usuario para la respuesta
        const [users] = await conn.execute(
            'SELECT id, password, nombre, apellido, email, privilegio_id FROM usuarios WHERE email = ? LIMIT 1',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }

        const user = users[0];
        const isMatch = await bcryptjs.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        // Generar token JWT
        const token = jwt.sign(
            { userId: user.id,
                privilegioId: user.privilegio_id 
            },
            JWT_SECRET, // Corregido: usando JWT_SECRET en lugar de secretKey
            { expiresIn: JWT_EXPIRES_IN } 
        );

        res.cookie('jwt', token, getCookieConfig(req));

        let redirectUrl;
        switch (user.privilegio_id) {
            case 1: redirectUrl = '/admin'; break;
            case 2: redirectUrl = '/profes'; break;
            case 3: redirectUrl = '/tutores'; break;
            case 4: redirectUrl = '/alumnos'; break;
            default: redirectUrl = '/index.html';
        }

        // Respuesta mejorada con más datos del usuario
        res.json({ 
            success: true,
            message: 'Login exitoso',
            redirectUrl,
            user: {
                id: user.id,
                nombre: user.nombre,
                apellido: user.apellido,
                email: user.email,
                rol: user.privilegio_id
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ 
            error: 'Error en el servidor',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        if (conn) await conn.end();
    }
};

export async function logout(req, res)  {
  // Lógica de logout
    try {
        res.clearCookie('jwt',getCookieConfig(req));
        res.json({ success: true, message: 'Sesión cerrada' });
    } catch (error) {
        console.error('Error en la borada de cokies:', error);
    }finally {
    }
};