const botao = document.querySelector(".botao");
const resposta = document.querySelector(".resposta");
const form = document.getElementById("formulario");
const telefone = document.querySelector("#telefone");
const email = document.querySelector("#email");

const regex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}(?:\.[a-z]{2})?$/i;

function validarEmail(email) {
  if (!regex.test(email.value)) {
    resposta.innerHTML = "Email inválido";
    return false;
  } else {
    resposta.innerHTML = "";
    return true;
  }
}

function aplicarMascara(input) {
  let telefone = input.value.replace(/\D/g, "");
  if (telefone.length > 10) {
    telefone = telefone.replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  } else if (telefone.length > 5) {
    telefone = telefone.replace(/^(\d{2})(\d{4})/, "($1) $2-");
  } else if (telefone.length > 2) {
    telefone = telefone.replace(/^(\d{2})/, "($1) ");
  }

  input.value = telefone;
}

function validarTelefone(input) {
  const telefone = input.value.trim();
  const regexTelefone = /^\(\d{2}\) \d{4,5}-\d{4}$/;
  const erroTelefone = document.querySelector("#erro-telefone");

  if (!regexTelefone.test(telefone)) {
    resposta.innerText =
      "Número de telefone inválido. Use o formato (00) 00000-0000 ou (00) 0000-0000";
    return false;
  } else {
    resposta.innerText = "";
    return true;
  }
}

async function enviarDados(e) {
  e.preventDefault();

  const telefoneValido = validarTelefone(telefone);
  const emailValido = validarEmail(email);

  if (!telefoneValido || !emailValido) {
    resposta.innerHTML =
      "Não foi foi possível prosseguir com o envio dos dados email ou telefone inválidos";
    return;
  }

  const json = {};

  const formulario = new FormData(form);
  formulario.forEach((item, indice) => {
    json[indice] = item;
  });
  document.cookie = `Nome=${json.name}`;
  const host = window.location.hostname;
  const response = await fetch(`/auth/register`, {
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
