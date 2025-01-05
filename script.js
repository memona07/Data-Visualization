var map = L.map('map').setView([31.5204, 72], 5);

// Base layers
var layer1 = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

var osmHOT = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team hosted by OpenStreetMap France'
});

// GeoJSON layers
var hospitalIcon = L.icon({
    iconUrl: 'hospitalll.png',
    iconSize: [30, 41],
    iconAnchor: [13, 43],
    popupAnchor: [0, -21]
});

var Hospitals = L.geoJSON(hospitals, {
    pointToLayer: function (feature, latlng) {
        var marker = L.marker(latlng, { icon: hospitalIcon });
        marker.bindPopup("<b>" + feature.properties["Name"] + "</b><br>" + feature.properties.Snippet);
        return marker;
    }
});

var pak = L.geoJSON(pakAd0, {
    onEachFeature: function (feature, layer) {
        if (feature.properties) {
            layer.bindPopup(Object.keys(feature.properties)
                .map(key => `<b>${key}:</b> ${feature.properties[key]}`)
                .join('<br>'));
        }
    }
}).addTo(map);

var pakPro = L.geoJSON(pakPro, {
    onEachFeature: function (feature, layer) {
        if (feature.properties) {
            layer.bindPopup(Object.keys(feature.properties)
                .map(key => `<b>${key}:</b> ${feature.properties[key]}`)
                .join('<br>'));
        }
    }
});

var pakDis = L.geoJSON(pakDis, {
    onEachFeature: function (feature, layer) {
        if (feature.properties) {
            layer.bindPopup(Object.keys(feature.properties)
                .map(key => `<b>${key}:</b> ${feature.properties[key]}`)
                .join('<br>'));
        }
    }
});

var pakTeh = L.geoJSON(pakTeh, {
    onEachFeature: function (feature, layer) {
        if (feature.properties) {
            layer.bindPopup(Object.keys(feature.properties)
                .map(key => `<b>${key}:</b> ${feature.properties[key]}`)
                .join('<br>'));
        }
    }
});

// Layer control
var overlayMaps = {
    "Hospitals": Hospitals,
    "Pakistan": pak,
    "Provinces": pakPro,
    "Districts": pakDis,
    "Tehsils": pakTeh
};

var layerControl = L.control.layers({
    "Layer 1": layer1,
    "Esri World Imagery": Esri_WorldImagery,
    "OpenStreetMap.HOT": osmHOT
}, overlayMaps).addTo(map);

// Scale bar
L.control.scale().addTo(map);
