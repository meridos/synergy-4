import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { NonAuthorizedRoute } from './components/NonAuthorizedRoute';

import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Profile } from './pages/Profile';
import { CreatePost } from './pages/CreatePost';
import { PostsPage } from './pages/Posts';
import { PostDetail } from './pages/PostDetail';
import { UserProfile } from './pages/UserProfile';
import { Users } from './pages/Users';

export function App() {
	return (
		<AuthProvider>
			<Router>
				<div className="App">
					<Navbar />
					<Routes>
						<Route
							path="/"
							element={
								<NonAuthorizedRoute>
									<Home />
								</NonAuthorizedRoute>
							}
						/>
						<Route path="/posts" element={<PostsPage />} />
						<Route path="/post/:id" element={<PostDetail />} />
						<Route
							path="/subscriptions"
							element={
								<ProtectedRoute>
									<PostsPage isSubscriptions />
								</ProtectedRoute>
							}
						/>
						<Route path="/share/:token" element={<PostDetail />} />
						<Route path="/users" element={<Users />} />
						<Route path="/user/:id" element={<UserProfile />} />
						<Route path="/login" element={<Login />} />
						<Route path="/register" element={<Register />} />

						<Route
							path="/profile"
							element={
								<ProtectedRoute>
									<Profile />
								</ProtectedRoute>
							}
						/>

						<Route
							path="/create-post"
							element={
								<ProtectedRoute>
									<CreatePost />
								</ProtectedRoute>
							}
						/>

						<Route
							path="/edit-post/:id"
							element={
								<ProtectedRoute>
									<CreatePost />
								</ProtectedRoute>
							}
						/>

						<Route
							path="*"
							element={
								<div className="container">
									<div className="main-content">
										<h1>Страница не найдена</h1>
									</div>
								</div>
							}
						/>
					</Routes>
				</div>
			</Router>
		</AuthProvider>
	);
}
