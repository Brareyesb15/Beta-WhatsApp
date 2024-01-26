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

// Función para crear la tabla si no existe
async function initializeDatabase() {
  try {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS mensajes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chatbot_id INTEGER NOT NULL,
        agente_id INTEGER NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        numero_contacto TEXT NOT NULL,
        mensaje TEXT NOT NULL,
        tipo_mensaje TEXT CHECK(tipo_mensaje IN ('recibido', 'enviado')) NOT NULL
      )
    `;
    await client.execute(createTableSQL);
    console.log('Table "mensajes" has been created or already exists.');
    return 'Table "mensajes" has been created or already exists.';
  } catch (error) {
    console.error(
      "An error occurred while initializing the database:",
      error.message
    );
  }
}

module.exports = {
  initializeDatabase,
  insertMessage,
  readMessages,
};
