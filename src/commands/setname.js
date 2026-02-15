module.exports = {
  name: "setname",
  description: "Altera o nome do grupo",
  async execute(sock, msg, args) {
    try {
      const from = msg.key.remoteJid;

      // só grupo
      if (!from.endsWith("@g.us")) {
        return await sock.sendMessage(from, {
          text: "❌ Esse comando só funciona em grupos."
        }, { quoted: msg });
      }

      // nome novo obrigatório
      const newName = args.join(" ").trim();

      if (!newName) {
        return await sock.sendMessage(from, {
          text: "❌ Use assim:\n\n!setname Novo nome do grupo"
        }, { quoted: msg });
      }

      const metadata = await sock.groupMetadata(from);

      // normalizador
      const normalizeNumber = (jid) => {
        if (!jid) return "";
        return jid.split(":")[0].replace("@s.whatsapp.net", "");
      };

      // ===== checar se bot é admin =====
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
          text: "⚠️ Eu preciso ser ADMIN para mudar o nome do grupo."
        }, { quoted: msg });
      }

      // ===== checar se sender é admin =====
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

      // mudar nome
      await sock.groupUpdateSubject(from, newName);

      await sock.sendMessage(from, {
        text: `✅ Nome do grupo alterado para:\n\n📌 *${newName}*`
      }, { quoted: msg });

    } catch (err) {
      console.log("❌ Erro no setname:", err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Erro ao tentar mudar o nome do grupo."
      }, { quoted: msg });
    }
  }
};
