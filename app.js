const express = require("express");
const cors = require("cors");
const mainRouter = require("./src/router/router");
var Bugsnag = require("@bugsnag/js");
var BugsnagPluginExpress = require("@bugsnag/plugin-express");
require("dotenv").config();

let apiKey = process.env.BUGSNAG_KEY;
Bugsnag.start({
  apiKey: apiKey,
  plugins: [BugsnagPluginExpress],
});

const app = express();
let middleware = Bugsnag.getPlugin("express");

app.use(middleware.requestHandler);

app.use(cors());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); //Autorizo recibir solicitudes de este dominio
  res.header("Access-Control-Allow-Credentials", true); //Autorizo recibir solicitudes que incluyan el encabezado con credenciales
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  ); //Autorizo recibir solicitudes con dichos hedears
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE"); //Autorizo las solicitudes tipo GET, POST, OPTIONS, PUT y DELETE.
  next();
});

// server.use(morgan("dev"));

app.use(express.json());

app.use(mainRouter);

app.use(middleware.errorHandler);

module.exports = { app, express };
