import React, { useCallback, useEffect, useState } from 'react';
import { useMap } from '../context/MapHook';

export function TravelMap({ width, height, coordinates, markers = [], withSearch, foundHandler }) {
	const propsLocation =
		coordinates && coordinates.lat && coordinates.long ? [coordinates.long, coordinates.lat] : [37.617698, 55.755864];

	const [map, setMap] = useState(null);
	const [loading, setLoading] = useState(true);
	const [location, setLocation] = useState(propsLocation);
	const [error, setError] = useState('');
	const [isFullscreen, setIsFullscreen] = useState(false);
	const { libs } = useMap();

	const setMapRefHandler = useCallback((node) => {
		setMap(node);
	}, []);

	const searchResultHandler = useCallback((searchResult) => {
		setError(searchResult?.length > 1 ? 'Выберите конкретное место' : '');
		setLocation(searchResult?.length > 0 ? searchResult[0].geometry.coordinates : propsLocation);

		if (searchResult?.length === 1 && foundHandler) {
			foundHandler(searchResult[0]);
		}
	}, []);

	const fullScreenHandler = useCallback(() => {
		// The document.fullscreenElement returns the Element that is currently being presented in fullscreen mode in this document, or null if fullscreen mode is not currently in use
		if (isFullscreen) {
			// The document.exitFullscreen() requests that the element on this document which is currently being presented in fullscreen mode be taken out of fullscreen mode
			document.exitFullscreen();
		} else {
			// The element.requestFullscreen() method issues an asynchronous request to make the element be displayed in fullscreen mode
			map.container.requestFullscreen();
		}
	}, [isFullscreen, map]);

	useEffect(() => {
		if (libs) {
			setLoading(false);
		}
	}, [libs]);

	useEffect(() => {
		// The fullscreenchange event is fired immediately after the browser switches into or out of fullscreen mode
		const onFullscreenChange = () => {
			setIsFullscreen(Boolean(document.fullscreenElement));
		};

		document.addEventListener('fullscreenchange', onFullscreenChange);

		// Remove event on component unmount
		return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
	}, []);

	if (loading) {
		return <div>Загрузка карты...</div>;
	}

	const {
		YMap,
		YMapDefaultSchemeLayer,
		YMapDefaultFeaturesLayer,
		YMapDefaultMarker,
		YMapControls,
		YMapSearchControl,
		YMapControl,
	} = libs;

	return (
		<div
			className="map-container"
			style={{ width: isFullscreen ? '100vw' : width, height: isFullscreen ? '100vh' : height }}
		>
			{error && <div className="error">{error}</div>}
			<YMap location={{ center: location, zoom: 10 }} mode="vector" ref={setMapRefHandler}>
				<YMapDefaultSchemeLayer />
				<YMapDefaultFeaturesLayer />
				{withSearch && (
					<YMapControls position="top">
						<YMapSearchControl searchResult={searchResultHandler} />
						<YMapControl>
							<button
								type="button"
								onClick={fullScreenHandler}
								className={`button ${isFullscreen ? 'exit-fullscreen' : 'fullscreen'}`}
							></button>
						</YMapControl>
					</YMapControls>
				)}

				<YMapDefaultMarker coordinates={location}></YMapDefaultMarker>
				{markers.map((marker) => (
					<YMapDefaultMarker
						color="blue"
						key={marker.number}
						title={marker.title}
						staticHint={true}
						coordinates={[marker.coordinates.long, marker.coordinates.lat]}
					></YMapDefaultMarker>
				))}
			</YMap>
			<style jsx="">{`
				.map-container {
					resize: both;
					overflow: auto;
				}
				.error {
					background-color: red;
					color: white;
					font-weight: bold;
					text-align: center;
				}
				.button {
					width: 52px;
					height: 49px;
					background-color: #ffffff;
					background-position: 50% 50%;
					background-repeat: no-repeat;
					border: none;
					border-radius: 12px;
					cursor: pointer;
				}

				.button.fullscreen {
					display: block;
					background-image: url('https://yastatic.net/s3/front-maps-static/maps-front-jsapi-3/3.0.17179206/build/static/s3-cases/fullscreen/fullscreen.svg');
				}

				.button.exit-fullscreen {
					display: block;
					background-image: url('https://yastatic.net/s3/front-maps-static/maps-front-jsapi-3/3.0.17179206/build/static/s3-cases/fullscreen/fullscreen-exit.svg');
				}
			`}</style>
		</div>
	);
}
