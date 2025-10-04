const { plugin, isAccess, mode } = require("../lib");

plugin(
  {
    pattern: "tagall",
    type: "group",
    fromMe: mode,
    desc: "Tag all group members with custom style",
  },
  async (m, text) => {
    if (!m.isGroup) return await m.reply("*_This command is for groups_*");
    if (!(await isAccess(m))) {
      return await m.send(
        "*_Only bot owner and group admins can use this command_*"
      );
    }
    try {
      const conn = m.client;
      const from = m.from;
      const groupMetadata = await conn.groupMetadata(from);
      const participants = groupMetadata.participants;
      const groupName = groupMetadata.subject || "Unknown Group";
      let totalMembers = participants ? participants.length : 0;
      if (totalMembers === 0)
        return m.reply("❌ No members found in this group.");
      const msgText = text?.trim() || "ATTENTION EVERYONE";
      const emojis = [
        "⚡",
        "✨",
        "🎖️",
        "💎",
        "🔱",
        "💗",
        "❤‍🩹",
        "👻",
        "🌟",
        "🪄",
        "🎋",
        "🪼",
        "🍿",
        "👀",
        "👑",
        "🦋",
        "🐋",
        "🌻",
        "🌸",
        "🔥",
        "🍉",
        "🍧",
        "🍨",
        "🍦",
        "🧃",
        "🪀",
        "🎾",
        "🪇",
        "🎲",
        "🎡",
        "🧸",
        "🎀",
        "🎈",
        "🩵",
        "♥️",
        "🚩",
        "🏳️‍🌈",
        "🏖️",
        "🔪",
        "🎏",
        "🫐",
        "🍓",
        "💋",
        "🍄",
        "🎐",
        "🍇",
        "🐍",
        "🪻",
        "🪸",
        "💀",
      ];
      const getEmoji = () => emojis[Math.floor(Math.random() * emojis.length)];
      let tagText = `*▢ GROUP : ${groupName}*\n*▢ MEMBERS : ${totalMembers}*\n*▢ MESSAGE : ${msgText}*\n\n*╭┈─「 ɦเ αℓℓ ƒɾเεɳ∂ร 🥰 」┈❍*\n`;
      for (const p of participants) {
        tagText += `*│${getEmoji()} ᩧ𝆺ྀི𝅥* @${p.id.split("@")[0]}\n`;
      }
      tagText += "*╰────────────❍*";
      const mentions = participants.map((p) => p.id);
      await conn.sendMessage(
        from,
        {
          text: tagText,
          mentions,
        },
        { quoted: m }
      );
    } catch (err) {
      console.error("tagall error:", err);
      m.reply("❌ An error occurred while tagging members.");
    }
  }
);
