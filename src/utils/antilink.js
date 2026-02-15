module.exports = async function antiLink(sock, msg) {
  try {
    const from = msg.key.remoteJid;

    if (!from.endsWith("@g.us")) return false;
    if (msg.key.fromMe) return false;

    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.imageMessage?.caption ||
      msg.message?.videoMessage?.caption ||
      "";

    if (!text) return false;

    // Detecta links
    const linkRegex = /(https?:\/\/|www\.|t\.me\/|chat\.whatsapp\.com\/|wa\.me\/|[a-z0-9-]+\.(com|net|org|br|io|gg|tv|me|app|site|store|vip|bet|xyz|top|live|club|cc|co|info))/i;

    if (!linkRegex.test(text)) return false;

    // ================= METADATA =================
    const metadata = await sock.groupMetadata(from);

    // ================= NORMALIZAR =================
    const normalizeNumber = (jid) => {
      if (!jid) return "";
      return jid.split(":")[0].replace("@s.whatsapp.net", "");
    };

    const botNumber = normalizeNumber(sock.user.id);

    // ================= ACHAR BOT PELO phoneNumber =================
    const botParticipant = metadata.participants.find((p) => {
      const pNumber = normalizeNumber(p.phoneNumber);
      return pNumber === botNumber;
    });

    console.log("🤖 BOT NUMBER:", botNumber);
    console.log("👥 BOT PARTICIPANT:", botParticipant);

    const isAdmin =
      botParticipant &&
      (botParticipant.admin === "admin" ||
        botParticipant.admin === "superadmin");

    console.log("✅ BOT IS ADMIN?", isAdmin);

    if (!isAdmin) {
      await sock.sendMessage(from, {
        text: "⚠️ Anti-link ativo, mas preciso ser ADMIN para apagar mensagens."
      });
      return true;
    }

    // ================= APAGAR MENSAGEM =================
    await sock.sendMessage(from, {
      delete: {
        remoteJid: from,
        fromMe: false,
        id: msg.key.id,
        participant: msg.key.participant
      }
    });

    // ================= AVISO =================
    await sock.sendMessage(from, {
      text: `🚫 Links não são permitidos neste grupo.\n\n👤 @${msg.key.participant.split("@")[0]}`,
      mentions: [msg.key.participant]
    });

    return true;
  } catch (err) {
    console.log("❌ Erro no AntiLink:", err);
    return false;
  }
};
