module.exports = async function welcomeHandler(sock, update) {
  try {
    const groupId = update.id;
    const participants = update.participants || [];
    const action = update.action;

    for (const user of participants) {
      // garante que seja string jid
      const userJid = typeof user === "string" ? user : user?.id;

      if (!userJid) continue;

      const mention = `@${userJid.split("@")[0]}`;

      if (action === "add") {
        await sock.sendMessage(groupId, {
          text: `👋 Bem-vindo(a) ${mention}!`,
          mentions: [userJid]
        });
      } else if (action === "remove") {
        await sock.sendMessage(groupId, {
          text: `👋 Adeus ${mention}!`,
          mentions: [userJid]
        });
      }
    }
  } catch (err) {
    console.log("Erro welcome:", err);
  }
};
