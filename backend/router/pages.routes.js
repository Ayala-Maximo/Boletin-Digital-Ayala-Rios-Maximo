//pages.routes.js
import express from 'express';
import {
    getAdmins,
    getAlumnos,
    getHome,
    getLogin,
    getProfes,
    getRegistro,
    getSecretaria,
    getDash,
    getNotas,
    getError,
    getBoletin,
    getAdministracionUsuarios
} from "../controllers/pages.controller.js";

import {soloRol} from "../middlewer/auth.middleware.js";

const router = express.Router();

router.get('/error', getError);
router.get('/', getHome);
router.get('/registro.html', getRegistro);
router.get('/login.html', getLogin);
router.get('/admin', soloRol(1), getAdmins);
router.get('/alumnos', soloRol(4), getAlumnos);
router.get('/secretaria', soloRol(3), getSecretaria);
router.get('/profes', soloRol(2), getProfes);
router.get('/dashboard', soloRol(1), getDash);
router.get('/notas', soloRol(1,2,3), getNotas);
router.get('/boletin', soloRol(4), getBoletin);
router.get('/AdministraciondeUsuarios', soloRol(3), getAdministracionUsuarios);

export default router;