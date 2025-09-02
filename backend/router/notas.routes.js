//notas.routes.js
import express from "express";
import { 
  getNotasCompletas, 
  getDatosFormulario, 
  createNota, 
  updateNota, 
  deleteNota,
  getNotaById,
  getNotasAlumno 
} from "../controllers/notas.controller.js";
import { verificarToken } from "../middlewer/auth.middleware.js";

const router = express.Router();

// Rutas de Notas para administradores
router.get("/notas-completas", verificarToken, getNotasCompletas);
router.get("/form-data", verificarToken, getDatosFormulario);
router.post("/", verificarToken, createNota);
router.put("/:id", verificarToken, updateNota);
router.delete("/:id", verificarToken, deleteNota);
router.get("/:id", verificarToken, getNotaById);

// Agregar esta ruta al archivo de rutas de notas
router.get('/alumno/:id', verificarToken, getNotasAlumno);

export default router;