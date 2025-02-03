const botao = document.querySelector(".botao");
const resposta = document.querySelector(".resposta");
const form = document.getElementById("formulario");
const resetSenha = document.querySelector(".forgotPass");
const email = document.querySelector("#email");

async function enviarDados(e) {
  e.preventDefault();
  const json = {};

  const formulario = new FormData(form);
  formulario.forEach((item, indice) => {
    json[indice] = item;
  });
  const response = await fetch(`/auth/login`, {
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

async function esqueciSenha(e) {
  console.log(email.value);
  e.preventDefault();
  const requisicao = await fetch("/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.value }),
  });
  const data = await requisicao.json();
  resetSenha.innerText = data.msg;
}

resetSenha.addEventListener("click", esqueciSenha);
