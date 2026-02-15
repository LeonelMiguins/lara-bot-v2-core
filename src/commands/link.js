module.exports = {
  name: "link",
  description: "Gera link de convite do grupo",
  async execute(sock, msg, args) {
    try {
      const from = msg.key.remoteJid;

      // só grupo
      if (!from.endsWith("@g.us")) {
        return await sock.sendMessage(from, {
          text: "❌ Esse comando só funciona em grupos."
        }, { quoted: msg });
      }

      // pegar metadata
      const metadata = await sock.groupMetadata(from);

      const groupName = metadata.subject || "Grupo";
      const groupDesc = metadata.desc || "Sem descrição.";

      const descPreview =
        groupDesc.length > 60 ? groupDesc.slice(0, 60) + "..." : groupDesc;

      // ====== checar se bot é admin (necessário para pegar link) ======
      const normalizeNumber = (jid) => {
        if (!jid) return "";
        return jid.split(":")[0].replace("@s.whatsapp.net", "");
      };

      const botNumber = normalizeNumber(sock.user.id);

      const botParticipant = metadata.participants.find((p) => {
        const pNumber = normalizeNumber(p.phoneNumber);
        return pNumber === botNumber;
      });

      const botIsAdmin =
        botParticipant &&
        (botParticipant.admin === "admin" ||
          botParticipant.admin === "superadmin");

      if (!botIsAdmin) {
        return await sock.sendMessage(from, {
          text: "⚠️ Eu preciso ser ADMIN para gerar link de convite."
        }, { quoted: msg });
      }

      // gerar link
      const inviteCode = await sock.groupInviteCode(from);
      const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;

      await sock.sendMessage(from, {
        text:
          `🔗 *LINK DO GRUPO*\n\n` +
          `📌 *Nome:* ${groupName}\n` +
          `📝 *Descrição:* ${descPreview}\n\n` +
          `✅ *Convite:* ${inviteLink}`
      }, { quoted: msg });

    } catch (err) {
      console.log("❌ Erro no comando link:", err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Erro ao gerar link do grupo."
      }, { quoted: msg });
    }
  }
};
