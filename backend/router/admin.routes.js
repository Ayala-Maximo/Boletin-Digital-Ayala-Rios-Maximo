// admin.routes.js

import { getUsuarios,getPrivilegios,deleteUsuario,updateUsuario,createUsuario,getUsuarioById,updateupdateUsuario3 } from "../controllers/admin.controller.js";
import {soloRol} from "../middlewer/auth.middleware.js";
import express from 'express';
const router = express.Router();

// Rutas de Usuarios
router.get("/usuarios", soloRol(1,3), getUsuarios);
router.get("/usuarios/:id", soloRol(1,3), getUsuarioById);
router.post("/usuarios", soloRol(1,3), createUsuario);
router.put("/usuarios/:id", soloRol(1,3), updateUsuario);
router.patch("/usuarios/:id/rol", soloRol(3), updateupdateUsuario3);
router.delete("/usuarios/:id", soloRol(1,3), deleteUsuario);

// Rutas de Privilegios
router.get("/privilegios", soloRol(1,3), getPrivilegios);

export default router;