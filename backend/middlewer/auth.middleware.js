import { JWT_SECRET, getCookieConfig,getRedirectUrlByRole } from "../config/config.js";
import jwt from 'jsonwebtoken';

// Middleware base de autenticación
export async function verificarToken(req, res, next) {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.redirect('/login.html');
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        req.privilegioId = decoded.privilegioId;

        next();
    } catch (error) {
        console.log("Fallo al verificar token:", error.message);
        res.clearCookie('jwt', getCookieConfig(req));
        res.redirect('/login.html?error=invalid_token');
    }
}

// Middleware parametrizable según rol requerido
export function soloRol(privilegioEsperado) {
    return [
        verificarToken,
        (req, res, next) => {
            if (req.privilegioId !== privilegioEsperado) {
                // Redirigir al usuario a su página según rol
                const redirectUrl = getRedirectUrlByRole(req.privilegioId);
                return res.redirect(redirectUrl);
            }
            next();
        }
    ];
}
