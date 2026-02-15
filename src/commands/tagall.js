module.exports = {
  name: "tagall",
  description: "Marca todos os membros do grupo",
  async execute(sock, msg, args) {
    try {
      const from = msg.key.remoteJid;

      // só grupo
      if (!from.endsWith("@g.us")) {
        return await sock.sendMessage(from, {
          text: "❌ Esse comando só funciona em grupos."
        }, { quoted: msg });
      }

      const metadata = await sock.groupMetadata(from);

      // checar se quem pediu é admin
      const sender = msg.key.participant;

      const senderParticipant = metadata.participants.find((p) => p.id === sender);

      const senderIsAdmin =
        senderParticipant &&
        (senderParticipant.admin === "admin" ||
          senderParticipant.admin === "superadmin");

      if (!senderIsAdmin) {
        return await sock.sendMessage(from, {
          text: "❌ Apenas ADMINS podem usar o comando !tagall."
        }, { quoted: msg });
      }

      // pegar mensagem personalizada
      let customMessage = args.join(" ").trim();

      if (!customMessage) {
        customMessage = "📢 Convocando todos os membros!";
      }

      // listar participantes
      const mentions = metadata.participants.map((p) => p.id);

      // texto com menções
      let text = `📌 *TAG ALL*\n\n${customMessage}\n\n`;

      for (const p of mentions) {
        text += `@${p.split("@")[0]} `;
      }

      await sock.sendMessage(from, {
        text,
        mentions
      }, { quoted: msg });

    } catch (err) {
      console.log("❌ Erro no comando tagall:", err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Erro ao marcar todos."
      }, { quoted: msg });
    }
  }
};
