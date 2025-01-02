import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { checkLuckyTime } from './utils/timeChecker.js';
import { hasUserDrawn, recordUserDraw, loadUsers } from './utils/userStore.js';
import { sendDiscordNotification } from './utils/discord.js';
import { validateAdminCredentials } from './utils/adminAuth.js';
import fetch from 'node-fetch';
import session from 'express-session';
import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';
import fs from 'fs/promises';
import path from 'path';
import helmet from 'helmet';
import compression from 'compression';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 5544;

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Add security headers
app.use(helmet());
app.use(compression());

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    // Send error to monitoring service
    res.status(500).json({ error: 'Something broke!' });
});

// Health check route
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date(),
        uptime: process.uptime()
    });
});

// Middleware xác thực token
const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                console.error('Token verification error:', err);
                return res.status(403).json({ error: 'Invalid token' });
            }

            req.user = user;
            console.log('Auth header:', authHeader);
            console.log('Token:', token);
            console.log('Decoded user:', user);
            next();
        });
    } catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
};

// Admin middleware
const authenticateAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err || !user.isAdmin) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        req.user = user;
        next();
    });
};

// Middleware kiểm tra admin
const checkAdmin = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ error: 'Invalid token' });
            }

            if (!decoded.isAdmin) {
                return res.status(403).json({ error: 'Requires admin privileges' });
            }

            req.user = decoded;
            next();
        });
    } catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
};

// Check lucky time route
app.get('/api/lucky-time', (req, res) => {
    try {
        const timeCheck = checkLuckyTime();
        res.json(timeCheck);
    } catch (error) {
        console.error('Time check error:', error);
        res.status(500).json({ 
            error: 'Failed to check time',
            details: error.message 
        });
    }
});

// Hàm random lì xì với tỉ lệ mới
const getRandomAmount = () => {
  const rand = Math.random() * 100; // Random từ 0-100%
  
  // Phân bố tỉ lệ:
  // 5k: 40%
  // 10k: 35%
  // 15k: 15%
  // 20k: 10%
  
  if (rand < 40) {
    return 5000; // 40% cơ hội nhận 5k
  } else if (rand < 75) {
    return 10000; // 35% cơ hội nhận 10k 
  } else if (rand < 90) {
    return 15000; // 15% cơ hội nhận 15k
  } else {
    return 20000; // 10% cơ hội nhận 20k
  }
};

// Thêm hàm kiểm tra thời gian tham gia server
const checkServerJoinTime = async (accessToken, userId) => {
  try {
    // Lấy thông tin member từ Discord API
    const memberResponse = await fetch(
      `https://discord.com/api/v10/guilds/${process.env.DISCORD_GUILD_ID}/members/${userId}`,
      {
        headers: {
          Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        },
      }
    );

    if (!memberResponse.ok) {
      throw new Error('Failed to fetch member data');
    }

    const memberData = await memberResponse.json();
    const joinedAt = new Date(memberData.joined_at);
    const now = new Date();
    const daysSinceJoined = (now - joinedAt) / (1000 * 60 * 60 * 24); // Chuyển về ngày
    
    return {
      isEligible: daysSinceJoined >= 2, // Đổi thành 2 ngày
      joinedAt: memberData.joined_at,
      daysLeft: Math.ceil(2 - daysSinceJoined) // Đổi thành 2 ngày
    };
  } catch (error) {
    console.error('Error checking server join time:', error);
    throw error;
  }
};

