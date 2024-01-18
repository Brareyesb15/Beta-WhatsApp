const { createBots } = require("../../general-configs/createBot");

const chatbotOn = async (apiKey,agentId) => {
try{
 await createBots(apiKey,agentId)
}
catch(e){
    console.log(error.message)
    return error.message
}
}
module.exports= {
    chatbotOn,
}