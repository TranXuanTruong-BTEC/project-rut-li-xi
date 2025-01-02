export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-red-600 mb-4">404</h1>
                <p className="text-xl text-gray-600 mb-8">
                    Trang bạn tìm kiếm không tồn tại
                </p>
                <a 
                    href="/"
                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors inline-block"
                >
                    Về trang chủ
                </a>
            </div>
        </div>
    );
} 