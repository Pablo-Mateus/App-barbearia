async function mostrarAgendamento() {
  try {
    const host = window.location.hostname;
    const response = await fetch("/mostrarClientes");
    const data = await response.json();
    const dia = document.querySelector("#dia");

    for (const item of data) {
      if (item.mes === 0) {
        item.mes = 1;
      }

      const divContainer = document.createElement("div");
      const nome = document.createElement("h2");
      const nomeMaiusculo =
        item.name.charAt(0).toUpperCase() + item.name.substring(1);
      nome.innerText = nomeMaiusculo;
      divContainer.appendChild(nome);
      divContainer.classList.add("divContainer");
      const novoDia = document.createElement("h2");
      const diaFormat = item.dia.toString().padStart(2, "0");
      const mesFormat = item.mes.toString().padStart(2, "0");
      novoDia.textContent = `${diaFormat}/${mesFormat}/${item.ano}`;
      dia.appendChild(divContainer);
      divContainer.appendChild(novoDia);
      const novaDiv = document.createElement("div");
      const novoLi = document.createElement("li");
      novoLi.classList.add("liHorario");
      const servico = document.createElement("h2");
      servico.classList.add("servico");
      const tempo = document.createElement("h2");
      tempo.classList.add("tempo");
      servico.innerText = `Servico: ${item.servico}`;
      const spanTempo = document.createElement("span");
      spanTempo.classList.add("tempoAtual");
      spanTempo.innerHTML = item.horario;
      tempo.appendChild(spanTempo);
      const divTempo = document.createElement("span");

      divTempo.innerText = "Tempo: ";
      tempo.insertAdjacentElement("afterBegin", divTempo);
      novoLi.textContent = item.hora;
      divContainer.appendChild(novaDiv);
      novaDiv.appendChild(novoLi);
      divContainer.appendChild(servico);
      divContainer.appendChild(tempo);
      const negar = document.createElement("a");

      negar.innerText = "cancelar";
      const divStatus = document.createElement("div");
      negar.id = "negar";
      negar.setAttribute("href", "''");
      divStatus.classList.add("div-status");
      divStatus.appendChild(negar);
      divContainer.appendChild(divStatus);
      if (item.status === "pendente") {
        const aceitar = document.createElement("a");
        aceitar.id = "agendamentoAceito";
        aceitar.innerText = "aceitar";
        aceitar.setAttribute("href", "''");
        divStatus.appendChild(aceitar);
      }
    }
    const listaLi = document.querySelectorAll(".container-dia ul div li");

    function mudarCor(item) {
      const li = item.currentTarget;
      listaLi.forEach((campo) => {
        campo.classList.remove("mudarCor");
      });
      li.classList.toggle("mudarCor");
    }

    listaLi.forEach((item) => {
      item.addEventListener("click", mudarCor);
    });
    const botaoEnviar = document.querySelectorAll("#negar");
    const botaoAceitar = document.querySelectorAll("#agendamentoAceito");
    for (const item of botaoEnviar) {
      item.addEventListener("click", removerHora);
    }
    for (const item of botaoAceitar) {
      item.addEventListener("click", aceitarAgendamento);
    }

    async function removerHora(botao) {
      botao.preventDefault();
      const h2Element = document
        .querySelector("li.mudarCor")
        .closest("div").previousSibling;
      for (const item of listaLi) {
        console.log(item);
        if (item.classList.contains("mudarCor")) {
          const informacoes = {
            dia: h2Element.textContent,
            hora: item.textContent,
            diaSemana: data[0].diaSemana,
          };
          try {
            const requisicao = await fetch("/retomarAgendamento", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(informacoes),
            });
            const data = await requisicao.json();
            botao.currentTarget.innerHTML = data.msg;
            setTimeout(() => {
              window.location.replace("/agendamentos");
            }, 2000);
          } catch (err) {
            botao.currentTarget.innerHTML = err;
          }
        }
      }
    }

    async function aceitarAgendamento(botao) {
      botao.preventDefault();
      const h2Element = document
        .querySelector("li.mudarCor")
        .closest("div").previousSibling;
      for (const item of listaLi) {
        const tempoServico = document.querySelector(".tempoAtual").innerText;
        if (item.classList.contains("mudarCor")) {
          const informacoes = {
            dia: h2Element.textContent,
            hora: item.textContent,
            diaSemana: data[0].diaSemana,
            horarios: localStorage.getItem("horarios"),
            status: "true",
          };

          try {
            const requisicao = await fetch("/aceitarAgendamento", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(informacoes),
            });
            const data = await requisicao.json();
            const divStatus = document.querySelector(".div-status");
            botao.currentTarget.innerHTML = data.msg;
            setTimeout(() => {
              window.location.replace("/agendamentos");
            }, 2000);
          } catch (err) {
            botao.currentTarget.innerHTML = err;
          }
        }
      }
    }
  } catch (err) {
    console.log(err);
  }
}

mostrarAgendamento();
