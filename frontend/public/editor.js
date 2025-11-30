// notas.js
class NotasManager {
    constructor() {
        this.notas = [];
        this.datosFormulario = null;
    }

    async init() {
        await this.cargarDatosFormulario();
        await this.cargarNotas();
        this.configurarEventos();
    }

    async cargarDatosFormulario() {
        try {
            const response = await fetch('/api/notas/form-data', {
                credentials: 'include'
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al cargar datos');
            }
            
            this.datosFormulario = await response.json();
            this.llenarSelectores();
        } catch (error) {
            console.error('Error:', error);
            this.mostrarMensaje(error.message || 'Error al cargar datos del formulario', 'error');
        }
    }

    llenarSelectores() {
        this.llenarSelector('#filtroAlumno', this.datosFormulario.alumnos, 'Seleccionar alumno');
        this.llenarSelector('#alumnoId', this.datosFormulario.alumnos, 'Seleccionar alumno');
        this.llenarSelector('#filtroMateria', this.datosFormulario.materias, 'Todas las materias');
        this.llenarSelector('#materiaId', this.datosFormulario.materias, 'Seleccionar materia');
        this.llenarSelector('#filtroPeriodo', this.datosFormulario.periodos, 'Todos los períodos');
        this.llenarSelector('#periodoId', this.datosFormulario.periodos, 'Seleccionar período');
        this.llenarSelector('#tipoEvaluacionId', this.datosFormulario.tiposEvaluacion, 'Seleccionar tipo');
    }

    llenarSelector(selectorId, datos, textoDefault) {
        const selector = document.querySelector(selectorId);
        if (!selector) return;
        
        selector.innerHTML = `<option value="">${textoDefault}</option>`;
        
        datos.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.nombre || `${item.apellido}, ${item.nombre}`;
            selector.appendChild(option);
        });
    }

    async cargarNotas() {
        try {
            const response = await fetch('/api/notas/notas-completas', {
                credentials: 'include'
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al cargar notas');
            }
            
            this.notas = await response.json();
            this.mostrarNotas();
        } catch (error) {
            console.error('Error:', error);
            this.mostrarMensaje(error.message || 'Error al cargar las notas', 'error');
        }
    }

    mostrarNotas() {
        const cuerpoTabla = document.getElementById('cuerpoTablaNotas');
        const thead = document.querySelector('.tabla-notas thead tr');
        if (!cuerpoTabla || !thead) return;

        cuerpoTabla.innerHTML = '';
        thead.innerHTML = '';
        
        const filtroAlumnoId = document.getElementById('filtroAlumno').value;
        const notasFiltradas = filtroAlumnoId ? this.notas.filter(n => n.alumno_id == filtroAlumnoId) : [];

        if (notasFiltradas.length === 0) {
            cuerpoTabla.innerHTML = '<tr><td colspan="100">No hay notas para mostrar.</td></tr>';
            return;
        }

        const materiasUnicas = [...new Set(notasFiltradas.map(n => n.materia_nombre))];
        const ordenTipos = ['Primer Informe', 'Segundo Informe', 'Recuperatorio Noviembre', 'Recuperatorio Marzo', 'Nota Final'];
        const tiposUnicos = [...new Set(notasFiltradas.map(n => n.tipo_evaluacion || 'Evaluación'))].sort((a, b) => {
            return ordenTipos.indexOf(a) - ordenTipos.indexOf(b);
        });

        // Add headers dynamically
        thead.innerHTML = `<th>Tipo</th>${materiasUnicas.map(m => `<th>${m}</th>`).join('')}`;

        // Create a map to easily access notes
        const notasPorTipoMateria = {};
        tiposUnicos.forEach(t => notasPorTipoMateria[t] = {});
        notasFiltradas.forEach(n => {
            const tipo = n.tipo_evaluacion || 'Evaluación';
            if (!notasPorTipoMateria[tipo][n.materia_nombre]) {
                notasPorTipoMateria[tipo][n.materia_nombre] = [];
            }
            notasPorTipoMateria[tipo][n.materia_nombre].push(n);
        });

        // Populate table body
        tiposUnicos.forEach(tipo => {
            const fila = document.createElement('tr');
            fila.innerHTML = `<td>${tipo}</td>`;
            
            materiasUnicas.forEach(materia => {
                const notasMateria = notasPorTipoMateria[tipo][materia] || [];
                let cellHtml = '';
                
                if (notasMateria.length > 0) {
                    const ultimaNota = notasMateria[notasMateria.length - 1];
                    cellHtml = `${ultimaNota.valor} <div class="acciones-btn">
                        <button class="btn btn-sm" onclick="notasManager.editarNota(${ultimaNota.id})">Editar</button>
                        <button class="btn btn-sm btn-danger" onclick="notasManager.eliminarNota(${ultimaNota.id})">Eliminar</button>
                    </div>`;
                }
                
                fila.innerHTML += `<td>${cellHtml}</td>`;
            });
            cuerpoTabla.appendChild(fila);
        });
    }

    configurarEventos() {
        document.getElementById('filtroAlumno')?.addEventListener('change', () => this.mostrarNotas());
        document.getElementById('filtroMateria')?.addEventListener('change', () => this.aplicarFiltros());
        document.getElementById('filtroPeriodo')?.addEventListener('change', () => this.aplicarFiltros());
    }

    aplicarFiltros() {
        // This function is still needed for modal forms but is less critical for the new main table
    }

    obtenerTextoDesdeId(id, datos) {
        const item = datos.find(d => d.id == id);
        return item ? (item.nombre || `${item.apellido}, ${item.nombre}`) : '';
    }

    abrirModalNota() {
        document.getElementById('modalNota').style.display = 'block';
    }

    cerrarModalNota() {
        document.getElementById('modalNota').style.display = 'none';
        document.getElementById('formNota').reset();
        document.getElementById('notaId').value = '';
        document.getElementById('modalNotaTitle').textContent = 'Nueva Nota';
    }

    async guardarNota() {
        const alumnoId = document.getElementById('alumnoId').value;
        const materiaId = document.getElementById('materiaId').value;
        const periodoId = document.getElementById('periodoId').value;
        const tipoId = document.getElementById('tipoEvaluacionId').value;
        const valor = document.getElementById('notaValor').value;
        const fechaEvaluacion = document.getElementById('fechaEvaluacion').value;
        const notaId = document.getElementById('notaId').value;
        
        if (!alumnoId || !materiaId || !periodoId || !tipoId || !valor) {
            this.mostrarMensaje('Por favor complete todos los campos obligatorios', 'error');
            return;
        }
        
        const notaValor = parseFloat(valor);
        if (isNaN(notaValor) || notaValor < 0 || notaValor > 10) {
            this.mostrarMensaje('La nota debe ser un número entre 0 y 10', 'error');
            return;
        }
        
        const notaData = {
            alumno_id: alumnoId,
            materia_id: materiaId,
            periodo_id: periodoId,
            tipo_evaluacion_id: tipoId,
            valor: notaValor,
            fecha_evaluacion: fechaEvaluacion || new Date().toISOString().split('T')[0]
        };
        
        try {
            const metodo = notaId ? 'PUT' : 'POST';
            const url = notaId ? `/api/notas/${notaId}` : '/api/notas';
            
            const response = await fetch(url, {
                method: metodo,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(notaData),
                credentials: 'include'
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al guardar nota');
            }
            
            const result = await response.json();
            this.mostrarMensaje(result.message, 'success');
            this.cerrarModalNota();
            await this.cargarNotas();
        } catch (error) {
            console.error('Error:', error);
            this.mostrarMensaje(error.message || 'Error al guardar la nota', 'error');
        }
    }

    async editarNota(id) {
        try {
            const response = await fetch(`/api/notas/${id}`, {
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al cargar nota');
            }

            const nota = await response.json();

            document.getElementById('notaId').value = nota.id;
            document.getElementById('alumnoId').value = nota.alumno_id;
            document.getElementById('materiaId').value = nota.materia_id;
            document.getElementById('periodoId').value = nota.periodo_id;
            document.getElementById('tipoEvaluacionId').value = nota.tipo_evaluacion_id;
            document.getElementById('notaValor').value = nota.valor;
            document.getElementById('fechaEvaluacion').value = nota.fecha_evaluacion;

            document.getElementById('modalNotaTitle').textContent = 'Editar Nota';
            this.abrirModalNota();
        } catch (error) {
            console.error('Error al preparar edición:', error);
            this.mostrarMensaje(error.message || 'Error al cargar la nota para editar', 'error');
        }
    }

    async eliminarNota(id) {
        const nota = this.notas.find(n => n.id === id);
        const mensaje = nota 
            ? `¿Estás seguro de que quieres eliminar la nota de ${nota.alumno_nombre} en ${nota.materia_nombre}?`
            : '¿Estás seguro de que quieres eliminar esta nota?';
        
        if (!confirm(mensaje)) return;
        
        try {
            const response = await fetch(`/api/notas/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al eliminar nota');
            }
            
            const result = await response.json();
            this.mostrarMensaje(result.message, 'success');
            await this.cargarNotas();
        } catch (error) {
            console.error('Error:', error);
            this.mostrarMensaje(error.message || 'Error al eliminar la nota', 'error');
        }
    }

    mostrarMensaje(mensaje, tipo) {
        const mensajeDiv = document.createElement('div');
        mensajeDiv.style.position = 'fixed';
        mensajeDiv.style.top = '20px';
        mensajeDiv.style.right = '20px';
        mensajeDiv.style.padding = '15px';
        mensajeDiv.style.borderRadius = '5px';
        mensajeDiv.style.color = 'white';
        mensajeDiv.style.zIndex = '1000';
        mensajeDiv.style.maxWidth = '300px';
        
        if (tipo === 'success') {
            mensajeDiv.style.background = '#28a745';
        } else if (tipo === 'error') {
            mensajeDiv.style.background = '#dc3545';
        } else {
            mensajeDiv.style.background = '#17a2b8';
        }
        
        mensajeDiv.textContent = mensaje;
        
        document.body.appendChild(mensajeDiv);
        
        setTimeout(() => {
            document.body.removeChild(mensajeDiv);
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.notasManager = new NotasManager();
    window.notasManager.init();
});

function abrirModalNota() {
    window.notasManager.abrirModalNota();
}

function cerrarModalNota() {
    window.notasManager.cerrarModalNota();
}

function guardarNota() {
    window.notasManager.guardarNota();
}