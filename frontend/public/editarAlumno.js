
let alumnos = {};
let notas = {};

function mostrarMensaje(mensaje, tipo = 'success') {
let mensajeDiv = document.getElementById('mensajeGlobal');
if (!mensajeDiv) {
    mensajeDiv = document.createElement('div');
    mensajeDiv.id = 'mensajeGlobal';
    mensajeDiv.style.position = 'fixed';
    mensajeDiv.style.top = '20px';
    mensajeDiv.style.right = '20px';
    mensajeDiv.style.padding = '15px';
    mensajeDiv.style.borderRadius = '5px';
    mensajeDiv.style.zIndex = '10000';
    mensajeDiv.style.maxWidth = '300px';
    document.body.appendChild(mensajeDiv);
}

if (tipo === 'success') {
    mensajeDiv.style.backgroundColor = '#d4edda';
    mensajeDiv.style.color = '#155724';
    mensajeDiv.style.border = '1px solid #c3e6cb';
} else {
    mensajeDiv.style.backgroundColor = '#f8d7da';
    mensajeDiv.style.color = '#721c24';
    mensajeDiv.style.border = '1px solid #f5c6cb';
}

mensajeDiv.textContent = mensaje;
mensajeDiv.style.display = 'block';
setTimeout(() => mensajeDiv.style.display = 'none', 3000);
}

function cargarAlumnos() {
alumnos = {
    7: { id: 7, nombre: "González, Juan", curso: "3ro A", promedio: 7.8, estado: "Regular" },
    9: { id: 9, nombre: "Pérez, María", curso: "3ro B", promedio: 8.5, estado: "Promocionado" }
};

const selectorAlumno = document.getElementById('selectorAlumno');
selectorAlumno.innerHTML = '<option value="">-- Seleccione un alumno --</option>';
for (const id in alumnos) {
    const option = document.createElement('option');
    option.value = id;
    option.textContent = alumnos[id].nombre;
    selectorAlumno.appendChild(option);
}

const alumnoIdModal = document.getElementById('alumnoId');
alumnoIdModal.innerHTML = '<option value="">Seleccionar alumno</option>';
for (const id in alumnos) {
    const option = document.createElement('option');
    option.value = id;
    option.textContent = alumnos[id].nombre;
    alumnoIdModal.appendChild(option);
}
}

function cargarNotas() {
notas = {
    1: { id: 1, alumnoId: 7, materiaId: 1, materia: "Matemática", nota: 8, tipoId: 1, tipo: "Primer Informe", periodoId: 1, periodo: "Primer Cuatrimestre 2025", fecha: "2025-05-15", profesor: "Prof. García" },
    2: { id: 2, alumnoId: 7, materiaId: 2, materia: "Lengua", nota: 7.5, tipoId: 1, tipo: "Primer Informe", periodoId: 1, periodo: "Primer Cuatrimestre 2025", fecha: "2025-05-18", profesor: "Prof. López" },
    3: { id: 3, alumnoId: 9, materiaId: 1, materia: "Matemática", nota: 9, tipoId: 1, tipo: "Primer Informe", periodoId: 1, periodo: "Primer Cuatrimestre 2025", fecha: "2025-05-16", profesor: "Prof. García" },
    4: { id: 4, alumnoId: 9, materiaId: 3, materia: "Taller", nota: 8.5, tipoId: 1, tipo: "Primer Informe", periodoId: 1, periodo: "Primer Cuatrimestre 2025", fecha: "2025-05-20", profesor: "Prof. Martínez" }
};
}

function mostrarInfoAlumno(alumnoId) {
const infoAlumno = document.getElementById('infoAlumno');
const alumno = alumnos[alumnoId];

if (alumno) {
    document.getElementById('alumnoNombre').textContent = alumno.nombre;
    document.getElementById('alumnoCurso').textContent = alumno.curso;
    document.getElementById('alumnoPromedio').textContent = alumno.promedio;
    document.getElementById('alumnoEstado').textContent = alumno.estado;
    infoAlumno.style.display = 'grid';
} else {
    infoAlumno.style.display = 'none';
}
}

