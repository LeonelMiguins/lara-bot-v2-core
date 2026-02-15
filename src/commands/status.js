const os = require("os");

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

function formatBytes(bytes) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Bytes";

  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

module.exports = {
  name: "botstatus",
  description: "Mostra informações completas do bot e servidor",
  async execute(sock, msg, args) {
    try {
      const from = msg.key.remoteJid;

      const start = Date.now();

      // tempo pra calcular ping real
      await sock.sendPresenceUpdate("available", from);
      const ping = Date.now() - start;

      const uptime = formatUptime(process.uptime());

      const mem = process.memoryUsage();
      const rss = formatBytes(mem.rss);
      const heapTotal = formatBytes(mem.heapTotal);
      const heapUsed = formatBytes(mem.heapUsed);
      const external = formatBytes(mem.external);

      const totalRam = formatBytes(os.totalmem());
      const freeRam = formatBytes(os.freemem());

      const cpu = os.cpus();
      const cpuModel = cpu[0]?.model || "Desconhecido";
      const cpuCores = cpu.length;

      const load = os.loadavg(); // linux
      const loadText = `${load[0].toFixed(2)} | ${load[1].toFixed(2)} | ${load[2].toFixed(2)}`;

      const platform = os.platform();
      const arch = os.arch();
      const hostname = os.hostname();

      const nodeVersion = process.version;
      const pid = process.pid;

      const botJid = sock.user?.id || "Desconhecido";
      const botNumber = botJid.split(":")[0].replace("@s.whatsapp.net", "");

      // chats/grupos carregados
      const chatsCount = sock.chats ? Object.keys(sock.chats).length : "N/A";

      // contar grupos
      let groupsCount = "N/A";
      if (sock.chats) {
        const groups = Object.keys(sock.chats).filter((id) =>
          id.endsWith("@g.us")
        );
        groupsCount = groups.length;
      }

      const now = new Date();
      const timeNow = now.toLocaleString("pt-BR");

      const text = `
🤖 *BOT STATUS - PAINEL COMPLETO*

🟢 *STATUS*
✅ Online: Sim
⚡ Ping: ${ping}ms
⏳ Uptime: ${uptime}

👤 *BOT INFO*
📞 Número: +${botNumber}
🆔 JID: ${botJid}

💻 *SERVIDOR / SISTEMA*
🖥️ Hostname: ${hostname}
🧱 Plataforma: ${platform}
🏗️ Arquitetura: ${arch}
📅 Data/Hora: ${timeNow}

🧠 *CPU*
⚙️ Modelo: ${cpuModel}
🧩 Núcleos: ${cpuCores}
📊 LoadAvg (1m|5m|15m): ${loadText}

📦 *MEMÓRIA RAM*
🟩 RAM Total: ${totalRam}
🟨 RAM Livre: ${freeRam}

🧪 *MEMÓRIA DO PROCESSO (NODE)*
📌 RSS: ${rss}
📌 Heap Total: ${heapTotal}
📌 Heap Usada: ${heapUsed}
📌 External: ${external}

⚙️ *NODE / PROCESSO*
🟢 NodeJS: ${nodeVersion}
🧷 PID: ${pid}
📂 Pasta: ${process.cwd()}

💬 *WHATSAPP*
📌 Chats carregados: ${chatsCount}
👥 Grupos carregados: ${groupsCount}

━━━━━━━━━━━━━━━━━━
⚡ Lara Bot V2 - Monitoramento
`;

      await sock.sendMessage(from, { text }, { quoted: msg });

    } catch (err) {
      console.log("❌ Erro no botstatus:", err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Erro ao puxar status do bot."
      }, { quoted: msg });
    }
  }
};
