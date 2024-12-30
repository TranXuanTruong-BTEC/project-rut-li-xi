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

app.post('/api/lucky-draw', drawLimiter, async (req, res) => {
    // Kiểm tra thời gian trước
    const timeCheck = checkLuckyTime();
    if (!timeCheck.canDraw) {
        return res.status(403).json({
            error: timeCheck.message,
            timeLeft: timeCheck.timeLeft
        });
    }

    console.log('Received request headers:', req.headers);
    console.log('Received request body:', req.body);

    // ... (rest of the existing code)
});

// Thêm endpoint kiểm tra thời gian
app.get('/api/time-check', (req, res) => {
    const timeCheck = checkLuckyTime();
    res.json(timeCheck);
});

// Thêm route kiểm tra health
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok',
        time: new Date().toISOString(),
        canDraw: checkLuckyTime().canDraw
    });
}); 