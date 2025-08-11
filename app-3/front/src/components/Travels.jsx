import React from 'react';
import { Link } from 'react-router-dom';
import { Price } from './Price';
import { Stars } from './Stars';
import { DateTime } from './DateTime';

export const Travels = ({ travels, isMyTravels = false }) => {
	if (!travels || travels.length === 0) {
		return (
			<div className="travels-container">
				<p>Путешествия не найдены.</p>
				{isMyTravels && (
					<Link to="/travels/create" className="btn primary">
						Добавить первое путешествие
					</Link>
				)}
			</div>
		);
	}

	return (
		<div className="travels-container">
			<div className="travels-grid">
				{travels.map((travel) => (
					<div key={travel.id} className="travel-card">
						<div className="travel-header">
							<h3>
								<Link to={`/travels/${travel.id}`}>{travel.title}</Link>
							</h3>
							<span className="travel-location">{travel.location}</span>
						</div>

						<div className="travel-content">
							{travel.description && (
								<p className="travel-description">
									{travel.description.length > 100 ? `${travel.description.substring(0, 100)}...` : travel.description}
								</p>
							)}

							<div className="travel-info">
								{travel.cost && (
									<div className="info-item">
										<strong>Стоимость:</strong> <Price price={travel.cost} />
									</div>
								)}

								{travel.start_date && (
									<div className="info-item">
										<strong>Дата:</strong> <DateTime date={travel.start_date} time={false} />
										{travel.end_date && ' - '}
										{travel.end_date && <DateTime date={travel.end_date} time={false} />}
									</div>
								)}

								{(travel.transportation_rating ||
									travel.safety_rating ||
									travel.population_rating ||
									travel.nature_rating) && (
									<div className="ratings">
										{travel.transportation_rating && (
											<div className="rating-item">
												<span>Передвижение:</span>
												<Stars
													rating={travel.transportation_rating}
													labels={['Очень плохо', 'Плохо', 'Удовлетворительно', 'Хорошо', 'Отлично']}
												/>
											</div>
										)}
										{travel.safety_rating && (
											<div className="rating-item">
												<span>Безопасность:</span>{' '}
												<Stars
													rating={travel.safety_rating}
													labels={['Очень опасно', 'Опасно', 'Средне', 'Безопасно', 'Очень безопасно']}
												/>
											</div>
										)}
										{travel.population_rating && (
											<div className="rating-item">
												<span>Населенность:</span>{' '}
												<Stars
													rating={travel.population_rating}
													labels={['Безлюдно', 'Мало людей', 'Средне', 'Людно', 'Очень людно']}
												/>
											</div>
										)}
										{travel.nature_rating && (
											<div className="rating-item">
												<span>Природа:</span>{' '}
												<Stars
													rating={travel.nature_rating}
													labels={['Пустыня', 'Мало растительности', 'Средне', 'Много зелени', 'Джунгли']}
												/>
											</div>
										)}
									</div>
								)}

								{travel.places && travel.places.length > 0 && (
									<div className="places-preview">
										<strong>Места ({travel.places.length}):</strong>
										<ul>
											{travel.places.slice(0, 3).map((place, index) => (
												<li key={index}>
													{place.name}
													{place.visited && <span className="visited-mark">✓</span>}
												</li>
											))}
											{travel.places.length > 3 && <li>...и еще {travel.places.length - 3}</li>}
										</ul>
									</div>
								)}
							</div>
						</div>

						<div className="travel-actions">
							<Link to={`/travels/${travel.id}`} className="btn">
								Подробнее
							</Link>
							{isMyTravels && (
								<Link to={`/travels/edit/${travel.id}`} className="btn">
									Редактировать
								</Link>
							)}
						</div>
					</div>
				))}
			</div>
			<style jsx="">{`
				.travel-card {
					display: flex;
					flex-direction: column;
				}
				.travel-actions {
					display: flex;
					gap: 8px;
					margin-top: auto;
				}
			`}</style>
		</div>
	);
};
