const { Router } = require("express");
const { instanciasBot } = require("../general-configs/instances");
const { initializeDatabase } = require("../repositories/turso/turso-create");
const {
  insertMessage,
  readMessages,
} = require("../repositories/turso/turso-repository");

// http://3.85.188.150:3000/welcome

const mainRouter = Router();

mainRouter.get("/welcome", (req, res) => {
  try {
    res.status(200).send("codeGPT says : is all good man?");
  } catch (error) {
    res.status(400).send(error.message);
  }
});

mainRouter.get("/instances", (req, res) => {
  try {
    const keys = Object.keys(instanciasBot);
    const response = {
      " number of instances": keys.length,
      " keys": keys,
    };
    res.status(200).send(response);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

mainRouter.get("/createTable", async (req, res) => {
  try {
    const response = await initializeDatabase();
    res.status(200).send(response);
  } catch (error) {
    res.status(400).send(error.message);
  }
});
mainRouter.get("/message", async (req, res) => {
  try {
    let number = 3014574970;
    let apiKey = "12342dfds5-23eweew-3rwqerew";
    let agentId = "Fdsfgfds13234fdm4e2343";
    await insertMessage(number, "hola mundo", apiKey, agentId, "recibido");
    res.status(200).send("guardado");
  } catch (error) {
    res.status(400).send(error.message);
  }
});

mainRouter.get("/readMessages", async (req, res) => {
  try {
    let apiKey = "12342dfds5-23eweew-3rwqerew";
    let agentId = "Fdsfgfds13234fdm4e2343";
    await readMessages(apiKey, agentId);
    res.status(200).send("guardado");
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = mainRouter;
