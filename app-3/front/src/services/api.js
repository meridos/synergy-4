/* global URLSearchParams */
import axios from 'axios';

export const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	timeout: 10000,
	headers: {
		'Content-Type': 'application/json',
	},
});

api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('token');

		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}

		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

api.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		if (error.response?.status === 401) {
			localStorage.removeItem('token');
			window.location.href = '/login';
		}

		return Promise.reject(error);
	},
);

export const authService = {
	login: (email, password) => api.post('/auth/login', { email, password }),
	register: (email, password, name) => api.post('/auth/register', { email, password, name }),
	profile: () => api.get('/auth/profile'),
	logout: () => api.post('/auth/logout'),
};

export const userService = {
	getUsers: () => api.get('/users'),
	getUser: (id) => api.get(`/users/${id}`),
	updateUser: (id, data) => api.put(`/users/${id}`, data),
	deleteUser: (id) => api.delete(`/users/${id}`),
};

export const travelService = {
	getTravels: (filters = {}) => {
		const params = new URLSearchParams();

		if (filters.location) {
			params.append('location', filters.location);
		}

		if (filters.sort_by) {
			params.append('sort_by', filters.sort_by);
		}

		if (filters.sort_direction) {
			params.append('sort_direction', filters.sort_direction);
		}

		const queryString = params.toString();
		const url = queryString ? `/travels?${queryString}` : '/travels';

		return api.get(url);
	},
	getMyTravels: (filters = {}) => {
		const params = new URLSearchParams();

		if (filters.location) {
			params.append('location', filters.location);
		}

		if (filters.sort_by) {
			params.append('sort_by', filters.sort_by);
		}

		if (filters.sort_direction) {
			params.append('sort_direction', filters.sort_direction);
		}

		const queryString = params.toString();
		const url = queryString ? `/travels/my?${queryString}` : '/travels/my';

		return api.get(url);
	},
	getTravel: (id) => api.get(`/travels/${id}`),
	createTravel: (data) => api.post('/travels', data),
	updateTravel: (id, data) => api.put(`/travels/${id}`, data),
	deleteTravel: (id) => api.delete(`/travels/${id}`),
	addPlace: (travelId, data) => api.post(`/travels/${travelId}/places`, data),
};

export default api;
