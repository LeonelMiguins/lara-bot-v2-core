module.exports = {
  name: "adms",
  description: "Mostra a lista de administradores do grupo",
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

      // filtrar admins
      const admins = metadata.participants.filter(
        (p) => p.admin === "admin" || p.admin === "superadmin"
      );

      if (admins.length === 0) {
        return await sock.sendMessage(from, {
          text: "❌ Nenhum admin encontrado no grupo."
        }, { quoted: msg });
      }

      const mentions = admins.map((p) => p.id);

      let text = `👮 *LISTA DE ADMINS (${admins.length})*\n\n`;

      for (const adm of admins) {
        const number = adm.id.split("@")[0];
        const role = adm.admin === "superadmin" ? "⭐ DONO" : "✅ ADMIN";
        text += `${role} - @${number}\n`;
      }

      await sock.sendMessage(from, {
        text,
        mentions
      }, { quoted: msg });

    } catch (err) {
      console.log("❌ Erro no comando adms:", err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Erro ao listar admins."
      }, { quoted: msg });
    }
  }
};
