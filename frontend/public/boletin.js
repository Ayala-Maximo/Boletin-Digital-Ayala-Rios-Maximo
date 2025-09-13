//boletin.js
document.addEventListener('DOMContentLoaded', function() {
    const usuarioNombre = document.getElementById('usuario-nombre');
    const infoAlumno = document.getElementById('info-alumno');
    const infoCurso = document.getElementById('info-curso');
    const contenedorBoletin = document.getElementById('contenedor-boletin');
    
    let notasData = [];
    
    // Cargar datos del usuario y boletín
    async function cargarDatosUsuario() {
        try {
            const response = await fetch('/api/auth/check-session', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.loggedIn) {
                    usuarioNombre.textContent = `${data.user.nombre} ${data.user.apellido}`;
                    infoAlumno.textContent = `Alumno: ${data.user.nombre} ${data.user.apellido}`;
                    
                    // Cargar boletín
                    await cargarBoletin(data.user.id);
                } else {
                    window.location.href = '/login.html';
                }
            } else {
                window.location.href = '/login.html';
            }
        } catch (error) {
            console.error('Error:', error);
            window.location.href = '/login.html';
        }
    }
    
    // Cargar boletín de notas
    async function cargarBoletin(alumnoId) {
        try {
            const response = await fetch(`/api/notas/alumno/${alumnoId}`, {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                notasData = data;
                
                // Obtener información del curso
                await cargarInfoCurso(alumnoId);
                
                // Mostrar boletín
                mostrarBoletin(data);
            } else {
                contenedorBoletin.innerHTML = '<p class="sin-notas">Error al cargar el boletín.</p>';
            }
        } catch (error) {
            console.error('Error:', error);
            contenedorBoletin.innerHTML = '<p class="sin-notas">Error al conectar con el servidor.</p>';
        }
    }
    
    // Cargar información del curso del alumno
    async function cargarInfoCurso(alumnoId) {
        try {
            const response = await fetch(`/api/alumnos/${alumnoId}/curso`, {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.curso) {
                    infoCurso.textContent = `Curso: ${data.curso.nombre}`;
                }
            }
        } catch (error) {
            console.error('Error al cargar información del curso:', error);
        }
    }
    
    // Mostrar boletín organizado por períodos
    function mostrarBoletin(notas) {
        if (notas.length === 0) {
            contenedorBoletin.innerHTML = '<p class="sin-notas">No hay notas para mostrar.</p>';
            return;
        }
        
        // Agrupar notas por período (usamos el nombre del período como clave)
        const notasPorPeriodo = {};
        notas.forEach(nota => {
            if (!notasPorPeriodo[nota.periodo]) {
                notasPorPeriodo[nota.periodo] = {
                    nombre: nota.periodo,
                    notas: []
                };
            }
            notasPorPeriodo[nota.periodo].notas.push(nota);
        });
        
        let html = '';
        const promediosPorMateria = {};
        
        // Generar HTML para cada período
        for (const periodoNombre in notasPorPeriodo) {
            const periodo = notasPorPeriodo[periodoNombre];
            
            html += `
                <div class="periodo-section">
                    <div class="periodo-title">
                        <h3>${periodo.nombre}</h3>
                    </div>
            `;
            
            // Agrupar notas por materia en este período
            const notasPorMateria = {};
            periodo.notas.forEach(nota => {
                if (!notasPorMateria[nota.materia]) {
                    notasPorMateria[nota.materia] = {
                        nombre: nota.materia,
                        notas: [],
                        promedio: 0
                    };
                }
                notasPorMateria[nota.materia].notas.push(nota);
            });
            
            // Calcular promedios por materia en este período
            for (const materiaNombre in notasPorMateria) {
                const materia = notasPorMateria[materiaNombre];
                const suma = materia.notas.reduce((acc, nota) => acc + parseFloat(nota.valor), 0);
                materia.promedio = suma / materia.notas.length;
                
                // Guardar para el promedio general
                if (!promediosPorMateria[materiaNombre]) {
                    promediosPorMateria[materiaNombre] = {
                        nombre: materia.nombre,
                        promedios: []
                    };
                }
                promediosPorMateria[materiaNombre].promedios.push(materia.promedio);
            }
            
            // Crear tabla para el período
            html += `
                <table class="tabla-boletin">
                    <thead>
                        <tr>
                            <th>Materia</th>
                            <th>Notas</th>
                            <th>Promedio</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            // Llenar tabla con materias y notas
            for (const materiaNombre in notasPorMateria) {
                const materia = notasPorMateria[materiaNombre];
                const notasList = materia.notas.map(nota => 
                    `${nota.tipo_evaluacion || 'Evaluación'}: ${nota.valor}`
                ).join(', ');
                
                html += `
                    <tr>
                        <td>${materia.nombre}</td>
                        <td>${notasList}</td>
                        <td class="promedio-materia">${materia.promedio.toFixed(2)}</td>
                    </tr>
                `;
            }
            
            html += `</tbody></table></div>`;
        }
        
        // Calcular y mostrar promedios finales
        html += `<div class="resumen-final">`;
        html += `<h3>Resumen Final</h3>`;
        html += `
            <table class="tabla-boletin">
                <thead>
                    <tr>
                        <th>Materia</th>
                        <th>Promedio Final</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        let promedioGeneral = 0;
        let materiasConPromedio = 0;
        
        for (const materiaNombre in promediosPorMateria) {
            const materia = promediosPorMateria[materiaNombre];
            const promedioFinal = materia.promedios.reduce((acc, prom) => acc + prom, 0) / materia.promedios.length;
            
            html += `
                <tr>
                    <td>${materia.nombre}</td>
                    <td class="nota-final">${promedioFinal.toFixed(2)}</td>
                </tr>
            `;
            
            promedioGeneral += promedioFinal;
            materiasConPromedio++;
        }
        
        // Promedio general
        if (materiasConPromedio > 0) {
            const promGeneral = promedioGeneral / materiasConPromedio;
            html += `
                <tr>
                    <td><strong>Promedio General</strong></td>
                    <td class="promedio-periodo"><strong>${promGeneral.toFixed(2)}</strong></td>
                </tr>
            `;
        }
        
        html += `</tbody></table></div>`;
        
        contenedorBoletin.innerHTML = html;
    }
    
    // Inicializar
    cargarDatosUsuario();
});