function mostrarNotasAlumno(alumnoId) {
const cuerpoTabla = document.getElementById('cuerpoTablaNotas');
cuerpoTabla.innerHTML = '';

const filtroMateria = document.getElementById('filtroMateria').value;
const filtroPeriodo = document.getElementById('filtroPeriodo').value;
const filtroTipo = document.getElementById('filtroTipo').value;

let notasFiltradas = Object.values(notas).filter(nota => {
    return nota.alumnoId == alumnoId &&
            (!filtroMateria || nota.materiaId == filtroMateria) &&
            (!filtroPeriodo || nota.periodoId == filtroPeriodo) &&
            (!filtroTipo || nota.tipoId == filtroTipo);
});

if (notasFiltradas.length === 0) {
    cuerpoTabla.innerHTML = '<tr><td colspan="7" style="text-align: center;">No se encontraron notas para este alumno con los filtros seleccionados</td></tr>';
    return;
}

notasFiltradas.forEach(nota => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
        <td>${nota.materia}</td>
        <td>${nota.nota}</td>
        <td>${nota.tipo}</td>
        <td>${nota.periodo}</td>
        <td>${nota.fecha}</td>
        <td>${nota.profesor}</td>
        <td class="acciones-btn">
            <button class="btn btn-sm" onclick="editarNota(${nota.id})">Editar</button>
            <button class="btn btn-sm btn-danger" onclick="eliminarNota(${nota.id})">Eliminar</button>
        </td>
    `;
    cuerpoTabla.appendChild(fila);
});
}

function abrirModalNota(notaId = null) {
const modal = document.getElementById('modalNota');
const titulo = document.getElementById('modalNotaTitle');
const form = document.getElementById('formNota');

if (notaId) {
    titulo.textContent = 'Editar Nota';
    const nota = notas[notaId];
    document.getElementById('notaId').value = nota.id;
    document.getElementById('alumnoId').value = nota.alumnoId;
    document.getElementById('materiaId').value = nota.materiaId;
    document.getElementById('periodoId').value = nota.periodoId;
    document.getElementById('tipoEvaluacionId').value = nota.tipoId;
    document.getElementById('notaValor').value = nota.nota;
    document.getElementById('fechaEvaluacion').value = nota.fecha;
} else {
    titulo.textContent = 'Nueva Nota';
    form.reset();
    const alumnoSeleccionado = document.getElementById('selectorAlumno').value;
    if (alumnoSeleccionado) {
        document.getElementById('alumnoId').value = alumnoSeleccionado;
    }
}
modal.style.display = 'flex';
}

function cerrarModalNota() {
document.getElementById('modalNota').style.display = 'none';
}

function guardarNota() {
const form = document.getElementById('formNota');
if (!form.checkValidity()) {
    form.reportValidity();
    return;
}

const notaId = document.getElementById('notaId').value;
const alumnoId = document.getElementById('alumnoId').value;
const materiaId = document.getElementById('materiaId').value;
const periodoId = document.getElementById('periodoId').value;
const tipoId = document.getElementById('tipoEvaluacionId').value;
const notaValor = document.getElementById('notaValor').value;
const fecha = document.getElementById('fechaEvaluacion').value;

const materiaText = document.getElementById('materiaId').selectedOptions[0].text;
const periodoText = document.getElementById('periodoId').selectedOptions[0].text;
const tipoText = document.getElementById('tipoEvaluacionId').selectedOptions[0].text;

if (notaId) {
    notas[notaId] = {
        id: parseInt(notaId),
        alumnoId: parseInt(alumnoId),
        materia: materiaText,
        materiaId: parseInt(materiaId),
        nota: parseFloat(notaValor),
        tipo: tipoText,
        tipoId: parseInt(tipoId),
        periodo: periodoText,
        periodoId: parseInt(periodoId),
        fecha: fecha,
        profesor: "Prof. García"
    };
    mostrarMensaje('Nota actualizada correctamente');
} else {
    const newId = Math.max(...Object.keys(notas).map(Number)) + 1;
    notas[newId] = {
        id: newId,
        alumnoId: parseInt(alumnoId),
        materia: materiaText,
        materiaId: parseInt(materiaId),
        nota: parseFloat(notaValor),
        tipo: tipoText,
        tipoId: parseInt(tipoId),
        periodo: periodoText,
        periodoId: parseInt(periodoId),
        fecha: fecha,
        profesor: "Prof. García"
    };
    mostrarMensaje('Nota creada correctamente');
}

cerrarModalNota();
const alumnoSeleccionado = document.getElementById('selectorAlumno').value;
if (alumnoId === alumnoSeleccionado) {
    mostrarNotasAlumno(alumnoId);
}
}

function editarNota(notaId) {
abrirModalNota(notaId);
}

function eliminarNota(notaId) {
if (confirm('¿Está seguro de que desea eliminar esta nota?')) {
    delete notas[notaId];
    mostrarMensaje('Nota eliminada correctamente');
    const alumnoSeleccionado = document.getElementById('selectorAlumno').value;
    if (alumnoSeleccionado) {
        mostrarNotasAlumno(alumnoSeleccionado);
    }
}
}

function aplicarFiltros() {
const alumnoSeleccionado = document.getElementById('selectorAlumno').value;
if (alumnoSeleccionado) {
    mostrarNotasAlumno(alumnoSeleccionado);
}
}

document.addEventListener('DOMContentLoaded', function() {
cargarAlumnos();
cargarNotas();

document.getElementById('selectorAlumno').addEventListener('change', function() {
    const alumnoId = this.value;
    if (alumnoId) {
        mostrarInfoAlumno(alumnoId);
        mostrarNotasAlumno(alumnoId);
    } else {
        document.getElementById('infoAlumno').style.display = 'none';
        document.getElementById('cuerpoTablaNotas').innerHTML = 
            '<tr><td colspan="7" style="text-align: center;">Seleccione un alumno para ver sus notas</td></tr>';
    }
});

document.getElementById('filtroMateria').addEventListener('change', aplicarFiltros);
document.getElementById('filtroPeriodo').addEventListener('change', aplicarFiltros);
document.getElementById('filtroTipo').addEventListener('change', aplicarFiltros);

window.addEventListener('click', function(event) {
    const modal = document.getElementById('modalNota');
    if (event.target === modal) {
        cerrarModalNota();
    }
});
});
