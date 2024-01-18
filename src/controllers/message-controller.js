const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const path = require("path");
const fs = require("fs");
const { commands } = require("./commands");
const { completion } = require("./send-to-ia");
const { writeFile } = require("fs").promises;

const sendMessage = async (msg, agentId) => {
  try {
    const comandoMatch = msg.text.match(/\/(\w+)/);
    let response = false;
    if (comandoMatch) response = await commands(msg, comandoMatch, agentId);
    // si no es comando Enviamos el mensaje anidado a la IA
    if (!response) response = await completion(msg, agentId);
    return response;
  } catch (error) {
    console.log("error", error.message);
    return error.message;
  }
};

module.exports = {
  sendMessage,
};
