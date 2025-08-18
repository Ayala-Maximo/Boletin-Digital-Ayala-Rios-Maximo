document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('/api/auth/check-session', {
            method: 'GET',
            credentials: 'include'
        });

        const data = await res.json();

        if (data.loggedIn) {
            window.location.href = data.redirectUrl;
            return; // Evita que se muestre el formulario
        }
    } catch (err) {
        console.log("No hay sesión activa.");
    }
});

document.getElementById('log').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('log-email').value;
    const password = document.getElementById('log-password').value;
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include' 
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en la autenticación');
      }

      console.log('¡Login exitoso!');
      
        if (data.success) {
            window.location.href = data.redirectUrl;
        } else {
            alert('Error de login');
        }
            
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    }
});