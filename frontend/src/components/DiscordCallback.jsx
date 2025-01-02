import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function DiscordCallback() {
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (!code) {
        setError('Không nhận được mã xác thực từ Discord');
        return;
      }

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/auth/discord/callback`,
          { code },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          navigate('/');
        } else {
          throw new Error('Token not received');
        }
      } catch (err) {
        console.error('Discord callback error:', err);
        setError(err.response?.data?.error || 'Đăng nhập thất bại');
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-red-600 to-yellow-500 p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Lỗi Đăng Nhập</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <a
              href="/"
              className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Thử lại
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-red-600 to-yellow-500">
      <div className="text-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-4"></div>
        <p className="text-lg">Đang xử lý đăng nhập...</p>
      </div>
    </div>
  );
}

export default DiscordCallback; 