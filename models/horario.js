const mongoose = require("mongoose");

const horarioSchema = new mongoose.Schema({
  diaSemana: { type: Number, required: true },
  horaInicio: { type: Number, required: true },
  horaFim: { type: Number, required: true },
  intervalo: { type: Number, required: true },
  horasTotais: { type: Array, require: true },
});

const Horario = mongoose.model("Horario", horarioSchema);
module.exports = Horario;
