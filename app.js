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
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.USER,
    pass: process.env.PASS,
  },
});

async function main() {
  const info = await transporter.sendMail({
    from: `<${process.env.USER}>`,
   
  });
}

main().catch(console.error);

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

app.get("/definirHorario", (req, res) => {
  res.render("definirHorario");
});

app.get("/disponiveis", verificarToken, async (req, res) => {
  const diaSemana = req.query.diaSemana;
  try {
    const horarios = await Horario.findOne({ diaSemana: diaSemana });

    if (!horarios) {
      return res
        .status(404)
        .json({ msg: "Nenhum horário disponível para este dia." });
    }

    // if (diaSemana == 0) {
    //   return res
    //     .status(404)
    //     .json({ msg: "Nenhum horário disponível para este dia." });
    // }

    // if (diaSemana == 1) {
    //   return res
    //     .status(404)
    //     .json({ msg: "Nenhum horário disponível para este dia." });
    // }

    res.json({ msg: horarios.horasTotais });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Erro ao buscar horários disponíveis." });
  }
});

app.post("/removerHorario", async (req, res) => {
  try {
    const horarios = await Horario.findOne({ diaSemana: req.body.diaSemana });
    const tempoServico = +req.body.horario;
    const arrayHora = req.body.hora.split(":").map(Number);

    let horarioConvertido = 0;
    const arrayMinutes = [];
    horarioConvertido = arrayHora[0] * 60 + arrayHora[1];

    horarios.horasTotais.forEach((item, indice) => {
      const [hora, minuto] = item.split(":").map(Number);
      arrayMinutes[indice] = hora * 60 + minuto;
    });
    const tempoTotal = horarioConvertido + tempoServico;
    const novoArray = [];
    const posicaoHora = arrayMinutes.indexOf(horarioConvertido);

    for (let i = posicaoHora; i < arrayMinutes.length; i++) {
      if (arrayMinutes[i] < tempoTotal) {
        novoArray.push(arrayMinutes[i]);
      }
    }

    const arrayFormatado = [];
    let horaInteira = 0;
    novoArray.forEach((item, index) => {
      const horaInteira = Math.floor(item / 60);
      const minutosRestantes = item % 60;
      arrayFormatado.push(
        `${horaInteira}:${minutosRestantes.toString().padStart(2, "0")}`
      );
    });

    await Horario.updateOne(
      { diaSemana: req.body.diaSemana },
      { $pull: { horasTotais: { $in: arrayFormatado } } }
    );

    let agendado = await Agendado.findOne({
      diaSemana: req.body.diaSemana,
    });
    agendado.horarios = arrayFormatado;
    await agendado.save();
    const stringHora = arrayFormatado.toString();

    res.status(200).json({ msg: stringHora });
  } catch {
    res.status(404).json({ msg: "Houve um erro ao remover horário" });
  }
});

app.post("/adicionar", async (req, res) => {
  try {
    const dias = req.body;
    const diasSemanaMap = {
      domingo: 0,
      segunda: 1,
      terca: 2,
      quarta: 3,
      quinta: 4,
      sexta: 5,
      sabado: 6,
    };

    for ([index, item] of dias.entries()) {
      if (
        item.inicio === "00:00" ||
        item.fim === "00:00" ||
        item.intervalo == "00:00"
      ) {
        await Horario.deleteOne({
          diaSemana: diasSemanaMap[item.dia],
        });
        console.log(`Horário do dia ${item.dia} não adicionado`);
      } else {
        let diaSemana = diasSemanaMap[item.dia];
        const horaInicio = item.inicio;
        const horaInicioFormat = +horaInicio.split(":")[0];
        const horaFim = item.fim;
        const horaFimFormat = +horaFim.split(":")[0];
        const intervalo = item.intervalo;
        const intervaloFormat = +intervalo.split(":")[1];

        const minutosInicio = horaInicioFormat * 60;
        const minutosFim = horaFimFormat * 60;
        let horario = await Horario.findOne({
          diaSemana: diaSemana,
        });

        horario ??= new Horario();

        horario.diaSemana = diaSemana;
        horario.horaInicio = minutosInicio;
        horario.horaFim = minutosFim;
        horario.intervalo = intervaloFormat;
        if (minutosInicio > minutosFim) {
          res.status(400).json({
            msg: `Você precisar adicionar o final do expediente de ${item.dia} com um horário maior`,
          });
        } else {
          await horario.save();
        }
      }

      const horarios = await Horario.find();
      for (const horario of horarios) {
        const listaHorarios = [];
        let horaInteira = 0;
        let minutos = 0;
        for (
          let i = horario.horaInicio;
          i <= horario.horaFim;
          i += horario.intervalo
        ) {
          minutos = i % 60;
          horaInteira = i / 60;
          listaHorarios.push(
            `${Math.floor(horaInteira)}:${minutos.toString().padStart(2, "0")}`
          );
        }
        horario.horasTotais = listaHorarios;
        await horario.save();
      }
    }

    res.status(200).json({ msg: "Horário adicionado com sucesso!" });
  } catch (err) {
    console.log(err);
  }
});

