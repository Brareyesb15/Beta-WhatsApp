const CodeGPTApi = require("../services/code-gpt-api");
const {
  insertMessage,
  readMessages,
} = require("../repositories/turso/turso-repository");
const generalUrl = process.env.GENERAL_URL_API;

let codeGPTApi;

function getCodeGPTApi(apiKey) {
  if (!codeGPTApi) {
    codeGPTApi = new CodeGPTApi(generalUrl, apiKey);
  }
  return codeGPTApi;
}

/**
 * Handles message completion by interacting with the GPT API.
 *
 * @param {object} message - The user's message object containing sender information and text content.
 * @returns {Promise<object|string>} - Returns the assistant's response or an error object.
 */
const completion = async (message, apiKey, agentId) => {
  try {
    const chatHistory = await readMessages(apiKey, agentId);

    const number = message.sender.split("@")[0];

    // Update chat memory with the user's message
    insertMessage(number, message.text, apiKey, agentId, "user");

    // Create an array of messages from the chat history
    let messages =
      chatHistory?.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })) || [];

    // Add the user's new message to the array
    messages.push({
      role: "user",
      content: message.text,
    });
    console.log("MEssages on controller", messages);
    // Build the payload for the GPT API request
    const response = await getCodeGPTApi(apiKey).completion(agentId, messages);

    // Process the API response and update chat memory with the assistant's message
    const data = await response;
    const text = data.replace(/^data: /, "");
    insertMessage(number, text, apiKey, agentId, "assistant");

    return text;
  } catch (error) {
    // Handle and log any errors that occur during the process
    console.error("Error:", error);
    return error.message;
  }
};

module.exports = {
  completion,
};
