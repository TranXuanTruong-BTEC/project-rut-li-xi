import React from 'react';
import { Navigate } from 'react-router-dom';

function PrivateRoute({ children }) {
    const adminToken = localStorage.getItem('adminToken');

    if (!adminToken) {
        return <Navigate to="/admin" />;
    }

    return children;
}

export default PrivateRoute; 