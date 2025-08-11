import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthHook';

export const Navbar = () => {
	const { user, isAuthenticated } = useAuth();
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
				<Link to="/travels" className={isActive('/travels')}>
					Путешествия
				</Link>
			</li>
			<li>
				<Link to="/my-travels" className={isActive('/my-travels')}>
					Мои путешествия
				</Link>
			</li>
			<li>
				<Link to="/travels/create" className={isActive('/travels/create')}>
					Добавить путешествие
				</Link>
			</li>
			<li className="right">
				<Link to="/profile" className={isActive('/profile')}>
					{user?.name || user?.email}
				</Link>
			</li>
		</ul>
	);

	const Links = () => (isAuthenticated ? <UsersLinks /> : <NonAuthorizedLinks />);

	return (
		<nav className="navbar">
			<div className="container">
				<Links />
			</div>
		</nav>
	);
};
