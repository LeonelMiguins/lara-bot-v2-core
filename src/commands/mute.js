module.exports = {
  name: "mute",
  description: "Fecha o grupo (somente admins podem falar)",
  async execute(sock, msg, args) {
    try {
      const from = msg.key.remoteJid;

      if (!from.endsWith("@g.us")) {
        return await sock.sendMessage(from, {
          text: "❌ Esse comando só funciona em grupos."
        });
      }

      const metadata = await sock.groupMetadata(from);

      // normalizador (pra botNumber)
      const normalizeNumber = (jid) => {
        if (!jid) return "";
        return jid.split(":")[0].replace("@s.whatsapp.net", "");
      };

      // ====== checar se bot é admin (via phoneNumber por causa do @lid) ======
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
          text: "⚠️ Eu preciso ser ADMIN para fechar o grupo."
        }, { quoted: msg });
      }

      // ====== checar se quem usou é admin ======
      const sender = msg.key.participant;

      const senderParticipant = metadata.participants.find((p) => p.id === sender);

      const senderIsAdmin =
        senderParticipant &&
        (senderParticipant.admin === "admin" ||
          senderParticipant.admin === "superadmin");

      if (!senderIsAdmin) {
        return await sock.sendMessage(from, {
          text: "❌ Apenas ADMIN pode usar esse comando."
        }, { quoted: msg });
      }

      // ====== fechar grupo ======
      await sock.groupSettingUpdate(from, "announcement");

      await sock.sendMessage(from, {
        text: "🔇 Grupo fechado!\n\n✅ Agora apenas ADMINS podem enviar mensagens."
      }, { quoted: msg });

    } catch (err) {
      console.log("❌ Erro no comando mute:", err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Erro ao tentar fechar o grupo."
      }, { quoted: msg });
    }
  }
};
