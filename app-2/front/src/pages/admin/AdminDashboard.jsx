import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const AdminDashboard = ({ children }) => {
	const location = useLocation();
	const isActive = (path) => {
		return location.pathname === path ? 'active' : '';
	};

	return (
		<div className="max-container">
			<div className="main-content">
				<h1>Панель администратора</h1>

				<div style={{ marginBottom: '2rem' }}>
					<div className="navbar bb">
						<ul>
							<li>
								<Link to="/admin" className={isActive('/admin')}>
									Уведомления
								</Link>
							</li>
							<li>
								<Link to="/admin/books" className={isActive('/admin/books')}>
									Книги
								</Link>
							</li>
						</ul>
					</div>
				</div>
				{children}
			</div>
		</div>
	);
};
