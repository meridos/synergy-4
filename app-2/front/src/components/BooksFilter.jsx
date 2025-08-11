/* global alert */
import React from 'react';

export const BooksFilter = ({
	filterActions,
	selectedAuthor,
	selectedCategory,
	sortBy,
	availableCategories,
	availableAuthors,
	booksLength,
}) => {
	const { setSelectedCategory, setSelectedAuthor, setSortBy } = filterActions;

	const handleCategoryFilterChange = (e) => {
		setSelectedCategory(e.target.value);
	};

	const handleAuthorFilterChange = (e) => {
		setSelectedAuthor(e.target.value);
	};

	const handleSortChange = (e) => {
		setSortBy(e.target.value);
	};

	const clearFilters = () => {
		setSelectedCategory('');
		setSelectedAuthor('');
		setSortBy('title');
	};

	return (
		<div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
			<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
				<label htmlFor="categoryFilter">Категория:</label>
				<select id="categoryFilter" value={selectedCategory} onChange={handleCategoryFilterChange}>
					<option value="">Все категории</option>
					{availableCategories.map((category) => (
						<option key={category.id} value={category.id}>
							{category.name}
						</option>
					))}
				</select>
			</div>

			<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
				<label htmlFor="authorFilter">Автор:</label>
				<select id="authorFilter" value={selectedAuthor} onChange={handleAuthorFilterChange}>
					<option value="">Все авторы</option>
					{availableAuthors.map((author) => (
						<option key={author.id} value={author.id}>
							{author.name}
						</option>
					))}
				</select>
			</div>

			<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
				<label htmlFor="sortBy">Сортировать по:</label>
				<select id="sortBy" value={sortBy} onChange={handleSortChange}>
					<option value="title">Заголовок (А-Я)</option>
					<option value="title_desc">Заголовок (Я-А)</option>
					<option value="author">Автор (А-Я)</option>
					<option value="author_desc">Автор (Я-А)</option>
					<option value="year">Год (старые)</option>
					<option value="year_desc">Год (новые)</option>
					<option value="category">Категория (А-Я)</option>
					<option value="category_desc">Категория (Я-А)</option>
					<option value="price">Цена (дешевые)</option>
					<option value="price_desc">Цена (дорогие)</option>
				</select>
			</div>

			{(selectedCategory || selectedAuthor || sortBy !== 'title') && (
				<button onClick={clearFilters} className="btn secondary">
					Очистить фильтры
				</button>
			)}

			<div style={{ marginLeft: 'auto', color: '#666', fontSize: '0.9em' }}>{`Найдено: ${booksLength} книг(и)`}</div>
		</div>
	);
};
