const fs = require("fs");
const path = require("path");

module.exports = {
  name: "rules",
  description: "Mostra ou configura as regras do grupo",
  async execute(sock, msg, args) {
    try {
      const from = msg.key.remoteJid;

      // ====== Só grupo ======
      if (!from.endsWith("@g.us")) {
        return await sock.sendMessage(from, {
          text: "❌ Esse comando só funciona em grupos."
        });
      }

      // ====== regras padrão ======
      const defaultRules = `
📌 *REGRAS DO GRUPO*

1️⃣ Respeito acima de tudo
2️⃣ Proibido spam / flood
3️⃣ Proibido links (sem permissão)
4️⃣ Proibido conteúdo +18
5️⃣ Proibido golpes, bets e divulgação
6️⃣ Sem brigas, discussões pesadas ou ofensas
7️⃣ Admin tem a palavra final

⚠️ Quem desrespeitar pode levar ban.
      `.trim();

      // ====== pasta do grupo ======
      const groupFolder = path.join(__dirname, "../data", from);
      const rulesFile = path.join(groupFolder, "rules.json");

      if (!fs.existsSync(groupFolder)) {
        fs.mkdirSync(groupFolder, { recursive: true });
      }

      // ====== pegar regras salvas ======
      const getSavedRules = () => {
        if (!fs.existsSync(rulesFile)) return null;

        try {
          const data = fs.readFileSync(rulesFile, "utf-8");
          const json = JSON.parse(data);
          return json.rules || null;
        } catch (err) {
          return null;
        }
      };

      // ====== salvar regras ======
      const saveRules = (text) => {
        const payload = {
          rules: text,
          updatedAt: new Date().toISOString()
        };

        fs.writeFileSync(rulesFile, JSON.stringify(payload, null, 2), "utf-8");
      };

      // ====== checar se admin ======
      const metadata = await sock.groupMetadata(from);

      const sender = msg.key.participant;

      const senderParticipant = metadata.participants.find((p) => p.id === sender);

      const senderIsAdmin =
        senderParticipant &&
        (senderParticipant.admin === "admin" ||
          senderParticipant.admin === "superadmin");

      // =====================================================
      // COMANDO: !rules set  (respondendo uma mensagem)
      // =====================================================
      if (args[0] && args[0].toLowerCase() === "set") {
        if (!senderIsAdmin) {
          return await sock.sendMessage(from, {
            text: "❌ Apenas ADMIN pode alterar as regras."
          }, { quoted: msg });
        }

        const quotedText =
          msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
          msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
          msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage?.caption ||
          msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage?.caption ||
          "";

        if (!quotedText) {
          return await sock.sendMessage(from, {
            text: "❌ Para definir regras, responda uma mensagem contendo as regras.\n\nExemplo:\nResponda uma mensagem e digite: !rules set"
          }, { quoted: msg });
        }

        saveRules(quotedText);

        return await sock.sendMessage(from, {
          text: "✅ Regras atualizadas e salvas com sucesso!"
        }, { quoted: msg });
      }

      // =====================================================
      // COMANDO: !rules reset
      // =====================================================
      if (args[0] && args[0].toLowerCase() === "reset") {
        if (!senderIsAdmin) {
          return await sock.sendMessage(from, {
            text: "❌ Apenas ADMIN pode resetar as regras."
          }, { quoted: msg });
        }

        if (fs.existsSync(rulesFile)) {
          fs.unlinkSync(rulesFile);
        }

        return await sock.sendMessage(from, {
          text: "✅ Regras resetadas para o padrão."
        }, { quoted: msg });
      }

      // =====================================================
      // COMANDO: !rules (mostrar)
      // =====================================================
      const savedRules = getSavedRules();

      await sock.sendMessage(from, {
        text: savedRules || defaultRules
      }, { quoted: msg });

    } catch (err) {
      console.log("❌ Erro no comando rules:", err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Erro ao mostrar/salvar regras."
      }, { quoted: msg });
    }
  }
};
