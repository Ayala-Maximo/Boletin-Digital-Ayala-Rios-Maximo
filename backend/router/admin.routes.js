// Configuración de rutas
import { getUsuarios,getNotas,getPrivilegios } from "../controllers/admin.controller.js";
import {soloRol} from "../middlewer/auth.middleware.js";
import express from 'express';
const router = express.Router();

router.get("/usuarios", soloRol(1), getUsuarios);
router.get("/notas", soloRol(1), getNotas);
router.get("/privilegios", soloRol(1), getPrivilegios);

export default router;