const { createClient } = require("@libsql/client");
require("dotenv").config();

const token = process.env.TURSO_TOKEN_API;

// Inicializar el cliente de Turso DB
const client = createClient({
  url: "libsql://whatsapp-1-brareyesb15.turso.io",
  // authToken es necesario si se conecta a una base de datos remota de Turso DB
  authToken:
    "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOiIyMDI0LTAxLTI2VDE5OjIxOjI3Ljg4NjY3MTMwOVoiLCJpZCI6IjA0ODMyZDhmLWJjNzktMTFlZS1hYmZmLWUyZTgyZWFhY2IwNSJ9.VrD3yNngGNahOJgkaBxn129Aa8diYmZ3MoNm1-eH_Xuk0J-0JO0iBTNmbfaeiQx04Gf_epYK8TQLteRdGG7SAw",
});

// Función para insertar un mensaje en la base de datos
async function insertMessage(phoneNumber, content, botId, agentId, role) {
  try {
    console.log("ENtro a turso?");
    const insertSQL = `
        INSERT INTO messages (botId, agentId, phoneNumber, content, role)
        VALUES (?, ?, ?, ?, ?)
      `;
    await client.execute({
      sql: insertSQL,
      args: [botId, agentId, phoneNumber, content, role],
    });
  } catch (error) {
    console.error("An error occurred while inserting a message:", error);
  }
}

// Función para leer los últimos 20 mensajes de la base de datos para un chatbot y agente específicos
async function readMessages(apiKey, agentId) {
  try {
    const readSQL = `
      SELECT * FROM messages
      WHERE botId = ? AND agentId = ?
      ORDER BY timestamp ASC
      LIMIT 20
    `;
    const result = await client.execute({
      sql: readSQL,
      args: [apiKey, agentId],
    });

    return result.rows;
  } catch (error) {
    console.error("An error occurred while reading messages:", error);
    return [];
  }
}

module.exports = {
  insertMessage,
  readMessages,
};
