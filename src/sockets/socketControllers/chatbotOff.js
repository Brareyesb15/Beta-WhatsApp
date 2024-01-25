const { instanciasBot } = require("../../general-configs/instances");

const chatbotOff = async (apiKey, agentId) => {
  let instance = await instanciasBot[apiKey];
  if (!instance?.botNumber) {
    await instance.apagar();
    delete instanciasBot[apiKey];
  }
};
module.exports = {
  chatbotOff,
};
