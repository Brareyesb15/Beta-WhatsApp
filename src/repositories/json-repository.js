const fs = require("fs");
const path = require("path");

/**
 * Updates the chat memory with the user's message.
 *
 * @param {string} sender - The unique identifier of the message sender.
 * @param {object} message - The message object containing role and content.
 * @param {string} apiKey - The name or identifier of the chatbot.
 */
const updateChatMemory = async (sender, message, apiKey, agentId) => {
  try {
    let chatHistory = await readChatMemoryFromFile(apiKey);

    if (!chatHistory[sender]) {
      chatHistory[sender] = [];
    }

    chatHistory[sender].push(message);

    if (chatHistory[sender].length > 30) {
      chatHistory[sender].shift();
    }

    const chatHistoryJSON = JSON.stringify(chatHistory, null, 2);

    const filePath = path.join(
      __dirname,
      "../../",
      "Data",
      "Memory",
      `${apiKey}_${agentId}.json`
    );

    // Verifica si el archivo existe
    if (!fs.existsSync(filePath)) {
      // Si no existe, crea la carpeta y el archivo
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, "{}", "utf-8");
    }

    fs.writeFileSync(filePath, chatHistoryJSON, "utf-8");
  } catch (error) {
    console.error("An error occurred in execute:", error);
  }
};

/**
 * Reads chat memory from a file based on the chatbot's name.
 *
 * @param {string} apiKey - The name or identifier of the chatbot.
 * @returns {object} - The chat memory object.
 */
const readChatMemoryFromFile = async (apiKey) => {
  try {
    const data = fs.readFileSync(
      path.join(
        __dirname,
        "../../",
        "Data",
        "Memory",
        `${apiKey}_${agentId}.json`
      ),
      "utf-8"
    );

    return JSON.parse(data);
  } catch (err) {
    return {};
  }
};

/**
 * Updates the apiKey in the file.
 *
 * @param {{string}} key - The new apiKey.
 */

module.exports = {
  updateChatMemory,
  readChatMemoryFromFile,
};
