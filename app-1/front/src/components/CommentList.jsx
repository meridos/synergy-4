import React from 'react';
import { DateTime } from './DateTime';
import { Link } from 'react-router-dom';

export const CommentList = ({ comments, loading, error }) => {
	if (loading) {
		return (
			<div className="card">
				<p>Загрузка комментариев...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="card">
				<p style={{ color: '#d73242ff' }}>Ошибка загрузки комментариев: {error}</p>
			</div>
		);
	}

	if (!comments || comments.length === 0) {
		return (
			<div className="card">
				<p>Комментариев пока нет</p>
			</div>
		);
	}

	return comments.map((comment) => (
		<div key={comment.id}>
			<div>
				<div>
					<Link to={`/user/${comment.user?.id}`}>
						<strong>{comment.user?.name || 'НЛО'}</strong>
					</Link>
					<span className="ml-1 text-gray text-small">
						<DateTime date={comment.created_at} />
					</span>
				</div>
				<p className="pre-wrap">{comment.content}</p>
			</div>
		</div>
	));
};
