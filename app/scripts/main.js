/*jslint browser: true*/
/*global L, $, _ */
(function(window, document, L, $, _) {
	'use strict';

	L.Icon.Default.imagePath = 'images/';

	/* create leaflet map */
	var map = L.map('map', {
		center: [37.143, -4.790],
		zoom: 5
	});
	/* variables */
	var totals, geojson;

	/* add default stamen tile layer */
	new L.tileLayer('http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png', {
		minZoom: 0,
		maxZoom: 18,
		attribution: 'Map data © <a href="http://www.openstreetmap.org">OpenStreetMap contributors</a>'
	}).addTo(map);

	function setValue(o, p) {
		document.getElementById(o).innerHTML = p.toLocaleString();
	}

	function getColor(d) {
		return d > 5000000 ? '#800026' :
			d > 2000000 ? '#8c193b' :
			d > 1500000 ? '#993251' :
			d > 1200000 ? '#a64c67' :
			d > 900000 ? '#b2667c' :
			d > 750000 ? '#bf7f92' :
			d > 600000 ? '#cc99a8' :
			d > 400000 ? '#d8b2bd' :
			d > 250000 ? '#e5ccd3' :
			d > 100000 ? '#f2e5e9' :
			'#ffffff';
	}

	function getLimitColor(d, limit) {
		return d > limit ? '#800026' :
			d > (limit - 50000) ? '#bf7f92' :
			'transparent';
	}

	function getPopulation(name) {
		var city = _.find(totals, function(o) {
			o.Nombre = o.Nombre.replace('. Total. Total habitantes. Personas. ', '');
			return o.Nombre.indexOf(name) > -1;
		}) || {};
		return city.Data[0].Valor;
	}

	function parseName(t) {
		switch (t) {
			case 'Illes Balears':
				return 'Balears, Illes';
			case 'Alacant/Alicante':
				return 'Alicante/Alacant';
			case 'La Rioja':
				return 'Rioja, La';
			case 'Guipúzcoa':
				return 'Gipuzkoa';
			case 'Vizcaya':
				return 'Bizkaia';
			case 'A Coruña':
				return 'Coruña, A';
			case 'Las Palmas':
				return 'Palmas, Las';
			default:
				return t;
		}
	}

	function draw(data) {

		if (!data) {
			data = JSON.parse(sessionStorage.getItem('geo'));
		}

		if (geojson) {
			map.removeLayer(geojson);
		}

		geojson = L.geoJSON(data.features, {
			style: function(feature) {
				var _colorByLimit = getLimitColor(getPopulation(parseName(feature.properties.ROTULO)), $('#slider').slider('value'));
				return {
					fillColor: _colorByLimit,
					color: '#800026',
					weight: 1,
					opacity: 0.7,
					fillOpacity: 0.6,
					dashArray: '5,5'
				};
			}
		}).bindPopup(function(layer) {
			return layer.feature.properties.ROTULO + ': ' + getPopulation(parseName(layer.feature.properties.ROTULO)).toLocaleString();
		}).addTo(map);

	}

	/* slider */
	$('#slider').slider({
		create: function(event, ui) {
			setValue('explanation', $('#slider').slider('value'));
		},
		slide: function(event, ui) {
			setValue('explanation', ui.value);
			draw();
		},
		animate: 'slow',
		max: 3000000,
		min: 50000,
		value: 500000
	});

	/* datos INE - provincias */
	$.get('https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/2852?nult=1', function(p) {
		totals = _.filter(p, function(o) {
			return o.Nombre.indexOf('Total.') > -1;
		});

		$.getJSON('data/SE89_10_ADMIN_PROV_A_X.json', function(data) {
			draw(data);
			sessionStorage.setItem('geo', JSON.stringify(data));
		});
	});

}(window, document, L, $, _));
