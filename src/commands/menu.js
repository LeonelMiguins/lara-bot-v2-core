module.exports = {
  name: "menu",
  description: "Mostra o menu de comandos",
  async execute(sock, msg, args) {
    try {
      const from = msg.key.remoteJid;

      const menuText = `
🤖 *MENU - LARA BOT V2*

📌 *COMANDOS DE ADMIN*

🔇 !mute
🔊 !unmute
📝 !setname <novo nome>
📢 !tagall <mensagem opcional>
👮 !adms
🔗 !link
👢 !ban @membro ou (respondendo)
⬆️ !promote @membro ou (respondendo)
⬇️ !demote @membro ou (respondendo)

🖼️ *FIGURINHAS / IMAGENS*
🎭 !sticker (imagem → figurinha)
🖼️ !toimg (imagem → imagem)

🛡️ *SEGURANÇA*
🚫 AntiLink automático (já ativo no bot)
🔒 !protect on
🔓 !protect off

ℹ️ *INFO*
📜 !rules
📜 !rules set (respondendo uma mensagem)

━━━━━━━━━━━━━━━━━━
⚡ *Use os comandos com !*
📌 Exemplo: !tagall Bora geral!
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
