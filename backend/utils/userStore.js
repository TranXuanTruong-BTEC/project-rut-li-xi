import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const USERS_FILE = path.join(__dirname, '../data/users.json');

export const loadUsers = async () => {
    try {
        const data = await fs.readFile(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return { draws: {} };
        }
        throw error;
    }
};

export const recordUserDraw = async (userId, drawData) => {
    try {
        const users = await loadUsers();
        
        if (!users.draws[userId]) {
            users.draws[userId] = {
                history: []
            };
        }

        const draw = {
            ...drawData,
            status: drawData.status || 'pending',
            timestamp: Date.now(),
            username: drawData.username || 'Unknown User',
            discordUsername: drawData.discordUsername || drawData.username || 'Unknown User'
        };

        users.draws[userId].history.push(draw);

        await fs.writeFile(
            path.join(process.cwd(), 'data', 'users.json'),
            JSON.stringify(users, null, 2)
        );

        return true;
    } catch (error) {
        console.error('Error recording draw:', error);
        throw error;
    }
};

export const hasUserDrawn = async (userId) => {
    const users = await loadUsers();
    return users.draws && users.draws.hasOwnProperty(userId);
}; 