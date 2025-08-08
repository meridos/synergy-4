import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthHook';
import { postService } from '../services/api';
import { RestrictedLabel } from '../components/RestrictedLabel';

export const CreatePost = () => {
	const navigate = useNavigate();
	const { id } = useParams();
	const { user, isAuthenticated } = useAuth();
	const [formData, setFormData] = useState({
		title: '',
		content: '',
		tags: [],
		restricted: false,
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [initialLoading, setInitialLoading] = useState(false);
	const [availableTags, setAvailableTags] = useState([]);
	const [newTag, setNewTag] = useState('');

	const isEditing = !!id;

	React.useEffect(() => {
		if (!isAuthenticated) {
			navigate('/login');
		}
	}, [isAuthenticated, navigate]);

	useEffect(() => {
		const loadTags = async () => {
			try {
				const response = await postService.getTags();

				setAvailableTags(response.data.tags || []);
			} catch (err) {
				console.error('Ошибка загрузки тегов:', err);
			}
		};

		loadTags();
	}, []);

	useEffect(() => {
		if (isEditing && isAuthenticated) {
			const loadPost = async () => {
				try {
					setInitialLoading(true);
					const response = await postService.getPost(id);
					const post = response.data;

					setFormData({
						title: post.title,
						content: post.content,
						tags: post.tags ? post.tags.map((tag) => tag.name) : [],
						restricted: post.restricted || false,
					});
				} catch (err) {
					setError(err.response?.data?.error || 'Ошибка загрузки поста');
					console.error('Error loading post:', err);
				} finally {
					setInitialLoading(false);
				}
			};

			loadPost();
		}
	}, [isEditing, id, isAuthenticated]);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;

		setFormData((prev) => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value,
		}));
	};

	const handleAddTag = (e) => {
		e.preventDefault();

		if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
			setFormData((prev) => ({
				...prev,
				tags: [...prev.tags, newTag.trim()],
			}));
			setNewTag('');
		}
	};

	const handleRemoveTag = (tagToRemove) => {
		setFormData((prev) => ({
			...prev,
			tags: prev.tags.filter((tag) => tag !== tagToRemove),
		}));
	};

	const handleSelectExistingTag = (tagName) => {
		if (!formData.tags.includes(tagName)) {
			setFormData((prev) => ({
				...prev,
				tags: [...prev.tags, tagName],
			}));
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!formData.title.trim() || !formData.content.trim()) {
			setError('Не заполнены обязательные поля');

			return;
		}

		setLoading(true);
		setError('');

		try {
			let response;

			if (isEditing) {
				response = await postService.updatePost(id, formData);
			} else {
				response = await postService.createPost(formData);
			}

			if (response.status === 200 || response.status === 201) {
				navigate('/posts', {
					state: { message: `Пост успешно ${isEditing ? 'обновлён' : 'создан'}!` },
				});
			}
		} catch (err) {
			setError(err.response?.data?.error || `Не удалось ${isEditing ? 'обновить' : 'создать'} пост. Попробуйте снова.`);
			console.error(`${isEditing ? 'Update' : 'Create'} post error:`, err);
		} finally {
			setLoading(false);
		}
	};

	const handleCancel = () => {
		navigate(-1);
	};

	const Tag = ({ tag, children, onClick }) => (
		<span
			onClick={onClick}
			disabled={loading}
			style={{
				display: 'inline-flex',
				backgroundColor: '#e3f2fd',
				color: '#1976d2',
				padding: '0.25rem 0.5rem',
				borderRadius: '4px',
				fontSize: '0.9em',
				alignItems: 'center',
				marginRight: '0.25rem',
				cursor: onClick ? 'pointer' : 'default',
			}}
		>
			{tag.name}
			{children}
		</span>
	);

	if (!isAuthenticated) {
		return null;
	}

	if (initialLoading) {
		return (
			<div className="container">
				<div className="main-content">
					<div style={{ textAlign: 'center', padding: '2rem' }}>
						<p>Загрузка поста...</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="container">
			<div className="main-content">
				<h1>{isEditing ? 'Редактировать пост' : 'Создать новый пост'}</h1>

				<div className="card">
					<form onSubmit={handleSubmit}>
						<div className="form-group">
							<label htmlFor="title">
								Заголовок <span style={{ color: 'red' }}>*</span>
							</label>
							<input
								type="text"
								id="title"
								name="title"
								value={formData.title}
								onChange={handleChange}
								placeholder="Введите заголовок поста"
								required
								disabled={loading}
								maxLength={255}
							/>
						</div>

						<div className="form-group">
							<label htmlFor="content">
								Содержание <span style={{ color: 'red' }}>*</span>
							</label>
							<textarea
								id="content"
								name="content"
								value={formData.content}
								onChange={handleChange}
								placeholder="Напишите содержание поста здесь..."
								required
								disabled={loading}
								rows={10}
								style={{
									resize: 'vertical',
									minHeight: '200px',
									width: '100%',
									padding: '0.5rem',
								}}
							/>
						</div>

						<div className="form-group">
							<label>Теги</label>

							{formData.tags.length > 0 && (
								<div style={{ marginBottom: '1rem' }}>
									{formData.tags.map((tag, index) => (
										<Tag key={index} tag={{ name: tag }} onClick={() => handleRemoveTag(tag)}>
											<span
												style={{
													background: 'none',
													border: 'none',
													color: '#1976d2',
													cursor: 'pointer',
													padding: '0',
													fontSize: '1.2em',
													lineHeight: '1',
												}}
											>
												<span style={{ marginLeft: '0.25rem' }}>&times;</span>
											</span>
										</Tag>
									))}
								</div>
							)}

							<div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
								<input
									type="text"
									value={newTag}
									onChange={(e) => setNewTag(e.target.value)}
									placeholder="Добавить новый тег"
									disabled={loading}
									onKeyPress={(e) => {
										if (e.key === 'Enter') {
											handleAddTag(e);
										}
									}}
									style={{ flex: 1 }}
								/>
								<button type="button" onClick={handleAddTag} disabled={loading || !newTag.trim()} className="btn">
									Добавить
								</button>
							</div>

							{availableTags.length > 0 && (
								<div>
									<small style={{ color: '#666', marginBottom: '0.5rem', display: 'block' }}>
										Нажмите, чтобы добавить существующие теги:
									</small>
									<div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
										{availableTags
											.filter((tag) => !formData.tags.includes(tag.name))
											.map((tag) => (
												<Tag key={tag.id} tag={tag} onClick={() => handleSelectExistingTag(tag.name)} />
											))}
									</div>
								</div>
							)}
						</div>

						<div className="form-group">
							<label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
								<input
									type="checkbox"
									name="restricted"
									checked={formData.restricted}
									onChange={handleChange}
									disabled={loading}
									style={{ width: '20px', height: '20px', marginRight: '0.5rem' }}
								/>
								Сделать пост скрытым
							</label>
							<small style={{ color: '#666', marginTop: '0.25rem', display: 'block' }}>
								Скрытые посты видны только вам и пользователям с ссылкой для доступа
							</small>
						</div>

						{error && (
							<div className="error" style={{ marginBottom: '1rem' }}>
								{error}
							</div>
						)}

						<div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
							<button type="button" onClick={handleCancel} className="btn" disabled={loading}>
								Отмена
							</button>

							<button
								type="submit"
								className="btn primary"
								disabled={loading || !formData.title.trim() || !formData.content.trim()}
							>
								{loading ? (isEditing ? 'Изменение...' : 'Создание...') : isEditing ? 'Изменить' : 'Создать'}
							</button>
						</div>
					</form>
				</div>

				<div className="card">
					<h3>Предпросмотр</h3>
					<div
						style={{
							border: '1px solid #ddd',
							padding: '1rem',
							borderRadius: '4px',
							backgroundColor: '#f9f9f9',
						}}
					>
						<h4 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>{formData.title || 'Заголовок поста'}</h4>
						<p
							style={{
								margin: '0',
								whiteSpace: 'pre-wrap',
								color: '#666',
							}}
						>
							{formData.content || 'Содержание поста'}
						</p>
						<div
							style={{
								marginTop: '0.5rem',
								fontSize: '0.8em',
								color: '#999',
							}}
						>
							<p>Автор: {user?.name}</p>
							{formData.restricted && <RestrictedLabel />}
							{formData.tags.length > 0 && (
								<div style={{ marginTop: '0.25rem' }}>
									Теги:{' '}
									{formData.tags.map((tag, index) => (
										<Tag key={index} tag={{ name: tag }} />
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
