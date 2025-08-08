import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthHook';
import api, { userService } from '../services/api';
import { DateTime } from '../components/DateTime';
import { Posts } from '../components/Posts';

export const UserProfile = () => {
	const { id } = useParams();
	const { user: currentUser } = useAuth();
	const [user, setUser] = useState(null);
	const [posts, setPosts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [subscriptionError, setSubscriptionError] = useState('');
	const [isSubscribed, setIsSubscribed] = useState(false);
	const [subscriberCount, setSubscriberCount] = useState(0);
	const [subscriptionCount, setSubscriptionCount] = useState(0);
	const [subscribing, setSubscribing] = useState(false);

	useEffect(() => {
		const fetchUserProfile = async () => {
			try {
				setLoading(true);
				setError('');

				const response = await api.get(`/users/${id}`);

				setUser(response.data.user);
				setPosts(response.data.posts);
				setIsSubscribed(response.data.is_subscribed || false);
				setSubscriberCount(response.data.subscriber_count || 0);
				setSubscriptionCount(response.data.subscription_count || 0);
			} catch (err) {
				setError(err.response?.data?.error || 'Failed to load user profile');
				console.error('Error fetching user profile:', err);
			} finally {
				setLoading(false);
			}
		};

		if (id) {
			fetchUserProfile();
		}
	}, [id]);

	const handleSubscriptionToggle = async () => {
		try {
			setSubscribing(true);
			setSubscriptionError('');

			if (isSubscribed) {
				await userService.unsubscribe(id);
				setIsSubscribed(false);
				setSubscriberCount((prev) => prev - 1);
			} else {
				await userService.subscribe(id);
				setIsSubscribed(true);
				setSubscriberCount((prev) => prev + 1);
			}
		} catch (err) {
			console.error('Error toggling subscription:', err);
			setSubscriptionError(err.response?.data?.error || 'Ошибка при изменении подписки');

			try {
				const response = await api.get(`/users/${id}`);

				setIsSubscribed(response.data.is_subscribed || false);
				setSubscriberCount(response.data.subscriber_count || 0);
			} catch (refetchErr) {
				console.error('Error refetching user data:', refetchErr);
			}
		} finally {
			setSubscribing(false);
		}
	};

	if (loading) {
		return (
			<div className="container">
				<div className="main-content">
					<div className="text-center">
						<p>Loading user profile...</p>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container">
				<div className="main-content">
					<h2>Ошибка</h2>
					<p>{error}</p>
				</div>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="container">
				<div className="main-content">
					<div className="text-center">
						<p>Пользователь не найден</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="container">
			<div className="main-content">
				<div className="user-profile-header">
					<div className="user-avatar avatar-circle">{user.name.charAt(0).toUpperCase()}</div>

					<div className="user-details">
						<h1>{user.name}</h1>
						<p className="user-email">{user.email}</p>
					</div>
					<div className="user-stats">
						<span className="stat-item">
							<strong>{posts.length}</strong> Постов
						</span>
						<span className="stat-item">
							<strong>{subscriberCount}</strong> Подписчиков
						</span>
						<span className="stat-item">
							<strong>{subscriptionCount}</strong> Подписок
						</span>
						<span className="stat-item">
							<strong>Присоединился:</strong> <DateTime date={user.created_at} time={false} />
						</span>
					</div>
					{currentUser && currentUser.id !== parseInt(id) && (
						<div className="subscription-actions">
							{subscriptionError && <div className="error">{subscriptionError}</div>}
							<button
								className={`btn ${isSubscribed ? 'danger' : 'primary'}`}
								onClick={handleSubscriptionToggle}
								disabled={subscribing}
							>
								{subscribing ? 'Обработка...' : isSubscribed ? 'Отписаться' : 'Подписаться'}
							</button>
						</div>
					)}
				</div>

				<h2 className="card">Посты от {user.name}</h2>

				<Posts posts={posts} />
			</div>

			<style jsx>{`
				.user-profile-header {
					display: grid;
					grid-template-columns: 50px 1fr auto;
					grid-template-rows: auto auto;
					gap: 1rem 2rem;
					margin-bottom: 3rem;
					padding: 2rem;
					background: #fff;
					border-radius: 8px;
					box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
				}
				.user-avatar {
					grid-row: 1;
					grid-column: 1;
					align-self: center;
				}
				.user-details {
					grid-row: 1;
					grid-column: 2;
					display: flex;
					flex-direction: column;
					gap: 0.5rem;
				}
				.user-details h1 {
					margin: 0;
					color: #333;
					font-size: 1.5rem;
				}
				.user-email {
					color: #666;
					margin: 0;
					font-size: 1.1rem;
				}
				.user-stats {
					grid-row: 2;
					grid-column: 1/4;
					display: flex;
					gap: 2rem;
					flex-wrap: wrap;
				}
				.stat-item {
					color: #555;
					font-size: 0.95rem;
				}
				.subscription-actions {
					grid-row: 1;
					grid-column: 3;
					align-self: center;
				}
				@media (max-width: 768px) {
					.user-profile-header {
						grid-template-columns: 1fr;
						grid-template-rows: 50px auto auto;
						text-align: center;
						gap: 1rem;
					}
					.user-avatar {
						grid-row: 1;
						grid-column: 1;
						justify-self: center;
					}
					.user-details {
						grid-row: 2;
						grid-column: 1;
						align-items: center;
					}
					.subscription-actions {
						grid-row: 4;
						grid-column: 1;
					}
					.user-stats {
						grid-row: 3;
						grid-column: 1;
						justify-content: center;
						margin-top: 1rem;
					}
				}
			`}</style>
		</div>
	);
};
