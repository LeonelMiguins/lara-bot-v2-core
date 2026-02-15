const fs = require("fs");
const path = require("path");

module.exports = {
  name: "saves",
  description: "Mostra todas as mensagens salvas do grupo",
  async execute(sock, msg, args) {
    try {
      const from = msg.key.remoteJid;

      // só grupo
      if (!from.endsWith("@g.us")) {
        return await sock.sendMessage(from, {
          text: "❌ Esse comando só funciona em grupos."
        }, { quoted: msg });
      }

      const groupFolder = path.join(__dirname, "..", "data", from);
      const filePath = path.join(groupFolder, "saves.json");

      if (!fs.existsSync(filePath)) {
        return await sock.sendMessage(from, {
          text: "📂 Nenhuma mensagem salva ainda.\n\nUse: !save (respondendo uma mensagem)"
        }, { quoted: msg });
      }

      let saves = [];
      try {
        saves = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      } catch (err) {
        saves = [];
      }

      if (!saves.length) {
        return await sock.sendMessage(from, {
          text: "📂 Nenhuma mensagem salva ainda."
        }, { quoted: msg });
      }

      // limitar pra não estourar
      const limit = 20;
      const lastSaves = saves.slice(-limit).reverse();

      let text = `📌 *MENSAGENS SALVAS (${saves.length})*\n\n`;
      let mentions = [];

      lastSaves.forEach((s, index) => {
        const preview = s.text.length > 60 ? s.text.substring(0, 60) + "..." : s.text;

        text += `*${index + 1}.* 👤 @${s.authorNumber}\n`;
        text += `🕒 ${s.date}\n`;
        text += `📝 ${preview}\n\n`;

        mentions.push(s.authorJid);
      });

      text += `📌 Mostrando as últimas ${lastSaves.length}.\n`;
      text += `Para salvar mais use: *!save*`;

      await sock.sendMessage(from, {
        text,
        mentions
      }, { quoted: msg });

    } catch (err) {
      console.log("❌ Erro no saves:", err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Erro ao listar saves."
      }, { quoted: msg });
    }
  }
};
