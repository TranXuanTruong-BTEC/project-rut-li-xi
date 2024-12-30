import React, { useState, useEffect } from 'react';
import Marquee from './Marquee';
import Firework from './Firework';
import DragonAnimation from './DragonAnimation';

const BANKS = [
    { id: 'vcb', name: 'Vietcombank', logo: '/images/banks/vcb.png' },
    { id: 'tcb', name: 'Techcombank', logo: '/images/banks/tcb.png' },
    { id: 'mb', name: 'MB Bank', logo: '/images/banks/mb.png' },
    { id: 'acb', name: 'ACB', logo: '/images/banks/acb.png' },
    { id: 'bidv', name: 'BIDV', logo: '/images/banks/bidv.png' }
];

export default function LuckyDraw() {
    const [isDrawing, setIsDrawing] = useState(false);
    const [result, setResult] = useState(null);
    const [hasDrawn, setHasDrawn] = useState(false);
    const [bankInfo, setBankInfo] = useState({
        bank: '',
        accountName: '',
        accountNumber: ''
    });
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState('');
    const [showFireworks, setShowFireworks] = useState(false);
    const [showCongrats, setShowCongrats] = useState(false);

    const handleDraw = async () => {
        if (!bankInfo.bank || !bankInfo.accountName || !bankInfo.accountNumber) {
            setError('Vui lòng điền đầy đủ thông tin ngân hàng');
            return;
        }

        try {
            setIsDrawing(true);
            setError('');
            
            const amounts = [5000, 10000, 15000, 20000];
            const randomAmount = amounts[Math.floor(Math.random() * amounts.length)];

            // Kiểm tra token
            const token = localStorage.getItem('discord_token');
            if (!token) {
                throw new Error('Vui lòng đăng nhập lại');
            }

            console.log('Sending request with token:', token); // Debug log

            const response = await fetch('http://localhost:3000/api/lucky-draw', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    amount: randomAmount,
                    bankInfo: bankInfo
                }),
                credentials: 'include'
            });

            console.log('Response status:', response.status); // Debug log

            const data = await response.json();
            console.log('Response data:', data); // Debug log

            if (!response.ok) {
                throw new Error(data.error || 'Có lỗi xảy ra khi rút lì xì');
            }

            // Lưu local và hiển thị kết quả
            const drawData = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                amount: randomAmount,
                bankInfo: { ...bankInfo },
                paid: false
            };

            localStorage.setItem(`draw_${drawData.id}`, JSON.stringify(drawData));
            setResult({ amount: randomAmount });
            setHasDrawn(true);
            setIsDrawing(false);

            window.dispatchEvent(new Event('storage'));
            setShowFireworks(true);
            setShowCongrats(true);
            setTimeout(() => {
                setShowFireworks(false);
                setShowCongrats(false);
            }, 5000);
        } catch (error) {
            console.error('Draw error:', error);
            setError(error.message || 'Có lỗi xảy ra, vui lòng thử lại');
            setIsDrawing(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-gradient-to-b from-yellow-100 via-red-50 to-pink-50 py-10 px-4 overflow-hidden">
            <div className="clouds">
                <div className="cloud cloud1"></div>
                <div className="cloud cloud2"></div>
                <div className="cloud cloud3"></div>
            </div>

            <DragonAnimation />

            {showFireworks && <Firework />}

            <div className="flower-container" />

            <div className="absolute top-0 left-0 right-0">
                <div className="lights-decoration" />
            </div>

            <div className="max-w-md mx-auto">
                <div className="relative bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-red-100">
                    <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 w-48 h-48">
                        <img 
                            src="/images/dragon-2024.png" 
                            alt="Dragon 2024" 
                            className="w-full h-full object-contain animate-float"
                        />
                    </div>

                    <div className="pt-20">
                        <h1 className="lucky-text text-4xl font-bold text-center text-red-600 mb-8">
                            🧧 Lì Xì May Mắn 2025 🧧
                        </h1>

                        {!showForm ? (
                            <button
                                onClick={() => setShowForm(true)}
                                className="w-full py-4 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg font-bold text-lg hover:from-red-700 hover:to-red-600 transition-all transform hover:scale-105 shadow-lg"
                            >
                                Bắt đầu rút lì xì
                            </button>
                        ) : (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    {BANKS.map(bank => (
                                        <button
                                            key={bank.id}
                                            onClick={() => setBankInfo({...bankInfo, bank: bank.id})}
                                            className={`p-4 border-2 rounded-lg transition-all ${
                                                bankInfo.bank === bank.id 
                                                    ? 'border-red-500 bg-red-50' 
                                                    : 'border-gray-200 hover:border-red-300'
                                            }`}
                                        >
                                            <img src={bank.logo} alt={bank.name} className="h-8 mx-auto mb-2" />
                                            <p className="text-sm text-center">{bank.name}</p>
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        value={bankInfo.accountName}
                                        onChange={(e) => setBankInfo({...bankInfo, accountName: e.target.value})}
                                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all"
                                        placeholder="Tên chủ tài khoản"
                                    />

                                    <input
                                        type="text"
                                        value={bankInfo.accountNumber}
                                        onChange={(e) => setBankInfo({...bankInfo, accountNumber: e.target.value})}
                                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all"
                                        placeholder="Số tài khoản"
                                    />
                                </div>

                                {error && (
                                    <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
                                        {error}
                                    </div>
                                )}

                                <button
                                    onClick={handleDraw}
                                    disabled={isDrawing || hasDrawn}
                                    className={`w-full py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 ${
                                        isDrawing || hasDrawn
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white shadow-lg'
                                    }`}
                                >
                                    {isDrawing ? 'Đang rút...' : hasDrawn ? 'Đã rút lì xì' : 'Rút lì xì'}
                                </button>

                                {result && (
                                    <div className="mt-6 text-center animate-fade-in">
                                        <div className="text-2xl font-bold text-red-600 lucky-text">
                                            🎉 Chúc mừng năm mới 2025 🎊
                                        </div>
                                        <div className="text-xl font-bold text-red-600 mt-2">
                                            Bạn đã rút được {result.amount?.toLocaleString()}đ
                                        </div>
                                        <p className="text-sm text-gray-600 mt-2">
                                            Tiền sẽ được chuyển vào tài khoản của bạn trong vòng 24h
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showCongrats && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm z-50">
                    <div className="congrats-popup bg-gradient-to-br from-red-50 to-yellow-50 p-10 rounded-2xl shadow-2xl text-center max-w-lg mx-4">
                        <div className="relative">
                            <div className="absolute -top-6 -left-6 w-12 h-12 text-4xl animate-spin-slow">✨</div>
                            <div className="absolute -top-6 -right-6 w-12 h-12 text-4xl animate-spin-slow">✨</div>
                            
                            <h2 className="text-4xl font-bold shimmer-text lucky-text mb-2">
                                🎉 Chúc mừng bạn! 🎉
                            </h2>
                            
                            <div className="mt-6 text-2xl font-semibold text-red-600 bg-red-50 rounded-lg p-4 shadow-inner">
                                Bạn đã rút được 
                                <div className="text-3xl font-bold mt-2 shimmer-text">
                                    {result?.amount?.toLocaleString()}đ
                                </div>
                            </div>

                            <div className="mt-8 space-y-3 text-lg">
                                <p className="text-xl font-semibold text-red-600">
                                    Chúc bạn năm mới ẤT TỴ 2025
                                </p>
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div className="bg-red-50 p-3 rounded-lg transform hover:scale-105 transition-transform">
                                        <p className="text-yellow-600">🐉 Vạn Sự Như Ý</p>
                                    </div>
                                    <div className="bg-yellow-50 p-3 rounded-lg transform hover:scale-105 transition-transform">
                                        <p className="text-red-600">💰 Phát Tài Phát Lộc</p>
                                    </div>
                                    <div className="bg-yellow-50 p-3 rounded-lg transform hover:scale-105 transition-transform">
                                        <p className="text-red-600">🏮 An Khang Thịnh Vượng</p>
                                    </div>
                                    <div className="bg-red-50 p-3 rounded-lg transform hover:scale-105 transition-transform">
                                        <p className="text-yellow-600">✨ Tràn Đầy Hạnh Phúc</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 text-sm text-gray-600 bg-white/80 p-4 rounded-lg">
                                Tiền lì xì sẽ được chuyển vào tài khoản của bạn trong vòng 24h
                            </div>

                            <div className="absolute -bottom-6 -left-6 w-12 h-12 text-4xl animate-spin-slow">✨</div>
                            <div className="absolute -bottom-6 -right-6 w-12 h-12 text-4xl animate-spin-slow">✨</div>
                        </div>
                    </div>
                </div>
            )}

            <Marquee />
        </div>
    );
} 