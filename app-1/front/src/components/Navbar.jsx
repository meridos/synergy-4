import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthHook';

export const Navbar = () => {
	const { user, isAuthenticated } = useAuth();
	const location = useLocation();

	const isActive = (path) => {
		return location.pathname === path ? 'active' : '';
	};

	return (
		<nav className="navbar">
			<div className="container">
				<ul>
					{!isAuthenticated && (
						<li>
							<Link to="/" className={isActive('/')}>
								Главная
							</Link>
						</li>
					)}
					<li>
						<Link to="/posts" className={isActive('/posts')}>
							Посты
						</Link>
					</li>
					{isAuthenticated ? (
						<>
							<li>
								<Link to="/subscriptions" className={isActive('/subscriptions')}>
									Подписки
								</Link>
							</li>
							<li>
								<Link to="/users" className={isActive('/users')}>
									Пользователи
								</Link>
							</li>
							<li>
								<Link to="/profile" className={isActive('/profile')}>
									{user?.name || user?.email}
								</Link>
							</li>
							<li>
								<Link to="/create-post" className={isActive('/create-post')}>
									Создать пост
								</Link>
							</li>
						</>
					) : (
						<>
							<li>
								<Link to="/login" className={isActive('/login')}>
									Войти
								</Link>
							</li>
							<li>
								<Link to="/register" className={isActive('/register')}>
									Регистрация
								</Link>
							</li>
						</>
					)}
				</ul>
			</div>
		</nav>
	);
};
