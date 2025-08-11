import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthHook';

export const Navbar = () => {
	const { user, isAuthenticated, isAdmin } = useAuth();
	const location = useLocation();

	const isActive = (path) => {
		return location.pathname === path ? 'active' : '';
	};

	const NonAuthorizedLinks = () => (
		<ul>
			<li>
				<Link to="/" className={isActive('/')}>
					Главная
				</Link>
			</li>
			<li className="right">
				<Link to="/login" className={isActive('/login')}>
					Войти
				</Link>
			</li>
			<li>
				<Link to="/register" className={isActive('/register')}>
					Регистрация
				</Link>
			</li>
		</ul>
	);
	const UsersLinks = () => (
		<ul>
			<li>
				<Link to="/books" className={isActive('/books')}>
					Книги
				</Link>
			</li>
			<li>
				<Link to="/my-rentals" className={isActive('/my-rentals')}>
					Моя история
				</Link>
			</li>
			<li className="right">
				<Link to="/profile" className={isActive('/profile')}>
					{user?.name || user?.email}
				</Link>
			</li>
		</ul>
	);
	const AdminLinks = () => (
		<ul>
			<li>
				<Link to="/admin" className={isActive('/admin')}>
					Панель администратора
				</Link>
			</li>
			<li>
				<Link to="/books/create" className={isActive('/books/create')}>
					Добавить книгу
				</Link>
			</li>
			<li className="right">
				<Link to="/profile" className={isActive('/profile')}>
					{user?.name || user?.email}
				</Link>
			</li>
		</ul>
	);

	const Links = () => (isAuthenticated ? isAdmin ? <AdminLinks /> : <UsersLinks /> : <NonAuthorizedLinks />);

	return (
		<nav className="navbar">
			<div className="container">
				<Links />
			</div>
		</nav>
	);
};
