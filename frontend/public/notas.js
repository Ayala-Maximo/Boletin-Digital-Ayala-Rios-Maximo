//notas.js
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
            
            if (!response.ok) throw new Error('Error al cargar datos');
            
            this.datosFormulario = await response.json();
            this.llenarSelectores();
        } catch (error) {
            console.error('Error:', error);
            this.mostrarMensaje('Error al cargar datos del formulario', 'error');
        }
    }

    llenarSelectores() {
        this.llenarSelector('#filtroAlumno', this.datosFormulario.alumnos, 'Todos los alumnos');
        this.llenarSelector('#alumnoId', this.datosFormulario.alumnos, 'Seleccionar alumno');
        this.llenarSelector('#filtroMateria', this.datosFormulario.materias, 'Todas las materias');
        this.llenarSelector('#materiaId', this.datosFormulario.materias, 'Seleccionar materia');
        this.llenarSelector('#filtroPeriodo', this.datosFormulario.periodos, 'Todos los períodos');
        this.llenarSelector('#periodoId', this.datosFormulario.periodos, 'Seleccionar período');
        this.llenarSelector('#filtroTipo', this.datosFormulario.tiposEvaluacion, 'Todos los tipos');
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
            
            if (!response.ok) throw new Error('Error al cargar notas');
            this.notas = await response.json();
            this.mostrarNotas();
        } catch (error) {
            console.error('Error:', error);
            this.mostrarMensaje('Error al cargar las notas', 'error');
        }
    }

    mostrarNotas() {
        const cuerpoTabla = document.getElementById('cuerpoTablaNotas');
        if (!cuerpoTabla) return;
        
        cuerpoTabla.innerHTML = '';
        
        this.notas.forEach(nota => {
            const fila = document.createElement('tr');
            
            fila.innerHTML = `
                <td>${nota.alumno_apellido}, ${nota.alumno_nombre}</td>
                <td>${nota.materia_nombre}</td>
                <td>${nota.valor}</td>
                <td>${nota.tipo_evaluacion}</td>
                <td>${nota.periodo_nombre}</td>
                <td>${new Date(nota.fecha_evaluacion).toLocaleDateString()}</td>
                <td>${nota.profesor_apellido}, ${nota.profesor_nombre}</td>
                <td>
                    <div class="acciones-btn">
                        <button class="btn btn-sm" onclick="notasManager.editarNota(${nota.id})">Editar</button>
                        <button class="btn btn-sm btn-danger" onclick="notasManager.eliminarNota(${nota.id})">Eliminar</button>
                    </div>
                </td>
            `;
            
            cuerpoTabla.appendChild(fila);
        });
        
        this.aplicarFiltros();
    }

    configurarEventos() {
        // Eventos de filtros
        document.getElementById('filtroAlumno')?.addEventListener('change', () => this.aplicarFiltros());
        document.getElementById('filtroMateria')?.addEventListener('change', () => this.aplicarFiltros());
        document.getElementById('filtroPeriodo')?.addEventListener('change', () => this.aplicarFiltros());
        document.getElementById('filtroTipo')?.addEventListener('change', () => this.aplicarFiltros());
        
    }

    aplicarFiltros() {
        const filtroAlumno = document.getElementById('filtroAlumno').value;
        const filtroMateria = document.getElementById('filtroMateria').value;
        const filtroPeriodo = document.getElementById('filtroPeriodo').value;
        const filtroTipo = document.getElementById('filtroTipo').value;
        
        const filas = document.querySelectorAll('#cuerpoTablaNotas tr');
        
        filas.forEach(fila => {
            const alumno = fila.cells[0].textContent;
            const materia = fila.cells[1].textContent;
            const periodo = fila.cells[4].textContent;
            const tipo = fila.cells[3].textContent;
            
            const coincideAlumno = !filtroAlumno || alumno.includes(this.obtenerTextoDesdeId(filtroAlumno, this.datosFormulario.alumnos));
            const coincideMateria = !filtroMateria || materia === this.obtenerTextoDesdeId(filtroMateria, this.datosFormulario.materias);
            const coincidePeriodo = !filtroPeriodo || periodo === this.obtenerTextoDesdeId(filtroPeriodo, this.datosFormulario.periodos);
            const coincideTipo = !filtroTipo || tipo === this.obtenerTextoDesdeId(filtroTipo, this.datosFormulario.tiposEvaluacion);
            
            fila.style.display = (coincideAlumno && coincideMateria && coincidePeriodo && coincideTipo) ? '' : 'none';
        });
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
        
        const notaData = {
            alumno_id: alumnoId,
            materia_id: materiaId,
            periodo_id: periodoId,
            tipo_evaluacion_id: tipoId,
            valor: parseFloat(valor),
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
            
            if (!response.ok) throw new Error('Error al guardar nota');
            
            const result = await response.json();
            this.mostrarMensaje(result.message, 'success');
            this.cerrarModalNota();
            await this.cargarNotas();
        } catch (error) {
            console.error('Error:', error);
            this.mostrarMensaje('Error al guardar la nota', 'error');
        }
    }

    async editarNota(id) {
      try {
        // Obtener la nota completa desde el servidor
        const response = await fetch(`/api/notas/${id}`, {
          credentials: 'include'
        });

        if (!response.ok) throw new Error('Error al cargar nota');

        const nota = await response.json();

        // Llenar el formulario con los datos
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
        this.mostrarMensaje('Error al cargar la nota para editar', 'error');
      }
    }

    async eliminarNota(id) {
        if (!confirm('¿Estás seguro de que quieres eliminar esta nota?')) return;
        
        try {
            const response = await fetch(`/api/notas/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            
            if (!response.ok) throw new Error('Error al eliminar nota');
            
            const result = await response.json();
            this.mostrarMensaje(result.message, 'success');
            await this.cargarNotas();
        } catch (error) {
            console.error('Error:', error);
            this.mostrarMensaje('Error al eliminar la nota', 'error');
            console.log(req.userId, req.body);
        }
    }

    mostrarMensaje(mensaje, tipo) {
        // Crear elemento de mensaje
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
        
        // Eliminar después de 3 segundos
        setTimeout(() => {
            document.body.removeChild(mensajeDiv);
        }, 3000);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.notasManager = new NotasManager();
    window.notasManager.init();
});

// Funciones globales para usar desde HTML
function abrirModalNota() {
    window.notasManager.abrirModalNota();
}

function cerrarModalNota() {
    window.notasManager.cerrarModalNota();
}

function guardarNota() {
    window.notasManager.guardarNota();
}

function mostrarSeccion(seccion) {
    document.querySelectorAll('.seccion').forEach(sec => {
        sec.classList.remove('activa');
    });
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('activa');
    });
    
    document.getElementById(`seccion-${seccion}`).classList.add('activa');
    event.target.classList.add('activa');
}