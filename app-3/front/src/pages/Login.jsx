import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthHook';

export const Login = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const { login } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	const from = location.state?.from?.pathname || '/';

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setLoading(true);

		try {
			const result = await login(email, password);

			if (result.success) {
				navigate(from, { replace: true });
			} else {
				setError(result.error);
			}
		} catch (err) {
			setError('Произошла непредвиденная ошибка');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="container">
			<div className="main-content">
				<form onSubmit={handleSubmit} className="auth-form">
					<h2>Вход</h2>

					<div className="form-group">
						<label htmlFor="email">Email:</label>
						<input
							type="email"
							id="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							disabled={loading}
						/>
					</div>

					<div className="form-group">
						<label htmlFor="password">Пароль:</label>
						<input
							type="password"
							id="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							disabled={loading}
						/>
					</div>

					{error && <div className="error">{error}</div>}

					<button type="submit" className="btn" disabled={loading}>
						{loading ? 'Вход...' : 'Войти'}
					</button>

					<p className="mt-1 text-center">
						Нет аккаунта? <Link to="/register">Зарегистрируйтесь</Link>
					</p>
				</form>
			</div>
		</div>
	);
};