// Route xử lý rút lì xì
app.post('/api/lucky-draw', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { bankName, accountNumber, accountName } = req.body;

    // Validate bank info
    if (!bankName || !accountNumber || !accountName) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin ngân hàng' });
    }

    // Kiểm tra đã rút chưa
    const hasDrawn = await hasUserDrawn(userId);
    if (hasDrawn) {
      return res.status(400).json({ error: 'Bạn đã rút lì xì rồi' });
    }

    // Kiểm tra thời gian
    const canDraw = checkLuckyTime();
    if (!canDraw) {
      return res.status(400).json({ error: 'Chưa đến thời gian rút lì xì' });
    }

    // Kiểm tra thời gian tham gia server
    const joinTimeCheck = await checkServerJoinTime(req.user.accessToken, userId);
    if (!joinTimeCheck.isEligible) {
      return res.status(400).json({ 
        error: `Bạn cần tham gia server ít nhất 2 ngày để rút lì xì. Còn ${joinTimeCheck.daysLeft} ngày nữa.`,
        joinedAt: joinTimeCheck.joinedAt
      });
    }

    // Random số tiền
    const amount = getRandomAmount();

    // Lưu thông tin rút lì xì
    await recordUserDraw(userId, {
      amount,
      bankName,
      accountNumber,
      accountName: accountName.toUpperCase(),
      timestamp: Date.now(),
      status: 'pending',
      joinedAt: joinTimeCheck.joinedAt,
      username: req.user.username,
      discordUsername: req.user.username,
      avatar: req.user.avatar
    });

    // Gửi thông báo đến Discord
    await sendDiscordNotification({
      userId: req.user.id,
      username: req.user.username,
      amount,
      bankName,
      accountNumber,
      accountName,
      joinedAt: joinTimeCheck.joinedAt
    });

    res.json({ amount });
  } catch (error) {
    console.error('Lucky draw error:', error);
    res.status(500).json({ error: 'Có lỗi xảy ra khi rút lì xì' });
  }
});

