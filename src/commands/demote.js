module.exports = {
  name: "demote",
  description: "Remove ADMIN de um membro no grupo",
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

      // ====== BOT number ======
      const botNumber = normalizeNumber(sock.user.id);

      // ====== Achar bot participant pelo phoneNumber (corrigido @lid) ======
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
          text: "⚠️ Eu preciso ser ADMIN para remover admin de alguém."
        });
      }

      // ====== Checar se quem executou é admin ======
      const sender = msg.key.participant;

      const senderParticipant = metadata.participants.find((p) => p.id === sender);

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

      // caso mention
      const mentioned =
        msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;

      if (mentioned && mentioned.length > 0) {
        targetJid = mentioned[0];
      }

      // caso reply
      if (!targetJid) {
        const quoted = msg.message?.extendedTextMessage?.contextInfo;

        if (quoted?.participant) {
          targetJid = quoted.participant;
        }
      }

      if (!targetJid) {
        return await sock.sendMessage(from, {
          text: "❌ Marque alguém ou responda uma mensagem para remover admin.\n\nExemplo: !demote @membro"
        });
      }

      // ====== Checar se alvo existe ======
      const targetParticipant = metadata.participants.find((p) => p.id === targetJid);

      if (!targetParticipant) {
        return await sock.sendMessage(from, {
          text: "❌ Não encontrei esse membro no grupo."
        });
      }

      // ====== Checar se alvo é admin ======
      if (targetParticipant.admin !== "admin" && targetParticipant.admin !== "superadmin") {
        return await sock.sendMessage(from, {
          text: "⚠️ Esse membro não é ADMIN."
        });
      }

      // ====== NÃO deixar remover superadmin (criador do grupo) ======
      if (targetParticipant.admin === "superadmin") {
        return await sock.sendMessage(from, {
          text: "⚠️ Não posso remover ADMIN do criador do grupo (superadmin)."
        });
      }

      // ====== Remover admin ======
      await sock.groupParticipantsUpdate(from, [targetJid], "demote");

      await sock.sendMessage(from, {
        text: `✅ @${targetJid.split("@")[0]} não é mais ADMIN.`,
        mentions: [targetJid]
      });

    } catch (err) {
      console.log("❌ Erro no comando demote:", err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Erro ao tentar remover admin."
      });
    }
  }
};
