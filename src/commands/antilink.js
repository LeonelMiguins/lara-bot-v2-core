const fs = require("fs");
const path = require("path");

module.exports = {
  name: "antilink",
  description: "Liga ou desliga o sistema Anti-Link do bot",
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

      // ================= CHECAR BOT ADMIN =================
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
          text: "⚠️ Eu preciso ser ADMIN para executar esse comando."
        }, { quoted: msg });
      }

      // ================= CHECAR SE QUEM PEDIU É ADMIN =================
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

      // ================= CONFIG.JSON =================
      const configPath = path.join(__dirname, "..", "..", "config.json");

      if (!fs.existsSync(configPath)) {
        return await sock.sendMessage(from, {
          text: "❌ config.json não encontrado."
        }, { quoted: msg });
      }

      let configData;
      try {
        configData = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      } catch (err) {
        return await sock.sendMessage(from, {
          text: "❌ Erro ao ler config.json (JSON inválido)."
        }, { quoted: msg });
      }

      // ================= COMANDO =================
      const option = (args[0] || "").toLowerCase();

      // se não mandou nada, mostra status
      if (!option) {
        return await sock.sendMessage(from, {
          text:
            `⚙️ *Status Anti-Link*\n\n` +
            `🔒 Anti-Link: *${configData.antiLink ? "ATIVADO ✅" : "DESATIVADO ❌"}*\n\n` +
            `Use:\n` +
            `📌 #antilink on\n` +
            `📌 #antilink off`
        }, { quoted: msg });
      }

      if (option !== "on" && option !== "off") {
        return await sock.sendMessage(from, {
          text:
            `❌ Opção inválida.\n\nUse:\n` +
            `📌 #antilink on\n` +
            `📌 #antilink off`
        }, { quoted: msg });
      }

      const newStatus = option === "on";

      // já está nesse estado
      if (configData.antiLink === newStatus) {
        return await sock.sendMessage(from, {
          text: `⚠️ Anti-Link já está ${newStatus ? "ATIVADO ✅" : "DESATIVADO ❌"}`
        }, { quoted: msg });
      }

      // atualizar config
      configData.antiLink = newStatus;

      fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));

      await sock.sendMessage(from, {
        text: `✅ Anti-Link foi ${newStatus ? "ATIVADO ✅" : "DESATIVADO ❌"} com sucesso!`
      }, { quoted: msg });

    } catch (err) {
      console.log("❌ Erro no comando antilink:", err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Erro ao executar comando Anti-Link."
      }, { quoted: msg });
    }
  }
};
