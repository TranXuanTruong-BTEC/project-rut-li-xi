import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navigation() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    if (!user) return null;

    return (
        <nav className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link to="/" className="flex items-center">
                            <span className="text-xl font-bold text-red-600">🧧 Lì Xì May Mắn</span>
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link 
                            to="/history"
                            className="text-gray-700 hover:text-red-600"
                        >
                            Lịch sử
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
                        >
                            Đăng xuất
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
} 