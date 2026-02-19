module.exports = async function welcomeHandler(sock, update, PREFIX = "!") {
  try {
    const groupId = update.id;
    const participants = update.participants || [];
    const action = update.action;

    // pegar nome do grupo e membros
    const metadata = await sock.groupMetadata(groupId);
    const groupName = metadata.subject || "Grupo";
    const totalMembers = metadata.participants?.length || 0;

    for (const user of participants) {
      // garante que seja string jid
      const userJid = typeof user === "string" ? user : user?.id;
      if (!userJid) continue;

      const userNumber = userJid.split("@")[0];
      const mention = `@${userNumber}`;

      if (action === "add") {
        await sock.sendMessage(groupId, {
          text:
            `🎉 *Olá ${mention}, Bem-vindo(a) ao grupo *${groupName}*!* 🎉\n\n` +
            `📌 Para ver as regras envie *${PREFIX}rules*.\n` +
            `📌 Para ver meus comandos envie *${PREFIX}menu*.\n\n` +
            `👥 Membros agora: *${totalMembers}*\n\n`,
          mentions: [userJid]
        });

      } else if (action === "remove") {
        await sock.sendMessage(groupId, {
          text:
            `*${mention}* saiu do grupo *${groupName}*!\n\n` +
            `👥 Membros agora: *${totalMembers}*\n\n` +
            `👋  Até mais...`,
          mentions: [userJid]
        });
      }
    }

  } catch (err) {
    console.log("❌ Erro welcome:", err);
  }
};
