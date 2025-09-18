document.addEventListener('DOMContentLoaded', function() {
    const usuarioNombre = document.getElementById('usuario-nombre');
    const infoAlumno = document.getElementById('info-alumno');
    const contenedorBoletin = document.getElementById('contenedor-boletin');

    // --- Cargar datos del usuario ---
    async function cargarDatosUsuario() {
        try {
            const res = await fetch('/api/auth/check-session', { credentials: 'include' });
            if (!res.ok) throw new Error();
            const data = await res.json();

            if (!data.loggedIn) return window.location.href = '/login.html';

            usuarioNombre.textContent = `${data.user.nombre} ${data.user.apellido}`;
            infoAlumno.textContent = `${data.user.nombre} ${data.user.apellido}`;
            await cargarBoletin(data.user.id);

        } catch (err) {
            console.error(err);
            window.location.href = '/login.html';
        }
    }

    // --- Cargar boletín de notas ---
    async function cargarBoletin(alumnoId) {
        try {
            const res = await fetch(`/api/notas/alumno/${alumnoId}`, { credentials: 'include' });
            if (!res.ok) throw new Error();
            const notas = await res.json();
            mostrarBoletin(notas);
        } catch (err) {
            console.error(err);
            contenedorBoletin.innerHTML = '<p class="sin-notas">Error al cargar el boletín.</p>';
        }
    }

    // --- Generar tabla de doble entrada ---
    function mostrarBoletin(notas) {
        if (!notas || notas.length === 0) {
            contenedorBoletin.innerHTML = '<p class="sin-notas">No hay notas para mostrar.</p>';
            return;
        }

        // Materias únicas
        const materias = [...new Set(notas.map(n => n.materia))];
        
        // --- MODIFICACIÓN: Cambiar el orden de los tipos de evaluación ---
        const ordenTipos = ['Primer Informe', 'Segundo Informe','Recuperatorio Noviembre','Recuperatorio Marzo', 'Nota Final']; // Se actualizó a 'Nota Final'
        const tipos = [...new Set(notas.map(n => n.tipo_evaluacion || 'Evaluación'))].sort((a, b) => {
            return ordenTipos.indexOf(a) - ordenTipos.indexOf(b);
        });

        // Mapa: tipo -> materia -> nota
        const tablaNotas = {};
        tipos.forEach(t => tablaNotas[t] = {});
        notas.forEach(n => {
            const tipo = n.tipo_evaluacion || 'Evaluación';
            tablaNotas[tipo][n.materia] = n.valor;
        });

        // Construir tabla
        let html = `
            <table>
                <thead>
                    <tr>
                        <th>ASIGNATURAS</th>
                        ${materias.map(m => `<th>${m}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
        `;

        tipos.forEach(tipo => {
            html += `<tr><td>${tipo}</td>`;
            materias.forEach(m => {
                const nota = tablaNotas[tipo][m] ?? '';
                html += `<td>${nota}</td>`;
            });
            html += `</tr>`;
        });

        html += `</tbody></table>`;

        contenedorBoletin.innerHTML = html;
    }

    cargarDatosUsuario();
});