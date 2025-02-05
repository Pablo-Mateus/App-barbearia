const mongoose = require("mongoose");

const agendadoSchema = new mongoose.Schema({
  name: String,
  diaSemana: Number,
  dia: Number,
  mes: Number,
  ano: Number,
  hora: String,
  servico: String,
  horario: String,
  horarios: Array,
  status: String,
  schedule: Date,
});


const Agendado = mongoose.model("Agendado", agendadoSchema);
module.exports = Agendado;
