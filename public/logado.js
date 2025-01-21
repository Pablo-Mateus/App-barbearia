const botaoReserva = document.querySelectorAll(".botao-reserva");

botaoReserva.forEach((item) => {
  console.log(item);
  item.addEventListener("click", () => {
    const servico = item.getAttribute("data-servico");
    const hora = item.getAttribute("data-horaServico");

    window.location.href = `agendar?servico=${encodeURIComponent(
      servico
    )}&horario=${encodeURIComponent(hora)}`;
  });
});