// Admin login route
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (validateAdminCredentials(username, password)) {
            const token = jwt.sign(
                {
                    id: 'admin',
                    username: username,
                    isAdmin: true
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );
            
            res.json({ token });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Admin data route
app.get('/api/admin/draws', authenticateAdmin, async (req, res) => {
    try {
        const data = await loadUsers();
        res.json(data);
    } catch (error) {
        console.error('Admin error:', error);
        res.status(500).json({ 
            error: 'Failed to load data',
            details: error.message 
        });
    }
});

// Route xử lý OAuth Discord
app.post('/api/auth/discord/callback', async (req, res) => {
    try {
        const { code } = req.body;
        
        if (!code) {
            return res.status(400).json({ error: 'No code provided' });
        }

        // Exchange code for access token
        const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            body: new URLSearchParams({
                client_id: process.env.DISCORD_CLIENT_ID,
                client_secret: process.env.DISCORD_CLIENT_SECRET,
                code,
                grant_type: 'authorization_code',
                redirect_uri: process.env.DISCORD_REDIRECT_URI,
                scope: 'identify guilds',
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const tokenData = await tokenResponse.json();
        
        if (tokenData.error) {
            console.error('Token Error:', tokenData);
            return res.status(400).json({ error: 'Failed to get access token' });
        }

        // Get user data
        const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
            },
        });

        const userData = await userResponse.json();
        console.log('Discord user data:', userData); // Debug log

        // Get user's guilds
        const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
            },
        });

        const guildsData = await guildsResponse.json();
        
        // Kiểm tra user có trong server không
        const isInServer = guildsData.some(guild => guild.id === process.env.DISCORD_GUILD_ID);
        
        if (!isInServer) {
            return res.status(403).json({
                error: 'Bạn cần tham gia server Discord để rút lì xì'
            });
        }

        // Thêm access token vào JWT token
        const token = jwt.sign(
            {
                id: userData.id,
                username: userData.username,
                avatar: userData.avatar, // Lưu hash avatar
                accessToken: tokenData.access_token
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Tạo URL avatar
        const avatarUrl = userData.avatar ? 
            `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png` :
            null;

        console.log('Avatar URL:', avatarUrl); // Debug log

        res.json({ 
            token,
            user: {
                id: userData.id,
                username: userData.username,
                avatar: avatarUrl
            }
        });

    } catch (error) {
        console.error('Discord auth error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
});

// Route để kiểm tra token và lấy thông tin user
app.get('/api/auth/user', authenticateToken, (req, res) => {
    res.json({
        id: req.user.id,
        username: req.user.username,
        avatar: req.user.avatar ? 
            `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.png` : 
            null
    });
});

// Route để lấy danh sách giao dịch cho admin
app.get('/api/admin/transactions', checkAdmin, async (req, res) => {
    try {
        const users = await loadUsers();
        const transactions = [];

        for (const userId in users.draws) {
            const userDraws = users.draws[userId];
            if (Array.isArray(userDraws.history)) {
                userDraws.history.forEach(draw => {
                    // Tạo URL avatar
                    const avatarUrl = draw.avatar ? 
                        `https://cdn.discordapp.com/avatars/${userId}/${draw.avatar}.png` :
                        null;

                    console.log('Processing transaction:', {
                        userId,
                        username: draw.username,
                        avatar: draw.avatar,
                        avatarUrl
                    });

                    transactions.push({
                        userId,
                        username: draw.username || 'Unknown User',
                        discordUsername: draw.discordUsername || draw.username || 'Unknown User',
                        avatar: avatarUrl,
                        amount: draw.amount,
                        bankName: draw.bankName,
                        accountNumber: draw.accountNumber,
                        accountName: draw.accountName,
                        timestamp: draw.timestamp,
                        status: draw.status || 'pending'
                    });
                });
            }
        }

        // Sắp xếp theo thời gian mới nhất
        transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Thêm thống kê
        const stats = {
            totalTransactions: transactions.length,
            totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
            uniqueUsers: new Set(transactions.map(t => t.userId)).size
        };

        res.json({ transactions, stats });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

// Route đăng xuất
app.get('/auth/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.redirect(process.env.CLIENT_URL);
    });
});

// Sửa route logout
app.post('/api/auth/logout', (req, res) => {
    res.json({ message: 'Logged out successfully' });
});

// Xóa giao dịch
app.delete('/api/admin/transaction', checkAdmin, async (req, res) => {
  try {
    const { userId, timestamp } = req.body;
    const users = await loadUsers();

    if (!users.draws[userId]?.history) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Lọc ra giao dịch cần xóa
    users.draws[userId].history = users.draws[userId].history.filter(
      draw => draw.timestamp !== timestamp
    );

    // Nếu không còn giao dịch nào, xóa luôn user
    if (users.draws[userId].history.length === 0) {
      delete users.draws[userId];
    }

    // Lưu lại dữ liệu
    await fs.writeFile(
      path.join(__dirname, 'data', 'users.json'),
      JSON.stringify(users, null, 2)
    );

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

// Cập nhật trạng thái giao dịch
app.patch('/api/admin/transaction/status', checkAdmin, async (req, res) => {
  try {
    const { userId, timestamp, status } = req.body;
    console.log('Updating transaction:', { userId, timestamp, status });

    // Đọc file users.json
    const usersFilePath = path.join(__dirname, 'data', 'users.json');
    const usersData = await fs.readFile(usersFilePath, 'utf8');
    const users = JSON.parse(usersData);

    if (!users.draws[userId]?.history) {
      console.log('User or history not found:', userId);
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Tìm giao dịch cần cập nhật
    const transaction = users.draws[userId].history.find(
      draw => draw.timestamp === parseInt(timestamp)
    );

    if (!transaction) {
      console.log('Transaction not found:', timestamp);
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Cập nhật trạng thái
    transaction.status = status;
    console.log('Updated transaction:', transaction);

    // Lưu lại file
    await fs.writeFile(
      usersFilePath,
      JSON.stringify(users, null, 2)
    );

    res.json({ 
      message: 'Status updated successfully',
      transaction: transaction
    });

  } catch (error) {
    console.error('Error updating transaction status:', error);
    res.status(500).json({ 
      error: 'Failed to update status',
      details: error.message 
    });
  }
});

// Admin logout route
app.post('/api/admin/logout', (req, res) => {
  res.json({ message: 'Admin logged out successfully' });
});

// Route lấy thống kê rút lì xì
app.get('/api/draws/stats', async (req, res) => {
  try {
    const users = await loadUsers();
    const allDraws = [];

    // Chuyển đổi dữ liệu thành mảng
    Object.entries(users.draws).forEach(([userId, userDraws]) => {
      if (Array.isArray(userDraws.history)) {
        userDraws.history.forEach(draw => {
          // Tạo URL avatar với kích thước nhỏ hơn
          const avatarUrl = draw.avatar ? 
            `https://cdn.discordapp.com/avatars/${userId}/${draw.avatar}.png?size=32` : 
            null;

          console.log('Processing draw:', {
            userId,
            username: draw.username,
            avatar: draw.avatar,
            avatarUrl
          });

          allDraws.push({
            userId,
            username: draw.username,
            amount: draw.amount,
            timestamp: draw.timestamp,
            avatar: avatarUrl
          });
        });
      }
    });

    // Sắp xếp theo thời gian để lấy gần đây nhất
    const recentDraws = [...allDraws]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);

    // Sắp xếp theo số tiền để lấy top 3
    const topDraws = [...allDraws]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);

    res.json({
      recentDraws,
      topDraws
    });
  } catch (error) {
    console.error('Error fetching draws stats:', error);
    res.status(500).json({ error: 'Failed to fetch draws stats' });
  }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 