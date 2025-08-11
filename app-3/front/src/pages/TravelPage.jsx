import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { travelService } from '../services/api';
import { StatusMessage } from '../components/StatusMessage';
import { TravelMap } from '../components/Map';
import { PageMessage } from '../components/PageMessage';
import { Price } from '../components/Price';
import { DateTime } from '../components/DateTime';
import { Stars } from '../components/Stars';

export const TravelPage = () => {
	const { id } = useParams();
	const [travel, setTravel] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	const mapIsShowed = useMemo(() => {
		const isPlaceWithCoordinates = travel?.places?.some((place) => place.latitude && place.longitude);

		return travel && ((travel.latitude && travel.longitude) || isPlaceWithCoordinates);
	}, [travel]);

	useEffect(() => {
		const fetchTravel = async () => {
			try {
				const response = await travelService.getTravel(id);

				setTravel(response.data.travel);
			} catch (error) {
				console.error('Error fetching travel:', error);
				setError('Ошибка загрузки путешествия');
			} finally {
				setLoading(false);
			}
		};

		if (id) {
			fetchTravel();
		}
	}, [id]);

	if (loading) {
		return (
			<div className="container">
				<div className="main-content">
					<p>Загрузка...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container">
				<div className="main-content">
					<StatusMessage type="error">{error}</StatusMessage>
				</div>
			</div>
		);
	}

	if (!travel) {
		return (
			<div className="container">
				<div className="main-content">
					<h1>Путешествие не найдено</h1>
				</div>
			</div>
		);
	}

	const formatRating = (rating) => {
		if (!rating) return 'Не указано';

		return '★'.repeat(rating) + '☆'.repeat(5 - rating);
	};

	return (
		<div className="container">
			<div className="main-content">
				<h1>{travel.title}</h1>

				<PageMessage />

				<div className="travel-details">
					<div className="travel-info">
						<h3>Информация о путешествии</h3>
						<p>
							<strong>Местоположение:</strong> {travel.location}
						</p>
						{travel.description && (
							<p>
								<strong>Описание:</strong> {travel.description}
							</p>
						)}
						{travel.cost && (
							<p>
								<strong>Стоимость:</strong> <Price price={travel.cost} />
							</p>
						)}
						{travel.start_date && (
							<p>
								<strong>Дата начала:</strong> <DateTime date={travel.start_date} time={false} />
							</p>
						)}
						{travel.end_date && (
							<p>
								<strong>Дата окончания:</strong> <DateTime date={travel.end_date} time={false} />
							</p>
						)}
					</div>

					{(travel.transportation_rating ||
						travel.safety_rating ||
						travel.population_rating ||
						travel.nature_rating) && (
						<div className="ratings">
							<h3>Оценки</h3>
							{travel.transportation_rating && (
								<p>
									<strong>Удобство передвижения:</strong>{' '}
									<Stars
										rating={travel.transportation_rating}
										labels={['Очень плохо', 'Плохо', 'Удовлетворительно', 'Хорошо', 'Отлично']}
									/>
								</p>
							)}
							{travel.safety_rating && (
								<p>
									<strong>Безопасность:</strong>{' '}
									<Stars
										rating={travel.safety_rating}
										labels={['Очень опасно', 'Опасно', 'Средне', 'Безопасно', 'Очень безопасно']}
									/>
								</p>
							)}
							{travel.population_rating && (
								<p>
									<strong>Населенность:</strong>{' '}
									<Stars
										rating={travel.population_rating}
										labels={['Безлюдно', 'Мало людей', 'Средне', 'Людно', 'Очень людно']}
									/>
								</p>
							)}
							{travel.nature_rating && (
								<p>
									<strong>Растительность:</strong>{' '}
									<Stars
										rating={travel.nature_rating}
										labels={['Пустыня', 'Мало растительности', 'Средне', 'Много зелени', 'Джунгли']}
									/>
								</p>
							)}
						</div>
					)}

					{travel.places && travel.places.length > 0 && (
						<div className="places">
							<h3>Места для посещения</h3>
							<ul>
								{travel.places.map((place) => (
									<li key={place.id} className={place.visited ? 'visited' : ''}>
										<strong>{place.name}</strong>
										{place.description && <p>{place.description}</p>}
										{place.visited && <span className="visited-badge">Посещено</span>}
									</li>
								))}
							</ul>
						</div>
					)}

					{mapIsShowed && (
						<div className="location">
							<h3>Геопозиция</h3>
							<p>
								Координаты: {travel.latitude}, {travel.longitude}
							</p>
							<div>
								<TravelMap
									height={400}
									coordinates={{ lat: travel.latitude, long: travel.longitude }}
									withSearch={false}
									markers={travel.places.map((place) => ({
										number: place.id,
										title: place.name,
										coordinates: { lat: place.latitude, long: place.longitude },
									}))}
								/>
							</div>
						</div>
					)}
				</div>

				<div className="travel-actions">
					<Link to={`/travels/edit/${travel.id}`} className="btn primary">
						Редактировать
					</Link>
				</div>
			</div>
		</div>
	);
};
