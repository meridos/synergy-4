import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthHook';

export const NonAuthorizedRoute = ({ children }) => {
	const { isAuthenticated, loading } = useAuth();
	const location = useLocation();

	if (isAuthenticated) {
		return <Navigate to="/subscriptions" state={{ from: location }} replace />;
	}

	return children;
};
