require("dotenv").config();
const http = require("http");
const { app } = require("./app");
const fs = require("fs").promises;
const { join } = require("path");
const { instanciasBot, instanceCreation } = require("./src/utils.js");
const { configureSocket } = require("./src/sockets/socket.js");
const whatsAppBot = require("./src/gateways/whatsapp-baileys.js");
const { readApiKeyFromFile } = require("./src/repositories/json-repository.js");

const PORT = process.env.PORT;
const IP_ADDRESS = process.env.IP_ADDRESS;

  // Create an HTTP server using the Express app
  const server = http.createServer(app);

  // // Call the function to create WhatsApp bots
  // createBots();
  configureSocket(server);
  // Start the server and listen on the specified IP address and port
  server.listen(PORT, IP_ADDRESS, () => {
    console.log(`Listening on http://${IP_ADDRESS}:${PORT}`);
  });