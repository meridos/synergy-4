import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthHook';
import { bookService } from '../services/api';
import { StatusMessage } from '../components/StatusMessage';

export const CreateBook = () => {
	const navigate = useNavigate();
	const { id } = useParams();
	const { user, isAuthenticated, isAdmin } = useAuth();
	const [formData, setFormData] = useState({
		title: '',
		description: '',
		publication_year: new Date().getFullYear(),
		price: 0,
		rental_price_2weeks: 0,
		rental_price_1month: 0,
		rental_price_3months: 0,
		stock_quantity: 1,
		available_for_rent: true,
		available_for_purchase: true,
		status: 'active',
		category_id: null,
		author_id: null,
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [initialLoading, setInitialLoading] = useState(false);

	const isEditing = !!id;

	useEffect(() => {
		if (!isAuthenticated) {
			navigate('/login');
		}
	}, [isAuthenticated, navigate]);

	useEffect(() => {
		if (isEditing && isAuthenticated) {
			const loadBook = async () => {
				try {
					setInitialLoading(true);
					const response = await bookService.getBook(id);
					const book = response.data.book;

					setFormData({
						title: book.title || '',
						description: book.description || '',
						publication_year: book.publication_year || new Date().getFullYear(),
						price: book.price || 0,
						rental_price_2weeks: book.rental_price_2weeks || 0,
						rental_price_1month: book.rental_price_1month || 0,
						rental_price_3months: book.rental_price_3months || 0,
						stock_quantity: book.stock_quantity ?? 1,
						available_for_rent: book.available_for_rent ?? true,
						available_for_purchase: book.available_for_purchase ?? true,
						status: book.status || 'active',
						category: book.category || null,
						author: book.author || null,
					});
				} catch (err) {
					setError(err.response?.data?.error || 'Ошибка загрузки книги');
					console.error('Error loading book:', err);
				} finally {
					setInitialLoading(false);
				}
			};

			loadBook();
		}
	}, [isEditing, id, isAuthenticated]);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;

		setFormData((prev) => ({
			...prev,
			[name]: type === 'checkbox' ? checked : type === 'number' ? value && parseFloat(value) : value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!formData.title.trim() || !formData.price || !formData.publication_year) {
			setError('Не заполнены обязательные поля');

			return;
		}

		setLoading(true);
		setError('');

		try {
			let response;

			if (isEditing) {
				response = await bookService.updateBook(id, formData);
			} else {
				response = await bookService.createBook(formData);
			}

			if (response.status === 200 || response.status === 201) {
				navigate('/books', {
					state: { message: `Книга успешно ${isEditing ? 'обновлена' : 'создана'}!` },
				});
			}
		} catch (err) {
			setError(
				err.response?.data?.error || `Не удалось ${isEditing ? 'обновить' : 'создать'} книгу. Попробуйте снова.`,
			);
			console.error(`${isEditing ? 'Update' : 'Create'} book error:`, err);
		} finally {
			setLoading(false);
		}
	};

	const handleCancel = () => {
		navigate(-1);
	};

	const handleDelete = async () => {
		await bookService.deleteBook(id);
		navigate('/books', {
			state: { message: `Книга успешно удалена!` },
		});
	};

	if (!isAuthenticated || (user && !isAdmin)) {
		return (
			<div className="container">
				<div className="main-content">
					<div style={{ textAlign: 'center', padding: '2rem' }}>
						<p>У вас нет прав доступа к этой странице.</p>
					</div>
				</div>
			</div>
		);
	}

	if (initialLoading) {
		return (
			<div className="container">
				<div className="main-content">
					<div style={{ textAlign: 'center', padding: '2rem' }}>
						<p>Загрузка книги...</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="container">
			<div className="main-content">
				<h1>{isEditing ? 'Редактировать книгу' : 'Добавить новую книгу'}</h1>

				<div className="card">
					<form onSubmit={handleSubmit}>
						<div className="form-group">
							<label htmlFor="title">
								Название <span style={{ color: 'red' }}>*</span>
							</label>
							<input
								type="text"
								id="title"
								name="title"
								value={formData.title}
								onChange={handleChange}
								placeholder="Введите название книги"
								required
								disabled={loading}
								maxLength={255}
							/>
						</div>

						<div className="form-group">
							<label htmlFor="description">Описание</label>
							<textarea
								id="description"
								name="description"
								value={formData.description}
								onChange={handleChange}
								placeholder="Введите описание книги"
								disabled={loading}
								rows={4}
								style={{
									resize: 'vertical',
									minHeight: '100px',
									width: '100%',
									padding: '0.5rem',
								}}
							/>
						</div>

						<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
							<div className="form-group">
								<label htmlFor="publication_year">
									Год издания <span style={{ color: 'red' }}>*</span>
								</label>
								<input
									type="number"
									id="publication_year"
									name="publication_year"
									value={formData.publication_year}
									onChange={handleChange}
									min="1000"
									max={new Date().getFullYear() + 1}
									required
									disabled={loading}
								/>
							</div>

							<div className="form-group">
								<label htmlFor="stock_quantity">Количество в наличии</label>
								<input
									type="number"
									id="stock_quantity"
									name="stock_quantity"
									value={formData.stock_quantity}
									onChange={handleChange}
									min="0"
									disabled={loading}
								/>
							</div>
						</div>

						<div className="form-group">
							<label htmlFor="price">
								Цена покупки <span style={{ color: 'red' }}>*</span>
							</label>
							<input
								type="number"
								id="price"
								name="price"
								value={formData.price}
								onChange={handleChange}
								required
								disabled={loading}
							/>
						</div>

						<h3>Цены аренды</h3>
						<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
							<div className="form-group">
								<label htmlFor="rental_price_2weeks">2 недели</label>
								<input
									type="number"
									id="rental_price_2weeks"
									name="rental_price_2weeks"
									value={formData.rental_price_2weeks}
									onChange={handleChange}
									min="0"
									step="0.01"
									disabled={loading}
								/>
							</div>

							<div className="form-group">
								<label htmlFor="rental_price_1month">1 месяц</label>
								<input
									type="number"
									id="rental_price_1month"
									name="rental_price_1month"
									value={formData.rental_price_1month}
									onChange={handleChange}
									min="0"
									step="0.01"
									disabled={loading}
								/>
							</div>

							<div className="form-group">
								<label htmlFor="rental_price_3months">3 месяца</label>
								<input
									type="number"
									id="rental_price_3months"
									name="rental_price_3months"
									value={formData.rental_price_3months}
									onChange={handleChange}
									min="0"
									step="0.01"
									disabled={loading}
								/>
							</div>
						</div>

						<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
							<div className="form-group">
								<label htmlFor="category">Категория</label>
								<input
									id="category"
									name="category"
									type="text"
									value={formData.category}
									onChange={handleChange}
									disabled={loading}
									placeholder="Введите название категории"
								/>
							</div>

							<div className="form-group">
								<label htmlFor="author">Автор</label>
								<input
									id="author"
									name="author"
									type="text"
									value={formData.author}
									onChange={handleChange}
									disabled={loading}
									placeholder="Введите имя автора"
								/>
							</div>
						</div>

						<div className="form-group">
							<label htmlFor="status">Статус</label>
							<select id="status" name="status" value={formData.status} onChange={handleChange} disabled={loading}>
								<option value="active">Активная</option>
								<option value="inactive">Неактивная</option>
								<option value="discontinued">Снята с продажи</option>
							</select>
						</div>

						<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
							<div className="form-group">
								<label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
									<input
										type="checkbox"
										name="available_for_purchase"
										checked={formData.available_for_purchase}
										onChange={handleChange}
										disabled={loading}
									/>
									Доступна для покупки
								</label>
							</div>

							<div className="form-group">
								<label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
									<input
										type="checkbox"
										name="available_for_rent"
										checked={formData.available_for_rent}
										onChange={handleChange}
										disabled={loading}
									/>
									Доступна для аренды
								</label>
							</div>
						</div>

						<StatusMessage type="error" message={error} />

						<div className="actions">
							<button type="button" onClick={handleCancel} className="btn" disabled={loading}>
								Отмена
							</button>

							{isEditing && (
								<button type="button" className="btn danger" disabled={loading} onClick={handleDelete}>
									Удалить
								</button>
							)}
							<button
								type="submit"
								className="btn primary"
								disabled={loading || !formData.title.trim() || !formData.price || !formData.publication_year}
							>
								{loading ? (isEditing ? 'Сохранение...' : 'Создание...') : isEditing ? 'Сохранить' : 'Создать'}
							</button>
						</div>
					</form>
				</div>
			</div>

			<style jsx>
				{`
					.actions {
						display: flex;
						gap: 1rem;
						justify-content: flex-end;
					}
				`}
			</style>
		</div>
	);
};
