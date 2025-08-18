import { registro,login,logout,checkSession } from "../controllers/auth.controller.js";
import { verificarToken } from "../middlewer/auth.middleware.js";
import express from 'express';
const router = express.Router();

router.post('/register', registro);
router.post('/login', login);
router.post('/logout', logout);
router.post('/verificador', verificarToken);
router.get('/check-session', verificarToken, checkSession)

export default router;