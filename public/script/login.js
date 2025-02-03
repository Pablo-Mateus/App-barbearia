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
  e.preventDefault();
  resetSenha.innerText = "Aguardando...";
  const requisicao = await fetch("/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.value }),
  });
  const data = await requisicao.json();
  resetSenha.innerText = data.msg;
  setTimeout(() => {
    resetSenha.innerText = "Esqueci minha senha";
  }, 1500);
}

resetSenha.addEventListener("click", esqueciSenha);

// const password = document.querySelector("#password");
// const confirmpassword = document.querySelector("#resetpassword");

// const token = document.querySelector("#token");
// const botao = document.querySelector(".botao");

// async function redefinir(e) {
//   e.preventDefault();
//   const requisicao = await fetch(`/auth/reset-password/:${token.value}`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       password: password.value,
//       confirmpassword: confirmpassword.value,
//     }),
//   });
// }

// botao.addEventListener("click", redefinir);
