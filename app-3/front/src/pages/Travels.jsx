import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthHook';
import { Travels } from '../components/Travels';
import { travelService } from '../services/api';
import { TravelsFilter } from '../components/TravelsFilter';
import { StatusMessage } from '../components/StatusMessage';
import { PageMessage } from '../components/PageMessage';

export const TravelsPage = () => {
	const { isAuthenticated } = useAuth();
	const [searchParams] = useSearchParams();
	const [travels, setTravels] = useState([]);
	const [error, setError] = useState('');
	const [selectedLocation, setSelectedLocation] = useState(searchParams.get('location') || '');
	const [sortBy, setSortBy] = useState('title');
	const [sortDirection, setSortDirection] = useState('asc');

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

			const response = await travelService.getTravels(params);

			setTravels(response.data.travels || []);
		} catch (error) {
			console.error('Error fetching travels:', error);
			setError('Ошибка загрузки путешествий');
		}
	}, [selectedLocation, sortBy, sortDirection]);

	useEffect(() => {
		fetchTravels();
	}, [fetchTravels]);

	return (
		<div className="container">
			<div className="main-content">
				<h1>Путешествия других пользователей</h1>

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

				<Travels travels={travels} />
			</div>
		</div>
	);
};
