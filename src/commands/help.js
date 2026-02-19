const config = require("../../config.json");

module.exports = {
  name: "help",
  description: "Mostra todos os comandos disponíveis do bot",
  async execute(sock, msg, args) {
    try {
      const from = msg.key.remoteJid;
      const prefix = config.prefix || "!";

      const text =
        `━━━━━━━━━━━━━━━━━━\n` +
        `📂 *Central de Ajuda*\n` +
        `━━━━━━━━━━━━━━━━━━\n\n` +

        `📌 *${prefix}menu*  → Mostra o menu do bot\n` +
        `📌 *${prefix}help*  → Mostra essa mensagem de ajuda\n` +
        `📌 *${prefix}bot status* → Mostra informações completas do bot\n\n` +

        `👑 *${prefix}promote @membro* → Promove membro para ADM\n` +
        `👤 *${prefix}demote @membro* → Remove ADM de um membro\n` +
        `🚫 *${prefix}ban @membro* → Bane um membro do grupo\n` +
        `🔇 *${prefix}mute* → Apenas ADMs podem mandar mensagem\n` +
        `🔊 *${prefix}unmute* → Libera mensagens para todos\n` +
        `🏷️ *${prefix}setname Nome* → Muda o nome do grupo\n` +
        `📝 *${prefix}setdesc Texto* → Muda a descrição do grupo\n\n` +

        `📍 *${prefix}tagall mensagem* → Marca todos os membros (ADM)\n` +
        `👑 *${prefix}adms* → Lista os administradores do grupo\n` +
        `🎟️ *${prefix}invite* → Cria link de convite do grupo\n\n` +

        `🔗 *${prefix}antilink on/off* → Liga/desliga anti-link\n` +
        `🔒 *${prefix}protect on* → Ativa modo protegido\n` +
        `🔓 *${prefix}protect off* → Desativa modo protegido\n\n` +

        `📜 *${prefix}rules* → Mostra as regras do grupo\n` +
        `✍️ *${prefix}rules set* (respondendo msg) → Define novas regras\n\n` +

        `💾 *${prefix}save* (respondendo msg) → Salva mensagem importante\n` +
        `📂 *${prefix}saves* → Mostra mensagens salvas\n\n` +

        `🖼️ *${prefix}sticker* (imagem) → Cria figurinha estática\n\n`
        ;

      await sock.sendMessage(from, { text }, { quoted: msg });

    } catch (err) {
      console.log("❌ Erro no help:", err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Erro ao mostrar o help."
      }, { quoted: msg });
    }
  }
};
