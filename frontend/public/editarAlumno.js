class EditorNotasAlumno {
    constructor() {
        this.alumnoId = new URLSearchParams(window.location.search).get('id');
        this.alumno = null;
        this.notas = [];
    }

    async init() {
        if (!this.alumnoId) {
            this.mostrarMensaje('No se especificó un alumno', 'error');
            return;
        }

        await this.cargarAlumno();
        await this.cargarNotas();
        this.configurarEventos();
    }

    async cargarAlumno() {
        try {
            const res = await fetch(`/api/alumnos/${this.alumnoId}`, { credentials: 'include' });
            if (!res.ok) throw new Error('Error al cargar alumno');
            this.alumno = await res.json();
            document.getElementById('infoAlumno').textContent = 
                `Alumno: ${this.alumno.apellido} ${this.alumno.nombre}`;
        } catch (error) {
            console.error(error);
            this.mostrarMensaje('Error al cargar datos del alumno', 'error');
        }
    }

    async cargarNotas() {
        try {
            const res = await fetch(`/api/notas/alumno/${this.alumnoId}`, { credentials: 'include' });
            if (!res.ok) throw new Error('Error al cargar notas');
            this.notas = await res.json();
            this.renderizarNotas();
        } catch (error) {
            console.error(error);
            this.mostrarMensaje('Error al cargar notas del alumno', 'error');
        }
    }

    renderizarNotas() {
        const tabla = document.getElementById('tablaNotas');
        tabla.innerHTML = '';

        if (!this.notas.length) {
            tabla.innerHTML = `<tr><td colspan="4">Sin notas cargadas</td></tr>`;
            return;
        }

        this.notas.forEach(nota => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${nota.materia_nombre}</td>
                <td>${nota.periodo_nombre}</td>
                <td><input type="number" value="${nota.valor}" data-id="${nota.id}" class="nota-input"></td>
                <td><button class="btn-guardar" data-id="${nota.id}">Guardar</button></td>
            `;
            tabla.appendChild(fila);
        });
    }

    configurarEventos() {
        document.addEventListener('click', async (e) => {
            if (e.target.classList.contains('btn-guardar')) {
                const id = e.target.dataset.id;
                const input = document.querySelector(`.nota-input[data-id="${id}"]`);
                const nuevoValor = parseFloat(input.value);

                if (isNaN(nuevoValor)) {
                    this.mostrarMensaje('Ingrese un número válido', 'error');
                    return;
                }

                await this.guardarNota(id, nuevoValor);
            }
        });
    }

    async guardarNota(id, valor) {
        try {
            const res = await fetch(`/api/notas/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ valor }),
                credentials: 'include'
            });

            if (!res.ok) throw new Error('Error al guardar nota');

            const data = await res.json();
            this.mostrarMensaje(data.message || 'Nota actualizada', 'success');
        } catch (error) {
            console.error(error);
            this.mostrarMensaje('Error al guardar la nota', 'error');
        }
    }

    mostrarMensaje(texto, tipo = 'info') {
        const div = document.createElement('div');
        div.textContent = texto;
        div.className = `mensaje ${tipo}`;
        Object.assign(div.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: tipo === 'success' ? '#28a745' : tipo === 'error' ? '#dc3545' : '#17a2b8',
            color: '#fff',
            padding: '10px 15px',
            borderRadius: '5px',
            zIndex: '9999'
        });
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.editorNotas = new EditorNotasAlumno();
    window.editorNotas.init();
});
