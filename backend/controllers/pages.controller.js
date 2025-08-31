import {frontendPath} from "../app.js";

export const getHome = (req, res) => {
  res.sendFile(frontendPath+'/auth/login.html');
};

export const getLogin = (req, res) => {
  res.sendFile(frontendPath+'/auth/login.html');
};

export const getRegistro = (req, res) => {
  res.sendFile(frontendPath+'/auth/registro.html');
};

export const getAdmins = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(frontendPath+'/protec/admin/indexAdmin.html');
};

export const getAlumnos = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(frontendPath+'/protec/alumnos/alumnos.html');
};

export const getTutores = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(frontendPath+'/protec/tutores/tutores.html');
};

export const getProfes = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(frontendPath+'/protec/profes/profes.html');
};

export const getDash = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(frontendPath+'/protec/admin/dashboard.html');
};