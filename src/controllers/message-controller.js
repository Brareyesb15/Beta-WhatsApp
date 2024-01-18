const { completion } = require("./send-to-ia");

const sendMessage = async (msg, apiKey, agentId) => {
  try {
    let response = false;
    response = await completion(msg, apiKey, agentId);
    return response;
  } catch (error) {
    console.log("error", error.message);
    return error.message;
  }
};

module.exports = {
  sendMessage,
};
