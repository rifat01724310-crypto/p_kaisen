const {
  plugin,
  personalDB,
  extractUrlsFromString,
  config,
  linkPreview,
  mood,
  isBot,
} = require("../lib");

const { exec } = require("child_process");
const axios = require("axios");
const fs = require("fs");

plugin(
  {
    pattern: "restart ?(.*)",
    desc: "restart bot",
    react: "🥱",
    type: "system",
    fromMe: mood,
  },
  async (message, match) => {
     if (!await isBot(message)) {
		return await message.send('*_Only bot owner can use this command_*');
    }
    await message.send("```restarting```", { linkPreview: linkPreview() });
    process.exit(0);
  }
);
plugin(
  {
    pattern: "plugin ?(.*)",
    desc: "install external plugins",
    react: "🦥",
    type: "system",
    fromMe: mood,
  },
  async (message, match) => {
    if (!await isBot(message)) {
      return await message.send('*_Only bot owner can use this command_*');
    }
    
    // Get plugin code from message or reply
    let pluginCode = match || message.reply_message?.text;
    
    if (!pluginCode) {
      // List installed plugins if no code provided
      const { plugins } = await personalDB(
        ["plugins"],
        { content: {} },
        "get",
        message.client.user.id.split(":")[0]
      );
      
      if (!Object.keys(plugins)[0]) {
        return await message.send("```no plugins found```", {
          linkPreview: linkPreview(),
        });
      }
      
      let text = "*LIST OF EXTERNAL PLUGINS*\n\n";
      for (const p in plugins) {
        text += `_*${p}*_\n\n`;
      }
      return await message.send(text, { linkPreview: linkPreview() });
    }
    
    await message.send("```Processing plugin...```", { linkPreview: linkPreview() });
    
    try {
      // Extract plugin name from pattern field
      const patternMatch = pluginCode.match(/pattern:\s*["']([^"']+)["']/);
      if (!patternMatch) {
        return message.send("```Invalid plugin format. Pattern field not found.```", {
          linkPreview: linkPreview(),
        });
      }
      
      const pluginName = patternMatch[1].split(" ")[0];
      const fileName = pluginName.replace(/[^a-zA-Z0-9]/g, '_');
      const filePath = __dirname + "/" + fileName + ".js";
      const botNumber = message.client.user.id.split(":")[0];
      
      // Check if plugin already exists
      const { plugins } = await personalDB(
        ["plugins"],
        { content: {} },
        "get",
        botNumber
      );
      
      let isUpdate = false;
      if (plugins && plugins[pluginName]) {
        isUpdate = true;
        
        // Delete old plugin from database
        await personalDB(
          ["plugins"],
          { 
            content: pluginName
          },
          "delete",
          botNumber
        );
        
        // Delete old plugin file if exists
        if (fs.existsSync(filePath)) {
          try {
            delete require.cache[require.resolve(filePath)];
            fs.unlinkSync(filePath);
          } catch (e) {
            // Ignore if file doesn't exist
          }
        }
      }
      
      // Write new plugin file
      fs.writeFileSync(filePath, pluginCode);
      
      // Load the new plugin
      try {
        delete require.cache[require.resolve(filePath)];
        require(filePath);
      } catch (loadError) {
        fs.unlinkSync(filePath);
        return await message.send(`\`\`\`Plugin loading error:\n${loadError.message}\`\`\``, {
          linkPreview: linkPreview(),
        });
      }
      
      // Save new plugin to database
      await personalDB(
        ["plugins"],
        {
          content: {
            [pluginName]: pluginCode,
          },
        },
        "add",
        botNumber
      );
      
      // Clean up temporary file
      fs.unlinkSync(filePath);
      
      // Send appropriate message
      if (isUpdate) {
        await message.send(`_✅ Successfully updated plugin: *${pluginName}*_`, {
          linkPreview: linkPreview(),
        });
      } else {
        await message.send(`_✅ Successfully installed plugin: *${pluginName}*_`, {
          linkPreview: linkPreview(),
        });
      }
      
    } catch (error) {
      return await message.send(`\`\`\`Operation failed:\n${error.message}\`\`\``, {
        linkPreview: linkPreview(),
      });
    }
  }
);

plugin(
  {
    pattern: "delplugin ?(.*)",
    desc: "remove installed external plugin",
    react: "😶",
    type: "system",
    fromMe: mood,
  },
  async (message, match) => {
    if (!match)
      return await message.send(
        "*Give me a plugin name thet you want to remove*",
        { linkPreview: linkPreview() }
      );
    const { plugins } = await personalDB(
      ["plugins"],
      {
        content: {},
      },
      "get"
    );
    if (!Object.keys(plugins)[0])
      return await message.send("```no plugins found```", {
        linkPreview: linkPreview(),
      });
    let Available = false;
    for (const p in plugins) {
      if (p == match) {
        Available = true;
        await personalDB(
          ["plugins"],
          {
            content: {
              id: match,
            },
          },
          "delete"
        );
        await message.send("_plugin successfully removed_", {
          linkPreview: linkPreview(),
        });
        break;
      }
    }
    if (!Available)
      return await message.send("```no plugins found```", {
        linkPreview: linkPreview(),
      });
  }
);
