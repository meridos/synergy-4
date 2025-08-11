import React, { useState, useEffect, useCallback } from 'react';
import { Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthHook';
import { Books } from '../components/Books';
import { bookService } from '../services/api';
import { BooksFilter } from '../components/BooksFilter';
import { StatusMessage } from '../components/StatusMessage';

export const BooksPage = () => {
	const { isAdmin } = useAuth();
	const location = useLocation();
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
				fetchBooks(),
			]);

			setAvailableCategories(categoriesResponse.data.categories || []);
			setAvailableAuthors(authorsResponse.data.authors || []);
		} catch (error) {
			setError('Ошибка загрузки книг');
			console.error('Error fetching categories and authors:', error);
		}
	}, []);

	useEffect(() => {
		fetchCategoriesAndAuthors();
	}, [fetchCategoriesAndAuthors]);

	useEffect(() => {
		setSelectedCategory(searchParams.get('category') || '');
		setSelectedAuthor(searchParams.get('author') || '');
	}, [searchParams]);

	if (isAdmin) {
		return <Navigate to="/admin/books" state={location.state} replace={true} />;
	}

	return (
		<div className="container">
			<div className="main-content">
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
					<h1>Библиотека книг</h1>
				</div>

				<StatusMessage className="error" message={error} />

				<div className="card" style={{ marginBottom: '2rem' }}>
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

				<Books books={books} />
			</div>
		</div>
	);
};
