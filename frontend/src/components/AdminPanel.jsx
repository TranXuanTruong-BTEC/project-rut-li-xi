import React, { useState, useEffect } from 'react';

const ADMIN_PASSWORD = "admin123"; // Thay đổi mật khẩu này

export default function AdminPanel() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [draws, setDraws] = useState([]);
    const [stats, setStats] = useState({
        totalDraws: 0,
        totalAmount: 0
    });

    useEffect(() => {
        if (isAuthenticated) {
            loadData();
        }
    }, [isAuthenticated]);

    const loadData = () => {
        // Lấy dữ liệu từ localStorage
        const storedDraws = Object.entries(localStorage)
            .filter(([key]) => key.startsWith('draw_'))
            .map(([key, value]) => JSON.parse(value))
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        setDraws(storedDraws);

        // Tính toán thống kê
        const total = storedDraws.reduce((acc, draw) => acc + draw.amount, 0);
        setStats({
            totalDraws: storedDraws.length,
            totalAmount: total
        });
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
        } else {
            alert('Mật khẩu không đúng!');
        }
    };

    const handleMarkAsPaid = (drawId) => {
        const updatedDraws = draws.map(draw => {
            if (draw.id === drawId) {
                const updatedDraw = { ...draw, paid: true };
                localStorage.setItem(`draw_${drawId}`, JSON.stringify(updatedDraw));
                return updatedDraw;
            }
            return draw;
        });
        setDraws(updatedDraws);
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md w-96">
                    <h2 className="text-2xl font-bold text-center mb-6">Admin Login</h2>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Nhập mật khẩu"
                            className="w-full p-2 border rounded"
                        />
                        <button
                            type="submit"
                            className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
                        >
                            Đăng nhập
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-2xl font-bold mb-4">Thống kê</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-red-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600">Tổng số lượt rút</p>
                            <p className="text-2xl font-bold text-red-600">{stats.totalDraws}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600">Tổng số tiền</p>
                            <p className="text-2xl font-bold text-green-600">
                                {stats.totalAmount.toLocaleString()}đ
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold mb-4">Danh sách rút lì xì</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thời gian
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ngân hàng
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tên TK
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Số TK
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Số tiền
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {draws.map((draw) => (
                                    <tr key={draw.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(draw.timestamp).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {draw.bankInfo.bank}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {draw.bankInfo.accountName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {draw.bankInfo.accountNumber}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                                            {draw.amount.toLocaleString()}đ
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                draw.paid 
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {draw.paid ? 'Đã chuyển' : 'Chờ chuyển'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            {!draw.paid && (
                                                <button
                                                    onClick={() => handleMarkAsPaid(draw.id)}
                                                    className="text-green-600 hover:text-green-900"
                                                >
                                                    Đánh dấu đã chuyển
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
} 