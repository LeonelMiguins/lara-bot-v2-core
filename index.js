const qrcode = require("qrcode-terminal");
const fs = require("fs");
const path = require("path");

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");

const P = require("pino");

const messageHandler = require("./src/handlers/messageHandler");
const welcomeHandler = require("./src/utils/welcome");
const config = require("./config.json");

// carregar comandos
const commands = new Map();
const commandsPath = path.join(__dirname, "src", "commands");
fs.readdirSync(commandsPath).forEach(file => {
  if (file.endsWith(".js")) {
    const command = require(path.join(commandsPath, file));
    commands.set(command.name, command);
  }
});
console.log("✅ Comandos carregados:", [...commands.keys()]);

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./auth");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: P({ level: "silent" })
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", update => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) qrcode.generate(qr, { small: true });
    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;
      if (reason !== DisconnectReason.loggedOut) startBot();
      else console.log("❌ Deslogado, delete auth e escaneie de novo.");
    }
    if (connection === "open") console.log("✅ Bot conectado!");
  });

  sock.ev.on("group-participants.update", async update => {
    await welcomeHandler(sock, update);
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg) return;

    await messageHandler(sock, msg, commands, config.prefix);
  });
}

startBot();
