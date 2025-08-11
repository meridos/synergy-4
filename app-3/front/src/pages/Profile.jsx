import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthHook';
import { useNavigate } from 'react-router-dom';
import { DateTime } from '../components/DateTime';

export const Profile = () => {
	const { user, logout, updateUser } = useAuth();
	const [editing, setEditing] = useState(false);
	const [formData, setFormData] = useState({
		name: user?.name || '',
		email: user?.email || '',
		password: '',
	});
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');
	const navigate = useNavigate();

	useEffect(() => {
		if (user) {
			setFormData({
				name: user.name || '',
				email: user.email || '',
				password: '',
			});
		}
	}, [user]);

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setMessage('');
		setError('');

		try {
			const updateData = {
				name: formData.name,
				email: formData.email,
			};

			if (formData.password.trim()) {
				updateData.password = formData.password;
			}

			const result = await updateUser(updateData);

			if (result.success) {
				setMessage('Профиль успешно обновлён!');
				setEditing(false);
				setFormData((prev) => ({ ...prev, password: '' }));
			} else {
				setError(result.error || 'Не удалось обновить профиль');
			}
		} catch (err) {
			setError('Не удалось обновить профиль. Попробуйте позже.');
			console.error('Update error:', err);
		} finally {
			setLoading(false);
		}
	};

	const handleCancel = () => {
		setFormData({
			name: user?.name || '',
			email: user?.email || '',
			password: '',
		});
		setEditing(false);
		setError('');
		setMessage('');
	};

	const handleLogout = () => {
		logout();
		navigate('/');
	};

	return (
		<div className="container">
			<div className="main-content">
				<div className="card">
					<h1>Информация о пользователе</h1>

					{!editing ? (
						<div>
							<p>
								<strong>Имя:</strong> {user?.name || 'Не указано'}
							</p>
							<p>
								<strong>Email:</strong> {user?.email}
							</p>
							<p>
								<strong>Идентификатор:</strong> {user?.id || 'N/A'}
							</p>
							{user?.createdAt && (
								<p>
									<strong>Дата регистрации:</strong> <DateTime date={user.createdAt} />
								</p>
							)}

							<p className="flex gap-small">
								<button onClick={() => setEditing(true)} className="btn">
									Изменить
								</button>
								<button onClick={handleLogout} className="btn danger">
									Выйти
								</button>
							</p>
						</div>
					) : (
						<form onSubmit={handleSubmit}>
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
								<label htmlFor="password">Новый пароль:</label>
								<input
									type="password"
									id="password"
									name="password"
									value={formData.password}
									onChange={handleChange}
									placeholder="Оставьте пустым, если не хотите менять"
									disabled={loading}
								/>
							</div>

							{error && <div className="error">{error}</div>}
							{message && <div className="success">{message}</div>}

							<div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
								<button type="submit" className="btn primary" disabled={loading}>
									{loading ? 'Сохранение...' : 'Сохранить'}
								</button>
								<button type="button" onClick={handleCancel} className="btn" disabled={loading}>
									Отмена
								</button>
							</div>
						</form>
					)}
				</div>
			</div>
		</div>
	);
};
