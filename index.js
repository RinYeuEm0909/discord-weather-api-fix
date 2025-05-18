require('dotenv').config();
const fs = require('fs');
const { Client, Collection, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);

  if (!command.data || !command.execute) {
    console.warn(`⚠️ Lệnh trong file ${file} thiếu data hoặc execute, bỏ qua!`);
    continue;
  }

  client.commands.set(command.data.name, command);
}

client.once('ready', () => {
  client.user.setActivity('Anime', { type: 'WATCHING' });
  client.user.setStatus('online');
  console.log(`👾 Bot đã sẵn sàng với ${client.guilds.cache.size} máy chủ.`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    return interaction.reply({ content: '❌ Lệnh không tồn tại!', ephemeral: true });
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: '❌ Có lỗi khi thực thi lệnh!', ephemeral: true });
  }
});
console.log('KEY =', process.env.WEATHER_API_KEY);

client.login(process.env.TOKEN);
