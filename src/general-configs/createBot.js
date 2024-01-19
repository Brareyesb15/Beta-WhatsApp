const whatsAppBot = require("../gateways/wap-baileys-all-chats");
const whatsAppBotForMe = require("../gateways/wap-baileys-for-me");
const { getCreds } = require("./get-creds");
const { instanciasBot } = require("./instances");

const createBots = async (apiKey, agentId, agentState) => {
  try {
    if (instanciasBot[apiKey]) {
      console.log("Ya existe el chatbot, no hacer nada.");
      return;
    }
    console.log("Creando bot", apiKey, agentId);
    const creds = await getCreds(apiKey);

    let botInstance;
    if (creds) {
      // Bot connected
      if (agentState === "forAll") {
        botInstance = new whatsAppBot(apiKey, creds, agentId);
      } else if (agentState === "forYou") {
        botInstance = new whatsAppBotForMe(apiKey, creds, agentId);
      }
      instanciasBot[apiKey] = botInstance;
    } else {
      // Bot disconnected
      if (agentState === "forAll") {
        botInstance = new whatsAppBot(apiKey, creds, agentId);
      } else if (agentState === "forYou") {
        botInstance = new whatsAppBotForMe(apiKey, creds, agentId);
      }
      instanciasBot[apiKey] = botInstance;
    }

    console.log(`instancia de ${apiKey} creado`);
    console.log(
      "Instancia:",
      instanciasBot[apiKey].apiKey,
      instanciasBot[apiKey].agent
    );
  } catch (e) {
    console.log("Error obtaining and creating bots", e);
  }
};

module.exports = {
  createBots,
};
