//regis.js
const res_nombre = document.getElementById("nombre")    // formulario de registro
const res_apellido = document.getElementById("apellido")    // formulario de registro
const res_email = document.getElementById("email")  // formulario de registro
const res_password = document.getElementById("password")    // formulario de registro

// formularios
const res = document.getElementById('res'); // formulario de registro
// Event Listeners
res.addEventListener('submit', registro);

async function registro(e) {
    e.preventDefault();
    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, apellido , email, password})
        });

        if (response.ok) {
            console.log("Registro exitoso. Ahora puedes iniciar sesión.");
            setTimeout(() => window.location.href = "login.html", 1000);
        } else {
            const data = await response.json();
            console.log("Error al registrarse");
        }
    } catch (error) {
        console.error('Error:', error);
        console.log("Error con la bd");
    }
}