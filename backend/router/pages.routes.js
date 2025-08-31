import express from 'express';
import {
    getAdmins,
    getAlumnos,
    getHome,
    getLogin,
    getProfes,
    getRegistro,
    getTutores,
    getDash
} from "../controllers/pages.controller.js";

import {soloRol} from "../middlewer/auth.middleware.js";

const router = express.Router();

router.get('/', getHome);
router.get('/registro.html', getRegistro);
router.get('/login.html', getLogin);
router.get('/admin', soloRol(1), getAdmins);
router.get('/alumnos', soloRol(4), getAlumnos);
router.get('/tutores', soloRol(3), getTutores);
router.get('/profes', soloRol(2), getProfes);
router.get('/dashboard', soloRol(1), getDash);
export default router;