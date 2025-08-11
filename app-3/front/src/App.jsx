import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MapProvider } from './context/MapContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { NonAuthorizedRoute } from './components/NonAuthorizedRoute';

import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Profile } from './pages/Profile';
import { TravelsPage } from './pages/Travels';
import { TravelPage } from './pages/TravelPage';
import { CreateTravel } from './pages/CreateTravel';
import { MyTravels } from './pages/MyTravels';

export function App() {
	return (
		<AuthProvider>
			<MapProvider>
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
							<Route
								path="/travels"
								element={
									<ProtectedRoute>
										<TravelsPage />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/travels/:id"
								element={
									<ProtectedRoute>
										<TravelPage />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/travels/create"
								element={
									<ProtectedRoute>
										<CreateTravel />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/travels/edit/:id"
								element={
									<ProtectedRoute>
										<CreateTravel />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/my-travels"
								element={
									<ProtectedRoute>
										<MyTravels />
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
			</MapProvider>
		</AuthProvider>
	);
}
