const { completion } = require("./send-to-ia");

const sendMessage = async (msg, apiKey, agentId) => {
  try {
    let response = false;
    response = await completion(msg, apiKey, agentId);

    return response;
  } catch (error) {
    // Manejo del error de control de contenido de IA:
    // Esto podría ir con una verificación de idioma,
    if (error.message == `Cannot read properties of undefined (reading '0')`) {
      msg.text =
        "Pidele al usuario que te repita la pregunta con otras palabras ya que no pudiste procesarla, todo esto en el idioma en el que ya están hablando";
      response = await completion(msg, apiKey, agentId);
      return response;
    }
    throw new Error(error.message);
  }
};

module.exports = {
  sendMessage,
};
