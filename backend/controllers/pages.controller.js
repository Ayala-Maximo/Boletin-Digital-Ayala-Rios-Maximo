//pages.controller.js

import {frontendPath} from "../app.js";

export const getError = (req, res) => {
  res.sendFile(frontendPath+'/auth/error.html');
};
//login
export const getHome = (req, res) => {
  res.sendFile(frontendPath+'/auth/login.html');
};

//login
export const getLogin = (req, res) => {
  res.sendFile(frontendPath+'/auth/login.html');
};

//registro
export const getRegistro = (req, res) => {
  res.sendFile(frontendPath+'/auth/registro.html');
};

//admins
export const getAdmins = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(frontendPath+'/protec/admin/indexAdmin.html');
};

//dashboard de los usuarios
export const getDash = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(frontendPath+'/protec/admin/dashboard.html');
};

//dashboard de las notas
export const getNotas = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(frontendPath+'/protec/admin/notas.html');
};

//secretaria
export const getSecretaria = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(frontendPath+'/protec/secretaria/secretaria.html');
};
export const getAdministracionUsuarios = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(frontendPath+'/protec/secretaria/administracionUsuarios.html');
};
//profes
export const getProfes = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(frontendPath+'/protec/profes/profes.html');
};

//alumnos
export const getAlumnos = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(frontendPath+'/protec/alumnos/alumnos.html');
};

export const getBoletin = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(frontendPath+'/protec/alumnos/boletin.html');
};