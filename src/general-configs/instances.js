let instanciasBot = {};

const instanceCreation = async (chatbotId) => {
    try {
      let instancia = instanciasBot[chatbotId];
  
      console.log("dentro de instancia",chatbotId)
      let apiKey = readApiKeyFromFile()
      let agent = 
      instancia.apiKey = apiKey
      instancia.agent = agent
  
      return `bot ${chatbotId} creado`;
    } catch (error) {
      console.error('Error en creationBot:', error,chatbotId);
      throw error;
    }
  }

module.exports = {
    instanceCreation,
    instanciasBot
  }