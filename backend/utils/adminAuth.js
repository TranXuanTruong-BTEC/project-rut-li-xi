export const validateAdminCredentials = (username, password) => {
    // Thay thế bằng thông tin admin thực tế của bạn
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
    
    return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}; 