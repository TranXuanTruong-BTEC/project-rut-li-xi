import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

export default function DiscordCallback() {
    const { setIsAuthenticated } = useAuth();
    const [error, setError] = useState('');

    useEffect(() => {
        const handleCallback = async () => {
            const code = new URLSearchParams(window.location.search).get('code');
            if (!code) {
                setError('Không nhận được mã xác thực từ Discord');
                return;
            }

            try {
                console.log('Attempting authentication with code:', code);

                const response = await fetch(`${API_URL}/api/auth/discord`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ code }),
                    credentials: 'include'
                });

                const data = await response.json();
                console.log('Auth response:', data);

                if (!response.ok) {
                    throw new Error(data.error || 'Xác thực thất bại');
                }

                localStorage.setItem('discord_token', data.token);
                setIsAuthenticated(true);
                window.location.href = '/';
            } catch (error) {
                console.error('Auth error:', error);
                setError(error.message || 'Có lỗi xảy ra khi xác thực');
            }
        };

        handleCallback();
    }, [setIsAuthenticated]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-50">
                <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md mx-4">
                    <div className="text-red-600 text-xl mb-4">⚠️ Lỗi xác thực</div>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <div className="space-y-2">
                        <button
                            onClick={() => window.location.href = '/'}
                            className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        >
                            Thử lại
                        </button>
                        <a 
                            href="https://discord.gg/your-server-invite"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full px-4 py-2 bg-[#5865F2] text-white rounded hover:bg-[#4752C4] transition-colors"
                        >
                            Tham gia Discord Server
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent mx-auto"></div>
                <p className="mt-4 text-gray-600">Đang xác thực...</p>
            </div>
        </div>
    );
} 