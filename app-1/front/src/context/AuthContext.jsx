import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AuthContext } from './AuthHook';

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [token, setToken] = useState(localStorage.getItem('token'));
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const initAuth = async () => {
			if (token) {
				try {
					api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

					const response = await api.get('/auth/profile');

					setUser(response.data.user);
				} catch (error) {
					console.error('Auth error:', error);
					// eslint-disable-next-line no-use-before-define
					logout();
				}
			}
			setLoading(false);
		};

		initAuth();
	}, [token]);

	const login = async (email, password) => {
		try {
			const response = await api.post('/auth/login', { email, password });
			const { token: newToken, user: userData } = response.data;

			localStorage.setItem('token', newToken);
			api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
			setToken(newToken);
			setUser(userData);

			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: error.response?.data?.message || 'Login failed',
			};
		}
	};

	const register = async (email, password, name) => {
		try {
			const response = await api.post('/auth/register', { email, password, name });
			const { token: newToken, user: userData } = response.data;

			localStorage.setItem('token', newToken);
			api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
			setToken(newToken);
			setUser(userData);

			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: error.response?.data?.message || 'Registration failed',
			};
		}
	};

	const updateUser = async (userData) => {
		try {
			const response = await api.put(`/users/${user.id}`, userData);

			setUser(response.data.user);

			return { success: true, user: response.data.user };
		} catch (error) {
			return {
				success: false,
				error: error.response?.data?.error || 'Profile update failed',
			};
		}
	};

	const refreshUser = async () => {
		try {
			const response = await api.get('/auth/profile');

			setUser(response.data.user);

			return { success: true, user: response.data.user };
		} catch (error) {
			console.error('Failed to refresh user data:', error);

			return {
				success: false,
				error: error.response?.data?.error || 'Failed to refresh user data',
			};
		}
	};

	const logout = () => {
		localStorage.removeItem('token');
		delete api.defaults.headers.common['Authorization'];
		setToken(null);
		setUser(null);
	};

	const value = {
		user,
		token,
		login,
		register,
		logout,
		updateUser,
		refreshUser,
		loading,
		isAuthenticated: !!user,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
