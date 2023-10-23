const form = document.querySelector('form');
const errorMessage = document.querySelector('.error-message');

form.addEventListener('submit', async function (event) {
  event.preventDefault();

  const username = document.querySelector('input[name="username"]').value;
  const password = document.querySelector('input[name="password"]').value;

  if (username && password) {
    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.token) {
          localStorage.setItem('jwt', data.token);
          
          // Redirecionar para a página home com o token no URL
          window.location.href = `/home/${username}?token=${data.token}`;
        } else {
          errorMessage.textContent = 'Usuário ou senha inválidos!';
          errorMessage.style.display = 'block';
        }
      } else {
        errorMessage.textContent = data.error || 'Erro ao fazer login!';
        errorMessage.style.display = 'block';
      }
    } catch (error) {
      console.error(error);
      errorMessage.textContent = 'Erro ao fazer login!';
      errorMessage.style.display = 'block';
    }
  } else {
    alert('Por favor, preencha todos os campos!');
  }
});
