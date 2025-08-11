import React, { useState, useEffect, useCallback } from 'react';
import { Travels } from '../components/Travels';
import { travelService } from '../services/api';
import { TravelsFilter } from '../components/TravelsFilter';
import { StatusMessage } from '../components/StatusMessage';
import { PageMessage } from '../components/PageMessage';

export const MyTravels = () => {
	const [travels, setTravels] = useState([]);
	const [error, setError] = useState('');
	const [selectedLocation, setSelectedLocation] = useState('');
	const [sortBy, setSortBy] = useState('created_at');
	const [sortDirection, setSortDirection] = useState('desc');

	const fetchTravels = useCallback(async () => {
		try {
			const params = {};

			if (selectedLocation) {
				params.location = selectedLocation;
			}

			if (sortBy) {
				params.sort_by = sortBy;
			}

			if (sortDirection) {
				params.sort_direction = sortDirection;
			}

			const response = await travelService.getMyTravels(params);

			setTravels(response.data.travels || []);
		} catch (error) {
			setError('Ошибка загрузки путешествий');
		}
	}, [selectedLocation, sortBy, sortDirection]);

	useEffect(() => {
		fetchTravels();
	}, [fetchTravels]);

	return (
		<div className="container">
			<div className="main-content">
				<h1>Мои путешествия</h1>

				<PageMessage />

				{error && <StatusMessage type="error">{error}</StatusMessage>}

				<TravelsFilter
					selectedLocation={selectedLocation}
					setSelectedLocation={setSelectedLocation}
					sortBy={sortBy}
					setSortBy={setSortBy}
					sortDirection={sortDirection}
					setSortDirection={setSortDirection}
				/>

				<Travels travels={travels} isMyTravels={true} onTravelUpdate={fetchTravels} />
			</div>
		</div>
	);
};
