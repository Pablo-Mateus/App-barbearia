const inputs = document.querySelectorAll("div input");
const botao = document.querySelector(".botao");
const segunda = document.querySelectorAll(".segunda input");
const terca = document.querySelectorAll(".terca input");
const quarta = document.querySelectorAll(".quarta input");
const quinta = document.querySelectorAll(".quinta input");
const sexta = document.querySelectorAll(".sexta input");
const sabado = document.querySelectorAll(".sabado input");



const dias = {
  segunda: {
    inicio: segunda[0].value,
    fim: segunda[1].value,
    intervalo: segunda[2].value,
  },
  terca: {
    inicio: terca[0].value,
    fim: terca[1].value,
    intervalo: terca[2].value,
  },
  quarta: {
    inicio: quarta[0].value,
    fim: quarta[1].value,
    intervalo: quarta[2].value,
  },
  quinta: {
    inicio: quinta[0].value,
    fim: quinta[1].value,
    intervalo: quinta[2].value,
  },
  sexta: {
    inicio: sexta[0].value,
    fim: sexta[1].value,
    intervalo: sexta[2].value,
  },
  sabado: {
    inicio: sabado[0].value,
    fim: sabado[1].value,
    intervalo: sabado[2].value,
  },
};

function enviarDados(e) {
  const dias = {
    segunda: {
      inicio: segunda[0].value,
      fim: segunda[1].value,
      intervalo: segunda[2].value,
    },
    terca: {
      inicio: terca[0].value,
      fim: terca[1].value,
      intervalo: terca[2].value,
    },
    quarta: {
      inicio: quarta[0].value,
      fim: quarta[1].value,
      intervalo: quarta[2].value,
    },
    quinta: {
      inicio: quinta[0].value,
      fim: quinta[1].value,
      intervalo: quinta[2].value,
    },
    sexta: {
      inicio: sexta[0].value,
      fim: sexta[1].value,
      intervalo: sexta[2].value,
    },
    sabado: {
      inicio: sabado[0].value,
      fim: sabado[1].value,
      intervalo: sabado[2].value,
    },
  };
  e.preventDefault();
  inputs.forEach((item)=>{
    if(item.value > ){

    }
  })
}

botao.addEventListener("click", enviarDados);
