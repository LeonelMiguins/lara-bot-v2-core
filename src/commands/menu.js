const config = require("../../config.json");

module.exports = {
  name: "menu",
  description: "Mostra o menu de comandos",
  async execute(sock, msg, args) {
    try {
      const from = msg.key.remoteJid;

      const PREFIX = config.prefix || "!";

      const menuText = `
━━━━━━━━━━━━━━━━━━
📂 *MENU - ${config.botName || "BOT"}*
━━━━━━━━━━━━━━━━━━

🔇 ${PREFIX}mute
🔊 ${PREFIX}unmute
📝 ${PREFIX}setname <novo nome>
📝 ${PREFIX}setdesc <nova descrição>
📢 ${PREFIX}tagall <mensagem opcional>
👮 ${PREFIX}adms
🔗 ${PREFIX}link
👢 ${PREFIX}ban @membro ou (respondendo)
⬆️ ${PREFIX}promote @membro ou (respondendo)
⬇️ ${PREFIX}demote @membro ou (respondendo)

🖼️ *FIGURINHAS / IMAGENS*
🎭 ${PREFIX}sticker (imagem → figurinha)
🖼️ ${PREFIX}toimg (Visualização única → imagem)

🛡️ *SEGURANÇA*
🚫 AntiLink automático (se ativado no config)
🔗 ${PREFIX}antilink on/off
🔒 ${PREFIX}protect on
🔓 ${PREFIX}protect off

ℹ️ *INFO*
📜 ${PREFIX}rules
📜 ${PREFIX}rules set (respondendo uma mensagem)
💾 ${PREFIX}save (respondendo msg)
📂 ${PREFIX}saves

━━━━━━━━━━━━━━━━━━
⚡ *Use os comandos com ${PREFIX}*
📌 Exemplo: ${PREFIX}tagall Bora geral!
`;

      await sock.sendMessage(from, { text: menuText }, { quoted: msg });

    } catch (err) {
      console.log("❌ Erro no menu:", err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Erro ao mostrar menu."
      }, { quoted: msg });
    }
  }
};
