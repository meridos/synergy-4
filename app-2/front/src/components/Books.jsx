/* global alert */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthHook';
import { bookService } from '../services/api';
import { Price } from './Price';

export const Books = ({ books }) => {
	const { user } = useAuth();
	const [purchasing, setPurchasing] = useState({});
	const [renting, setRenting] = useState({});

	const handlePurchase = async (bookId, quantity = 1) => {
		setPurchasing((prev) => ({ ...prev, [bookId]: true }));

		try {
			const response = await bookService.purchaseBook(bookId, quantity);

			alert(`Книга успешно куплена! Общая стоимость: $${response.data.total_price}`);
			window.location.reload();
		} catch (error) {
			const errorMessage = error.response?.data?.error || error.message || 'Purchase failed';

			alert(`Ошибка покупки: ${errorMessage}`);
		} finally {
			setPurchasing((prev) => ({ ...prev, [bookId]: false }));
		}
	};

	const handleRent = async (bookId, rentalPeriod) => {
		setRenting((prev) => ({ ...prev, [bookId]: true }));

		try {
			const response = await bookService.rentBook(bookId, rentalPeriod);

			alert(
				`Книга успешно арендована! Стоимость: $${response.data.rental_price}. Срок возврата: ${new Date(response.data.end_date).toLocaleDateString()}`,
			);
			window.location.reload();
		} catch (error) {
			const errorMessage = error.response?.data?.error || error.message || 'Rental failed';

			alert(`Ошибка аренды: ${errorMessage}`);
		} finally {
			setRenting((prev) => ({ ...prev, [bookId]: false }));
		}
	};

	if (!books || books.length === 0) {
		return (
			<div className="card text-center" style={{ padding: '3rem' }}>
				<h3>Книги не найдены</h3>
				<p>Попробуйте изменить фильтры поиска</p>
			</div>
		);
	}

	return (
		<div
			className="books-grid"
			style={{
				display: 'grid',
				gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
				gap: '1.5rem',
			}}
		>
			{books.map((book) => (
				<div key={book.id} className="card book" style={{ height: 'fit-content' }}>
					<div style={{ padding: '1.5rem' }}>
						<div style={{ marginBottom: '1rem' }}>
							<h3 className="book-title">
								<Link to={`/books/${book.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
									{book.title}
								</Link>
							</h3>
							<div className="description">
								{book.author && (
									<div>
										<strong>Автор:</strong> {book.author}
									</div>
								)}
								{book.category && (
									<div>
										<strong>Категория:</strong> {book.category}
									</div>
								)}
								<div>
									<strong>Год издания:</strong> {book.publication_year}
								</div>
							</div>
						</div>

						{book.description && (
							<div
								style={{
									marginBottom: '1rem',
									fontSize: '0.9em',
									lineHeight: '1.4',
									maxHeight: '3em',
									overflow: 'hidden',
									textOverflow: 'ellipsis',
								}}
							>
								{book.description}
							</div>
						)}

						<div style={{ marginBottom: '1.5rem' }}>
							{book.available_for_purchase && (
								<div style={{ fontSize: '1.1em', fontWeight: 'bold', marginBottom: '0.5rem' }}>
									Цена покупки: <Price price={book.price} />
								</div>
							)}
							{book.available_for_rent && book.status === 'active' && (
								<>
									<div>Аренда:</div>
									<table className="table small center">
										<thead>
											<tr>
												<th>2 недели</th>
												<th>1 месяц</th>
												<th>3 месяца</th>
											</tr>
										</thead>
										<tbody>
											<tr>
												<td>{book.rental_price_2weeks > 0 ? <Price price={book.rental_price_2weeks} /> : '-'}</td>
												<td>{book.rental_price_1month > 0 ? <Price price={book.rental_price_1month} /> : '-'}</td>
												<td>{book.rental_price_3months > 0 ? <Price price={book.rental_price_3months} /> : '-'}</td>
											</tr>
										</tbody>
									</table>
								</>
							)}
						</div>

						{user && book.status === 'active' && book.stock_quantity > 0 && (
							<div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
								{book.available_for_purchase && (
									<button
										onClick={() => handlePurchase(book.id)}
										disabled={purchasing[book.id]}
										className="btn primary"
									>
										{purchasing[book.id] ? 'Покупка...' : 'Купить'}
									</button>
								)}

								{book.available_for_rent && (
									<div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', alignSelf: 'center' }}>
										{book.rental_price_2weeks > 0 && (
											<button
												onClick={() => handleRent(book.id, '2weeks')}
												disabled={renting[book.id]}
												className="btn "
											>
												{renting[book.id] ? 'Аренда...' : '2 нед.'}
											</button>
										)}
										{book.rental_price_1month > 0 && (
											<button
												onClick={() => handleRent(book.id, '1month')}
												disabled={renting[book.id]}
												className="btn "
											>
												{renting[book.id] ? 'Аренда...' : '1 мес.'}
											</button>
										)}
										{book.rental_price_3months > 0 && (
											<button
												onClick={() => handleRent(book.id, '3months')}
												disabled={renting[book.id]}
												className="btn "
											>
												{renting[book.id] ? 'Аренда...' : '3 мес.'}
											</button>
										)}
									</div>
								)}
							</div>
						)}

						{(!user || book.status !== 'active' || book.stock_quantity <= 0) && (
							<div
								style={{
									padding: '0.75rem',
									backgroundColor: '#f8f9fa',
									border: '1px solid #dee2e6',
									borderRadius: '4px',
									textAlign: 'center',
									color: '#6c757d',
									fontSize: '0.9em',
								}}
							>
								{!user ? 'Войдите для покупки/аренды' : book.status !== 'active' ? 'Книга недоступна' : 'Нет в наличии'}
							</div>
						)}
					</div>
				</div>
			))}

			<style jsx>{`
				.book-title {
					margin: 0 0 0.5rem 0;
					font-size: 1.2em;
					font-weight: bold;
					transition: color 0.3s ease;
				}

				.book:hover .book-title {
					color: #007bff;
				}

				.description {
					font-size: 0.9em;
					color: #666;
				}
			`}</style>
		</div>
	);
};
