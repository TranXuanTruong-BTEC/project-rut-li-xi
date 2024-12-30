import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { hasUserDrawn, recordUserDraw } from './utils/userStore.js';
import { sendDiscordNotification } from './utils/discord.js';
import { checkLuckyTime } from './utils/timeChecker.js';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5544;

// Cấu hình CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());
app.use(helmet());

// Rate limiting
const drawLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 giờ
    max: 1 // 1 request mỗi IP
});

// Routes
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok',
        time: new Date().toISOString(),
        canDraw: checkLuckyTime().canDraw
    });
});

app.post('/api/auth/discord', async (req, res) => {
    // ... code xử lý auth
});

app.post('/api/lucky-draw', drawLimiter, async (req, res) => {
    // ... code xử lý rút lì xì
});

app.get('/api/time-check', (req, res) => {
    const timeCheck = checkLuckyTime();
    res.json(timeCheck);
});

// Khởi động server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Environment check:', {
        DISCORD_CLIENT_ID: !!process.env.DISCORD_CLIENT_ID,
        DISCORD_CLIENT_SECRET: !!process.env.DISCORD_CLIENT_SECRET,
        DISCORD_SERVER_ID: !!process.env.DISCORD_SERVER_ID,
        JWT_SECRET: !!process.env.JWT_SECRET
    });
}); 