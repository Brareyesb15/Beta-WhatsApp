const { createBots } = require("../../general-configs/createBot");

const chatbotOn = async (apiKey,agentId) => {

 createBots(apiKey,agentId)

}
module.exports= {
    chatbotOn,
}