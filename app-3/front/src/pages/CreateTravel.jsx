import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { travelService } from '../services/api';
import { StatusMessage } from '../components/StatusMessage';
import { TravelMap } from '../components/Map';
import { Stars } from '../components/Stars';

export const CreateTravel = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const isEditing = Boolean(id);

	const [formData, setFormData] = useState({
		title: '',
		description: '',
		location: '',
		latitude: '',
		longitude: '',
		cost: '',
		start_date: '',
		end_date: '',
		transportation_rating: '',
		safety_rating: '',
		population_rating: '',
		nature_rating: '',
		places: [],
	});

	const [newPlace, setNewPlace] = useState({
		name: '',
		description: '',
		latitude: '',
		longitude: '',
		visited: false,
	});

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [showMap, setShowMap] = useState(false);

	useEffect(() => {
		if (isEditing && id) {
			const fetchTravel = async () => {
				try {
					setLoading(true);
					const response = await travelService.getTravel(id);
					const travel = response.data.travel;

					setFormData({
						title: travel.title || '',
						description: travel.description || '',
						location: travel.location || '',
						latitude: travel.latitude || '',
						longitude: travel.longitude || '',
						cost: travel.cost || '',
						start_date: travel.start_date || '',
						end_date: travel.end_date || '',
						transportation_rating: travel.transportation_rating || '',
						safety_rating: travel.safety_rating || '',
						population_rating: travel.population_rating || '',
						nature_rating: travel.nature_rating || '',
						places: travel.places || [],
					});
				} catch (error) {
					console.error('Error fetching travel:', error);
					setError('Ошибка загрузки путешествия');
				} finally {
					setLoading(false);
				}
			};

			fetchTravel();
		}
	}, [isEditing, id]);

	const handleInputChange = (e) => {
		const { name, value } = e.target;

		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleStarChange = (name, rating) => {
		setFormData((prev) => ({
			...prev,
			[name]: rating,
		}));
	};

	const handlePlaceInputChange = (e) => {
		const { name, value, type, checked } = e.target;

		setNewPlace((prev) => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value,
		}));
	};

	const handlePlaceMapChange = (e) => {
		const [longitude, latitude] = e.geometry.coordinates;

		setNewPlace((prev) => {
			const name = prev.name;

			return {
				...prev,
				name: prev.name || e.properties?.name || '',
				longitude,
				latitude,
			};
		});
	};

	const handleTravelMapChange = (e) => {
		console.log(e);
		const [longitude, latitude] = e.geometry.coordinates;

		setFormData((prev) => ({
			...prev,
			longitude,
			latitude,
		}));
	};

	const addPlace = () => {
		if (newPlace.name.trim()) {
			setFormData((prev) => ({
				...prev,
				places: [...prev.places, { ...newPlace }],
			}));
			setNewPlace({
				name: '',
				description: '',
				latitude: '',
				longitude: '',
				visited: false,
			});
		}
	};

	const removePlace = (index) => {
		setFormData((prev) => {
			const newPlaces = prev.places.slice();
			const [placeToRemove] = newPlaces.splice(index, 1);

			const placeChanged = {
				...placeToRemove,
				isRemoved: placeToRemove.isRemoved ? false : true,
			};

			return {
				...prev,
				places: newPlaces.concat(!placeToRemove.id && placeChanged.isRemoved ? [] : placeChanged),
			};
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError('');
		setSuccess('');

		try {
			const submitData = {
				...formData,
				latitude: formData.latitude ? parseFloat(formData.latitude) : null,
				longitude: formData.longitude ? parseFloat(formData.longitude) : null,
				cost: formData.cost ? parseFloat(formData.cost) : null,
				transportation_rating: formData.transportation_rating ? parseInt(formData.transportation_rating) : null,
				safety_rating: formData.safety_rating ? parseInt(formData.safety_rating) : null,
				population_rating: formData.population_rating ? parseInt(formData.population_rating) : null,
				nature_rating: formData.nature_rating ? parseInt(formData.nature_rating) : null,
				places: formData.places.map((place) => ({
					...place,
					latitude: place.latitude ? parseFloat(place.latitude) : null,
					longitude: place.longitude ? parseFloat(place.longitude) : null,
				})),
			};

			if (isEditing) {
				await travelService.updateTravel(id, submitData);
				setSuccess('Путешествие успешно обновлено!');
			} else {
				await travelService.createTravel(submitData);
				setSuccess('Путешествие успешно создано!');
			}

			setTimeout(() => {
				navigate(id ? `/travels/${id}` : '/my-travels', {
					state: { message: `Путешествие успешно ${isEditing ? 'обновлёно' : 'создано'}!` },
				});
			}, 1500);
		} catch (error) {
			console.error('Error saving travel:', error);
			setError('Ошибка сохранения путешествия');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="container">
			<div className="main-content">
				<h1>{isEditing ? 'Редактировать путешествие' : 'Добавить путешествие'}</h1>

				{error && <StatusMessage type="error">{error}</StatusMessage>}
				{success && <StatusMessage type="success">{success}</StatusMessage>}

				<form onSubmit={handleSubmit} className="travel-form">
					<div className="form-group">
						<label htmlFor="title">
							Название путешествия <span style={{ color: 'red' }}>*</span>
						</label>
						<input type="text" id="title" name="title" value={formData.title} onChange={handleInputChange} required />
					</div>

					<div className="form-group">
						<label htmlFor="location">
							Местоположение <span style={{ color: 'red' }}>*</span>
						</label>
						<input
							type="text"
							id="location"
							name="location"
							value={formData.location}
							onChange={handleInputChange}
							required
						/>
					</div>

					<div className="form-group">
						<label htmlFor="description">Описание</label>
						<textarea
							id="description"
							name="description"
							value={formData.description}
							onChange={handleInputChange}
							rows="5"
							style={{ width: '100%' }}
						/>
					</div>

					<div className="form-row">
						<div className="form-group">
							<label htmlFor="latitude">Широта</label>
							<input
								type="number"
								id="latitude"
								name="latitude"
								value={formData.latitude}
								onChange={handleInputChange}
							/>
						</div>
						<div className="form-group">
							<label htmlFor="longitude">Долгота</label>
							<input
								type="number"
								id="longitude"
								name="longitude"
								value={formData.longitude}
								onChange={handleInputChange}
							/>
						</div>
					</div>
					<div className="form-group">
						<button className="btn" style={{ width: '100%' }} type="button" onClick={() => setShowMap((prev) => !prev)}>
							{showMap ? 'Скрыть карту' : 'Показать карту'}
						</button>
					</div>
					{showMap && (
						<div className="form-group">
							<TravelMap
								// coordinates={{ lat: formData.latitude, long: formData.longitude }}
								width="100%"
								height={400}
								withSearch={true}
								foundHandler={handleTravelMapChange}
							/>
						</div>
					)}

					<div className="form-group">
						<label htmlFor="cost">Стоимость путешествия (руб.)</label>
						<input type="number" step="0.01" id="cost" name="cost" value={formData.cost} onChange={handleInputChange} />
					</div>

					<div className="form-row">
						<div className="form-group">
							<label htmlFor="start_date">Дата начала</label>
							<input
								type="date"
								id="start_date"
								name="start_date"
								value={formData.start_date}
								onChange={handleInputChange}
							/>
						</div>
						<div className="form-group">
							<label htmlFor="end_date">Дата окончания</label>
							<input type="date" id="end_date" name="end_date" value={formData.end_date} onChange={handleInputChange} />
						</div>
					</div>

					<div className="ratings-section">
						<h3>Оценки (от 1 до 5)</h3>
						<div className="form-row">
							<div className="form-group">
								<label htmlFor="transportation_rating">Удобство передвижения</label>
								<Stars
									rating={formData.transportation_rating}
									onChange={(rating) => handleStarChange('transportation_rating', rating)}
									labels={['Очень плохо', 'Плохо', 'Удовлетворительно', 'Хорошо', 'Отлично']}
									isEditable={true}
								/>
							</div>
							<div className="form-group">
								<label htmlFor="safety_rating">Безопасность</label>
								<Stars
									rating={formData.safety_rating}
									onChange={(rating) => handleStarChange('safety_rating', rating)}
									labels={['Очень опасно', 'Опасно', 'Средне', 'Безопасно', 'Очень безопасно']}
									isEditable={true}
								/>
							</div>
						</div>
						<div className="form-row">
							<div className="form-group">
								<label htmlFor="population_rating">Населенность</label>
								<Stars
									rating={formData.population_rating}
									onChange={(rating) => handleStarChange('population_rating', rating)}
									labels={['Безлюдно', 'Мало людей', 'Средне', 'Людно', 'Очень людно']}
									isEditable={true}
								/>
							</div>
							<div className="form-group">
								<label htmlFor="nature_rating">Растительность</label>
								<Stars
									rating={formData.nature_rating}
									onChange={(rating) => handleStarChange('nature_rating', rating)}
									labels={['Пустыня', 'Мало растительности', 'Средне', 'Много зелени', 'Джунгли']}
									isEditable={true}
								/>
							</div>
						</div>
					</div>

					<div className="places-section">
						<h3>Места для посещения</h3>

						<div className="add-place">
							<div className="form-row">
								<div className="form-group">
									<input
										type="text"
										name="name"
										placeholder="Название места"
										value={newPlace.name}
										onChange={handlePlaceInputChange}
									/>
								</div>
								<div className="form-group">
									<input
										type="text"
										name="description"
										placeholder="Описание"
										value={newPlace.description}
										onChange={handlePlaceInputChange}
									/>
								</div>
							</div>
							<div className="form-row">
								<div className="form-group">
									<input
										type="number"
										name="latitude"
										placeholder="Широта"
										value={newPlace.latitude}
										onChange={handlePlaceInputChange}
									/>
								</div>
								<div className="form-group">
									<input
										type="number"
										name="longitude"
										placeholder="Долгота"
										value={newPlace.longitude}
										onChange={handlePlaceInputChange}
									/>
								</div>
								<div className="form-group">
									<label>
										<input
											type="checkbox"
											name="visited"
											checked={newPlace.visited}
											onChange={handlePlaceInputChange}
										/>
										Посещено
									</label>
								</div>
								<div className="form-group">
									<button type="button" onClick={addPlace} className="btn success">
										Добавить место
									</button>
								</div>
							</div>
							<div className="form-row">
								<div className="form-group">
									<TravelMap width="100%" height={300} withSearch={true} foundHandler={handlePlaceMapChange} />
								</div>
							</div>
						</div>

						{formData.places.length > 0 && (
							<div className="places-list">
								{formData.places.map((place, index) => (
									<div key={index} className="place-item">
										<div className={place.isRemoved ? 'place-removed' : ''}>
											<strong>{place.name}</strong>
											{place.description && <p>{place.description}</p>}
											{place.visited && <span className="visited-badge">Посещено</span>}
										</div>
										<button
											disabled={place.idRemoved}
											type="button"
											onClick={() => removePlace(index)}
											className="btn btn-danger btn-small"
										>
											{place.isRemoved ? 'Восстановить' : 'Удалить'}
										</button>
									</div>
								))}
							</div>
						)}
					</div>

					<div className="form-actions">
						<button type="submit" disabled={loading} className="btn primary mr-1">
							{loading ? 'Сохранение...' : isEditing ? 'Обновить' : 'Создать'}
						</button>
						<button type="button" onClick={() => navigate('/my-travels')} className="btn">
							Отмена
						</button>
					</div>
				</form>
			</div>
			<style jsx="">{`
				.place-removed {
					text-decoration: line-through;
					color: gray;
				}
			`}</style>
		</div>
	);
};
