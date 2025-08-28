// Configuración de rutas
import { getUsuarios,getNotas,getPrivilegios,deleteUsuario,updateUsuario,createUsuario,getUsuarioById } from "../controllers/admin.controller.js";
import {soloRol} from "../middlewer/auth.middleware.js";
import express from 'express';
import bcrypt from "bcryptjs";
const router = express.Router();

// Rutas de Usuarios
router.get("/usuarios", soloRol(1), getUsuarios);
router.get("/usuarios/:id", soloRol(1), getUsuarioById);
router.post("/usuarios", soloRol(1), createUsuario);
router.put("/usuarios/:id", soloRol(1), updateUsuario);
router.delete("/usuarios/:id", soloRol(1), deleteUsuario);

// Rutas de Notas
router.get("/notas", soloRol(1), getNotas);

// Rutas de Privilegios
router.get("/privilegios", soloRol(1), getPrivilegios);

export default router;