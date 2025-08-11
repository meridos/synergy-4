import React from 'react';

export const StatusMessage = ({ message, type }) => {
	const className = type === 'error' ? 'error' : 'success';
	const text = message;

	if (!text) {
		return null;
	}

	return <div className={`${className} mb-1`}>{text}</div>;
};
