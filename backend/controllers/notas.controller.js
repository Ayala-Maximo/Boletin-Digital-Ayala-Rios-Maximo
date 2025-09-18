import { pool } from "../config/config.js";

// Obtener todas las notas con información relacionada
export const getNotasCompletas = async (req, res) => {
  try {
    // Verificar que el usuario esté autenticado
    if (!req.userId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    // Admins y secretarios ven todas las notas, profesores ven todas las notas también
    let query = `
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
        per.nombre AS periodo_nombre,
        n.profesor_id
      FROM notas n
      INNER JOIN usuarios u ON n.alumno_id = u.id
      INNER JOIN materias mat ON n.materia_id = mat.id
      INNER JOIN periodos_academicos per ON n.periodo_id = per.id
      INNER JOIN usuarios p ON n.profesor_id = p.id
      LEFT JOIN tipo_evaluaciones te ON n.tipo_evaluacion_id = te.id
    `;
    
    // Solo para alumnos mantener el filtro original
    if (req.privilegioId === 4) {
      query += ` WHERE n.alumno_id = ?`;
      var params = [req.userId];
    } else {
      // Admins, secretarios y profesores ven todas las notas
      var params = [];
    }

    const [notas] = await pool.execute(query, params);

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

// Actualizar nota (ahora actualiza también el profesor_id)
export const updateNota = async (req, res) => {
  try {
    const { valor, fecha_evaluacion } = req.body;

    const [result] = await pool.execute(
      `UPDATE notas 
       SET valor = ?, fecha_evaluacion = ?, profesor_id = ?
       WHERE id = ?`,
      [valor, fecha_evaluacion, req.userId, req.params.id]
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
    // Verificar permisos antes de eliminar (solo admin o el profesor que creó la nota)
    if (req.privilegioId !== 1) {
      const [nota] = await pool.execute(
        "SELECT profesor_id FROM notas WHERE id = ?",
        [req.params.id]
      );
      
      if (nota.length === 0 || nota[0].profesor_id !== req.userId) {
        return res.status(403).json({ error: "No tiene permisos para eliminar esta nota" });
      }
    }

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

// Obtener nota específica por ID
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
    if (req.privilegioId === 4 && req.params.id && req.params.id != req.userId) {
      return res.status(403).json({ error: "No puede ver notas de otros alumnos" });
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