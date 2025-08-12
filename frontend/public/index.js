fetch('/api/verificador', {
  method: 'POST',
  credentials: 'include', // Necesario para cookies
});
document.getElementById('logout-btn').addEventListener('click', async function(e) {
  e.preventDefault();
  try {
    // Llamar al endpoint de logout
    const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include' // Necesario para cookies
    });
    
    if (response.ok) {
      alert('Sesión cerrada correctamente');
      window.history.replaceState(null, '', '/login.html');
      window.location.href = '/login.html';
      console.log("logout")
    }
  } catch (error) {
    console.error('Error al cerrar sesión:', error);} 
});
