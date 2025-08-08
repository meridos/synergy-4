import React, { useState, useEffect, useCallback } from 'react';
import { commentService } from '../services/api';
import { CommentForm } from './CommentForm';
import { CommentList } from './CommentList';
import { useAuth } from '../context/AuthHook';

export const CommentsSection = ({ postId }) => {
	const { isAuthenticated } = useAuth();
	const [comments, setComments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState('');

	const fetchComments = useCallback(async () => {
		try {
			setLoading(true);
			setError('');
			const response = await commentService.getPostComments(postId);

			setComments(response.data.comments || []);
		} catch (err) {
			console.error('Error fetching comments:', err);
			setError(err.response?.data?.error || 'Не удалось загрузить комментарии');
		} finally {
			setLoading(false);
		}
	}, [postId]);

	const handleSubmitComment = async (content) => {
		try {
			setSubmitting(true);
			setError('');

			const response = await commentService.createPostComment(postId, { content });

			setComments((prev) => [...prev, response.data.comment]);
		} catch (err) {
			console.error('Error creating comment:', err);
			setError(err.response?.data?.error || 'Не удалось создать комментарий');
		} finally {
			setSubmitting(false);
		}
	};

	useEffect(() => {
		if (postId) {
			fetchComments();
		}
	}, [postId, fetchComments]);

	return (
		<>
			<h3>Комментарии</h3>

			{isAuthenticated && (
				<div className="mb-2">
					<CommentForm onSubmit={handleSubmitComment} loading={submitting} />
				</div>
			)}

			<CommentList comments={comments} loading={loading} error={error} />
		</>
	);
};
