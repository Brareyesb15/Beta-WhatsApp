const socketIO = require("socket.io");

const { updateDataInFile } = require("../repositories/json-repository");
const { getAgents, getAgentById } = require("./socketControllers/getAgents");
const { verifyKey } = require("./socketControllers/verifyKey");
const { chatbotOn } = require("./socketControllers/chatbotOn");
const eventEmitter = require("../gateways/events");
const { instanciasBot } = require("../general-configs/instances");
const { chatbotOff } = require("./socketControllers/chatbotOff");

eventEmitter.on("qrRemoved", (status, sessionName) => {
  quitarQr(status, sessionName);
});

eventEmitter.on("qrCreated", (qr, sessionName) => {
  console.log("debería escuchar");
  createQr(qr, sessionName);
});

let io;

/**
 * Configura el socket para el servidor.
 * @param {http.Server} server - El servidor HTTP al que se asocia Socket.IO.
 */
const configureSocket = async (server) => {
  // Crear una instancia de Socket.IO asociada al servidor
  io = socketIO(server, {
    cors: {
      origin: "http://localhost:3000", // mandar esto a .env como "frontend-url"
      methods: ["GET", "POST"],
      credentials: true,
    },
  });
  io.on("connection", async (socket) => {
    socket.on("enviarDatos", async (data) => {
      if (data) {
        console.log("TODAS INSTANCIAS:", instanciasBot);
        socket.join(data.apiKey); // Unir el socket a una sala con el nombre de apiKey
        socket.apiKey = data.apiKey;
        await chatbotOn(data.apiKey, data.agentId);

        instanciasBot[data.apiKey].frontendConnection = true;

        socket.on("disconnect", () => {
          instanciasBot[data.apiKey].frontendConnection = false;
          console.log(
            "Un cliente se ha desconectado",
            instanciasBot[data.apiKey].frontendConnection
          );
          chatbotOff(data.apiKey);
        });
      }
    });
  });
};

const createQr = async (qr, name) => {
  io.to(name).emit("qr", qr);
};

const quitarQr = async (bool, name) => {
  // Emitir el valor booleano 'bool' al usuario específico para que deje de renderizar el código QR
  io.to(name).emit("qr", bool);
};

module.exports = {
  configureSocket,
  createQr,
};
