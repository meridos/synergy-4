import React, { useState, useEffect } from 'react';

export const TravelsFilter = ({
	selectedLocation,
	setSelectedLocation,
	sortBy,
	setSortBy,
	sortDirection,
	setSortDirection,
}) => {
	const [localLocation, setLocalLocation] = useState(selectedLocation);

	useEffect(() => {
		const timer = setTimeout(() => {
			setSelectedLocation(localLocation);
		}, 300);

		return () => clearTimeout(timer);
	}, [localLocation, setSelectedLocation]);

	useEffect(() => {
		setLocalLocation(selectedLocation);
	}, [selectedLocation]);

	return (
		<div className="travels-filter">
			<div className="filter-group">
				<input
					type="text"
					name="location"
					placeholder="Поиск по местоположению"
					value={localLocation}
					onChange={(e) => setLocalLocation(e.target.value)}
				/>
			</div>

			<div className="filter-group">
				<select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
					<option value="title">По названию</option>
					<option value="location">По местоположению</option>
					<option value="cost">По стоимости</option>
					<option value="start_date">По дате начала</option>
					<option value="created_at">По дате создания</option>
				</select>
			</div>

			<div className="filter-group">
				<label>
					<input
						type="checkbox"
						checked={sortDirection === 'desc'}
						onChange={(e) => setSortDirection(e.target.checked ? 'desc' : 'asc')}
					/>
					По убыванию
				</label>
			</div>
		</div>
	);
};
