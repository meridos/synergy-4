import React, { useCallback, useEffect, useState } from 'react';

export function Stars({ rating = null, isEditable = false, labels = [], onChange }) {
	const emptyText = 'Не указано';
	const starIcon = '★';

	const [hoveredIndex, setHoveredIndex] = useState(null);
	const [selectedIndex, setSelectedIndex] = useState(rating ?? null);
	const [selectedLabel, setSelectedLabel] = useState('');
	const starsCount = 5;

	const onClickHandler = useCallback(
		(idx) => {
			if (!isEditable) return;

			if (idx === rating - 1) {
				onChange('');
			} else {
				onChange(idx + 1);
			}
		},
		[isEditable, onChange, rating],
	);

	useEffect(() => {
		setSelectedIndex(rating - 1);
	}, [rating]);

	useEffect(() => {
		const selected = labels[hoveredIndex ?? selectedIndex] || emptyText;

		setSelectedLabel(selected);
	}, [labels, hoveredIndex, selectedIndex, isEditable]);

	return (
		<div className={`stars-container ${isEditable ? 'editable' : ''}`}>
			<div className="stars">
				{[...Array(starsCount)].map((_, idx) => (
					<span
						key={idx}
						className={`star${(hoveredIndex === null ? (selectedIndex ?? -1) >= idx : hoveredIndex >= idx) ? ' filled' : ''}`}
						onMouseEnter={() => setHoveredIndex(idx)}
						onMouseLeave={() => setHoveredIndex(null)}
						onClick={() => onClickHandler(idx)}
					>
						{starIcon}
					</span>
				))}
			</div>
			{labels.length === 5 && <div className="label">{selectedLabel}</div>}
			<style jsx="">{`
				.stars-container {
					position: relative;
					display: flex;
					flex-direction: column;
				}
				.stars-container:not(.editable) {
					display: inline-flex;
					width: max-content;
				}
				.star {
					font-size: 2rem;
					color: #ccc;
					transition: color 0.2s;
					padding: 0.25rem;
					cursor: ew-resize;
				}
				.star.filled {
					color: #007bff;
				}
				.editable .star {
					cursor: pointer;
				}
				.label {
					color: #888;
					margin-top: -0.25rem;
				}
				.stars-container:not(.editable):not(:hover) .label {
					display: none;
				}
				.stars-container:not(.editable) .star {
					font-size: 1rem;
				}
				.stars-container:not(.editable) .label {
					position: absolute;
					white-space: nowrap;
					font-size: 0.8rem;
					line-height: 14px;
					color: #000;
					background-color: #fff;
					border-radius: 4px;
					padding: 2px 5px;
					pointer-events: none;
					width: max-content;
					left: 0.25rem;
					bottom: -0.8rem;
				}
			`}</style>
		</div>
	);
}
