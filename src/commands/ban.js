module.exports = {
  name: "ban",
  description: "Remove (bane) um membro do grupo",
  async execute(sock, msg, args) {
    try {
      const from = msg.key.remoteJid;

      // ====== só grupo ======
      if (!from.endsWith("@g.us")) {
        return await sock.sendMessage(from, {
          text: "❌ Esse comando só funciona em grupos."
        });
      }

      // ====== pegar metadata ======
      const metadata = await sock.groupMetadata(from);

      // ====== normalizador ======
      const normalizeNumber = (jid) => {
        if (!jid) return "";
        return jid.split(":")[0].replace("@s.whatsapp.net", "");
      };

      // ====== checar se bot é admin (usando phoneNumber por causa do @lid) ======
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
          text: "⚠️ Eu preciso ser ADMIN para banir alguém."
        });
      }

      // ====== checar se quem executou é admin ======
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

      // ====== pegar alvo (mention ou reply) ======
      let targetJid = null;

      const mentioned =
        msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;

      if (mentioned && mentioned.length > 0) {
        targetJid = mentioned[0];
      }

      if (!targetJid) {
        const quoted = msg.message?.extendedTextMessage?.contextInfo;
        if (quoted?.participant) {
          targetJid = quoted.participant;
        }
      }

      if (!targetJid) {
        return await sock.sendMessage(from, {
          text: "❌ Marque alguém ou responda uma mensagem para banir.\n\nExemplo: !ban @membro"
        });
      }

      // ====== impedir banir o bot ======
      const botJidFull = sock.user.id.split(":")[0] + "@s.whatsapp.net";
      if (targetJid === botJidFull) {
        return await sock.sendMessage(from, {
          text: "🤡 Eu não posso me banir né kkkkk"
        });
      }

      // ====== checar se alvo existe ======
      const targetParticipant = metadata.participants.find((p) => p.id === targetJid);

      if (!targetParticipant) {
        return await sock.sendMessage(from, {
          text: "❌ Não encontrei esse membro no grupo."
        });
      }

      // ====== impedir banir admin/superadmin ======
      if (targetParticipant.admin === "admin" || targetParticipant.admin === "superadmin") {
        return await sock.sendMessage(from, {
          text: "⚠️ Não posso banir um ADMIN."
        });
      }

      // ====== banir ======
      await sock.groupParticipantsUpdate(from, [targetJid], "remove");

      await sock.sendMessage(from, {
        text: `🚫 @${targetJid.split("@")[0]} foi banido do grupo.`,
        mentions: [targetJid]
      });

    } catch (err) {
      console.log("❌ Erro no comando ban:", err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Erro ao tentar banir membro."
      });
    }
  }
};
