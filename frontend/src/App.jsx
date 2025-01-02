import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LuckyDraw from './components/LuckyDraw';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import DiscordCallback from './components/DiscordCallback';
import PrivateRoute from './components/PrivateRoute';
import NotFound from './components/NotFound';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LuckyDraw />} />
                <Route path="/callback" element={<DiscordCallback />} />
                <Route path="/admin" element={<AdminLogin />} />
                <Route 
                    path="/admin/dashboard" 
                    element={
                        <PrivateRoute>
                            <AdminDashboard />
                        </PrivateRoute>
                    } 
                />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
}

export default App; 