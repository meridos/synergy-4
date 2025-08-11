import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { bookService } from '../../services/api';
import { BooksFilter } from '../../components/BooksFilter';
import { PageMessage } from '../../components/PageMessage';
import { DateTime } from '../../components/DateTime';
import { StatusMessage } from '../../components/StatusMessage';

export const AdminBooks = () => {
	const [searchParams] = useSearchParams();
	const [books, setBooks] = useState([]);
	const [availableCategories, setAvailableCategories] = useState([]);
	const [availableAuthors, setAvailableAuthors] = useState([]);
	const [error, setError] = useState('');
	const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
	const [selectedAuthor, setSelectedAuthor] = useState(searchParams.get('author') || '');
	const [sortBy, setSortBy] = useState('title');

	const fetchBooks = useCallback(async () => {
		try {
			const params = {};

			if (selectedCategory) {
				params.category_id = selectedCategory;
			}

			if (selectedAuthor) {
				params.author_id = selectedAuthor;
			}

			if (sortBy) {
				params.sort_by = sortBy;
			}

			const response = await bookService.getBooks(params);

			setBooks(response.data.books || []);
		} catch (error) {
			console.error('Error fetching books:', error);
			setError('Ошибка загрузки книг');
		}
	}, [selectedCategory, selectedAuthor, sortBy]);

	const fetchCategoriesAndAuthors = useCallback(async () => {
		try {
			const [categoriesResponse, authorsResponse] = await Promise.all([
				bookService.getCategories(),
				bookService.getAuthors(),
			]);

			setAvailableCategories(categoriesResponse.data.categories || []);
			setAvailableAuthors(authorsResponse.data.authors || []);
		} catch (error) {
			console.error('Error fetching categories and authors:', error);
		}
	}, []);

	useEffect(() => {
		fetchCategoriesAndAuthors();
	}, [fetchCategoriesAndAuthors]);

	useEffect(() => {
		fetchBooks();
	}, [fetchBooks]);

	useEffect(() => {
		setSelectedCategory(searchParams.get('category') || '');
		setSelectedAuthor(searchParams.get('author') || '');
	}, [searchParams]);

	const Status = ({ book }) => {
		switch (book.status) {
			case 'active':
				return 'Активная';
			case 'inactive':
				return 'Неактивная';
			case 'discontinued':
				return 'Снята с продажи';
			default:
				return '-';
		}
	};

	const Available = ({ book }) => {
		return (
			[book.available_for_rent && 'Аренда', book.available_for_purchase && 'Покупка'].filter(Boolean).join(', ') || '-'
		);
	};

	return (
		<>
			<PageMessage />
			<StatusMessage type="error" message={error} />
			<div className="mb-1">
				<BooksFilter
					filterActions={{ setSelectedCategory, setSelectedAuthor, setSortBy }}
					selectedCategory={selectedCategory}
					selectedAuthor={selectedAuthor}
					sortBy={sortBy}
					availableCategories={availableCategories}
					availableAuthors={availableAuthors}
					booksLength={books.length}
				/>
			</div>
			<table className="table">
				<thead>
					<tr>
						<th>Название</th>
						<th>Статус</th>
						<th>Автор</th>
						<th>Год пуб.</th>
						<th>Цена</th>
						<th>Аренда</th>
						<th>Шт.</th>
						<th>Доступно</th>
						<th>Создана</th>
						<th>Обновлена</th>
					</tr>
				</thead>
				<tbody>
					{books.map((book) => (
						<tr key={book.id}>
							<td>
								<Link to={`/books/edit/${book.id}`}>{book.title}</Link>
							</td>
							<td>
								<Status book={book} />
							</td>
							<td>{book.author}</td>
							<td>{book.publication_year}</td>
							<td>{book.price}</td>
							<td>
								{book.rental_price_2weeks}/{book.rental_price_1month}/{book.rental_price_3months}
							</td>
							<td>{book.stock_quantity}</td>
							<td>
								<Available book={book} />
							</td>
							<td>
								<DateTime date={book.created_at} />
							</td>
							<td>
								<DateTime date={book.updated_at} />
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</>
	);
};
