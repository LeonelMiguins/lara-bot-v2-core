const antiLink = require("../utils/antilink");

module.exports = async function messageHandler(sock, msg, commands, PREFIX) {
  if (!msg.message) return;
  if (msg.key.fromMe) return;

  const from = msg.key.remoteJid;

  const text =
    msg.message.conversation ||
    msg.message.extendedTextMessage?.text ||
    msg.message.imageMessage?.caption ||
    msg.message.videoMessage?.caption ||
    "";

  if (!text) return;

  //console.log("📩 Mensagem:", text);

  // ✅ AntiLink (ANTES dos comandos)
  antiLink(sock, msg).catch(console.log);


  // se não for comando, ignora
  if (!text.startsWith(PREFIX)) return;

  const args = text.slice(PREFIX.length).trim().split(/ +/);
  const commandName = args.shift()?.toLowerCase();

  if (!commandName) return;

  const command = commands.get(commandName);

  if (!command) {
    return sock.sendMessage(from, { text: "❌ Comando não existe. Envie *"+PREFIX+"menu* para ver os comandos, ou *"+PREFIX+"help* para ajuda"});
  }

  try {
    await command.execute(sock, msg, args);
  } catch (err) {
    console.log("❌ Erro no comando:", err);
    await sock.sendMessage(from, { text: "❌ Erro ao executar comando." });
  }
};
