import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthHook';

export const Register = () => {
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
		confirmPassword: '',
	});
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const { register } = useAuth();
	const navigate = useNavigate();

	const handleChange = (e) => {
		const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;

		setFormData({
			...formData,
			[e.target.name]: value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');

		if (formData.password !== formData.confirmPassword) {
			setError('Пароли не совпадают');

			return;
		}

		if (formData.password.length < 6) {
			setError('Пароль должен содержать не менее 6 символов');

			return;
		}

		setLoading(true);

		try {
			const result = await register(formData.email, formData.password, formData.name);

			if (result.success) {
				navigate('/');
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
					<h2>Регистрация</h2>

					<div className="form-group">
						<label htmlFor="name">Имя:</label>
						<input
							type="text"
							id="name"
							name="name"
							value={formData.name}
							onChange={handleChange}
							required
							disabled={loading}
						/>
					</div>

					<div className="form-group">
						<label htmlFor="email">Email:</label>
						<input
							type="email"
							id="email"
							name="email"
							value={formData.email}
							onChange={handleChange}
							required
							disabled={loading}
						/>
					</div>

					<div className="form-group">
						<label htmlFor="password">Пароль:</label>
						<input
							type="password"
							id="password"
							name="password"
							value={formData.password}
							onChange={handleChange}
							required
							disabled={loading}
							minLength="6"
						/>
					</div>

					<div className="form-group">
						<label htmlFor="confirmPassword">Подтвердите пароль:</label>
						<input
							type="password"
							id="confirmPassword"
							name="confirmPassword"
							value={formData.confirmPassword}
							onChange={handleChange}
							required
							disabled={loading}
						/>
					</div>

					{error && <div className="error">{error}</div>}

					<button type="submit" className="btn" disabled={loading}>
						{loading ? 'Создание аккаунта...' : 'Зарегистрироваться'}
					</button>

					<p className="mt-1 text-center">
						Уже есть аккаунт? <Link to="/login">Войдите здесь</Link>
					</p>
				</form>
			</div>
		</div>
	);
};
