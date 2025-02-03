const password = document.querySelector("#password");
const confirmpassword = document.querySelector("#confirmpassword");

const token = document.querySelector("#token");
const botao = document.querySelector(".botao");

async function redefinir(e) {
  e.preventDefault();

  const requisicao = await fetch(`/reset-password?token=${token.value}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      password: password.value,
      confirmpassword: confirmpassword.value,
    }),
  });
  const response = await requisicao.json();
  const resposta = document.querySelector(".resposta");
  resposta.innerText = response.msg;
  if (requisicao.ok) {
    setTimeout(() => {
      window.location.href = response.redirect;
    }, 2000);
  }
}

botao.addEventListener("click", redefinir);
