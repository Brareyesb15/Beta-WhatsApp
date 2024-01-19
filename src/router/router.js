const { Router } = require("express");

// http://3.85.188.150:3000/welcome

const mainRouter = Router();

mainRouter.get("/welcome", (req, res) => {
  try {
    res.status(200).send("codeGPT viking mode");
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = mainRouter;
