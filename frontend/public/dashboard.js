async function fetchData(endpoint, tablaId) {
  try {
    const res = await fetch(`/api/${endpoint}`, { credentials: "include" });
    const data = await res.json();

    const tbody = document.querySelector(`#${tablaId} tbody`);
    tbody.innerHTML = "";

    data.forEach(item => {
      let row = "<tr>";
      for (let key in item) {
        row += `<td>${item[key]}</td>`;
      }
      row += `<td>
                <button onclick="editar('${endpoint}', ${item.id})">Editar</button>
                <button onclick="eliminar('${endpoint}', ${item.id})">Eliminar</button>
              </td>`;
      row += "</tr>";
      tbody.innerHTML += row;
    });
  } catch (err) {
    console.error("Error cargando datos:", err);
  }
}

function mostrarSeccion(id) {
  document.querySelectorAll(".seccion").forEach(sec => sec.style.display = "none");
  document.getElementById(id).style.display = "block";

  if (id === "usuarios") fetchData("usuarios", "tablaUsuarios");
  if (id === "notas") fetchData("notas", "tablaNotas");
  if (id === "privilegios") fetchData("privilegios", "tablaPrivilegios");
}

async function eliminar(endpoint, id) {
  if (!confirm("¿Seguro que deseas eliminar este registro?")) return;

  try {
    await fetch(`/api/${endpoint}/${id}`, { method: "DELETE", credentials: "include" });
    mostrarSeccion(endpoint);
  } catch (err) {
    console.error("Error eliminando:", err);
  }
}

function editar(endpoint, id) {
  alert(`Aquí abrirías un modal para editar el registro ${id} de ${endpoint}`);
}

document.getElementById("logout-btn").addEventListener("click", async () => {
  await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
  window.location.href = "/login.html";
});

// Inicial
mostrarSeccion("usuarios");
