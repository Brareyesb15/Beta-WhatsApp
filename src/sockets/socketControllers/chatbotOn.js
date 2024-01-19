const { createBots } = require("../../general-configs/createBot");

const chatbotOn = async (apiKey, agentId, agentState) => {
  try {
    await createBots(apiKey, agentId, agentState);
  } catch (e) {
    console.log(error.message);
    return error.message;
  }
};
module.exports = {
  chatbotOn,
};
