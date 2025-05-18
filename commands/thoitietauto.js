const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

let weatherInterval = null;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('thoitiet')
    .setDescription('Tự động cập nhật thời tiết qua webhook.')
    .addStringOption(option =>
      option.setName('city')
        .setDescription('Thành phố (ví dụ: Hanoi, Ho Chi Minh)')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('interval')
        .setDescription('Chu kỳ cập nhật (phút, mặc định 60)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const city = interaction.options.getString('city');
    const interval = interaction.options.getInteger('interval') || 60;

    const API_KEY = process.env.WEATHER_API_KEY;
    const WEBHOOK_URL = process.env.WEATHER_WEBHOOK;

    if (!API_KEY || !WEBHOOK_URL) {
      return interaction.reply({
        content: '❌ Chưa cấu hình API key hoặc webhook. Kiểm tra file `.env`.',
        ephemeral: true
      });
    }

    if (weatherInterval) clearInterval(weatherInterval);

    async function sendWeather() {
      try {
        const response = await axios.get('http://api.weatherapi.com/v1/current.json', {
          params: { key: API_KEY, q: city, lang: 'vi' }
        });

        const data = response.data;
        const weather = data.current;

        await axios.post(WEBHOOK_URL, {
          embeds: [{
            title: `Thời tiết ở ${data.location.name}`,
            description: weather.condition.text,
            color: 0x1E90FF,
            fields: [
              { name: '🌡️ Nhiệt độ', value: `${weather.temp_c}°C`, inline: true },
              { name: '💧 Độ ẩm', value: `${weather.humidity}%`, inline: true },
              { name: '🌬️ Gió', value: `${weather.wind_kph} km/h`, inline: true },
            ],
            thumbnail: { url: `https:${weather.condition.icon}` },
            timestamp: new Date()
          }]
        });

        console.log(`[✅] Đã gửi thời tiết tự động cho ${city}`);
      } catch (error) {
        console.error('❌ Lỗi khi lấy/gửi thời tiết:', error.message);
      }
    }

    // Gửi ngay
    await sendWeather();
    // Đặt khoảng thời gian
    weatherInterval = setInterval(sendWeather, interval * 1000);

    return interaction.reply({
      content: `✅ Đã bắt đầu cập nhật thời tiết **${city}** mỗi **${interval} phút**.`,
      ephemeral: true
    });
  }
};
