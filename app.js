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

    res.json({ msg: horarios.horasTotais });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Erro ao buscar horários disponíveis." });
  }
});

app.post("/removerHorario", async (req, res) => {
  const horarios = await Horario.findOne({ diaSemana: req.body.diaSemana });
  const tempoServico = +req.body.horario;
  const horaMarcada = +req.body.hora.replace(":", ".") 
  
  const arrayMinutes = [];

  horarios.horasTotais.forEach((item, indice) => {
    const [hora, minuto] = item.split(":").map(Number);
    arrayMinutes[indice] = hora * 60 + minuto;
  });
  console.log(horaMarcada);

  const tempoTotal = horaMarcada + tempoServico;
  const novoArray = [];

  arrayMinutes.forEach((item, index) => {
    if (horaMarcada < tempoTotal) {
      novoArray[index] = item;
    }
  });

  const arrayFormatado = [];
  let horaInteira = 0;

  novoArray.forEach((item, index) => {
    const horaInteira = Math.floor(item / 60);
    const minutosRestantes = item % 60;
    arrayFormatado.push(
      `${horaInteira}:${minutosRestantes.toString().padStart(2, "0")}`
    );
  });
  console.log(novoArray);
  // for (let i = 0; i < novoArray.length; i++) {
  //   const [hora, minuto] = item.split(":").map(Number);
  //   arrayFormatado[indice] = hora * 60 + minuto;
  //   // horaInteira = (novoArray[i] / 60).toFixed(1).replace(".", ":");

  //   // arrayFormatado.push(horaInteira);
  // }

  await Horario.updateOne(
    { diaSemana: req.body.diaSemana },
    { $pull: { horasTotais: { $in: arrayFormatado } } }
  );
});

// app.post("/criarHorario", verificarToken, async (req, res) => {
//   try {
//     const horarios = await Horario.findOne({ diaSemana: diaSemana });

//     if (!horarios) {
//       return res
//         .status(404)
//         .json({ msg: "Nenhum horário disponível para este dia." });
//     }

//     if (diaSemana == 0) {
//       return res
//         .status(404)
//         .json({ msg: "Nenhum horário disponível para este dia." });
//     }

//     if (diaSemana == 1) {
//       return res
//         .status(404)
//         .json({ msg: "Nenhum horário disponível para este dia." });
//     }

//     const listaHorarios = [];
//     let horaInteira = 0;
//     let minutos = 0;
//     for (
//       let i = horarios.horaInicio;
//       i <= horarios.horaFim;
//       i += horarios.intervalo
//     ) {
//       minutos = i % 60;
//       horaInteira = i / 60;
//       listaHorarios.push(
//         `${Math.floor(horaInteira)}:${minutos.toString().padStart(2, "0")}`
//       );
//     }
//     horarios.horasTotais = listaHorarios;
//     await horarios.save();

//     res.json({ msg: horarios.horasTotais });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ msg: "Erro ao buscar horários disponíveis." });
//   }
// });

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

    const horarios = await Horario.findOne({ diaSemana: diaSemana });

    const listaHorarios = [];
    let horaInteira = 0;
    let minutos = 0;
    for (
      let i = horarios.horaInicio;
      i <= horarios.horaFim;
      i += horarios.intervalo
    ) {
      minutos = i % 60;
      horaInteira = i / 60;
      listaHorarios.push(
        `${Math.floor(horaInteira)}:${minutos.toString().padStart(2, "0")}`
      );
    }
    horarios.horasTotais = listaHorarios;
    await horarios.save();

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
    await Horario.updateOne(
      { diaSemana: req.body.diaSemana },
      { $addToSet: { horasTotais: req.body.hora } }
    );

    const horarios = await Horario.findOne({ diaSemana: req.body.diaSemana });

    horarios.horasTotais.sort((a, b) => {
      const [hourA, minuteA] = a.split(":").map(Number);
      const [hourB, minuteB] = b.split(":").map(Number);
      return hourA - hourB || minuteA - minuteB;
    });
    await horarios.save();

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
  const diaSemana = parseInt(req.body.diaSemana);
  const horaAtual = req.body.hora;
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
  .connect("mongodb://0.0.0.0/local")
  .then(() => {
    app.listen(3000);
    console.log("Conectou ao banco");
  })
  .catch((err) => {
    console.log(err);
  });
