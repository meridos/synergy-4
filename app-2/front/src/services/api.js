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
	subscribe: (id) => api.post(`/users/${id}/subscribe`),
	unsubscribe: (id) => api.delete(`/users/${id}/subscribe`),
	getSubscriptionFeed: () => api.get('/subscription-feed'),
};

export const bookService = {
	getBooks: (filters = {}) => {
		const params = new URLSearchParams();

		if (filters.category_id) {
			params.append('category_id', filters.category_id);
		}

		if (filters.author_id) {
			params.append('author_id', filters.author_id);
		}

		if (filters.sort_by) {
			params.append('sort_by', filters.sort_by);
		}

		if (filters.view) {
			params.append('view', filters.view);
		}

		const queryString = params.toString();
		const url = queryString ? `/books?${queryString}` : '/books';

		return api.get(url);
	},
	getBook: (id) => api.get(`/books/${id}`),
	createBook: (data) => api.post('/books', data),
	updateBook: (id, data) => api.put(`/books/${id}`, data),
	deleteBook: (id) => api.delete(`/books/${id}`),
	purchaseBook: (id, quantity = 1) => api.post(`/books/${id}/purchase`, { quantity }),
	rentBook: (id, rentalPeriod) => api.post(`/books/${id}/rent`, { rental_period: rentalPeriod }),
	getCategories: () => api.get('/categories'),
	getAuthors: () => api.get('/authors'),
	getCategory: (id) => api.get(`/categories/${id}`),
	getAuthor: (id) => api.get(`/authors/${id}`),
	createCategory: (data) => api.post('/categories', data),
	createAuthor: (data) => api.post('/authors', data),
	updateCategory: (id, data) => api.put(`/categories/${id}`, data),
	updateAuthor: (id, data) => api.put(`/authors/${id}`, data),
	deleteCategory: (id) => api.delete(`/categories/${id}`),
	deleteAuthor: (id) => api.delete(`/authors/${id}`),
};

export const purchaseService = {
	getUserPurchases: () => api.get('/users/purchases'),
	getUserRentals: () => api.get('/users/rentals'),
	getOverdueRentals: () => api.get('/users/rentals/overdue'),
	getExpiringRentals: () => api.get('/users/rentals/expiring'),
};

export default api;
