//dashboard.js
let entidadActual = null;
let editandoId = null;

// Función principal para obtener datos de la API
async function fetchData(endpoint, tablaId) {
  try {
    const response = await fetch(`/api/${endpoint}`, { credentials: "include" });
    if (!response.ok) throw new Error('Error en la respuesta del servidor');
    
    const data = await response.json();
    renderTable(data, tablaId, endpoint);
  } catch (error) {
    console.error(`Error cargando ${endpoint}:`, error);
    alert(`Error al cargar los datos de ${endpoint}`);
  }
}

// Renderizar tabla con los datos
function renderTable(data, tablaId, endpoint) {
  const tbody = document.querySelector(`#${tablaId} tbody`);
  tbody.innerHTML = "";

  data.forEach(item => {
    const row = document.createElement('tr');
    
    // Agregar celdas con datos
    Object.values(item).forEach(value => {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.appendChild(cell);
    });

    // Agregar celdas de acciones
    const actionsCell = document.createElement('td');
    actionsCell.innerHTML = `
      <button onclick="abrirModal('${endpoint}', ${item.id})">Editar</button>
      <button onclick="eliminar('${endpoint}', ${item.id})">Eliminar</button>
    `;
    row.appendChild(actionsCell);
    
    tbody.appendChild(row);
  });
}

// Mostrar sección específica
function mostrarSeccion(id) {
  document.querySelectorAll(".seccion").forEach(sec => {
    sec.style.display = "none";
  });
  
  const seccion = document.getElementById(id);
  if (seccion) {
    seccion.style.display = "block";
    fetchData(id, `tabla${id.charAt(0).toUpperCase() + id.slice(1)}`);
  }
}

// Manejo del modal
function abrirModal(entidad, id = null) {
  entidadActual = entidad;
  editandoId = id;
  
  const modal = document.getElementById("modal");
  modal.style.display = "flex";

  const modalTitle = document.getElementById("modal-title");
  const form = document.getElementById("modal-form");
  
  modalTitle.textContent = id ? `Editar ${entidad}` : `Nuevo ${entidad}`;
  form.innerHTML = getFormHTML(entidad, id);

  form.onsubmit = handleFormSubmit;
  
  if (id) cargarDatosExistentes(entidad, id, form);
}

// Obtener HTML del formulario según entidad
function getFormHTML(entidad, id) {
  const forms = {
    usuarios: `
      <label>Nombre</label><input name="nombre" required>
      <label>Apellido</label><input name="apellido" required>
      <label>Email</label><input type="email" name="email" required>
      <label>Rol</label>
      <select name="privilegio_id">
        <option value="1">Admin</option>
        <option value="2">Profesor</option>
        <option value="3">Tutor</option>
        <option value="4">Alumno</option>
      </select>
      ${id ? "" : '<label>Contraseña</label><input type="password" name="password" required>'}
      <button type="submit">${id ? "Guardar cambios" : "Crear"}</button>
    `,
    notas: `
      <label>ID Alumno</label><input name="alumno_id" required>
      <label>Materia</label><input name="materia" required>
      <label>Nota</label><input name="nota" type="number" min="1" max="10" required>
      <button type="submit">${id ? "Guardar cambios" : "Crear"}</button>
    `,
    privilegios: `
      <label>Nombre</label><input name="nombre" required>
      <label>Descripción</label><input name="descripcion" required>
      <button type="submit">${id ? "Guardar cambios" : "Crear"}</button>
    `
  };
  
  return forms[entidad] || '';
}

// Manejar envío del formulario
async function handleFormSubmit(e) {
  e.preventDefault();
  const formData = Object.fromEntries(new FormData(e.target).entries());
  
  try {
    await guardar(entidadActual, formData, editandoId);
    cerrarModal();
    mostrarSeccion(entidadActual);
  } catch (error) {
    console.error("Error al guardar:", error);
    alert("Error al guardar los datos");
  }
}

// Cargar datos existentes para edición
async function cargarDatosExistentes(entidad, id, form) {
  try {
    const response = await fetch(`/api/${entidad}/${id}`, { credentials: "include" });
    if (!response.ok) throw new Error('Error al cargar datos');
    
    const data = await response.json();
    Object.keys(data).forEach(key => {
      if (form.elements[key]) form.elements[key].value = data[key];
    });
  } catch (error) {
    console.error("Error cargando datos:", error);
  }
}

// Cerrar modal
function cerrarModal() {
  document.getElementById("modal").style.display = "none";
}

// Guardar datos (crear o actualizar)
async function guardar(endpoint, data, id = null) {
  const method = id ? "PUT" : "POST";
  const url = id ? `/api/${endpoint}/${id}` : `/api/${endpoint}`;

  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data)
  });

  if (!response.ok) throw new Error('Error al guardar los datos');
}

// Eliminar registro
async function eliminar(endpoint, id) {
  if (!confirm("¿Seguro que deseas eliminar este registro?")) return;
  
  try {
    const response = await fetch(`/api/${endpoint}/${id}`, { 
      method: "DELETE", 
      credentials: "include" 
    });
    
    if (!response.ok) throw new Error('Error al eliminar');
    mostrarSeccion(endpoint);
  } catch (error) {
    console.error("Error eliminando:", error);
    alert("Error al eliminar el registro");
  }
}

// Inicializar aplicación
document.addEventListener('DOMContentLoaded', () => {
  mostrarSeccion("usuarios");
});