const { createClient } = require("@libsql/client");
require("dotenv").config();

const token = process.env.TURSO_TOKEN_API;
const tursoDatabaseUrl = process.env.TURSO_DATABASE_URL;

// Inicializar el cliente de Turso DB
const client = createClient({
  url: tursoDatabaseUrl,
  // authToken es necesario si se conecta a una base de datos remota de Turso DB
  authToken: token,
});

// Función para crear la tabla si no existe
async function initializeDatabase() {
  try {
    // const createTableSQL = `
    //   CREATE TABLE IF NOT EXISTS messages2 (
    //     messageId INTEGER PRIMARY KEY AUTOINCREMENT,
    //     botId INTEGER NOT NULL,
    //     agentId INTEGER NOT NULL,
    //     timestamp DATETIME NOT NULL,
    //     phoneNumber TEXT NOT NULL,
    //     content TEXT NOT NULL,
    //     role TEXT NOT NULL
    //   )
    // `;
    // await client.execute(createTableSQL);
    // console.log('New table "messages2" has been created.');
  } catch (error) {
    console.error(
      "An error occurred while initializing the database:",
      error.message
    );
  }
}
module.exports = {
  initializeDatabase,
};
