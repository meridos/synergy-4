import React from 'react';
import { Link } from 'react-router-dom';
import { RestrictedLabel } from './RestrictedLabel';
import { DateTime } from './DateTime';

const MAX_POST_LENGTH = 100;

export function Posts({ posts, selectedTag, setSelectedTag }) {
	return posts.length === 0 ? (
		<div className="card">
			<p>Постов пока нет.</p>
		</div>
	) : (
		<div className="posts-grid">
			{posts.map((post) => (
				<article key={post.id} className="card">
					<header>
						<Link
							to={`/post/${post.id}`}
							style={{
								textDecoration: 'none',
								color: 'inherit',
							}}
						>
							<h3
								style={{
									margin: '0 0 0.5rem 0',
									color: '#333',
									cursor: 'pointer',
								}}
								onMouseOver={(e) => (e.target.style.color = '#007bff')}
								onMouseOut={(e) => (e.target.style.color = '#333')}
							>
								{post.title}
							</h3>
						</Link>

						{post.user && (
							<div>
								Автор: <Link to={`/user/${post.user_id}`}>{post.user.name}</Link>
							</div>
						)}
						<div
							style={{
								fontSize: '0.9em',
								color: '#666',
								marginBottom: '1rem',
							}}
						>
							{post.restricted && (
								<span className="mr-1">
									{' '}
									<RestrictedLabel />
								</span>
							)}
							<span>
								Опубликовано <DateTime date={post.created_at} />
							</span>
						</div>
					</header>

					<div
						style={{
							marginBottom: '1rem',
							lineHeight: '1.6',
						}}
					>
						{post.content.length > MAX_POST_LENGTH ? `${post.content.substring(0, MAX_POST_LENGTH)}...` : post.content}
					</div>

					{post.tags && post.tags.length > 0 && (
						<div style={{ marginBottom: '1rem' }}>
							{post.tags.map((tag, index) => (
								<span
									key={index}
									onClick={() => setSelectedTag?.(tag.id)}
									style={{
										backgroundColor: selectedTag === tag.name ? '#1976d2' : '#e3f2fd',
										color: selectedTag === tag.name ? 'white' : '#1976d2',
										padding: '0.25rem 0.5rem',
										borderRadius: '3px',
										fontSize: '0.8em',
										marginRight: '0.5rem',
										marginBottom: '0.25rem',
										display: 'inline-block',
										cursor: setSelectedTag ? 'pointer' : 'default',
										border: selectedTag === tag.name ? '1px solid #1976d2' : '1px solid transparent',
									}}
								>
									{tag.name}
								</span>
							))}
						</div>
					)}
				</article>
			))}

			<style jsx>{`
				.posts-grid {
					display: grid;
					gap: 1.5rem;
					grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
				}

				@media (max-width: 768px) {
					.posts-grid {
						grid-template-columns: 1fr;
					}
				}

				.loading {
					text-align: center;
					padding: 2rem;
					font-size: 1.1em;
					color: #666;
				}
			`}</style>
		</div>
	);
}
