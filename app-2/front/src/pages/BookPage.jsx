/* global alert */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookService } from '../services/api';
import { StatusMessage } from '../components/StatusMessage';
import { DateTime } from '../components/DateTime';

export const BookPage = () => {
	const { id } = useParams();
	const [book, setBook] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [purchasing, setPurchasing] = useState(false);
	const [renting, setRenting] = useState(false);
	const [quantity, setQuantity] = useState(1);

	const formatPrice = (price) => {
		return new Intl.NumberFormat('ru-RU', {
			style: 'currency',
			currency: 'RUB',
			minimumFractionDigits: 2,
		}).format(price);
	};

	useEffect(() => {
		const fetchBook = async () => {
			try {
				setLoading(true);
				const response = await bookService.getBook(id);

				setBook(response.data.book);
				setError('');
			} catch (error) {
				console.error('Error fetching book:', error);

				if (error.response?.status === 404) {
					setError('Книга не найдена');
				} else {
					setError('Ошибка загрузки книги');
				}
			} finally {
				setLoading(false);
			}
		};

		if (id) {
			fetchBook();
		}
	}, [id]);

	const handlePurchase = useCallback(async () => {
		setPurchasing(true);
		try {
			const response = await bookService.purchaseBook(book.id, quantity);

			alert(`Книга успешно куплена! Общая стоимость: ${formatPrice(response.data.total_price)}`);
			const updatedBook = await bookService.getBook(id);

			setBook(updatedBook.data.book);
		} catch (error) {
			const errorMessage = error.response?.data?.error || error.message || 'Purchase failed';

			alert(`Ошибка покупки: ${errorMessage}`);
		} finally {
			setPurchasing(false);
		}
	}, [quantity, book, id]);

	const handleRent = async (rentalPeriod) => {
		setRenting(true);
		try {
			const response = await bookService.rentBook(book.id, rentalPeriod);

			alert(
				`Книга успешно арендована! Стоимость: ${formatPrice(response.data.rental_price)}. Срок возврата: ${new Date(response.data.end_date).toLocaleDateString()}`,
			);
			const updatedBook = await bookService.getBook(id);

			setBook(updatedBook.data.book);
		} catch (error) {
			const errorMessage = error.response?.data?.error || error.message || 'Rental failed';

			alert(`Ошибка аренды: ${errorMessage}`);
		} finally {
			setRenting(false);
		}
	};

	const RentPrice = ({ price, period }) => {
		return (
			<div
				style={{
					padding: '0.5rem',
					backgroundColor: 'white',
					borderRadius: '4px',
					border: '1px solid #dee2e6',
				}}
			>
				<div style={{ fontWeight: 'bold' }}>{period}</div>
				<div style={{ color: '#17a2b8', fontWeight: 'bold' }}>{formatPrice(price)}</div>
			</div>
		);
	};

	if (loading) {
		return <StatusMessage message="Загрузка книги..." />;
	}

	if (error) {
		return (
			<div className="container">
				<div className="main-content">
					<StatusMessage className="error" message={error} />
					<div style={{ textAlign: 'center', marginTop: '1rem' }}>
						<Link
							to="/books"
							style={{
								display: 'inline-block',
								padding: '0.75rem 1.5rem',
								backgroundColor: '#007bff',
								color: 'white',
								textDecoration: 'none',
								borderRadius: '4px',
								fontWeight: 'bold',
							}}
						>
							Вернуться к книгам
						</Link>
					</div>
				</div>
			</div>
		);
	}

	if (!book) {
		return <StatusMessage className="error" message="Книга не найдена" />;
	}

	return (
		<div className="container">
			<div className="main-content">
				<div className="mb-2">
					<Link to="/books">← Назад к книгам</Link>
				</div>

				<div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
					<div style={{ padding: '2rem' }}>
						<div style={{ marginBottom: '2rem' }}>
							<h1 style={{ margin: '0 0 1rem 0', fontSize: '2em', fontWeight: 'bold' }}>{book.title}</h1>

							<div style={{ fontSize: '1.1em', color: '#666', marginBottom: '1rem' }}>
								{book.author && (
									<div style={{ marginBottom: '0.5rem' }}>
										<strong>Автор:</strong> {book.author}
									</div>
								)}
								{book.category && (
									<div style={{ marginBottom: '0.5rem' }}>
										<strong>Категория:</strong> {book.category}
									</div>
								)}
								<div style={{ marginBottom: '0.5rem' }}>
									<strong>Год издания:</strong> {book.publication_year}
								</div>

								<div style={{ color: '#666' }}>
									<strong>Доступно:</strong> {book.stock_quantity} шт.
								</div>
							</div>

							<div style={{ marginBottom: '1rem' }}>
								<div
									style={{
										display: 'inline-block',
										padding: '0.5rem 1rem',
										borderRadius: '4px',
										backgroundColor: book.status === 'active' ? '#d4edda' : '#f8d7da',
										color: book.status === 'active' ? '#155724' : '#721c24',
										marginRight: '1rem',
										fontWeight: 'bold',
									}}
								>
									Статус: {book.status === 'active' ? 'Активна' : 'Неактивна'}
								</div>
							</div>
						</div>

						{book.description && (
							<div style={{ marginBottom: '2rem' }}>
								<h3 style={{ marginBottom: '1rem', fontSize: '1.3em' }}>Описание</h3>
								<p style={{ fontSize: '1em', lineHeight: '1.6', color: '#333' }}>{book.description}</p>
							</div>
						)}

						{book.status === 'active' && book.stock_quantity > 0 && (
							<div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
								<h4 style={{ margin: 0, fontSize: '1.2em' }}>Действия</h4>

								<div
									style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}
								>
									<div style={{ marginBottom: '1rem' }}>
										<h3>
											Цена покупки: <span className="success">{formatPrice(book.price)}</span>
										</h3>
									</div>
									{(book.rental_price_2weeks > 0 || book.rental_price_1month > 0 || book.rental_price_3months > 0) && (
										<div>
											<h4 style={{ marginBottom: '0.5rem', fontSize: '1.1em' }}>Аренда:</h4>
											<div
												style={{
													display: 'grid',
													gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
													gap: '0.5rem',
												}}
											>
												{book.rental_price_2weeks > 0 && (
													<RentPrice period="2 недели" price={book.rental_price_2weeks} />
												)}
												{book.rental_price_1month > 0 && (
													<RentPrice period="1 месяц" price={book.rental_price_1month} />
												)}
												{book.rental_price_3months > 0 && (
													<RentPrice period="3 месяца" price={book.rental_price_3months} />
												)}
											</div>
										</div>
									)}
								</div>
								{book.available_for_purchase && (
									<>
										<label>
											Количество:{' '}
											<input
												type="number"
												min={1}
												max={book.stock_quantity}
												value={quantity}
												onChange={(e) => setQuantity(e.target.value)}
												style={{
													padding: '0.5rem',
													border: '1px solid #dee2e6',
													borderRadius: '4px',
													fontSize: '1em',
													width: '50px',
												}}
											/>
										</label>
										<button
											onClick={() => handlePurchase()}
											disabled={purchasing}
											className={`btn ${purchasing ? 'secondary' : 'primary'}`}
											style={{
												padding: '1rem 2rem',
												cursor: purchasing ? 'not-allowed' : 'pointer',
												fontSize: '1.1em',
											}}
										>
											{purchasing ? 'Покупка...' : `Купить за ${formatPrice(book.price)}`}
										</button>
									</>
								)}

								{book.available_for_rent && (
									<div>
										<h5 style={{ marginBottom: '0.5rem', fontSize: '1em' }}>Арендовать:</h5>
										<div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
											{book.rental_price_2weeks > 0 && (
												<button
													onClick={() => handleRent('2weeks')}
													disabled={renting}
													className="btn primary"
													style={{
														flex: 1,
													}}
												>
													{renting ? 'Аренда...' : `2 недели (${formatPrice(book.rental_price_2weeks)})`}
												</button>
											)}
											{book.rental_price_1month > 0 && (
												<button
													onClick={() => handleRent('1month')}
													disabled={renting}
													className="btn primary"
													style={{
														flex: 1,
													}}
												>
													{renting ? 'Аренда...' : `1 месяц (${formatPrice(book.rental_price_1month)})`}
												</button>
											)}
											{book.rental_price_3months > 0 && (
												<button
													onClick={() => handleRent('3months')}
													disabled={renting}
													className="btn primary"
													style={{
														flex: 1,
													}}
												>
													{renting ? 'Аренда...' : `3 месяца (${formatPrice(book.rental_price_3months)})`}
												</button>
											)}
										</div>
									</div>
								)}
							</div>
						)}

						{(book.status !== 'active' || book.stock_quantity <= 0) && (
							<div
								style={{
									padding: '1.5rem',
									backgroundColor: '#f8f9fa',
									border: '2px solid #dee2e6',
									borderRadius: '8px',
									textAlign: 'center',
									color: '#6c757d',
									fontSize: '1.1em',
									fontWeight: 'bold',
								}}
							>
								{book.status !== 'active' ? 'Книга недоступна' : 'Нет в наличии'}
							</div>
						)}

						<div
							style={{
								marginTop: '2rem',
								padding: '1rem',
								backgroundColor: '#f8f9fa',
								borderRadius: '4px',
								fontSize: '0.9em',
								color: '#666',
							}}
						>
							<div
								style={{
									display: 'grid',
									gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
									gap: '0.5rem',
								}}
							>
								<div>
									<strong>Доступна для покупки:</strong> {book.available_for_purchase ? 'Да' : 'Нет'}
								</div>
								<div>
									<strong>Доступна для аренды:</strong> {book.available_for_rent ? 'Да' : 'Нет'}
								</div>
								{book.created_at && (
									<div>
										<strong>Добавлена:</strong> <DateTime date={book.created_at} />
									</div>
								)}
								{book.updated_at && (
									<div>
										<strong>Обновлена:</strong> <DateTime date={book.updated_at} />
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
