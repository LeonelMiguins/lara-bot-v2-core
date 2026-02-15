const fs = require("fs");
const path = require("path");

module.exports = {
  name: "save",
  description: "Salva uma mensagem respondida no arquivo saves.json",
  async execute(sock, msg, args) {
    try {
      const from = msg.key.remoteJid;

      // só grupo
      if (!from.endsWith("@g.us")) {
        return await sock.sendMessage(from, {
          text: "❌ Esse comando só funciona em grupos."
        }, { quoted: msg });
      }

      const quoted =
        msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      const quotedParticipant =
        msg.message?.extendedTextMessage?.contextInfo?.participant;

      const stanzaId =
        msg.message?.extendedTextMessage?.contextInfo?.stanzaId;

      if (!quoted || !quotedParticipant) {
        return await sock.sendMessage(from, {
          text: "❌ Responda uma mensagem e use:\n\n!save"
        }, { quoted: msg });
      }

      // pegar texto da mensagem respondida
      const text =
        quoted.conversation ||
        quoted.extendedTextMessage?.text ||
        quoted.imageMessage?.caption ||
        quoted.videoMessage?.caption ||
        quoted.documentMessage?.caption ||
        "";

      if (!text) {
        return await sock.sendMessage(from, {
          text: "❌ Só consigo salvar mensagens que tenham TEXTO ou legenda."
        }, { quoted: msg });
      }

      // pasta e arquivo
      const groupFolder = path.join(__dirname, "..", "data", from);
      const filePath = path.join(groupFolder, "saves.json");

      if (!fs.existsSync(groupFolder)) {
        fs.mkdirSync(groupFolder, { recursive: true });
      }

      // carregar saves existentes
      let saves = [];
      if (fs.existsSync(filePath)) {
        try {
          saves = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        } catch (err) {
          saves = [];
        }
      }

      // formatar números
      const authorNumber = quotedParticipant.split("@")[0];
      const savedBy = (msg.key.participant || "").split("@")[0];

      // horário Brasil
      const now = new Date();
      const brTime = now.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

      // criar objeto
      const saveObj = {
        id: stanzaId || null,
        authorJid: quotedParticipant,
        authorNumber: authorNumber,
        savedBy: savedBy,
        text: text,
        date: brTime,
        timestamp: Date.now()
      };

      saves.push(saveObj);

      // salvar
      fs.writeFileSync(filePath, JSON.stringify(saves, null, 2));

      await sock.sendMessage(from, {
        text:
          `✅ Mensagem salva com sucesso!\n\n` +
          `👤 Autor: @${authorNumber}\n` +
          `🕒 Data: ${brTime}\n` +
          `📝 Texto: ${text.substring(0, 200)}${text.length > 200 ? "..." : ""}`
        ,
        mentions: [quotedParticipant]
      }, { quoted: msg });

    } catch (err) {
      console.log("❌ Erro no save:", err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Erro ao salvar mensagem."
      }, { quoted: msg });
    }
  }
};