app.get("/home", redirecionarSeLogado, (req, res) => {
  res.render("home");
});

app.get("/agendar", verificarToken, (req, res) => {
  if (req.query.servico === undefined) {
    res.redirect("/logado");
  }
  res.render("agendar");
});

app.get("/login", redirecionarSeLogado, (req, res) => {
  res.render("login");
});

app.get("/register", redirecionarSeLogado, (req, res) => {
  res.render("register");
});

app.get("/logado", verificarToken, (req, res) => {
  const token = req.cookies.token;
  const decoded = jwt.verify(token, process.env.SECRET);
  if (decoded.id === "felipe@gmail.com") {
    res.redirect("/logadoBarbeiro");
  }
  if (decoded.id !== "felipe@gmail.com") {
    res.render("logado");
  }
});

app.get("/clientes", verificarToken, (req, res) => {
  const token = req.cookies.token;
  const decoded = jwt.verify(token, process.env.SECRET);
  req.user = decoded;
  if (decoded.id === "felipe@gmail.com") {
    res.render("clientes");
  } else {
    res.redirect("/agendamentos");
  }
});

app.get("/logadoBarbeiro", verificarToken, (req, res) => {
  const token = req.cookies.token;

  const decoded = jwt.verify(token, process.env.SECRET);

  req.user = decoded;
  if (decoded.id === "felipe@gmail.com") {
    res.render("logadoBarbeiro");
  } else {
    res.redirect("logado");
  }
});

app.get("/logout", verificarToken, (req, res) => {
  res.clearCookie("token");
  res.clearCookie("Nome");
  res.redirect("/login");
});

app.get("/agendamentos", verificarToken, (req, res) => {
  const token = req.cookies.token;
  const decoded = jwt.verify(token, process.env.SECRET);
  req.user = decoded;
  if (decoded.id === "felipe@gmail.com") {
    res.redirect("/clientes");
  } else {
    res.render("agendamentos");
  }
});
app.get("/mostrarClientes", verificarToken, async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    console.log("Token não encontrado");
  }

  const decoded = jwt.verify(token, process.env.SECRET);
  const nomeUsuario = decoded.id;
  try {
    const agendamentos = await Agendado.find({});
    res.json(agendamentos);
  } catch (err) {
    console.log(err);
  }
});
app.get("/mostrarAgendamento", verificarToken, async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    console.log("Token não encontrado");
  }

  const decoded = jwt.verify(token, process.env.SECRET);
  const nomeUsuario = decoded.id;
  try {
    const agendamentos = await Agendado.find({ name: req.cookies.Nome });
    res.json(agendamentos);
  } catch (err) {
    console.log(err);
  }
});

app.post("/retomarAgendamento", async (req, res) => {
  let agendado = await Agendado.findOne({ hora: req.body.hora });

  try {
    await Horario.updateOne(
      { diaSemana: req.body.diaSemana },
      { $addToSet: { horasTotais: { $each: agendado.horarios } } }
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
      name: req.cookies.Nome,
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

    const token = jwt.sign({ id: user.email }, process.env.SECRET, {
      expiresIn: "1h",
    });
    res.cookie("token", token, { httpOnly: true });
    const decoded = jwt.verify(token, process.env.SECRET);

    if (decoded.id === "felipe@gmail.com") {
      res.json({ redirect: "/logadoBarbeiro" });
    }
    if (decoded.id !== "felipe@gmail.com") {
      res.json({ redirect: "/logado" });
    }
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
  res.cookie("Nome", user.name);
  //Check password match
  const checkPassword = await bcrypt.compare(password, user.password);

  if (!checkPassword) {
    return res.status(422).json({ msg: "Senha inválida" });
  }

  try {
    const secret = process.env.SECRET;
    const token = jwt.sign(
      {
        id: user.email,
      },
      secret
    );
    res.cookie("token", token, { httpOnly: true });
    const decoded = jwt.verify(token, process.env.SECRET);

    if (decoded.id === "felipe@gmail.com") {
      res.json({ redirect: "/logadoBarbeiro" });
    }
    if (decoded.id !== "felipe@gmail.com") {
      res.json({ redirect: "/logado" });
    }
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
