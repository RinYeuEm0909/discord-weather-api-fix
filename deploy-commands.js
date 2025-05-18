require('dotenv').config(); // nếu bạn dùng file .env
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Lấy token và IDs từ biến môi trường hoặc thay trực tiếp ở đây
const TOKEN = process.env.DISCORD_TOKEN || 'YOUR_BOT_TOKEN';
const CLIENT_ID = process.env.CLIENT_ID || 'YOUR_CLIENT_ID';
const GUILD_ID = process.env.GUILD_ID || 'YOUR_GUILD_ID';

// Đọc tất cả command files trong thư mục commands
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if ('data' in command && 'execute' in command) {
    commands.push(command.data.toJSON());
  } else {
    console.warn(`[WARN] Lệnh ${file} thiếu "data" hoặc "execute" property.`);
  }
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log('🔄 Đang đăng ký lệnh slash cho guild...');

    // Đăng ký lệnh dạng Guild command (hiển thị nhanh trong server test)
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands },
    );

    console.log('✅ Đã đăng ký thành công các lệnh slash!');
  } catch (error) {
    console.error('❌ Lỗi khi đăng ký lệnh:', error);
  }
})();
