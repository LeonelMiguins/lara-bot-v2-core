module.exports = {
  name: "scan",
  description: "Escaneia informações públicas de um membro",
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

      // pegar alvo (mention ou reply)
      const mentioned =
        msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

      const quotedParticipant =
        msg.message?.extendedTextMessage?.contextInfo?.participant;

      let targetJid = null;

      if (mentioned.length > 0) {
        targetJid = mentioned[0];
      } else if (quotedParticipant) {
        targetJid = quotedParticipant;
      } else {
        return await sock.sendMessage(from, {
          text: "❌ Marque alguém ou responda a mensagem da pessoa.\n\nExemplo:\n!scan @membro"
        }, { quoted: msg });
      }

      // procurar no grupo
      const participant = metadata.participants.find((p) => p.id === targetJid);

      if (!participant) {
        return await sock.sendMessage(from, {
          text: "❌ Essa pessoa não está no grupo."
        }, { quoted: msg });
      }

      const number = targetJid.split("@")[0];

      // role admin
      let roleText = "👤 Membro";
      if (participant.admin === "admin") roleText = "✅ Admin";
      if (participant.admin === "superadmin") roleText = "⭐ Dono (SuperAdmin)";

      // tentar pegar foto
      let profilePic = null;
      try {
        profilePic = await sock.profilePictureUrl(targetJid, "image");
      } catch (err) {
        profilePic = null;
      }

      // tentar pegar about/status
      let about = null;
      try {
        const aboutData = await sock.fetchStatus(targetJid);
        about = aboutData?.status || null;
      } catch (err) {
        about = null;
      }

      // montar texto
      let text = `🕵️ *SCAN DE MEMBRO*\n\n`;
      text += `📌 *Grupo:* ${metadata.subject}\n`;
      text += `👤 *Usuário:* @${number}\n`;
      text += `🆔 *JID:* ${targetJid}\n`;
      text += `👮 *Cargo:* ${roleText}\n\n`;

      if (about) {
        text += `💬 *Recado:* ${about}\n\n`;
      } else {
        text += `💬 *Recado:* (Privado ou não disponível)\n\n`;
      }

      text += `🔒 *Privacidade:* Algumas informações podem estar ocultas.\n`;

      // se tiver foto manda com imagem
      if (profilePic) {
        return await sock.sendMessage(from, {
          image: { url: profilePic },
          caption: text,
          mentions: [targetJid]
        }, { quoted: msg });
      }

      // se não tiver foto manda só texto
      await sock.sendMessage(from, {
        text,
        mentions: [targetJid]
      }, { quoted: msg });

    } catch (err) {
      console.log("❌ Erro no scan:", err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Erro ao escanear usuário."
      }, { quoted: msg });
    }
  }
};
