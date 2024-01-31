const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  makeInMemoryStore,
  jidDecode,
  proto,
  getContentType,
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const { Boom } = require("@hapi/boom");
const { join } = require("path");
const rimraf = require("rimraf");
require("dotenv").config();
const {
  sendDocument,
  sendMessage,
} = require("../controllers/message-controller");
const eventEmitter = require("./events");
const { instanciasBot } = require("../general-configs/instances");
const { insertMessage } = require("../repositories/turso/turso-repository");

class whatsAppBot {
  constructor(sessionName, creds, agent) {
    this.sessionName = sessionName;
    this.donet = "";
    this.botNumber = creds;
    this.store = makeInMemoryStore({
      logger: pino().child({ level: "silent", stream: "store" }),
    });
    this.messageQueues = {};
    this.agent = agent;
    this.qr = "";
    this.apiKey = sessionName;
    this.frontendConnection = "";
    this.start().then();
  }

  smsg(conn, m) {
    if (!m) return m;
    let M = proto.WebMessageInfo;
    if (m.key) {
      m.id = m.key.id;
      m.isBaileys = m.id.startsWith("BAE5") && m.id.length === 16;
      m.chat = m.key.remoteJid;
      m.fromMe = m.key.fromMe;
      m.isGroup = m.chat.endsWith("@g.us");
      m.sender = conn.decodeJid(
        (m.fromMe && conn.user.id) ||
          m.participant ||
          m.key.participant ||
          m.chat ||
          ""
      );
      if (m.isGroup) m.participant = conn.decodeJid(m.key.participant) || "";
    }
    if (m.message) {
      m.mtype = getContentType(m.message);
      m.msg =
        m.mtype == "viewOnceMessage"
          ? m.message[m.mtype].message[
              getContentType(m.message[m.mtype].message)
            ]
          : m.message[m.mtype];
      m.body =
        m.message.conversation ||
        m.msg.caption ||
        m.msg.text ||
        (m.mtype == "listResponseMessage" &&
          m.msg.singleSelectReply.selectedRowId) ||
        (m.mtype == "buttonsResponseMessage" && m.msg.selectedButtonId) ||
        (m.mtype == "viewOnceMessage" && m.msg.caption) ||
        m.text;
      let quoted = (m.quoted = m.msg.contextInfo
        ? m.msg.contextInfo.quotedMessage
        : null);
      m.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : [];
      if (m.quoted) {
        let type = getContentType(quoted);
        m.quoted = m.quoted[type];
        if (["productMessage"].includes(type)) {
          type = getContentType(m.quoted);
          m.quoted = m.quoted[type];
        }
        if (typeof m.quoted === "string")
          m.quoted = {
            text: m.quoted,
          };
        m.quoted.mtype = type;
        m.quoted.id = m.msg.contextInfo.stanzaId;
        m.quoted.chat = m.msg.contextInfo.remoteJid || m.chat;
        m.quoted.isBaileys = m.quoted.id
          ? m.quoted.id.startsWith("BAE5") && m.quoted.id.length === 16
          : false;
        m.quoted.sender = conn.decodeJid(m.msg.contextInfo.participant);
        m.quoted.fromMe = m.quoted.sender === conn.decodeJid(conn.user.id);
        m.quoted.text =
          m.quoted.text ||
          m.quoted.caption ||
          m.quoted.conversation ||
          m.quoted.contentText ||
          m.quoted.selectedDisplayText ||
          m.quoted.title ||
          "";
        m.quoted.mentionedJid = m.msg.contextInfo
          ? m.msg.contextInfo.mentionedJid
          : [];
        m.getQuotedObj = m.getQuotedMessage = async () => {
          if (!m.quoted.id) return false;
          let q = await this.store.loadMessage(m.chat, m.quoted.id, conn);
          return this.smsg(conn, q);
        };
        let vM = (m.quoted.fakeObj = M.fromObject({
          key: {
            remoteJid: m.quoted.chat,
            fromMe: m.quoted.fromMe,
            id: m.quoted.id,
          },
          message: quoted,
          ...(m.isGroup ? { participant: m.quoted.sender } : {}),
        }));

        /**
         *
         * @returns
         */
        m.quoted.delete = () =>
          conn.sendMessage(m.quoted.chat, { delete: vM.key });

        /**
         *
         * @param {*} jid
         * @param {*} forceForward
         * @param {*} options
         * @returns
         */
        m.quoted.copyNForward = (jid, forceForward = false, options = {}) =>
          conn.copyNForward(jid, vM, forceForward, options);

        /**
         *
         * @returns
         */
        m.quoted.download = () => conn.downloadMediaMessage(m.quoted);
      }
    }
    // if (m.msg.url) m.download = () => conn.downloadMediaMessage(m.msg);
    m.text =
      m.msg.text ||
      m.msg.caption ||
      m.message.conversation ||
      m.msg.contentText ||
      m.msg.selectedDisplayText ||
      m.msg.title ||
      "";
    /**
     * Reply to this message
     * @param {String|Object} text
     * @param {String|false} chatId
     * @param {Object} options
     */
    m.reply = (text, chatId = m.chat, options = {}) =>
      Buffer.isBuffer(text)
        ? conn.sendMedia(chatId, text, "file", "", m, { ...options })
        : conn.sendText(chatId, text, m, { ...options });
    /**
     * Copy this message
     */
    m.copy = () => this.smsg(conn, M.fromObject(M.toObject(m)));

    /**
     *
     * @param {*} jid
     * @param {*} forceForward
     * @param {*} options
     * @returns
     */
    m.copyNForward = (jid = m.chat, forceForward = false, options = {}) =>
      conn.copyNForward(jid, m, forceForward, options);

    return m;
  }
  async start() {
    const NAME_DIR_SESSION = `${this.sessionName}_session`;

    const { state, saveCreds } = await useMultiFileAuthState(
      `./Sessions/${NAME_DIR_SESSION}`
    );

    const client = makeWASocket({
      logger: pino({ level: "silent" }),
      printQRInTerminal: false,
      browser: ["Powered by CodeGPT with <3"],
      auth: state,
    });
    this.client = client;
    this.client.logout;

    this.store.bind(client.ev);

    client.ev.on("messages.upsert", async (chatUpdate) => {
      try {
        // Tomo el último mensaje.
        let lastMessage = chatUpdate.messages[0];
        if (!lastMessage.message) return;

        //Recibio una llamada / evita errores
        if (
          lastMessage.messageStubType === 40 ||
          lastMessage.messageStubType === 41
        ) {
          return;
        }

        //Ordena la data de un mensaje
        let msg = this.smsg(client, lastMessage);

        //---No responder a los siguientes mensajes:

        //           Historias                     Grupo                Message
        if (
          msg.chat === "status@broadcast" ||
          msg.isGroup ||
          msg.mtype === "protocolMessage"
        )
          return;

        //--- Solo a los siguientes mensajes se les aplicará lógica
        if (
          (msg.mtype === "conversation" ||
            msg.mtype === "extendedTextMessage" ||
            msg.mtype === "audioMessage") &&
          !msg.isBaileys &&
          !msg.fromMe
        ) {
          const chatId = msg.chat.replace("@s.whatsapp.net", "");
          let message;

          if (msg.mtype === "audioMessage") {
            // message = await receiveAudio(this.sessionName, msg.msg);
            // acá irá una implementación de whisper.
            return;
          } else {
            message = msg.text;
          }

          if (!this.messageQueues[chatId]) {
            this.messageQueues[chatId] = [message];
          } else {
            this.messageQueues[chatId].push(message);
          }
        }

        // Espera 5 segundos para acumular mensajes
        setTimeout(async () => {
          const chatId = msg.chat.replace("@s.whatsapp.net", "");
          // Verifica si hay cola de mensajes para ese chat
          if (
            !this.messageQueues[chatId] ||
            this.messageQueues[chatId].length === 0
          ) {
            return;
          }

          // Une los mensajes anidados
          const mensajesAnidados = this.messageQueues[chatId].join(" ");
          // Guarda una copia de la cola actual para comparar después
          const colaOriginal = [...this.messageQueues[chatId]];
          // Limpia la cola de mensajes actual

          if (mensajesAnidados) {
            msg.text = mensajesAnidados;
            try {
              await client.readMessages([msg.key]);
              client.sendPresenceUpdate("composing", msg.key.remoteJid);
              let response = await sendMessage(msg, this.apiKey, this.agent);
              // Verifica si la cola ha cambiado después de enviar el mensaje

              if (
                JSON.stringify(this.messageQueues[chatId]) ===
                JSON.stringify(colaOriginal)
              ) {
                // Si la cola no ha cambiado, responde con el mensaje recibido
                msg.reply(response);
                delete this.messageQueues[chatId];
                insertMessage(
                  chatId,
                  msg.text,
                  this.apiKey,
                  this.agent,
                  "user",
                  new Date(msg.messageTimestamp * 1000)
                    .toISOString()
                    .replace("T", " ")
                    .substring(0, 19) // Fechay hora del mensaje convertido a lo que la tabla pide.
                );
                insertMessage(
                  chatId,
                  response,
                  this.apiKey,
                  this.agent,
                  "assistant",
                  new Date().toISOString().replace("T", " ").substring(0, 19) // Fecha y hora actual en el formato deseado
                );
                return;
              }
              client.sendPresenceUpdate("pause", msg.key.remoteJid);
            } catch (error) {
              // En caso de error, responde con el mensaje de error
              msg.reply(error.message);
            }
          }
        }, 5000); // Cambio de 20000 ms (20 segundos) a 5000 ms (5 segundos)
      } catch (err) {
        console.log(err);
      }
    });

    // Setting
    client.decodeJid = (jid) => {
      if (!jid) return jid;
      if (/:\d+@/gi.test(jid)) {
        let decode = jidDecode(jid) || {};
        return (
          (decode.user && decode.server && decode.user + "@" + decode.server) ||
          jid
        );
      } else return jid;
    };

    client.ev.on("contacts.update", (update) => {
      for (let contact of update) {
        let id = client.decodeJid(contact.id);
        if (this.store && this.store.contacts)
          this.store.contacts[id] = { id, name: contact.notify };
      }
    });

    client.public = true;

    client.serializeM = (m) => this.smsg(client, m);

    client.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (connection === "close") {
        let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
        let razon = new Boom(lastDisconnect?.error)?.message;
        if (razon === "turn off") {
          console.log("apagado");
          const PATH_BASE = join(
            process.cwd(),
            `/Sessions/${NAME_DIR_SESSION}`
          );
          rimraf(PATH_BASE, (err) => {
            if (err) return;
          });
          return;
        }
        if (reason === DisconnectReason.badSession) {
          console.log(`Bad Session File, Please Delete Session and Scan Again`);
          this.start();
        } else if (reason === DisconnectReason.connectionClosed) {
          // console.log("Connection closed, reconnecting....");
          this.start();
        } else if (reason === DisconnectReason.connectionLost) {
          // console.log("Connection Lost from Server, reconnecting...");
          this.start();
        } else if (reason === DisconnectReason.connectionReplaced) {
          console.log(
            "Connection Replaced, Another New Session Opened, Please Restart Bot"
          );
          this.start();
        } else if (reason === DisconnectReason.loggedOut) {
          console.log(
            `Device Logged Out, Please Delete Folder Session  and Scan Again.`
          );
          const PATH_BASE = join(
            process.cwd(),
            `/Sessions/${NAME_DIR_SESSION}`
          );
          rimraf(PATH_BASE, (err) => {
            if (err) return;
          });
          if (!this.frontendConnection) {
            delete instanciasBot[this.apiKey];
            return;
          }
          this.start();
        } else if (reason === DisconnectReason.restartRequired) {
          console.log("Restart Required, Restarting...");
          this.start();
        } else if (reason === DisconnectReason.timedOut) {
          console.log("Connection TimedOut, Reconnecting...");
          this.start();
        } else {
          console.log(`Unknown DisconnectReason: ${reason}|${connection}`);
          this.start();
        }
      }

      if (connection === "open") {
        this.qr = false;
        console.log("creds", client.decodeJid(client.user.id));
        this.botNumber = client.decodeJid(client.user.id);
        eventEmitter.emit(
          "qrRemoved",
          this.botNumber.split("@")[0],
          this.apiKey
        );
      }

      /** QR Code */
      if (qr) {
        this.qr = qr;
        eventEmitter.emit("qrCreated", qr, this.sessionName);
        this.botNumber = null;
      }
    });

    //Actualiza las credenciales cuando se vincula un nuevo numero
    client.ev.on("creds.update", saveCreds);

    //Para enviar mensajes recibe numero@ws y texto
    client.sendText = (jid, text, quoted = "", options) =>
      client.sendMessage(jid, { text: text, ...options });
    this.apagar = async () => {
      client.end(new Error("turn off"));
    };
  }
}

module.exports = whatsAppBot;
