import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthHook';
import { api } from '../services/api';
import { DateTime } from '../components/DateTime';

export const UserRentals = () => {
	const { user, isAuthenticated } = useAuth();
	const [rentals, setRentals] = useState([]);
	const [purchases, setPurchases] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [activeTab, setActiveTab] = useState('rentals');

	useEffect(() => {
		if (!isAuthenticated) {
			return;
		}

		const fetchUserHistory = async () => {
			try {
				setLoading(true);
				const [rentalsResponse, purchasesResponse] = await Promise.all([
					api.get('/users/rentals'),
					api.get('/users/purchases'),
				]);

				setRentals(rentalsResponse.data.rentals || []);
				setPurchases(purchasesResponse.data.purchases || []);
			} catch (err) {
				setError('Не удалось загрузить историю');
				console.error('Error loading user history:', err);
			} finally {
				setLoading(false);
			}
		};

		fetchUserHistory();
	}, [isAuthenticated]);

	const formatPrice = (price) => {
		return new Intl.NumberFormat('ru-RU', {
			style: 'currency',
			currency: 'RUB',
		}).format(price);
	};

	const getStatusClassName = (status, endDate) => {
		if (status === 'returned') return 'success';

		if (new Date(endDate) < new Date()) return 'danger';

		return 'primary';
	};

	const getStatusText = (status, endDate) => {
		if (status === 'returned') return 'Возвращена';

		if (new Date(endDate) < new Date()) return 'Просрочена';

		return 'Активна';
	};

	const tabClick = (tab) => (e) => {
		e.preventDefault();
		setActiveTab(tab);
	};

	const isActiveTab = (tab) => {
		return activeTab === tab ? 'active' : '';
	};

	if (!isAuthenticated) {
		return (
			<div className="container">
				<div className="main-content">
					<p>Войдите в систему для просмотра истории</p>
				</div>
			</div>
		);
	}

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
		<div className="container">
			<div className="main-content">
				<h1>Моя история</h1>

				{error && (
					<div className="error" style={{ marginBottom: '2rem' }}>
						{error}
					</div>
				)}

				<div className="navbar bb">
					<ul>
						<li>
							<a onClick={tabClick('rentals')} className={isActiveTab('rentals')}>
								Аренда ({rentals.length})
							</a>
						</li>
						<li>
							<a onClick={tabClick('purchases')} className={isActiveTab('purchases')}>
								Покупки ({purchases.length})
							</a>
						</li>
					</ul>
				</div>

				{activeTab === 'rentals' && (
					<>
						<h2>История аренды</h2>
						{rentals.length === 0 ? (
							<p>У вас пока нет арендованных книг</p>
						) : (
							<table className="table">
								<thead>
									<tr>
										<th>Книга</th>
										<th>Период</th>
										<th>Стоимость</th>
										<th>Дата начала</th>
										<th>Дата окончания</th>
										<th>Статус</th>
									</tr>
								</thead>
								<tbody>
									{rentals.map((rental) => (
										<tr key={rental.id}>
											<td>{rental.book_title}</td>
											<td>
												{rental.rental_period === '2weeks' && '2 недели'}
												{rental.rental_period === '1month' && '1 месяц'}
												{rental.rental_period === '3months' && '3 месяца'}
											</td>
											<td>{formatPrice(rental.rental_price)}</td>
											<td>
												<DateTime date={rental.created_at} />
											</td>
											<td>
												<DateTime date={rental.end_date} />
											</td>
											<td className={getStatusClassName(rental.status, rental.end_date)}>
												{getStatusText(rental.status, rental.end_date)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						)}
					</>
				)}

				{activeTab === 'purchases' && (
					<>
						<h2>История покупок</h2>
						{purchases.length === 0 ? (
							<p>У вас пока нет покупок</p>
						) : (
							<table className="table">
								<thead>
									<tr>
										<th>Книга</th>
										<th>Количество</th>
										<th>Цена за штуку</th>
										<th>Общая стоимость</th>
										<th>Дата покупки</th>
									</tr>
								</thead>
								<tbody>
									{purchases.map((purchase) => (
										<tr key={purchase.id}>
											<td>{purchase.book_title}</td>
											<td>{purchase.quantity}</td>
											<td>{formatPrice(purchase.book_price)}</td>
											<td>{formatPrice(purchase.price)}</td>
											<td>
												<DateTime date={purchase.purchase_date} />
											</td>
										</tr>
									))}
								</tbody>
							</table>
						)}
					</>
				)}
			</div>
		</div>
	);
};
