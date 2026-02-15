module.exports = {
  name: "promote",
  description: "Promove um membro para ADMIN no grupo",
  async execute(sock, msg, args) {
    try {
      const from = msg.key.remoteJid;

      // ====== Checar se é grupo ======
      if (!from.endsWith("@g.us")) {
        return await sock.sendMessage(from, {
          text: "❌ Esse comando só funciona em grupos."
        });
      }

      // ====== Pegar metadata ======
      const metadata = await sock.groupMetadata(from);

      // ====== Normalizador de número ======
      const normalizeNumber = (jid) => {
        if (!jid) return "";
        return jid.split(":")[0].replace("@s.whatsapp.net", "");
      };

      // ====== ID/Número do bot ======
      const botNumber = normalizeNumber(sock.user.id);

      // ====== Achar bot dentro do grupo usando phoneNumber (corrigido) ======
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
          text: "⚠️ Eu preciso ser ADMIN para promover alguém."
        });
      }

      // ====== Checar se quem usou o comando é admin ======
      const sender = msg.key.participant;

      const senderParticipant = metadata.participants.find((p) => {
        return p.id === sender;
      });

      const senderIsAdmin =
        senderParticipant &&
        (senderParticipant.admin === "admin" ||
          senderParticipant.admin === "superadmin");

      if (!senderIsAdmin) {
        return await sock.sendMessage(from, {
          text: "❌ Você precisa ser ADMIN para usar esse comando."
        });
      }

      // ====== Pegar alvo (mention ou reply) ======
      let targetJid = null;

      // se marcou alguém
      const mentioned =
        msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;

      if (mentioned && mentioned.length > 0) {
        targetJid = mentioned[0];
      }

      // se respondeu mensagem
      if (!targetJid) {
        const quoted = msg.message?.extendedTextMessage?.contextInfo;

        if (quoted?.participant) {
          targetJid = quoted.participant;
        }
      }

      if (!targetJid) {
        return await sock.sendMessage(from, {
          text: "❌ Marque alguém ou responda uma mensagem para promover.\n\nExemplo: !promote @membro"
        });
      }

      // ====== Checar se o alvo já é admin ======
      const targetParticipant = metadata.participants.find((p) => {
        return p.id === targetJid;
      });

      if (!targetParticipant) {
        return await sock.sendMessage(from, {
          text: "❌ Não encontrei esse membro no grupo."
        });
      }

      if (targetParticipant.admin === "admin" || targetParticipant.admin === "superadmin") {
        return await sock.sendMessage(from, {
          text: "⚠️ Esse membro já é ADMIN."
        });
      }

      // ====== Promover ======
      await sock.groupParticipantsUpdate(from, [targetJid], "promote");

      await sock.sendMessage(from, {
        text: `✅ @${targetJid.split("@")[0]} foi promovido para ADMIN!`,
        mentions: [targetJid]
      });

    } catch (err) {
      console.log("❌ Erro no comando promote:", err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Erro ao tentar promover membro."
      });
    }
  }
};
