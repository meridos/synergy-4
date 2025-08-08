import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthHook';
import { postService } from '../services/api';
import { PageMessage } from '../components/PageMessage';
import { Posts } from '../components/Posts';

export const PostsPage = ({ isSubscriptions }) => {
	const { isAuthenticated } = useAuth();
	const [searchParams] = useSearchParams();
	const [posts, setPosts] = useState([]);
	const [availableTags, setAvailableTags] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || '');
	const [sortBy, setSortBy] = useState('newest');
	const [pageTitle, setPageTitle] = useState('');

	const fetchPosts = useCallback(async () => {
		const { data } = await postService.getPosts({
			tag: selectedTag || null,
			sortBy: sortBy,
			isSubscriptions: !!isSubscriptions,
		});

		setPosts(data);
	}, [selectedTag, sortBy, isSubscriptions]);
	const fetchPostsMemo = useMemo(fetchPosts, [fetchPosts]);
	const fetchData = useCallback(async () => {
		try {
			setLoading(true);
			const [tagsResponse] = await Promise.all([postService.getTags(), fetchPostsMemo]);

			setAvailableTags(tagsResponse.data.tags || []);
		} catch (err) {
			setError('Не удалось загрузить данные. Попробуйте позже.');
			console.error('API Error:', err);
		} finally {
			setLoading(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	const fetchDataMemo = useMemo(fetchData, [fetchData]);
	const handleTagFilterChange = (e) => {
		setSelectedTag(e.target.value);
	};
	const handleSortChange = (e) => {
		setSortBy(e.target.value);
	};
	const clearFilters = () => {
		setSelectedTag('');
		setSortBy('newest');
	};

	useEffect(() => {
		setPageTitle(isSubscriptions ? 'Подписки' : 'Посты');
	}, [isSubscriptions]);

	useEffect(() => {
		setSelectedTag(searchParams.get('tag') || '');
	}, [searchParams]);

	if (loading) {
		return (
			<div className="container">
				<div className="main-content">
					<div className="loading">Загрузка постов...</div>
				</div>
			</div>
		);
	}

	return (
		<div className="container">
			<div className="main-content">
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
					<h1>{pageTitle}</h1>
				</div>

				<PageMessage />

				<div className="card" style={{ marginBottom: '2rem' }}>
					<div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
						<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
							<label htmlFor="tagFilter" style={{ fontWeight: 'bold', minWidth: 'fit-content' }}>
								Фильтр по тегу:
							</label>
							<select
								id="tagFilter"
								value={selectedTag}
								onChange={handleTagFilterChange}
								style={{
									padding: '0.5rem',
									borderRadius: '4px',
									border: '1px solid #ddd',
									minWidth: '150px',
								}}
							>
								<option value="">Все теги</option>
								{availableTags.map((tag) => (
									<option key={tag.id} value={tag.id}>
										{tag.name} ({tag.post_count || 0})
									</option>
								))}
							</select>
						</div>

						<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
							<label htmlFor="sortBy" style={{ fontWeight: 'bold', minWidth: 'fit-content' }}>
								Сортировать по:
							</label>
							<select
								id="sortBy"
								value={sortBy}
								onChange={handleSortChange}
								style={{
									padding: '0.5rem',
									borderRadius: '4px',
									border: '1px solid #ddd',
									minWidth: '120px',
								}}
							>
								<option value="newest">Сначала новые</option>
								<option value="oldest">Сначала старые</option>
								<option value="title">Заголовок (А-Я)</option>
							</select>
						</div>

						{(selectedTag || sortBy !== 'newest') && (
							<button
								onClick={clearFilters}
								style={{
									padding: '0.5rem 1rem',
									backgroundColor: '#6c757d',
									color: 'white',
									border: 'none',
									borderRadius: '4px',
									cursor: 'pointer',
								}}
							>
								Очистить фильтры
							</button>
						)}

						<div style={{ marginLeft: 'auto', color: '#666', fontSize: '0.9em' }}>{`Кол-во: ${posts.length} шт`}</div>
					</div>
				</div>

				{error && (
					<div className="error" style={{ marginBottom: '2rem' }}>
						{error}
					</div>
				)}

				<Posts posts={posts} selectedTag={selectedTag} setSelectedTag={setSelectedTag} />
			</div>
		</div>
	);
};
