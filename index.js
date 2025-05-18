require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

// Load tất cả lệnh từ thư mục commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(`[WARNING] Lệnh ở file ${file} thiếu "data" hoặc "execute" property.`);
  }
}

client.once('ready', () => {
  console.log(`Đăng nhập thành công với bot: ${client.user.tag}`);

  // Kiểm tra API key Riot đã load chưa
  console.log('API KEY Riot:', process.env.RIOT_API_KEY || 'Chưa thiết lập API KEY');
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'Có lỗi khi thực thi lệnh!', ephemeral: true });
    } else {
      await interaction.reply({ content: 'Có lỗi khi thực thi lệnh!', ephemeral: true });
    }
  }
});

// Đăng nhập bot bằng token trong .env
client.login(process.env.DISCORD_TOKEN);
