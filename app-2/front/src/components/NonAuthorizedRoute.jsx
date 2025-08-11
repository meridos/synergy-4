import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthHook';

export const NonAuthorizedRoute = ({ children }) => {
	const { isAuthenticated, isAdmin } = useAuth();
	const location = useLocation();

	if (isAdmin) {
		return <Navigate to="/admin" state={{ from: location }} replace />;
	}

	if (isAuthenticated) {
		return <Navigate to="/books" state={{ from: location }} replace />;
	}

	return children;
};
