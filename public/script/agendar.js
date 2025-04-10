document.addEventListener("DOMContentLoaded", function () {
  const calendarioMes = document.getElementById("calendario-mes");
  const mesAnoTexto = document.getElementById("mes-ano");
  const btnPrev = document.getElementById("prev");
  const btnNext = document.getElementById("next");
  const host = window.location.hostname;
  const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const meses = [
    { nome: "Janeiro", dias: 31 },
    { nome: "Fevereiro", dias: 28 }, // Ajuste para ano bissexto será feito abaixo
    { nome: "Março", dias: 31 },
    { nome: "Abril", dias: 30 },
    { nome: "Maio", dias: 31 },
    { nome: "Junho", dias: 30 },
    { nome: "Julho", dias: 31 },
    { nome: "Agosto", dias: 31 },
    { nome: "Setembro", dias: 30 },
    { nome: "Outubro", dias: 31 },
    { nome: "Novembro", dias: 30 },
    { nome: "Dezembro", dias: 31 },
  ];

  let mesAtual = new Date().getMonth();
  const anoAtual = new Date().getFullYear();

  // Função para verificar se o ano é bissexto
  function isAnoBissexto(ano) {
    return (ano % 4 === 0 && ano % 100 !== 0) || ano % 400 === 0;
  }

  // Ajustar fevereiro para ano bissexto
  if (isAnoBissexto(anoAtual)) {
    meses[1].dias = 29; // Ajusta Fevereiro para 29 dias
  }

  // Função para criar o calendário de um mês
  function criarCalendarioMes(nomeMes, diasNoMes, primeiroDia) {
    calendarioMes.innerHTML = ""; // Limpa o calendário antes de gerar o novo

    const diasSemanaDiv = document.createElement("div");
    diasSemanaDiv.classList.add("dias-semana");
    diasSemana.forEach((dia) => {
      const diaSemana = document.createElement("div");
      diaSemana.classList.add("dia-semana");
      diaSemana.innerText = dia;
      diasSemanaDiv.appendChild(diaSemana);
    });
    calendarioMes.appendChild(diasSemanaDiv);

    const diasDiv = document.createElement("div");
    diasDiv.classList.add("dias");

    // Preencher os dias do mês
    for (let i = 0; i < primeiroDia; i++) {
      const emptyDiv = document.createElement("div");
      diasDiv.appendChild(emptyDiv);
    }
    for (let dia = 1; dia <= diasNoMes; dia++) {
      const diaDiv = document.createElement("div");
      diaDiv.classList.add("dia");
      diaDiv.innerText = dia;
      diasDiv.appendChild(diaDiv);
    }

    calendarioMes.appendChild(diasDiv);
  }

  // Função para calcular o primeiro dia da semana de um mês
  function primeiroDiaDoMes(ano, mes) {
    return new Date(ano, mes, 1).getDay();
  }

  // Função para atualizar o calendário exibido
  function atualizarCalendario() {
    const primeiroDia = primeiroDiaDoMes(anoAtual, mesAtual);
    const mes = meses[mesAtual];
    mesAnoTexto.innerText = `${mes.nome} ${anoAtual}`;
    criarCalendarioMes(mes.nome, mes.dias, primeiroDia);
    enviarDados();
  }

  // Eventos de navegação
  btnPrev.addEventListener("click", function () {
    mesAtual = mesAtual === 0 ? 11 : mesAtual - 1;
    atualizarCalendario();
  });

  btnNext.addEventListener("click", function () {
    mesAtual = mesAtual === 11 ? 0 : mesAtual + 1;
    atualizarCalendario();
  });

  // Inicializar o calendário com o mês atual
  atualizarCalendario();

  function enviarDados() {
    const diasSemana = document.querySelectorAll(".dia");
    let diaSelecionadoGlobal = null;
    let diaSemanaGlobal = null;

    diasSemana.forEach((item) => {
      item.addEventListener("click", async function captarDia(item) {
        const diaSelecionado = item.target.textContent;
        const dataSelecionada = new Date(anoAtual, mesAtual, diaSelecionado);
        const diaSemana = dataSelecionada.getDay();
        diaSemanaGlobal = dataSelecionada.getDay();

        const response = await fetch(`/disponiveis?diaSemana=${diaSemana}`);
        const data = await response.json();

        const botaoHora = document.querySelector(".botao-hora");
        const divContainer = document.querySelector(".horas");
        if (mesAtual !== new Date().getMonth()) {
          divContainer.innerHTML = "";
          return;
        }

        divContainer.innerHTML = "";
        if (response.status === 404) {
          const mensagem = document.createElement("h1");
          mensagem.classList.add("erro");
          mensagem.innerHTML = data.msg;
          divContainer.appendChild(mensagem);
        }

        data.msg.forEach((item, indice) => {
          const horas = document.createElement("div");
          horas.innerHTML = data.msg[indice];
          divContainer.appendChild(horas);

          horas.addEventListener("click", function mudarCor(item) {
            const listaDiv = document.querySelectorAll(".horas div");
            listaDiv.forEach((item) => {
              item.classList.remove("ativo2");
            });
            item.target.classList.toggle("ativo2");
          });
        });

        const div = item.target;
        diaSelecionadoGlobal = item.target.textContent;

        diasSemana.forEach((item) => {
          item.classList.remove("ativo");
        });
        div.classList.toggle("ativo");
      });
    });

    const botaoEnviar = document.querySelector("#data-hora");
    async function botaoEnviarF(item) {
      item.preventDefault();
      botaoEnviar.innerText = "Aguarde";
      function getqueryParams() {
        const params = new URLSearchParams(window.location.search);
        return {
          servico: params.get("servico"),
          horario: params.get("horario"),
        };
      }
      const { servico, horario } = getqueryParams();

      const listaDiv = document.querySelectorAll(".horas div");
      for (const item of listaDiv) {
        if (
          item.classList.contains("ativo2") &&
          servico !== null &&
          horario !== null
        ) {
          const hora = item.textContent;
          console.log(item.textContent);
          const informacoes = {
            name: document.cookie.name,
            diaSemana: diaSemanaGlobal,
            dia: diaSelecionadoGlobal,
            mes: mesAtual,
            ano: anoAtual,
            hora: hora,
            servico: servico,
            horario: horario,
          };

          await fetch(`/criarAgendamento`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(informacoes),
          });

          await fetch(`/removerHorario`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(informacoes),
          });

          botaoEnviar.innerText = "Horário agendado com sucesso";
          setTimeout(() => {
            location.replace(`/agendamentos`);
          }, 2000);
        }

        if (servico === null && horario === null) {
          botaoEnviar.innerText = "Você precisa selecionar um serviço";
        }
      }
    }
    botaoEnviar.addEventListener("click", botaoEnviarF);
  }
});
