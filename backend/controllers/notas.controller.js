//notas.controller.js
import { pool } from "../config/config.js";

// Obtener todas las notas con información relacionada
export const getNotasCompletas = async (req, res) => {
  try {
    // Verificar que el usuario esté autenticado
    if (!req.userId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const [notas] = await pool.execute(`
      SELECT 
        n.id,
        u.id AS alumno_id,
        u.apellido AS alumno_apellido,
        u.nombre AS alumno_nombre,
        mat.nombre AS materia_nombre,
        n.valor,
        n.fecha_evaluacion,
        te.nombre AS tipo_evaluacion,
        p.apellido AS profesor_apellido,
        p.nombre AS profesor_nombre,
        per.nombre AS periodo_nombre
      FROM notas n
      INNER JOIN usuarios u ON n.alumno_id = u.id
      INNER JOIN materias mat ON n.materia_id = mat.id
      INNER JOIN periodos_academicos per ON n.periodo_id = per.id
      INNER JOIN usuarios p ON n.profesor_id = p.id
      LEFT JOIN tipo_evaluaciones te ON n.tipo_evaluacion_id = te.id
      WHERE n.profesor_id = ? OR ? = 1
    `, [req.userId, req.privilegioId]);

    res.json(notas);
  } catch (error) {
    console.error("Error al obtener notas:", error);
    res.status(500).json({ error: "Error al obtener notas" });
  }
};

// Obtener datos para formularios
export const getDatosFormulario = async (req, res) => {
  try {
    const [materias] = await pool.execute("SELECT id, nombre FROM materias WHERE activa = TRUE");
    const [periodos] = await pool.execute("SELECT id, nombre FROM periodos_academicos WHERE activo = TRUE");
    const [tiposEvaluacion] = await pool.execute("SELECT id, nombre FROM tipo_evaluaciones ORDER BY orden");
    const [alumnos] = await pool.execute("SELECT id, nombre, apellido FROM usuarios WHERE privilegio_id = 4 ORDER BY apellido, nombre");

    res.json({ materias, periodos, tiposEvaluacion, alumnos });
  } catch (error) {
    console.error("Error al obtener datos del formulario:", error);
    res.status(500).json({ error: "Error al obtener datos del formulario" });
  }
};

// Crear nueva nota
export const createNota = async (req, res) => {
  try {
    const { alumno_id, materia_id, periodo_id, tipo_evaluacion_id, valor, fecha_evaluacion } = req.body;

    await pool.execute(
      `INSERT INTO notas 
        (alumno_id, materia_id, periodo_id, profesor_id, tipo_evaluacion_id, valor, fecha_evaluacion) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [alumno_id, materia_id, periodo_id, req.userId, tipo_evaluacion_id, valor, fecha_evaluacion]
    );

    res.json({ success: true, message: "Nota creada correctamente" });
  } catch (error) {
    console.error("Error al crear nota:", error);
    res.status(500).json({ error: "Error al crear nota" });
  }
};

// Actualizar nota
export const updateNota = async (req, res) => {
  try {
    const { valor, fecha_evaluacion } = req.body;

    const [result] = await pool.execute(
      `UPDATE notas 
       SET valor = ?, fecha_evaluacion = ? 
       WHERE id = ?`,
      [valor, fecha_evaluacion, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Nota no encontrada" });
    }

    res.json({ success: true, message: "Nota actualizada correctamente" });
  } catch (error) {
    console.error("Error al actualizar nota:", error);
    res.status(500).json({ error: "Error al actualizar nota" });
  }
};

// Eliminar nota
export const deleteNota = async (req, res) => {
  try {
    const [result] = await pool.execute("DELETE FROM notas WHERE id = ?", [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Nota no encontrada" });
    }

    res.json({ success: true, message: "Nota eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar nota:", error);
    res.status(500).json({ error: "Error al eliminar nota" });
  }
};

export const getNotaById = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM notas WHERE id = ?`,
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: "Nota no encontrada" });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error("Error al obtener nota:", error);
    res.status(500).json({ error: "Error al obtener nota" });
  }
};

// Obtener notas de un alumno específico
export const getNotasAlumno = async (req, res) => {
  try {
    // Verificar que el usuario esté autenticado y sea el alumno correspondiente o tenga permisos
    if (req.privilegioId !== 4 && req.privilegioId !== 1) {
      return res.status(403).json({ error: "No tiene permisos para ver estas notas" });
    }
    
    // Si es alumno, solo puede ver sus propias notas
    const alumnoId = (req.privilegioId === 4) ? req.userId : req.params.id;
    
    const [notas] = await pool.execute(`
      SELECT 
        n.id,
        mat.nombre AS materia,
        per.nombre AS periodo,
        te.nombre AS tipo_evaluacion,
        n.valor,
        n.fecha_evaluacion,
        CONCAT(p.nombre, ' ', p.apellido) AS profesor
      FROM notas n
      INNER JOIN materias mat ON n.materia_id = mat.id
      INNER JOIN periodos_academicos per ON n.periodo_id = per.id
      INNER JOIN usuarios p ON n.profesor_id = p.id
      LEFT JOIN tipo_evaluaciones te ON n.tipo_evaluacion_id = te.id
      WHERE n.alumno_id = ?
      ORDER BY mat.nombre, per.nombre, n.fecha_evaluacion
    `, [alumnoId]);

    res.json(notas);
  } catch (error) {
    console.error("Error al obtener notas del alumno:", error);
    res.status(500).json({ error: "Error al obtener notas del alumno" });
  }
};