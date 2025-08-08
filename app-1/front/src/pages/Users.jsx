import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { DateTime } from '../components/DateTime';

export const Users = () => {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				setLoading(true);
				setError('');
				const response = await api.get('/users');

				setUsers(response.data.users);
			} catch (err) {
				setError(err.response?.data?.error || 'Ошибка загрузки пользователей');
				console.error('Error fetching users:', err);
			} finally {
				setLoading(false);
			}
		};

		fetchUsers();
	}, []);

	if (loading) {
		return (
			<div className="container">
				<div className="main-content">
					<div style={{ textAlign: 'center', padding: '2rem' }}>
						<p>Загрузка...</p>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container">
				<div className="main-content">
					<div className="error-message">
						<h2>Ошибка</h2>
						<p>{error}</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="container">
			<div className="main-content">
				<h1>Пользователи</h1>

				{users.length === 0 ? (
					<p>Нет пользователей</p>
				) : (
					<div className="users">
						{users.map((user) => (
							<Link className="user" key={user.id} to={`/user/${user.id}`}>
								<div className="avatar-circle">{user.name.charAt(0).toUpperCase()}</div>

								<div>
									<h3 className="user-name">{user.name}</h3>
									<div className="user-info">
										<span>{user.email}</span>
										<DateTime date={user.created_at} time={false} />
									</div>
								</div>
							</Link>
						))}
					</div>
				)}
			</div>

			<style jsx>{`
				.users {
					display: grid;
					gap: 1rem;
					grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
				}

				.user {
					display: flex;
					text-decoration: none;
					color: inherit;
					gap: 1rem;
				}

				.user-name {
					margin: 0;
					transition: color 0.3s ease;
				}

				.user:hover .user-name {
					color: #007bff;
				}

				.user-info {
					display: flex;
					color: #666;
					gap: 0.5rem;
				}

				.user-info {
					text-align: center;
					margin-bottom: 1rem;
				}
			`}</style>
		</div>
	);
};
