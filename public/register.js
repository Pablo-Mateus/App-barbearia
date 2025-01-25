const botao = document.querySelector(".botao");
const resposta = document.querySelector(".resposta");
const form = document.getElementById("formulario");

async function enviarDados(e) {
  e.preventDefault();
  const json = {};

  const formulario = new FormData(form);
  formulario.forEach((item, indice) => {
    json[indice] = item;
  });
  // localStorage.setItem("nome", json.name);
  document.cookie = `Nome=${json.name}`;
  const response = await fetch("http://localhost:3000/auth/register", {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify(json),
  });

  const data = await response.json();

  if (response.ok && data.redirect) {
    // Verifica se a resposta está OK e tem a URL
    window.location.href = data.redirect; // Redireciona manualmente
  } else {
    document.querySelector(".resposta").innerText = data.msg; // Exibe mensagem de erro
  }
}

formulario.addEventListener("submit", enviarDados);
