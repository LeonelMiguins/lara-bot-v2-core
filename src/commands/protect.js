const fs = require("fs");
const path = require("path");

module.exports = {
  name: "protect",
  description: "Protege ou desprotege o grupo",
  async execute(sock, msg, args) {
    try {
      const from = msg.key.remoteJid;

      // só grupo
      if (!from.endsWith("@g.us")) {
        return await sock.sendMessage(from, {
          text: "❌ Esse comando só funciona em grupos."
        }, { quoted: msg });
      }

      const action = args[0]?.toLowerCase();

      if (!action || (action !== "on" && action !== "off")) {
        return await sock.sendMessage(from, {
          text: "❌ Use:\n\n!protect on\n!protect off"
        }, { quoted: msg });
      }

      const metadata = await sock.groupMetadata(from);

      // ===== normalizador =====
      const normalizeNumber = (jid) => {
        if (!jid) return "";
        return jid.split(":")[0].replace("@s.whatsapp.net", "");
      };

      // ===== checar se bot é admin (usando phoneNumber por causa do @lid) =====
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
          text: "⚠️ Eu preciso ser ADMIN para ativar/desativar proteção."
        }, { quoted: msg });
      }

      // ===== checar se quem pediu é admin =====
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

      // ===== pasta e arquivo =====
      const groupFolder = path.join(__dirname, "..", "data", from);
      const filePath = path.join(groupFolder, "group_data.json");

      if (!fs.existsSync(groupFolder)) {
        fs.mkdirSync(groupFolder, { recursive: true });
      }

      // =========================
      // ===== PROTECT ON =========
      // =========================
      if (action === "on") {
        // salvar dados antes
        const originalData = {
          groupId: from,
          subject: metadata.subject || "",
          desc: metadata.desc || "",
          protectedAt: new Date().toISOString()
        };

        fs.writeFileSync(filePath, JSON.stringify(originalData, null, 2));

        // resetar link convite
        await sock.groupRevokeInvite(from);

        // adicionar cadeado no nome se não tiver
        let newSubject = metadata.subject || "Grupo";
        if (!newSubject.startsWith("🔒")) {
          newSubject = `🔒 ${newSubject}`;
        }

        // nova descrição
        const newDesc =
          "🔒 GRUPO PROTEGIDO\n\n" +
          "⚠️ Segurança ativada contra ataques e travas.\n" +
          "🚫 Links suspeitos serão removidos.\n" +
          "👮 Apenas admins podem controlar configurações.\n\n" +
          "✅ Proteção ativada pelo bot.";

        // atualizar nome e descrição
        await sock.groupUpdateSubject(from, newSubject);
        await sock.groupUpdateDescription(from, newDesc);

        // mensagem no grupo
        await sock.sendMessage(from, {
          text:
            "🔒 *MODO PROTEÇÃO ATIVADO*\n\n" +
            "✅ Link de convite foi resetado.\n" +
            "🔒 Nome e descrição foram alterados.\n\n" +
            "⚠️ Grupo protegido contra ataques e a maioria das travas."
        }, { quoted: msg });

        return;
      }

      // ==========================
      // ===== PROTECT OFF =========
      // ==========================
      if (action === "off") {
        if (!fs.existsSync(filePath)) {
          return await sock.sendMessage(from, {
            text: "❌ Não achei nenhum backup salvo.\nAtive primeiro com: !protect on"
          }, { quoted: msg });
        }

        const saved = JSON.parse(fs.readFileSync(filePath));

        let oldSubject = saved.subject || "Grupo";
        let oldDesc = saved.desc || "";

        // caso o subject esteja com cadeado, remove
        oldSubject = oldSubject.replace(/^🔒\s*/g, "");

        // restaurar nome e descrição
        await sock.groupUpdateSubject(from, oldSubject);
        await sock.groupUpdateDescription(from, oldDesc);

        await sock.sendMessage(from, {
          text:
            "🔓 *MODO PROTEÇÃO DESATIVADO*\n\n" +
            "✅ Nome do grupo restaurado.\n" +
            "✅ Descrição restaurada.\n\n" +
            "📌 Grupo voltou ao normal."
        }, { quoted: msg });

        return;
      }

    } catch (err) {
      console.log("❌ Erro no protect:", err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Erro ao executar proteção."
      }, { quoted: msg });
    }
  }
};
