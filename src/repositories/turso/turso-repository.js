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

// Función para insertar un mensaje en la base de datos
async function insertMessage(
  phoneNumber,
  content,
  botId,
  agentId,
  role,
  timestamp
) {
  try {
    console.log("Entró a Turso?");
    const insertSQL = `
      INSERT INTO messages (botId, agentId, phoneNumber, content, role, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await client.execute({
      sql: insertSQL,
      args: [botId, agentId, phoneNumber, content, role, timestamp],
    });
  } catch (error) {
    console.error("An error occurred while inserting a message:", error);
  }
}

// Función para leer los últimos 20 mensajes de la base de datos para un chatbot y agente específicos
async function readMessages(apiKey, agentId, number) {
  try {
    const readSQL = `
      SELECT * FROM messages
      WHERE botId = ? AND agentId = ? AND phoneNumber = ?
      ORDER BY timestamp DESC
      LIMIT 20
    `;
    const result = await client.execute({
      sql: readSQL,
      args: [apiKey, agentId, number],
    });

    return result.rows.reverse();
  } catch (error) {
    console.error("An error occurred while reading messages:", error);
    return [];
  }
}

module.exports = {
  insertMessage,
  readMessages,
};
