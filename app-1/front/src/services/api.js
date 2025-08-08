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

export const postService = {
	getPosts: (filters, sort) => {
		const params = { ...filters, ...sort };

		return api.get('/posts', { params });
	},
	getSubscriptionFeed: (tagFilter = null) => {
		const params = tagFilter ? { tag: tagFilter } : {};

		return api.get('/subscription-feed', { params });
	},
	getPost: (id) => api.get(`/posts/${id}`),
	getPostByShareToken: (token) => api.get(`/share/${token}`),
	createPost: (data) => api.post('/posts', data),
	updatePost: (id, data) => api.put(`/posts/${id}`, data),
	deletePost: (id) => api.delete(`/posts/${id}`),
	getTags: () => api.get('/tags'),
};

export const commentService = {
	getPostComments: (postId) => api.get(`/posts/${postId}/comments`),
	createPostComment: (postId, data) => api.post(`/posts/${postId}/comments`, data),
};

export default api;
