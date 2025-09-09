//boletin.js
document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM
    const usuarioNombre = document.getElementById('usuario-nombre');
    const infoAlumno = document.getElementById('info-alumno');
    const infoCurso = document.getElementById('info-curso');
    const contenedorBoletin = document.getElementById('contenedor-boletin');
    const periodoFilter = document.getElementById('periodo-filter');
    const materiaFilter = document.getElementById('materia-filter');
    const aplicarFiltrosBtn = document.getElementById('aplicar-filtros');
    const imprimirBtn = document.getElementById('imprimir-boletin');
    
    let notasData = [];
    let periodos = [];
    let materias = [];
    
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
                
                // Extraer periodos y materias únicos para los filtros
                periodos = [...new Set(data.map(nota => nota.periodo))];
                materias = [...new Set(data.map(nota => nota.materia))];
                
                // Llenar filtros
                llenarFiltros();
                
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
    
    // Llenar opciones de filtros
    function llenarFiltros() {
        // Limpiar filtros (excepto la opción por defecto)
        while (periodoFilter.options.length > 1) {
            periodoFilter.remove(1);
        }
        
        while (materiaFilter.options.length > 1) {
            materiaFilter.remove(1);
        }
        
        // Agregar periodos
        periodos.forEach(periodo => {
            const option = document.createElement('option');
            option.value = periodo;
            option.textContent = periodo;
            periodoFilter.appendChild(option);
        });
        
        // Agregar materias
        materias.forEach(materia => {
            const option = document.createElement('option');
            option.value = materia;
            option.textContent = materia;
            materiaFilter.appendChild(option);
        });
    }
    
    // Aplicar filtros al boletín
    function aplicarFiltros() {
        let notasFiltradas = [...notasData];
        
        // Filtrar por periodo
        if (periodoFilter.value !== 'todos') {
            notasFiltradas = notasFiltradas.filter(nota => nota.periodo === periodoFilter.value);
        }
        
        // Filtrar por materia
        if (materiaFilter.value !== 'todos') {
            notasFiltradas = notasFiltradas.filter(nota => nota.materia === materiaFilter.value);
        }
        
        // Mostrar boletín filtrado
        mostrarBoletin(notasFiltradas);
    }
    
    // Mostrar boletín en una tabla
    function mostrarBoletin(notas) {
        if (notas.length === 0) {
            contenedorBoletin.innerHTML = '<p class="sin-notas">No hay notas para mostrar con los filtros seleccionados.</p>';
            return;
        }
        
        // Agrupar notas por materia y periodo
        const notasPorMateria = {};
        notas.forEach(nota => {
            if (!notasPorMateria[nota.materia]) {
                notasPorMateria[nota.materia] = {};
            }
            
            if (!notasPorMateria[nota.materia][nota.periodo]) {
                notasPorMateria[nota.materia][nota.periodo] = [];
            }
            
            notasPorMateria[nota.materia][nota.periodo].push(nota);
        });
        
        // Crear tabla
        let html = `
            <table class="tabla-boletin">
                <thead>
                    <tr>
                        <th>Materia</th>
        `;
        
        // Encabezados de periodos
        periodos.forEach(periodo => {
            html += `<th>${periodo}</th>`;
        });
        
        html += `<th>Promedio</th></tr></thead><tbody>`;
        
        // Calcular promedios y llenar tabla
        let promedioGeneral = 0;
        let materiasConNotas = 0;
        
        for (const materia in notasPorMateria) {
            html += `<tr><td>${materia}</td>`;
            
            let promedioMateria = 0;
            let evaluacionesMateria = 0;
            
            periodos.forEach(periodo => {
                if (notasPorMateria[materia][periodo]) {
                    const notasPeriodo = notasPorMateria[materia][periodo];
                    const suma = notasPeriodo.reduce((acc, nota) => acc + parseFloat(nota.valor), 0);
                    const promedio = suma / notasPeriodo.length;
                    
                    html += `<td>${promedio.toFixed(2)}</td>`;
                    
                    promedioMateria += promedio;
                    evaluacionesMateria++;
                } else {
                    html += '<td>-</td>';
                }
            });
            
            if (evaluacionesMateria > 0) {
                const promMateria = promedioMateria / evaluacionesMateria;
                html += `<td class="promedio-materia">${promMateria.toFixed(2)}</td>`;
                
                promedioGeneral += promMateria;
                materiasConNotas++;
            } else {
                html += '<td>-</td>';
            }
            
            html += '</tr>';
        }
        
        // Promedio general
        if (materiasConNotas > 0) {
            const promGeneral = promedioGeneral / materiasConNotas;
            html += `
                <tr>
                    <td colspan="${periodos.length}" style="text-align: right; font-weight: bold;">Promedio General:</td>
                    <td class="promedio-general">${promGeneral.toFixed(2)}</td>
                </tr>
            `;
        }
        
        html += '</tbody></table>';
        
        contenedorBoletin.innerHTML = html;
    }
    
    // Event listeners
    aplicarFiltrosBtn.addEventListener('click', aplicarFiltros);
    
    imprimirBtn.addEventListener('click', function() {
        window.print();
    });
    
    document.getElementById('logout-btn').addEventListener('click', async function(e) {
        e.preventDefault();
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
            window.location.href = '/login.html';
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    });
    
    // Inicializar
    cargarDatosUsuario();
});