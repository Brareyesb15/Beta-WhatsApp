const socketIO = require("socket.io");
const { chatbotOn } = require("./socketControllers/chatbotOn");
const eventEmitter = require("../gateways/events");
const { instanciasBot } = require("../general-configs/instances");
const { chatbotOff, chatbotKill } = require("./socketControllers/chatbotOff");

eventEmitter.on("qrRemoved", (number, sessionName) => {
  quitarQr(number, sessionName);
});

eventEmitter.on("qrCreated", (qr, sessionName) => {
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
      origin: "*", // mandar esto a .env como "frontend-url"
      methods: ["GET", "POST"],
      credentials: true,
    },
  });
  io.on("connection", async (socket) => {
    socket.on("killBot", async (data) => {
      console.log("Entró a killBot:", data.apiKey);
      chatbotKill(data.apiKey);
    });
    socket.on("enviarDatos", async (data) => {
      console.log("Data connection", data);
      if (data) {
        socket.join(data.apiKey); // Unir el socket a una sala con el nombre de apiKey
        socket.apiKey = data.apiKey;
        try {
          await chatbotOn(data.apiKey, data.agentId, data.agentState);
          if (instanciasBot[data.apiKey]) {
            instanciasBot[data.apiKey].qr
              ? io.to(data.apiKey).emit("qr", instanciasBot[data.apiKey].qr)
              : io
                  .to(data.apiKey)
                  .emit(
                    "qr",
                    +instanciasBot[data.apiKey].botNumber?.split("@")[0]
                  );
            instanciasBot[data.apiKey].frontendConnection = true;
            socket.on("disconnect", () => {
              instanciasBot[data.apiKey]
                ? (instanciasBot[data.apiKey].frontendConnection = false)
                : null;
              console.log("Un cliente se ha desconectado");
              chatbotOff(data.apiKey);
            });
          } else {
            console.log(
              "La clave de la instancia de bot no existe en instanciasBot."
            );
          }
        } catch (error) {
          console.error("Error al intentar activar el chatbot:", error);
        }
      }
    });
  });
};

const createQr = async (qr, name) => {
  try {
    io.to(name).emit("qr", qr);
  } catch (error) {
    console.error("Error al intentar enviar el QR:", error);
  }
};

const quitarQr = async (number, name) => {
  try {
    number = +number;
    io.to(name).emit("qr", number);
  } catch (error) {
    console.error("Error al intentar quitar el QR:", error);
  }
};

module.exports = {
  configureSocket,
  createQr,
};
