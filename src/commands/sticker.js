const sharp = require("sharp");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

module.exports = {
  name: "sticker",
  description: "Cria figurinha estática a partir de imagem",
  async execute(sock, msg, args) {
    try {
      const from = msg.key.remoteJid;

      // pegar mídia do msg ou da mensagem respondida
      const quoted =
        msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      const imageMessage =
        msg.message?.imageMessage || quoted?.imageMessage;

      const videoMessage =
        msg.message?.videoMessage || quoted?.videoMessage;

      // se for vídeo
      if (videoMessage) {
        return await sock.sendMessage(from, {
          text: "❌ Eu só faço figurinha estática (imagem). Vídeo não suportado."
        }, { quoted: msg });
      }

      // se não for imagem
      if (!imageMessage) {
        return await sock.sendMessage(from, {
          text: "❌ Envie ou responda uma IMAGEM e use !sticker"
        }, { quoted: msg });
      }

      // baixar imagem
      const stream = await downloadContentFromMessage(imageMessage, "image");

      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      // converter pra webp
      const webpBuffer = await sharp(buffer)
        .resize(512, 512, { fit: "inside" })
        .toFormat("webp")
        .toBuffer();

      // enviar figurinha
      await sock.sendMessage(from, { sticker: webpBuffer }, { quoted: msg });

    } catch (err) {
      console.log("❌ Erro sticker:", err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Erro ao criar figurinha."
      }, { quoted: msg });
    }
  }
};
