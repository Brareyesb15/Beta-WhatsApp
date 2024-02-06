const socketIO = require("socket.io");
const { chatbotOn } = require("./socketControllers/chatbotOn");
const eventEmitter = require("../gateways/events");
const { instanciasBot } = require("../general-configs/instances");
const { chatbotOff, chatbotKill } = require("./socketControllers/chatbotOff");
require("dotenv").config();

let io;

eventEmitter.on("qrRemoved", (number, sessionName) => {
  try {
    quitarQr(number, sessionName);
  } catch (error) {
    console.error(`Error al quitar QR para la sesión: ${sessionName}`, error);
  }
});

eventEmitter.on("qrCreated", (qr, sessionName) => {
  try {
    createQr(qr, sessionName);
  } catch (error) {
    console.error(`Error al crear QR para la sesión: ${sessionName}`, error);
  }
});

const configureSocket = async (server) => {
  try {
    io = socketIO(server, {
      cors: {
        origin: "*", // mandar esto a .env como "frontend-url"
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    io.on("connection", async (socket) => {
      socket.on("killBot", async (data) => {
        console.log("data", data);
        try {
          console.log("Entró a killBot:", data.apiKey);
          await chatbotKill(data.apiKey);
        } catch (error) {
          console.error(
            `Error al intentar matar el bot o apikey invalida`,
            error
          );
        }
      });

      socket.on("enviarDatos", async (data) => {
        try {
          console.log("Data connection", data);
          if (data && instanciasBot[data.apiKey]) {
            socket.join(data.apiKey);
            socket.apiKey = data.apiKey;
            await chatbotOn(data.apiKey, data.agentId, data.agentState);
            const qrData =
              instanciasBot[data.apiKey].qr ||
              instanciasBot[data.apiKey].botNumber?.split("@")[0];
            io.to(data.apiKey).emit("qr", qrData);
            instanciasBot[data.apiKey].frontendConnection = true;
          }
        } catch (error) {
          console.error(
            `Error al procesar los datos enviados para apiKey: ${data.apiKey}`,
            error
          );
        }
      });

      socket.on("disconnect", () => {
        try {
          if (instanciasBot && instanciasBot.hasOwnProperty(data.apiKey)) {
            instanciasBot[data.apiKey].frontendConnection = false;
          } else {
            console.log(
              `No existe una instancia para la apiKey: ${data.apiKey}`
            );
          }
          console.log("Un cliente se ha desconectado");
          chatbotOff(data.apiKey);
        } catch (error) {
          console.error(`Error al manejar la desconexión o sin apiKey`, error);
        }
      });
    });
  } catch (error) {
    console.error("Error al configurar Socket.IO:", error);
  }
};

const createQr = async (qr, name) => {
  try {
    io.to(name).emit("qr", qr);
  } catch (error) {
    console.error(`Error al crear QR para la sesión: ${name}`, error);
  }
};

const quitarQr = async (number, name) => {
  try {
    number = +number;
    io.to(name).emit("qr", number);
  } catch (error) {
    console.error(`Error al quitar QR para la sesión: ${name}`, error);
  }
};

module.exports = {
  configureSocket,
  createQr,
};
