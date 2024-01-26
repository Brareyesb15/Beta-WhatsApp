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
async function insertMessage(
  chatbot_id,
  agente_id,
  numero_contacto,
  mensaje,
  tipo_mensaje
) {
  try {
    const insertSQL = `
        INSERT INTO mensajes (chatbot_id, agente_id, numero_contacto, mensaje, tipo_mensaje)
        VALUES (?, ?, ?, ?, ?)
      `;
    await client.execute({
      sql: insertSQL,
      args: [chatbot_id, agente_id, numero_contacto, mensaje, tipo_mensaje],
    });
  } catch (error) {
    console.error("An error occurred while inserting a message:", error);
  }
}

// Función para leer mensajes de la base de datos
async function readMessages(chatbot_id) {
  try {
    const readSQL = `SELECT * FROM mensajes WHERE chatbot_id = ?`;
    const result = await client.execute({
      sql: readSQL,
      args: [chatbot_id],
    });
    return result.rows;
  } catch (error) {
    console.error("An error occurred while reading messages:", error);
    return [];
  }
}

module.exports = {
  initializeDatabase,
  insertMessage,
  readMessages,
};
