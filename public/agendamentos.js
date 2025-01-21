async function mostrarAgendamento() {
  try {
    const response = await fetch("/mostrarAgendamento");
    const data = await response.json();
    console.log(data);
    const dia = document.querySelector("#dia");
    data.forEach((item) => {
      if (item.mes === 0) {
        item.mes = 1;
      }
      const divContainer = document.createElement("div");
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
      servico.classList.add("servico")
      const tempo = document.createElement("h2");
      tempo.classList.add("tempo")
      servico.innerText = `Servico: ${item.servico}`;
      tempo.innerText = `Tempo: ${item.horario} minutos`;
      novoLi.textContent = item.hora
      divContainer.appendChild(novaDiv);
      novaDiv.appendChild(novoLi);
      divContainer.appendChild(servico);

      divContainer.appendChild(tempo);
    });
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

    async function removerHora(botao) {
      botao.preventDefault();
      const h2Element = document
        .querySelector("li.mudarCor")
        .closest("div").previousSibling;
      listaLi.forEach(async (item) => {
        if (item.classList.contains("mudarCor")) {
          const informacoes = {
            dia: h2Element.textContent,
            hora: item.textContent,
          };
          try {
            const requisicao = await fetch("/retomarAgendamento", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(informacoes),
            });
            const data = await requisicao.json();
            botaoEnviar.innerHTML = data.msg;
            setTimeout(() => {
              window.location.replace("/agendamentos");
            }, 2000);
          } catch (err) {
            botaoEnviar.innerHTML = err;
          }
        }
      });
    }
    const botaoEnviar = document.querySelector("#data-hora");
    botaoEnviar.addEventListener("click", removerHora);
  } catch (err) {
    console.log(err);
  }
}

mostrarAgendamento();


