// Imports
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
// app.options('*', cors());
const app = express();
const path = require("path");
const axios = require("axios");
const cookieParser = require("cookie-parser");
//Models
const User = require("./models/User");
const Horario = require("./models/horario.js"); // Importa o modelo
const Agendado = require("./models/usuarioAgendado.js");

// app.use(cors());
//Config Json Response
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

function verificarToken(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect("/login");
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET);

    req.user = decoded;
    next();
  } catch (err) {
    console.log(err);
    return res.redirect("/login");
  }
}

function redirecionarSeLogado(req, res, next) {
  const token = req.cookies.token;
  if (token) {
    try {
      jwt.verify(token, process.env.SECRET);
      return res.redirect("/logado");
    } catch (err) {
      next();
    }
  } else {
    next();
  }
}

app.get("/disponiveis", verificarToken, async (req, res) => {
  const diaSemana = req.query.diaSemana;

  try {
    const horarios = await Horario.findOne({ diaSemana: diaSemana });

    const listaHorarios = [];

    for (
      let i = horarios.horaInicio;
      i < horarios.horaFim;
      i += horarios.intervalo + 50
    ) {
      console.log(i);
    }

    if (!horarios) {
      return res
        .status(404)
        .json({ msg: "Nenhum horário disponível para este dia." });
    }

    if (diaSemana == 0) {
      return res
        .status(404)
        .json({ msg: "Nenhum horário disponível para este dia." });
    }

    if (diaSemana == 1) {
      return res
        .status(404)
        .json({ msg: "Nenhum horário disponível para este dia." });
    }

    // function generateTimeSlots(startTime, endTime, interval) {
    //   const timeSlots = [];
    //   function timeToString(timeString) {
    //     const [hours, minutes] = timeString.split(":").map(Number);
    //     const date = new Date();
    //     date.setHours(hours, minutes, 0, 0);
    //     return date;
    //   }

    //   function formatDateTimeString(date) {
    //     const hours = String(date.getHours()).padStart(2, "0");
    //     const minutes = String(date.getMinutes()).padStart(2, "0");
    //     return `${hours}:${minutes}`;
    //   }
    //   let currentTime = timeToString(startTime);
    //   const endTimeDate = timeToString(endTime);

    //   while (currentTime < endTimeDate) {
    //     timeSlots.push(formatDateTimeString(currentTime));
    //     currentTime.setMinutes(currentTime.getMinutes() + interval);
    //   }
    //   timeSlots.push(endTime);

    //   return timeSlots;
    // }
    // const start = horarios.horaInicio;
    // const end = horarios.horaFim;
    // const interval = horarios.intervalo;
    // const timeSlots = generateTimeSlots(start, end, interval);
    // const agendamentos = await Agendado.find({ diaSemana: diaSemana });

    // const horasAgendadas = agendamentos.map((agendamento) => agendamento.hora);
    // const horariosDisponiveis = timeSlots.filter(
    //   (hora) => !horasAgendadas.includes(hora)
    // );

    // res.json({ msg: horariosDisponiveis });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Erro ao buscar horários disponíveis." });
  }
});

app.post("/adicionar", async (req, res) => {
  console.log(req.body);
  try {
    const { diaSemana, horaInicio, horaFim, intervalo } = req.body;
    const minutosInicio = horaInicio * 60;
    const minutosFim = horaFim * 60;
    const data = new Horario({
      diaSemana,
      horaInicio: minutosInicio,
      horaFim: minutosFim,
      intervalo,
    });
    await data.save();
    console.log(horaInicio);
    res.status(200).json({ msg: "Horário adicionado com sucesso!" });
  } catch (err) {
    console.log(err);
  }
});

app.get("/home", redirecionarSeLogado, (req, res) => {
  res.render("home");
});

app.get("/agendar", verificarToken, (req, res) => {
  res.render("agendar");
});

app.get("/login", redirecionarSeLogado, (req, res) => {
  res.render("login");
});

app.get("/register", redirecionarSeLogado, (req, res) => {
  res.render("register");
});

app.get("/logado", verificarToken, (req, res) => {
  res.render("logado");
});

app.get("/logout", verificarToken, (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});

app.get("/agendamentos", verificarToken, (req, res) => {
  res.render("agendamentos");
});

app.get("/mostrarAgendamento", verificarToken, async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    console.log("Token não encontrado");
  }

  const decoded = jwt.verify(token, process.env.SECRET);
  const nomeUsuario = decoded.id;
  try {
    const agendamentos = await Agendado.find({ name: nomeUsuario });
    res.json(agendamentos);
  } catch (err) {
    console.log(err);
  }
});

app.post("/retomarAgendamento", async (req, res) => {
  try {
    await Agendado.deleteOne({ hora: req.body.hora });
    res.status(200).json({ msg: "Horário deletado com sucesso" });
  } catch (err) {
    console.log(err);
  }
});

app.post("/criarAgendamento", async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    console.log("Token não encontrado");
  }

  const decoded = jwt.verify(token, process.env.SECRET);
  const nomeUsuario = decoded.id;

  try {
    const horaAgendada = new Agendado({
      name: nomeUsuario,
      diaSemana: req.body.diaSemana,
      dia: req.body.dia,
      mes: req.body.mes,
      ano: req.body.ano,
      hora: req.body.hora,
      servico: req.body.servico,
      horario: req.body.horario,
    });

    await horaAgendada.save();
    res.status(200).json({ msg: "Horário agendado com sucesso" });
  } catch (err) {
    console.log(err);
  }
});

//Register User
app.post("/auth/register", async (req, res) => {
  const { name, email, password, confirmpassword } = req.body;

  if (!name) {
    return res.json({ msg: "O nome é obrigatório" });
  }

  if (!email) {
    return res.json({ msg: "O email é obrigatório" });
  }

  if (!password) {
    return res.status(422).json({ msg: "A senha é obrigatório" });
  }

  if (password !== confirmpassword) {
    return res.status(422).json({ msg: "As senhas não conferem" });
  }

  try {
    //Check if user exists
    const userExists = await User.findOne({ email: email });

    if (userExists) {
      return res.status(422).json({ msg: "Por favor utilize outro email." });
    }

    //Create password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    //Create User
    const user = new User({
      name,
      email,
      password: passwordHash,
    });
    await user.save();

    const token = jwt.sign({ id: user.name }, process.env.SECRET, {
      expiresIn: "1h",
    });
    res.cookie("token", token, { httpOnly: true });
    res.json({ redirect: "/logado" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde.",
    });
  }
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  //Validations

  if (!email) {
    return res.status(402).json({ msg: "O email é obrigatório!" });
  }

  if (!password) {
    return res.status(402).json({ msg: "A senha é obrigatória!" });
  }

  //Check if user exists
  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(404).json({ msg: "Usuário não encontado!" });
  }

  //Check password match
  const checkPassword = await bcrypt.compare(password, user.password);

  if (!checkPassword) {
    return res.status(422).json({ msg: "Senha inválida" });
  }

  try {
    const secret = process.env.SECRET;
    const token = jwt.sign(
      {
        id: user.name,
      },
      secret
    );
    res.cookie("token", token, { httpOnly: true });
    res.json({ redirect: "/logado" });
  } catch (err) {
    res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde.",
    });
  }
});
mongoose
  .connect("mongodb://localhost:27017/local")
  .then(() => {
    app.listen(3000);
    console.log("Conectou ao banco");
  })
  .catch((err) => {
    console.log(err);
  });
