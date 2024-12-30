import React from 'react';

export default function Login() {
    // Thay YOUR_CLIENT_ID bằng Discord Client ID của bạn
    const DISCORD_CLIENT_ID = '1323209415699988524';
    const REDIRECT_URI = window.location.hostname === 'localhost' 
        ? 'http://localhost:5173/callback'
        : 'https://your-frontend-url.vercel.app/callback';
    
    const DISCORD_LOGIN_URL = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20guilds`;

    return (
        <div className="min-h-screen bg-gradient-to-b from-yellow-100 via-red-50 to-pink-50 flex items-center justify-center">
            <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl text-center max-w-md w-full mx-4">
                <h1 className="lucky-text text-4xl font-bold text-red-600 mb-8">
                    🧧 Lì Xì May Mắn 2025 🧧
                </h1>
                <p className="text-gray-600 mb-8">
                    Vui lòng đăng nhập bằng Discord để tham gia rút lì xì
                </p>
                <a
                    href={DISCORD_LOGIN_URL}
                    className="inline-flex items-center px-6 py-3 bg-[#5865F2] text-white rounded-lg font-semibold hover:bg-[#4752C4] transition-colors"
                >
                    Đăng nhập với Discord
                </a>
            </div>
        </div>
    );
} 