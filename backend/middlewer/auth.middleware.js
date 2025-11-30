//auth.middleware.js
import { JWT_SECRET, getCookieConfig,getRedirectUrlByRole } from "../config/config.js";
import jwt from 'jsonwebtoken';
import { pool } from "../config/config.js";

// Middleware base de autenticación
export async function verificarToken(req, res, next) {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.redirect('/login.html');
        }

        // Verificar token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Asignar datos básicos del token
        req.userId = decoded.userId;
        req.privilegioId = decoded.privilegioId;

        const [rows] = await pool.query(
            "SELECT nombre, apellido, email FROM usuarios WHERE id = ? LIMIT 1",
            [decoded.userId]
        );

        if (rows.length === 0) {
            // Usuario no encontrado en BD pero token válido - inconsistencia
            res.clearCookie('jwt', getCookieConfig(req));
            return res.redirect('/login.html?error=user_not_found');
        }

        const user = rows[0];
        req.nombre = user.nombre;
        req.apellido = user.apellido;
        req.email = user.email;

        next();
    } catch (error) {
        console.error("Fallo al verificar token:", error.message);
        res.clearCookie('jwt', getCookieConfig(req));
        
        // Redirigir con mensaje de error apropiado
        if (error.name === 'TokenExpiredError') {
            res.redirect('/login.html?error=token_expired');
        } else if (error.name === 'JsonWebTokenError') {
            res.redirect('/login.html?error=invalid_token');
        } else {
            res.redirect('/login.html?error=auth_error');
        }
    }
}

// Middleware parametrizable según rol requerido
export function soloRol(...privilegiosEsperados) {
    return [
        verificarToken,
        (req, res, next) => {
            if (!privilegiosEsperados.includes(req.privilegioId)) {
                // Verificar si hay una redirección específica configurada para esta ruta y rol
                const routeSpecificRedirect = getRouteSpecificRedirect(req.path, req.privilegioId);
                
                if (routeSpecificRedirect) {
                    return res.redirect(routeSpecificRedirect);
                }
                
                // Redirigir al usuario a su página según rol por defecto
                const redirectUrl = getRedirectUrlByRole(req.privilegioId);
                return res.redirect(redirectUrl);
            }
            next();
        }
    ];
}

function getRouteSpecificRedirect(path, privilegioId) {
    const redirectRules = {
        '/dashboard': {
            3: '/AdministraciondeUsuarios' // Secretaría redirigida desde dashboard
        },
        '/dashboard': {
            2: '/editor'
        }
        // Puedes agregar más reglas aquí
    };
    
    return redirectRules[path] && redirectRules[path][privilegioId];
};