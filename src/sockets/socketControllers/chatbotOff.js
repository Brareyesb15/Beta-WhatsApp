const { instanciasBot } = require("../../general-configs/instances");

const chatbotOff = async (apiKey, agentId) => {
  let instance = await instanciasBot[apiKey];
  if (instance && !instance.botNumber) {
    await instance.apagar();
    delete instanciasBot[apiKey];
  }
};

// en teoria esta función solo se activa cuando un usuario está en la interfaz y su chatbot está encendido,
// es decir, si hay un numero (contrario a la función anterior.)
const chatbotKill = async (apiKey) => {
  console.log("matar bot");
  let instance = await instanciasBot[apiKey];
  await instance?.apagar();
  delete instanciasBot[apiKey];
};

module.exports = {
  chatbotOff,
  chatbotKill,
};
