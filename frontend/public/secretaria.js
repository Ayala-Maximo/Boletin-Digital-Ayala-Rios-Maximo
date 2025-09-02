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

// Renderizar tabla con los datos (sin mostrar ID)
function renderTable(data, tablaId, endpoint) {
  const tbody = document.querySelector(`#${tablaId} tbody`);
  tbody.innerHTML = "";

  // Filtrar usuarios administradores (asumiendo que privilegio_id = 1 es admin)
  const filteredData = endpoint === 'usuarios' 
    ? data.filter(user => user.privilegio_id !== 1) 
    : data;

  filteredData.forEach(item => {
    const row = document.createElement('tr');
    
    // Agregar celdas con datos (excluyendo el ID)
    const {id, ...itemSinId} = item;
    Object.values(itemSinId).forEach(value => {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.appendChild(cell);
    });

    // Agregar celdas de acciones
    const actionsCell = document.createElement('td');
    
    // Solo mostrar botón de eliminar para estudiantes (privilegio_id = 4)
    const isEstudiante = item.privilegio_id == 4;
    
    actionsCell.innerHTML = `
      <button onclick="abrirModal('usuarios', ${item.id})">Editar</button>
      ${isEstudiante ? `<button onclick="eliminar('usuarios', ${item.id})">Eliminar</button>` : ''}
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
  
  modalTitle.textContent = `Editar ${entidad}`;
  form.innerHTML = getFormHTML(entidad, id);

  form.onsubmit = handleFormSubmit;
  
  if (id) cargarDatosExistentes(entidad, id, form);
}

// Obtener HTML del formulario según entidad (solo para edición de privilegios)
function getFormHTML(entidad, id) {
  const forms = {
    usuarios: `
      <label>Rol</label>
      <select name="privilegio_id" required>
        <option value="2">Profesor</option>
        <option value="3">Tutor</option>
        <option value="4">Alumno</option>
      </select>
      <button type="submit">Guardar cambios</button>
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
    
    // Solo establecer el valor del campo de privilegio
    if (form.elements['privilegio_id']) {
      form.elements['privilegio_id'].value = data.privilegio_id;
    }
  } catch (error) {
    console.error("Error cargando datos:", error);
  }
}

// Cerrar modal
function cerrarModal() {
  document.getElementById("modal").style.display = "none";
}

// Guardar datos (solo actualizar)
async function guardar(endpoint, data, id = null) {
  let url = `/api/${endpoint}/${id}`;
  let method = "PUT";

  // Si es usuarios y solo estamos cambiando el rol → usar PATCH /usuarios/:id/rol
  if (endpoint === "usuarios" && Object.keys(data).length === 1 && data.privilegio_id) {
    url = `/api/${endpoint}/${id}/rol`;
    method = "PATCH";
  }

  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data)
  });

  if (!response.ok) throw new Error("Error al guardar los datos");
}
// Eliminar registro (solo para estudiantes)
async function eliminar(endpoint, id) {
  if (!confirm("¿Seguro que deseas eliminar este estudiante?")) return;
  
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

// Cerrar sesión
document.getElementById("logout-btn").addEventListener("click", async () => {
  try {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    window.location.href = "/login.html";
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
});

// Inicializar aplicación
document.addEventListener('DOMContentLoaded', () => {
  mostrarSeccion("usuarios");
});