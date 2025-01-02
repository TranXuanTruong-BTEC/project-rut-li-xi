import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Decorations } from './Decorations';

const BANKS = [
  { id: 'vcb', name: 'Vietcombank' },
  { id: 'tcb', name: 'Techcombank' },
  { id: 'mb', name: 'MB Bank' },
  { id: 'acb', name: 'ACB' },
  { id: 'bidv', name: 'BIDV' },
  { id: 'vib', name: 'VIB' },
  { id: 'vtp', name: 'ViettelPay' },
  { id: 'momo', name: 'Ví Momo' },
  { id: 'zalo', name: 'ZaloPay' },
];

function LuckyDraw() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [bankInfo, setBankInfo] = useState({
    bankName: '',
    accountNumber: '',
    accountName: ''
  });
  const [recentDraws, setRecentDraws] = useState([]);
  const [topDraws, setTopDraws] = useState([]);

  useEffect(() => {
    // Kiểm tra token trong localStorage
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserData(token);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecentAndTopDraws();
  }, []);

  const fetchUserData = async (token) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (err) {
      console.error('Error fetching user:', err);
      localStorage.removeItem('token');
      setError('Vui lòng đăng nhập lại');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentAndTopDraws = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/draws/stats`);
      setRecentDraws(response.data.recentDraws || []);
      setTopDraws(response.data.topDraws || []);
    } catch (error) {
      console.error('Error fetching draws stats:', error);
    }
  };

  const handleDiscordLogin = () => {
    const CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID;
    const REDIRECT_URI = `${window.location.origin}/callback`;
    const scope = 'identify guilds';

    window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(scope)}`;
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/logout`);
      localStorage.removeItem('token');
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleDraw = async () => {
    try {
      // Validate bank info
      if (!bankInfo.bankName || !bankInfo.accountNumber || !bankInfo.accountName) {
        setError('Vui lòng điền đầy đủ thông tin ngân hàng');
        return;
      }

      setLoading(true);
      setShowAnimation(true);
      const token = localStorage.getItem('token');

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/lucky-draw`,
        {
          bankName: bankInfo.bankName,
          accountNumber: bankInfo.accountNumber,
          accountName: bankInfo.accountName.toUpperCase()
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setTimeout(() => {
        setResult(response.data);
        setShowAnimation(false);
      }, 2000);
    } catch (err) {
      console.error('Draw error:', err);
      setError(err.response?.data?.error || 'Có lỗi xảy ra khi rút lì xì');
      setShowAnimation(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-red-50 relative overflow-hidden">
      <Decorations />
      <div className="text-center py-6 bg-gradient-to-r from-red-600 to-yellow-500">
        <h1 className="text-3xl font-bold text-white animate-bounce">
          🎊 Chúc Mừng Năm Mới - Xuân Ất Tỵ 2025 🎊
        </h1>
      </div>

      <div className="bg-white border-y border-red-200 py-2 shadow-inner">
        <div className="marquee-container overflow-hidden whitespace-nowrap">
          <div className="marquee-content inline-block animate-marquee">
            {recentDraws.length > 0 ? (
              recentDraws.map((draw, index) => (
                <span key={index} className="inline-flex items-center mx-4">
                  {draw.avatar ? (
                    <img
                      src={draw.avatar}
                      className="w-6 h-6 rounded-full mr-2"
                      alt={draw.username}
                      onError={(e) => {
                        e.target.onerror = null; // Prevent infinite loop
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(draw.username)}&background=random&color=fff&size=32`;
                      }}
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mr-2">
                      <span className="text-red-600 text-xs font-bold">
                        {draw.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-red-600">
                    {draw.username} vừa rút được {draw.amount.toLocaleString('vi-VN')}đ 🧧
                  </span>
                </span>
              ))
            ) : (
              <p className="text-red-600">Chưa có lượt rút nào gần đây.</p>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-3">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              <h2 className="text-2xl font-bold text-red-800 mb-4">🏆 Top May Mắn</h2>
              <div className="space-y-4">
                {topDraws.length > 0 ? (
                  topDraws.map((draw, index) => (
                    <div key={index} className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </div>
                        <div>
                          <p className="font-semibold">{draw.username}</p>
                          <p className="text-sm text-gray-500">
                            {draw.amount.toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-red-600">Chưa có lượt rút nào.</p>
                )}
              </div>
            </div>
          </div>

          <div className="md:col-span-6">
            <div className="bg-white rounded-lg shadow-lg p-8">
              {user ? (
                <>
                  <div className="text-center mb-8">
                    <img
                      src={user.avatar}
                      alt="Avatar"
                      className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-red-500"
                    />
                    <h1 className="text-2xl font-bold text-red-800">
                      Chào mừng, {user.username}!
                    </h1>
                  </div>

                  {!result && !showAnimation && (
                    <div className="mb-6 space-y-4">
                      <div>
                        <label className="block text-red-800 mb-2">Chọn Ngân Hàng</label>
                        <select
                          value={bankInfo.bankName}
                          onChange={(e) =>
                            setBankInfo({ ...bankInfo, bankName: e.target.value })
                          }
                          className="w-full p-3 border-2 border-red-300 rounded-lg focus:outline-none focus:border-red-500 bg-white"
                        >
                          <option value="">-- Chọn ngân hàng --</option>
                          {BANKS.map((bank) => (
                            <option key={bank.id} value={bank.name}>
                              {bank.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-red-800 mb-2">Số Tài Khoản</label>
                        <input
                          type="text"
                          value={bankInfo.accountNumber}
                          onChange={(e) =>
                            setBankInfo({ ...bankInfo, accountNumber: e.target.value.replace(/\D/g, '') })
                          }
                          className="w-full p-3 border-2 border-red-300 rounded-lg focus:outline-none focus:border-red-500"
                          placeholder="Nhập số tài khoản"
                          maxLength="20"
                        />
                      </div>

                      <div>
                        <label className="block text-red-800 mb-2">Tên Chủ Tài Khoản</label>
                        <input
                          type="text"
                          value={bankInfo.accountName}
                          onChange={(e) =>
                            setBankInfo({ ...bankInfo, accountName: e.target.value.toUpperCase() })
                          }
                          className="w-full p-3 border-2 border-red-300 rounded-lg focus:outline-none focus:border-red-500"
                          placeholder="Nhập tên chủ tài khoản"
                        />
                      </div>
                    </div>
                  )}

                  {showAnimation ? (
                    <div className="lucky-envelope">
                      <div className="envelope-body">
                        <div className="envelope-flap"></div>
                        <div className="envelope-content">
                          <div className="money-content">
                            <div className="money"></div>
                            <div className="money"></div>
                            <div className="money"></div>
                          </div>
                        </div>
                      </div>
                      <div className="sparkles">
                        <div className="sparkle"></div>
                        <div className="sparkle"></div>
                        <div className="sparkle"></div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {!result && (
                        <button
                          onClick={handleDraw}
                          disabled={loading}
                          className="w-full lucky-button text-white font-bold py-4 px-6 rounded-lg text-lg"
                        >
                          {loading ? 'Đang mở lì xì...' : 'Mở Lì Xì May Mắn'}
                        </button>
                      )}

                      {result && (
                        <div className="mt-6 text-center animate-fadeIn">
                          <h2 className="text-xl font-bold text-red-800 mb-2">Chúc Mừng!</h2>
                          <p className="text-4xl font-bold text-red-600 digital mb-4">
                            {result.amount.toLocaleString('vi-VN')} VNĐ
                          </p>
                          <p className="text-red-800">
                            Tiền sẽ được chuyển vào tài khoản của bạn trong thời gian sớm nhất!
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  <button
                    onClick={handleLogout}
                    className="mt-6 w-full text-red-600 hover:text-red-800 text-sm"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-red-800 mb-6">
                    Đăng nhập để nhận lì xì Tết 2025
                  </h2>
                  <button
                    onClick={handleDiscordLogin}
                    className="inline-block bg-[#5865F2] text-white font-bold py-4 px-8 rounded-lg
                             hover:bg-[#4752C4] transition-all duration-300 transform hover:scale-105"
                  >
                    Đăng nhập với Discord
                  </button>
                </div>
              )}

              {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg text-center">
                  {error}
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              <h2 className="text-2xl font-bold text-red-800 mb-4">🎊 Lời Chúc Năm Mới</h2>
              <div className="space-y-4 text-center">
                <p className="text-red-600 font-medium">
                  Chúc Mừng Năm Mới
                </p>
                <p className="text-yellow-600">
                  Vạn Sự Như Ý
                </p>
                <p className="text-red-600">
                  Tài Lộc Đầy Nhà
                </p>
                <p className="text-yellow-600">
                  An Khang Thịnh Vượng
                </p>
                <div className="pt-4">
                  <span className="text-6xl">🧧</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lucky coins */}
      <div className="coins-container">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="coin"></div>
        ))}
      </div>
    </div>
  );
}

export default LuckyDraw;