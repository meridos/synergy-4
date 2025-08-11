import React from 'react';
import { useLocation } from 'react-router-dom';

export const PageMessage = ({ className }) => {
	className = className || 'success';

	const location = useLocation();
	const text = location.state?.message;

	if (!text) {
		return null;
	}

	window.history.replaceState({}, document.title);

	return <div className={`${className} mb-1`}>{text}</div>;
};
