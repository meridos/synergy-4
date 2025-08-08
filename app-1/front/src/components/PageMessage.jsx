import React from 'react';
import { useLocation } from 'react-router-dom';

export const PageMessage = () => {
	const location = useLocation();
	const message = location.state?.message;

	if (!message) {
		return null;
	}

	window.history.replaceState({}, document.title);

	return <div className="success mb-1">{message}</div>;
};
