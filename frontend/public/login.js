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
      window.location.href = '/index.html';
    } else {
      alert('Error de login');
    }
            
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    }
});