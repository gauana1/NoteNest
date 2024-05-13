// components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

function ProtectedRoute({ children }) {
    const { currentUser } = useAuth();
    console.log(currentUser);
    if (!currentUser) {
        // Redirect them to the login page, but save the current location they were trying to go to
        return <Navigate to="/" replace />;
    }

    return children;
}
export { ProtectedRoute };