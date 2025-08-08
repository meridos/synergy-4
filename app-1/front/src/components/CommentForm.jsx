import React, { useState } from 'react';
import { useAuth } from '../context/AuthHook';

export const CommentForm = ({ onSubmit, loading }) => {
	const { isAuthenticated } = useAuth();
	const [content, setContent] = useState('');

	const handleSubmit = (e) => {
		e.preventDefault();

		if (!content.trim()) return;

		onSubmit(content);
		setContent('');
	};

	if (!isAuthenticated) {
		return null;
	}

	return (
		<form onSubmit={handleSubmit}>
			<div>
				<textarea
					value={content}
					onChange={(e) => setContent(e.target.value)}
					placeholder="Напишите комментарий..."
					rows={3}
					name="comment"
					style={{
						width: '100%',
						padding: '1rem',
						border: '1px solid #ddd',
						resize: 'vertical',
					}}
					required
				/>
			</div>
			<div>
				<button type="submit" disabled={loading || !content.trim()} className="btn primary">
					{loading ? 'Отправка...' : 'Отправить'}
				</button>
			</div>
		</form>
	);
};
