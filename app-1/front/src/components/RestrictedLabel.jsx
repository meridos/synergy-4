import React from 'react';

export function RestrictedLabel(props) {
	return (
		<span
			{...props}
			style={{
				...(props.style || {}),
				backgroundColor: '#ffecb3',
				color: '#f57f17',
				padding: '0.125rem 0.25rem',
				borderRadius: '2px',
				fontSize: '0.9em',
			}}
		>
			🔒 Ограниченный
		</span>
	);
}
