const whatsAppBot = require("../gateways/whatsapp-baileys");
const { getCreds } = require("./get-creds");
const { instanciasBot } = require("./instances");


const createBots = async (apiKey,agentId) => {
  try {
    console.log("Creando bot", apiKey, agentId)
    const creds = await getCreds(apiKey);

    if (creds) {
      // Bot connected
      const botInstance = new whatsAppBot(apiKey,creds,agentId);
      instanciasBot[apiKey] = botInstance;
    } else {
      // Bot disconnected
      const botInstance = new whatsAppBot(apiKey,creds,agentId);
      instanciasBot[apiKey] = botInstance;
    }

    try {
    //   await instanceCreation(chatbotId);

      console.log(`instancia de ${apiKey} creado`);
      console.log("Instancia:", instanciasBot[apiKey].apiKey,instanciasBot[apiKey].agent);
    } catch (error) {
      console.error('Error:', error);
    }
  } catch (e) {
    console.log("Error obtaining and creating bots", e);
  }
};

module.exports = {
  createBots
}