import fetch from 'node-fetch';

export async function sendDiscordNotification({ username, discordUsername, amount, userId }) {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    
    const message = {
        embeds: [{
            title: "🧧 Thông Báo Rút Lì Xì Thành Công 🎉",
            description: `<@${userId}> vừa rút thành công lì xì Tết Ất Tỵ 2025! 🐉`,
            color: 0xFF0000,
            fields: [
                {
                    name: "👤 Tên Discord",
                    value: `<@${userId}>`,  
                    inline: true
                },
                {
                    name: "👤 Tên Tài Khoản",
                    value: username,
                    inline: true
                },
                {
                    name: "💰 Số Tiền",
                    value: `${amount.toLocaleString()}đ`,
                    inline: true
                }
            ],
            footer: {
                text: "Chúc mừng năm mới - Vạn sự như ý 🎊"
            },
            timestamp: new Date().toISOString()
        }]
    };

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message)
        });

        if (!response.ok) {
            throw new Error('Failed to send Discord notification');
        }
    } catch (error) {
        console.error('Discord notification error:', error);
    }
}
