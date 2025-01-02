import { useState, useEffect } from 'react';
import axios from 'axios';

function AdminDashboard() {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/transactions`,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Transactions data:', response.data.transactions);
      setTransactions(response.data.transactions);
      setStats(response.data.stats);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId, timestamp) => {
    if (!confirm('Bạn có chắc muốn xóa giao dịch này?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/admin/transaction`,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          data: { userId, timestamp }
        }
      );
      fetchTransactions(); // Refresh data
    } catch (err) {
      setError('Không thể xóa giao dịch. Vui lòng thử lại sau.');
      console.error('Error deleting transaction:', err);
    }
  };

  const handleStatusUpdate = async (userId, timestamp, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      console.log('Updating status:', {
        userId,
        timestamp,
        status: newStatus
      });

      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/admin/transaction/status`,
        {
          userId,
          timestamp: parseInt(timestamp),
          status: newStatus
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Update response:', response.data);

      // Cập nhật state local
      setTransactions(prevTransactions => 
        prevTransactions.map(trans => 
          trans.userId === userId && trans.timestamp === timestamp
            ? { ...trans, status: newStatus }
            : trans
        )
      );

      // Show success message
      alert('Cập nhật trạng thái thành công!');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Lỗi khi cập nhật trạng thái: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Admin</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Đăng xuất
          </button>
        </div>
        
        {/* Stats Section */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Tổng giao dịch</h3>
              <p className="text-2xl font-bold">{stats.totalTransactions}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Tổng tiền</h3>
              <p className="text-2xl font-bold">{stats.totalAmount.toLocaleString('vi-VN')} VNĐ</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Số người tham gia</h3>
              <p className="text-2xl font-bold">{stats.uniqueUsers}</p>
            </div>
          </div>
        )}

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thông tin ngân hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={`${transaction.userId}-${transaction.timestamp}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {/* Avatar */}
                      <div className="flex-shrink-0 h-10 w-10">
                        {transaction.avatar ? (
                          <img
                            className="h-10 w-10 rounded-full"
                            src={transaction.avatar}
                            alt={transaction.username}
                            onError={(e) => {
                              console.log('Avatar load error:', e);
                              e.target.onerror = null; // Prevent infinite loop
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(transaction.username)}&background=random`;
                            }}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-gray-600 text-sm">
                              {transaction.username?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                          </div>
                        )}
                      </div>
                      {/* User Info */}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          {transaction.discordUsername}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {transaction.amount.toLocaleString('vi-VN')} VNĐ
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {transaction.bankName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {transaction.accountNumber} - {transaction.accountName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.timestamp).toLocaleString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={transaction.status || 'pending'}
                      onChange={(e) => handleStatusUpdate(
                        transaction.userId,
                        transaction.timestamp,
                        e.target.value
                      )}
                      className="text-sm rounded-full px-3 py-1"
                      style={{
                        backgroundColor: 
                          transaction.status === 'completed' ? '#DEF7EC' :
                          transaction.status === 'failed' ? '#FDE8E8' :
                          '#FEF3C7',
                        color:
                          transaction.status === 'completed' ? '#03543F' :
                          transaction.status === 'failed' ? '#9B1C1C' :
                          '#92400E'
                      }}
                    >
                      <option value="pending">Đang xử lý</option>
                      <option value="completed">Đã chuyển khoản</option>
                      <option value="failed">Thất bại</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDelete(transaction.userId, transaction.timestamp)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard; 