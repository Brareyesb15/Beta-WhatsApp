const socketIO = require("socket.io");
const { chatbotOn } = require("./socketControllers/chatbotOn");
const eventEmitter = require("../gateways/events");
const { instanciasBot } = require("../general-configs/instances");
const { chatbotOff } = require("./socketControllers/chatbotOff");

eventEmitter.on("qrRemoved", (number, sessionName) => {
  quitarQr(number, sessionName);
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
        socket.join(data.apiKey); // Unir el socket a una sala con el nombre de apiKey
        socket.apiKey = data.apiKey;
        await chatbotOn(data.apiKey, data.agentId, data.agentState);
        instanciasBot[data.apiKey].qr
          ? io.to(data.apiKey).emit("qr", instanciasBot[data.apiKey].qr)
          : io
              .to(data.apiKey)
              .emit("qr", +instanciasBot[data.apiKey].botNumber?.split("@")[0]);

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

const quitarQr = async (number, name) => {
  number = +number;
  io.to(name).emit("qr", number);
};

module.exports = {
  configureSocket,
  createQr,
};
