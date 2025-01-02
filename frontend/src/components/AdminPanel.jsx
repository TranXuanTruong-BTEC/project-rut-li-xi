import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminPanel() {
    const { token } = useAuth();
    const [draws, setDraws] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDraws = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL;
                const adminToken = localStorage.getItem('admin_token');
                
                if (!adminToken) {
                    navigate('/admin');
                    return;
                }

                const response = await fetch(`${API_URL}/api/admin/draws`, {
                    headers: {
                        'Authorization': `Bearer ${adminToken}`
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Unauthorized');
                }

                const data = await response.json();
                setDraws(Object.entries(data.draws).map(([userId, draw]) => ({
                    userId,
                    ...draw
                })));
            } catch (error) {
                setError(error.message);
                if (error.message === 'Unauthorized') {
                    navigate('/admin');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDraws();
    }, [navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 p-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-red-600 text-xl mb-4">Lỗi</h2>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">Danh sách rút lì xì</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Username
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Số tiền
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thời gian
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {draws.map((draw) => (
                                <tr key={draw.userId}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {draw.userId}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {draw.username}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {draw.amount.toLocaleString()}đ
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(draw.timestamp).toLocaleString('vi-VN')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
} 