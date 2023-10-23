// Você pode usar essa seção para selecionar os elementos HTML que vai manipular
const header = document.querySelector("header"); // isso seleciona o elemento header
const menu = document.querySelector(".menu"); // isso seleciona o elemento com a classe menu

// Você pode usar essa seção para definir as funções que vão executar as animações
function shrinkHeader() {
  // essa função vai diminuir a altura do header quando o usuário rolar a página
  header.style.height = "80px"; // isso muda a altura do header para 80 pixels
}

function expandHeader() {
  // essa função vai aumentar a altura do header quando o usuário voltar ao topo da página
  header.style.height = "100vh"; // isso muda a altura do header para 100% da altura da tela
}

// Você pode usar essa seção para definir os eventos que vão disparar as funções
window.addEventListener("scroll", function() {
  // esse evento vai monitorar o scroll da página
  if (window.scrollY > 0) {
    // se o scroll for maior que zero, significa que o usuário rolou a página para baixo
    shrinkHeader(); // então chama a função que diminui o header
  } else {
    // se o scroll for igual a zero, significa que o usuário voltou ao topo da página
    expandHeader(); // então chama a função que aumenta o header
  }
});
