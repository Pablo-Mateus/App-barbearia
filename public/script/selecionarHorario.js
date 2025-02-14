const inputs = document.querySelectorAll("div input");
const botao = document.querySelector(".botao");
const segunda = document.querySelectorAll(".segunda");
const terca = document.querySelectorAll(".terca");
const quarta = document.querySelectorAll(".quarta");
const quinta = document.querySelectorAll(".quinta");
const sexta = document.querySelectorAll(".sexta");
const sabado = document.querySelectorAll(".sabado");
const domingo = document.querySelectorAll(".domingo");
const select = document.querySelectorAll("select");
const selectMinutos = document.querySelectorAll("#minutos");
const mainDesktop = document.querySelector(".desktop");
const mainMobile = document.querySelector(".mobile");
const diasSemana = [
  "segunda",
  "terca",
  "quarta",
  "quinta",
  "sexta",
  "sabado",
  "domingo",
];
selectMinutos.forEach((item) => {
  for (let i = 0; i <= 60; i++) {
    let minutos = i.toString().padStart(2, "0");
    let option = document.createElement("option");
    option.value = `00:${minutos}`;
    option.textContent = `00:${minutos}`;
    item.appendChild(option);
  }
});

select.forEach((item) => {
  if (item.id !== "minutos" && item.id !== "dias") {
    for (let i = 0; i < 24; i++) {
      let hora = i.toString().padStart(2, "0"); // Garante dois dígitos (ex: "01", "02", etc.)
      let option = document.createElement("option");
      option.value = `${hora}:00`;
      option.textContent = `${hora}:00`;
      item.appendChild(option);
    }
  }
});

diasSemana.forEach((item) => {
  let dadosSalvos = JSON.parse(localStorage.getItem(item));
  if (dadosSalvos) {
    let selects = document.querySelectorAll(`.${item}`);
    selects[0].value = dadosSalvos.inicio;
    selects[1].value = dadosSalvos.fim;
    selects[2].value = dadosSalvos.intervalo;
  }
});

async function enviarDados(e) {
  e.preventDefault();
  const dias = [
    {
      dia: "segunda",
      inicio: segunda[0].value,
      fim: segunda[1].value,
      intervalo: segunda[2].value,
    },
    {
      dia: "terca",
      inicio: terca[0].value,
      fim: terca[1].value,
      intervalo: terca[2].value,
    },
    {
      dia: "quarta",
      inicio: quarta[0].value,
      fim: quarta[1].value,
      intervalo: quarta[2].value,
    },
    {
      dia: "quinta",
      inicio: quinta[0].value,
      fim: quinta[1].value,
      intervalo: quinta[2].value,
    },
    {
      dia: "sexta",
      inicio: sexta[0].value,
      fim: sexta[1].value,
      intervalo: sexta[2].value,
    },
    {
      dia: "sabado",
      inicio: sabado[0].value,
      fim: sabado[1].value,
      intervalo: sabado[2].value,
    },
    {
      dia: "domingo",
      inicio: domingo[0].value,
      fim: domingo[1].value,
      intervalo: domingo[2].value,
    },
  ];

  localStorage.clear();
  dias.forEach((item) => {
    localStorage.setItem(item.dia, JSON.stringify(item));
  });

  const requisicao = await fetch("/adicionar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dias),
  });

  const data = await requisicao.json();
  botao.innerText = data.msg;
  console.log(data.msg);
}

botao.addEventListener("click", enviarDados);
