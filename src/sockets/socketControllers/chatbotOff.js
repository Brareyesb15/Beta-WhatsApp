const { createBots } = require("../../general-configs/createBot");
const { instanciasBot } = require("../../general-configs/instances");

const chatbotOff = async (apiKey, agentId) => {
  let instance = await instanciasBot[apiKey];
  if (!instance?.botNumber) {
    await instance.apagar();
    delete instanciasBot[apiKey];
    console.log("Instancia apagada", instanciasBot);
  }
};
module.exports = {
  chatbotOff,
};
