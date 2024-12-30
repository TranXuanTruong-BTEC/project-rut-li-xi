import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import LuckyDraw from './components/LuckyDraw';
import Login from './components/Login';
import DiscordCallback from './components/DiscordCallback';

function AppContent() {
    const { isAuthenticated, loading } = useAuth();
    const isCallbackRoute = window.location.pathname === '/callback';

    if (loading) {
        return <div>Loading...</div>;
    }

    if (isCallbackRoute) {
        return <DiscordCallback />;
    }

    if (!isAuthenticated) {
        return <Login />;
    }

    return <LuckyDraw />;
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App; 