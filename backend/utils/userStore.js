import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, '../data/users.json');

export async function loadUsers() {
    try {
        const data = await fs.readFile(dataPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return { draws: {} };
    }
}

export async function saveUsers(data) {
    try {
        await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving users:', error);
        throw new Error('Failed to save user data');
    }
}

export async function hasUserDrawn(userId) {
    const data = await loadUsers();
    return !!data.draws[userId];
}

export async function recordUserDraw(userId, drawData) {
    const data = await loadUsers();
    data.draws[userId] = {
        ...drawData,
        timestamp: new Date().toISOString()
    };
    await saveUsers(data);
}
