const sharp = require("sharp");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

module.exports = {
  name: "toimg",
  description: "Transforma figurinha/imagem em imagem normal",
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
          text: "❌ Esse comando não suporta vídeo."
        }, { quoted: msg });
      }

      // se não for imagem
      if (!imageMessage) {
        return await sock.sendMessage(from, {
          text: "❌ Envie ou responda uma IMAGEM e use !toimg"
        }, { quoted: msg });
      }

      // baixar imagem
      const stream = await downloadContentFromMessage(imageMessage, "image");

      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      // converter para PNG (imagem normal)
      const imgBuffer = await sharp(buffer)
        .resize(1024, 1024, { fit: "inside" })
        .png()
        .toBuffer();

      // enviar como imagem
      await sock.sendMessage(from, {
        image: imgBuffer,
        caption: "✅ Aqui está sua imagem!"
      }, { quoted: msg });

    } catch (err) {
      console.log("❌ Erro toimg:", err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Erro ao converter para imagem."
      }, { quoted: msg });
    }
  }
};
