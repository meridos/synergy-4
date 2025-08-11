import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthHook';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { DateTime } from '../../components/DateTime';

export const AdminNotifications = () => {
	const { user, isAuthenticated, isAdmin } = useAuth();
	const navigate = useNavigate();
	const [overdueRentals, setOverdueRentals] = useState([]);
	const [expiringRentals, setExpiringRentals] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [sendingReminders, setSendingReminders] = useState(false);
	const [reminderMessage, setReminderMessage] = useState('');

	useEffect(() => {
		if (!isAuthenticated || !isAdmin) {
			navigate('/');

			return;
		}

		const fetchRentalData = async () => {
			try {
				setLoading(true);
				const [overdueResponse, expiringResponse] = await Promise.all([
					api.get('/admin/rentals/overdue'),
					api.get('/admin/rentals/expiring'),
				]);

				setOverdueRentals(overdueResponse.data.overdue_rentals || []);
				setExpiringRentals(expiringResponse.data.expiring_rentals || []);
			} catch (err) {
				setError('Не удалось загрузить данные о аренде');
				console.error('Error loading rental data:', err);
			} finally {
				setLoading(false);
			}
		};

		fetchRentalData();
	}, [isAuthenticated, isAdmin, user, navigate]);

	const formatPrice = (price) => {
		return new Intl.NumberFormat('ru-RU', {
			style: 'currency',
			currency: 'RUB',
		}).format(price);
	};

	const handleSendReminders = async () => {
		try {
			setSendingReminders(true);
			setReminderMessage('');
			const response = await api.post('/admin/rentals/send-reminders');

			setReminderMessage(response.data.message);
		} catch (err) {
			setError('Не удалось отправить напоминания');
			console.error('Error sending reminders:', err);
		} finally {
			setSendingReminders(false);
		}
	};

	if (loading) {
		return (
			<div className="container">
				<div className="main-content">
					<p>Загрузка...</p>
				</div>
			</div>
		);
	}

	return (
		<>
			{error && (
				<div className="error" style={{ marginBottom: '2rem' }}>
					{error}
				</div>
			)}

			{reminderMessage && (
				<div
					style={{
						backgroundColor: '#d4edda',
						color: '#155724',
						padding: '1rem',
						borderRadius: '4px',
						marginBottom: '2rem',
					}}
				>
					{reminderMessage}
				</div>
			)}

			<div style={{ marginBottom: '2rem' }}>
				<button onClick={handleSendReminders} disabled={sendingReminders} className="btn primary">
					{sendingReminders ? 'Отправка...' : 'Отправить напоминания'}
				</button>
			</div>

			<div style={{ display: 'grid', gap: '2rem' }}>
				<div className="card">
					<h2 style={{ color: '#dc3545', marginBottom: '1rem' }}>Просроченная аренда ({overdueRentals.length})</h2>
					{overdueRentals.length === 0 ? (
						<p>Нет просроченных арендованных книг</p>
					) : (
						<div style={{ overflowX: 'auto' }}>
							<table className="table">
								<thead>
									<tr>
										<th>Пользователь</th>
										<th>Email</th>
										<th>Книга</th>
										<th>Срок окончания</th>
										<th>Стоимость</th>
									</tr>
								</thead>
								<tbody>
									{overdueRentals.map((rental) => (
										<tr key={rental.id}>
											<td>{rental.user_name}</td>
											<td>{rental.user_email}</td>
											<td>{rental.book_title}</td>
											<td>
												<DateTime date={rental.end_date} />
											</td>
											<td>{formatPrice(rental.rental_price)}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>

				<div className="card">
					<h2 style={{ color: '#ffc107', marginBottom: '1rem' }}>Скоро истекает аренда ({expiringRentals.length})</h2>
					{expiringRentals.length === 0 ? (
						<p>Нет арендованных книг, срок которых скоро истечет</p>
					) : (
						<div style={{ overflowX: 'auto' }}>
							<table className="table">
								<thead>
									<tr>
										<th>Пользователь</th>
										<th>Email</th>
										<th>Книга</th>
										<th>Срок окончания</th>
										<th>Стоимость</th>
									</tr>
								</thead>
								<tbody>
									{expiringRentals.map((rental) => (
										<tr key={rental.id}>
											<td>{rental.user_name}</td>
											<td>{rental.user_email}</td>
											<td>{rental.book_title}</td>
											<td>
												<DateTime date={rental.end_date} />
											</td>
											<td>{formatPrice(rental.rental_price)}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			</div>
		</>
	);
};
