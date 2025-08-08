import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthHook';
import { postService } from '../services/api';
import { DateTime } from '../components/DateTime';
import { RestrictedLabel } from '../components/RestrictedLabel';
import { CommentsSection } from '../components/CommentsSection';

export const PostDetail = () => {
	const routeParams = useParams();
	const navigate = useNavigate();
	const { user, isAuthenticated } = useAuth();
	const [post, setPost] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [isDeleting, setIsDeleting] = useState(false);
	const [copySuccess, setCopySuccess] = useState(false);

	const fetchPost = useCallback(async () => {
		try {
			setLoading(true);
			setError('');

			const response = routeParams.token
				? await postService.getPostByShareToken(routeParams.token)
				: await postService.getPost(routeParams.id);

			setPost(response.data);
		} catch (err) {
			console.error('Error fetching post:', err);

			if (err.response?.status === 404) {
				setError('Пост не найден');
			} else {
				setError('Не удалось загрузить пост');
			}
		} finally {
			setLoading(false);
		}
	}, [routeParams]);
	const handleEdit = () => {
		navigate(`/edit-post/${post.id}`);
	};
	const handleDelete = async () => {
		if (!window.confirm('Вы уверены, что хотите удалить этот пост?')) {
			return;
		}

		try {
			setIsDeleting(true);
			await postService.deletePost(post.id);
			navigate('/posts', {
				state: { message: 'Пост успешно удалён!' },
			});
		} catch (err) {
			console.error('Error deleting post:', err);
			setError(err.response?.data?.error || 'Не удалось удалить пост');
		} finally {
			setIsDeleting(false);
		}
	};
	const handleShare = async () => {
		try {
			let token = post.share_token;

			if (!token) {
				const response = await postService.updatePost(post.id, {
					...post,
					restricted: true,
				});

				token = response.data.post.share_token;
				setPost(response.data.post);
			}

			if (token) {
				const shareUrl = `${window.location.origin}/share/${token}`;

				await navigator.clipboard.writeText(shareUrl);
				setCopySuccess(true);

				setTimeout(() => setCopySuccess(false), 3000);
			}
		} catch (err) {
			console.error('Error generating share link:', err);
			setError('Не удалось сгенерировать ссылку');
		}
	};

	useEffect(() => {
		fetchPost();
	}, [routeParams, fetchPost]);

	if (loading) {
		return (
			<div className="container">
				<div className="main-content">
					<div className="text-center">
						<p>Загрузка поста...</p>
					</div>
				</div>
			</div>
		);
	}

	if (error || !post) {
		return (
			<div className="container">
				<div className="main-content">
					<div className="card">
						<h1>Пост не найден</h1>
					</div>
				</div>
			</div>
		);
	}

	const isOwner = isAuthenticated && user && user.id === post.user_id;

	return (
		<div className="container">
			<div className="main-content">
				<article className="card">
					<header className="mb-2">
						<h1>
							{post.title}
							{post.restricted && <RestrictedLabel />}
						</h1>

						<div className="flex text-gray text-small gap-small flex-center">
							<div>
								<span>
									Опубликовано <DateTime date={post.created_at} />
								</span>
								{post.updated_at && post.updated_at !== post.created_at && (
									<span>
										(Обновлено <DateTime date={post.updated_at} />)
									</span>
								)}
							</div>

							{isOwner && (
								<div className="flex gap-small">
									{post.restricted && (
										<button onClick={handleShare} className="btn">
											{copySuccess ? 'Link Copied!' : 'Share'}
										</button>
									)}
									<button onClick={handleEdit} className="btn">
										Редактировать
									</button>
									<button onClick={handleDelete} disabled={isDeleting} className="btn danger">
										{isDeleting ? 'Удаление...' : 'Удалить'}
									</button>
								</div>
							)}
						</div>
					</header>

					<div className="mb-2">
						<div className="pre-wrap">{post.content}</div>
					</div>

					{post.tags && post.tags.length > 0 && (
						<div className="mb-2">
							<h3>Теги:</h3>
							<div className="flex flex-wrap gap-small">
								{post.tags.map((tag, index) => (
									<Link
										key={index}
										to={`/posts?tag=${encodeURIComponent(tag.name)}`}
										style={{
											backgroundColor: '#e3f2fd',
											color: '#1976d2',
											padding: '0.25rem 0.5rem',
											borderRadius: '4px',
											fontSize: '0.9em',
											textDecoration: 'none',
										}}
									>
										{tag.name}
									</Link>
								))}
							</div>
						</div>
					)}

					{post.user && (
						<footer>
							<div>
								<span className="text-gray text-small">
									Опубликовал <Link to={`/user/${post.user_id}`}>{post.user.name}</Link>
								</span>
							</div>
						</footer>
					)}
				</article>

				<div className="card">
					<CommentsSection postId={post.id} />
				</div>
			</div>
		</div>
	);
};
