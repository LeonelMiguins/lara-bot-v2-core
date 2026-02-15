module.exports = {
  name: "setdesc",
  description: "Altera a descrição do grupo",
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
          text: "⚠️ Eu preciso ser ADMIN para mudar a descrição do grupo."
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

      // ===== pegar descrição pelo args OU pela mensagem respondida =====
      let newDesc = args.join(" ").trim();

      const quotedMsg =
        msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      if (!newDesc && quotedMsg) {
        newDesc =
          quotedMsg.conversation ||
          quotedMsg.extendedTextMessage?.text ||
          quotedMsg.imageMessage?.caption ||
          quotedMsg.videoMessage?.caption ||
          "";
      }

      if (!newDesc) {
        return await sock.sendMessage(from, {
          text: "❌ Use assim:\n\n!setdesc Nova descrição\n\nOU responda uma mensagem e mande:\n!setdesc"
        }, { quoted: msg });
      }

      // mudar descrição
      await sock.groupUpdateDescription(from, newDesc);

      await sock.sendMessage(from, {
        text: "✅ Descrição do grupo alterada com sucesso!"
      }, { quoted: msg });

    } catch (err) {
      console.log("❌ Erro no setdesc:", err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Erro ao tentar mudar a descrição do grupo."
      }, { quoted: msg });
    }
  }
};
