const { Router } = require("express");
const { instanciasBot } = require("../general-configs/instances");

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
    res.status(200).send(instanciasBot);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = mainRouter;
