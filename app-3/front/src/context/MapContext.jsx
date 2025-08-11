import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { MapContext } from './MapHook';

export const MapProvider = ({ children }) => {
	const [map, setMap] = useState(null);
	const ymaps3 = window.ymaps3;

	useEffect(() => {
		const initMap = async () => {
			ymaps3.import.registerCdn('https://cdn.jsdelivr.net/npm/{package}', ['@yandex/ymaps3-default-ui-theme@0.0']);

			const [ymaps3React, ymaps3DefaultUITheme] = await Promise.all([
				ymaps3.import('@yandex/ymaps3-reactify'),
				ymaps3.import('@yandex/ymaps3-default-ui-theme'),
				ymaps3.ready,
			]);

			const reactify = ymaps3React.reactify.bindTo(React, ReactDOM);
			const {
				YMap,
				YMapDefaultSchemeLayer,
				YMapDefaultFeaturesLayer,
				YMapMarker,
				YMapListener,
				YMapControls,
				YMapControl,
			} = reactify.module(ymaps3);
			const { YMapDefaultMarker, YMapSearchControl } = reactify.module(ymaps3DefaultUITheme);

			setMap({
				YMap,
				YMapDefaultSchemeLayer,
				YMapDefaultFeaturesLayer,
				YMapListener,
				YMapDefaultMarker,
				YMapMarker,
				YMapControls,
				YMapSearchControl,
				YMapControl,
			});
		};

		initMap();
	}, []);

	return <MapContext.Provider value={{ libs: map }}>{children}</MapContext.Provider>;
};
