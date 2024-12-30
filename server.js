import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { hasUserDrawn, recordUserDraw } from './utils/userStore.js';
import { sendDiscordNotification } from './utils/discord.js';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({
    origin: [FRONTEND_URL, 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.options('*', cors());

app.use(express.json());

// Thêm các middleware bảo mật
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: process.env.RATE_LIMIT || 100 // Giới hạn request
});
app.use(limiter);

// Thêm các header bảo mật
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Thêm danh sách admin ID vào đầu file
const ADMIN_IDS = ['1119427673035391036']; // Thay bằng Discord ID của bạn

// Thêm route kiểm tra
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 5 // 5 requests mỗi IP
});

app.post('/api/auth/discord', authLimiter, async (req, res) => {
    const { code } = req.body;
    
    if (!code) {
        return res.status(400).json({ error: 'Code is required' });
    }

    try {
        console.log('Processing auth request with code:', code);

        const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            body: new URLSearchParams({
                client_id: process.env.DISCORD_CLIENT_ID,
                client_secret: process.env.DISCORD_CLIENT_SECRET,
                code,
                grant_type: 'authorization_code',
                redirect_uri: `${FRONTEND_URL}/callback`,
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const tokenData = await tokenResponse.json();
        
        if (tokenData.error) {
            console.error('Token error:', tokenData);
            return res.status(400).json({ 
                error: tokenData.error_description || 'Failed to get token' 
            });
        }

        // Lấy thông tin user
        const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
            },
        });

        const userData = await userResponse.json();
        
        // Kiểm tra giới hạn chỉ khi không phải admin
        if (!ADMIN_IDS.includes(userData.id)) {
            const hasDrawn = await hasUserDrawn(userData.id);
            if (hasDrawn) {
                return res.status(403).json({
                    error: 'Bạn đã rút lì xì rồi! Mỗi tài khoản Discord chỉ được rút một lần duy nhất.'
                });
            }
        }

        // Lấy danh sách server của user
        const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
            },
        });

        const guilds = await guildsResponse.json();
        const isInServer = guilds.some(guild => guild.id === process.env.DISCORD_SERVER_ID);

        if (!isInServer) {
            return res.status(403).json({ 
                error: 'Bạn cần tham gia server Discord để sử dụng ứng dụng'
            });
        }

        const token = jwt.sign(
            { 
                access_token: tokenData.access_token,
                user_id: userData.id
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ 
            error: 'Authentication failed',
            details: error.message 
        });
    }
});

const drawLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 giờ
    max: 1 // 1 request mỗi IP
});

app.post('/api/lucky-draw', drawLimiter, async (req, res) => {
    console.log('Received request headers:', req.headers);
    console.log('Received request body:', req.body);

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { user_id, access_token } = decoded;

        // Kiểm tra xem user đã rút chưa, bỏ qua nếu là admin
        if (!ADMIN_IDS.includes(user_id)) {
            const hasDrawn = await hasUserDrawn(user_id);
            if (hasDrawn) {
                return res.status(403).json({
                    error: 'Bạn đã rút lì xì rồi! Mỗi tài khoản Discord chỉ được rút một lần duy nhất.'
                });
            }
        }

        // Lấy thông tin user từ Discord
        const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        const userData = await userResponse.json();
        const discordUsername = userData.global_name || userData.username;

        // Thêm lại dòng này
        const { amount, bankInfo } = req.body;

        // Lưu thông tin rút lì xì
        await recordUserDraw(user_id, {
            discordUsername,
            amount,
            bankInfo,
            timestamp: new Date().toISOString(),
            paid: false
        });

        // Gửi thông báo đến Discord với tên Discord
        await sendDiscordNotification({
            username: bankInfo.accountName,
            discordUsername,
            amount: amount,
            userId: user_id
        });

        res.json({ 
            success: true,
            message: 'Rút lì xì thành công!'
        });
    } catch (error) {
        console.error('Draw error:', error);
        res.status(500).json({ 
            error: 'Failed to process draw',
            details: error.message 
        });
    }
});

// Thêm logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5544;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Environment check:', {
        DISCORD_CLIENT_ID: !!process.env.DISCORD_CLIENT_ID,
        DISCORD_CLIENT_SECRET: !!process.env.DISCORD_CLIENT_SECRET,
        DISCORD_SERVER_ID: !!process.env.DISCORD_SERVER_ID,
        JWT_SECRET: !!process.env.JWT_SECRET
    });
}); 