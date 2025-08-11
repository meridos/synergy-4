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
import { BooksPage } from './pages/Books';
import { BookPage } from './pages/BookPage';
import { CreateBook } from './pages/CreateBook';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserRentals } from './pages/UserRentals';
import { AdminNotifications } from './pages/admin/AdminNotifications';
import { AdminBooks } from './pages/admin/AdminBooks';

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
						<Route path="/books" element={<BooksPage />} />
						<Route path="/books/:id" element={<BookPage />} />
						<Route
							path="/books/create"
							element={
								<ProtectedRoute>
									<CreateBook />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/books/edit/:id"
							element={
								<ProtectedRoute>
									<CreateBook />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/admin"
							element={
								<ProtectedRoute>
									<AdminDashboard>
										<AdminNotifications />
									</AdminDashboard>
								</ProtectedRoute>
							}
						/>
						<Route
							path="/admin/books"
							element={
								<ProtectedRoute>
									<AdminDashboard>
										<AdminBooks />
									</AdminDashboard>
								</ProtectedRoute>
							}
						/>
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
							path="/my-rentals"
							element={
								<ProtectedRoute>
									<UserRentals />
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
