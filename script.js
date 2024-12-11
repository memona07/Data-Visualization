var map = L.map('map').setView([31.5204, 74.3587], 5);

var layer1 = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
});

var osmHOT = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team hosted by OpenStreetMap France'
});

//GEOJSON
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
}).addTo(map);

var pak = L.geoJSON(pakAd0 , {}).addTo(map);
var pakPro = L.geoJSON(pakPro , {}).addTo(map);
var pakDis = L.geoJSON(pakDis , {}).addTo(map);
var pakTeh = L.geoJSON(pakTeh , {}).addTo(map);
// Real-time location
var liveLocationEnabled = false;
var liveLocationBuffer;
var bufferLayer;
var nearestHospitalMarker;

if (!navigator.geolocation) {
    console.log('Your browser does not support geolocation');
} else {
    // Create a button and add it to the map
    var locationButton = L.control({ position: 'topleft' });

    locationButton.onAdd = function (map) {
        var buttonDiv = L.DomUtil.create('div', 'location-button');
        buttonDiv.innerHTML = '<button onclick="fetchLiveLocation()">Live Location</button>';
        return buttonDiv;
    };

    locationButton.addTo(map);
}

var pmarker;

function fetchLiveLocation() {
    navigator.geolocation.getCurrentPosition(geoposition);
}

function geoposition(position) {
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;

    // Create a popup content string
    var popupContent = `Latitude: ${lat.toFixed(2)}<br>Longitude: ${lon.toFixed(2)}`;

    // Display the information as a popup on the map
    var popup = L.popup()
        .setLatLng([lat, lon])
        .setContent(popupContent);

    if (pmarker) {
        pmarker.setLatLng([lat, lon]);
        pmarker.bindPopup(popup);
    } else {
        pmarker = L.marker([lat, lon]).addTo(map).bindPopup(popup);
    }

    if (liveLocationEnabled) {
        // Clear previous buffer and hospital markers
        if (bufferLayer) map.removeLayer(bufferLayer);
        if (nearestHospitalMarker) map.removeLayer(nearestHospitalMarker);

        // Apply buffer
        var point = turf.point([lon, lat]);
        var buffered = turf.buffer(point, liveLocationBuffer, { units: 'kilometers' });
        bufferLayer = L.geoJSON(buffered).addTo(map);

        // Find the nearest hospital among the ones within the buffer zone
        var nearestHospital = findNearestHospital(L.latLng(lat, lon), Hospitals);

        if (nearestHospital) {
            nearestHospitalMarker = L.marker(nearestHospital.getLatLng(), {
                icon: L.divIcon({
                    className: 'nearest-hospital-icon',
                    html: '<div>Nearest Hospital</div>'
                })
            }).addTo(map);
        }

        // Iterate through points in GeoJSON file
        Hospitals.eachLayer(function (layer) {
            var popupContent = "<b>" + layer.feature.properties["Name"] + "</b><br>" + layer.feature.properties.Snippet;
            layer.bindPopup(popupContent);
        });
    }
}

function findNearestHospital(realTimeLocation, hospitals) {
    var nearestHospital;
    var nearestDistance = Infinity;

    hospitals.eachLayer(function (layer) {
        var hospitalLocation = layer.getLatLng();
        var distance = realTimeLocation.distanceTo(hospitalLocation);
        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestHospital = layer;
        }
    });

    return nearestHospital;
}

var baseMaps = {
    "Layer 1": layer1,
    "OpenStreetMap": osm,
    "OpenStreetMap.HOT": osmHOT
};

var overlayMaps = {
    "Hospitals": Hospitals,
    "Pakistan": pak,
    "Provinces": pakPro,
    "Districts": pakDis,
    "Tehsils": pakTeh
};

var bufferControl = L.control({ position: 'topleft' , collaps: 'false'});
bufferControl.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'buffer-control');
    div.innerHTML = '<h4>Buffer Zone</h4><select id="buffer-select"><option value="0">Select Buffer</option><option value="2">2km</option><option value="3">3km</option><option value="5">5km</option><option value="8">8km</option><option value="10">10km</option></select>';
    L.DomEvent.disableClickPropagation(div);
    return div;
};
bufferControl.addTo(map);

document.getElementById('buffer-select').addEventListener('change', function () {
    liveLocationBuffer = parseInt(this.value);
    if (liveLocationBuffer > 0) {
        liveLocationEnabled = true;
        fetchLiveLocation();
    } else {
        liveLocationEnabled = false;
        map.eachLayer(function (layer) {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });
    }
});

// scale bar
L.control.scale().addTo(map)

var layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);


var routingControl; // Add this line to initialize routingControl

function geoposition(position) {
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;

    // Create a popup content string
    var popupContent = `Latitude: ${lat.toFixed(2)}<br>Longitude: ${lon.toFixed(2)}`;

    // Display the information as a popup on the map
    var popup = L.popup()
        .setLatLng([lat, lon])
        .setContent(popupContent);

    if (pmarker) {
        pmarker.setLatLng([lat, lon]);
        pmarker.bindPopup(popup);
    } else {
        pmarker = L.marker([lat, lon]).addTo(map).bindPopup(popup);
    }

    if (liveLocationEnabled) {
        // Clear previous buffer and hospital markers
        if (bufferLayer) map.removeLayer(bufferLayer);
        if (nearestHospitalMarker) map.removeLayer(nearestHospitalMarker);

        // Apply buffer
        var point = turf.point([lon, lat]);
        var buffered = turf.buffer(point, liveLocationBuffer, { units: 'kilometers' });
        bufferLayer = L.geoJSON(buffered).addTo(map);

        // Find the nearest hospital among the ones within the buffer zone
        var nearestHospital = findNearestHospital(L.latLng(lat, lon), Hospitals);

        if (nearestHospital) {
            nearestHospitalMarker = L.marker(nearestHospital.getLatLng(), {
                icon: L.divIcon({
                    className: 'nearest-hospital-icon',
                    html: '<div>Nearest Hospital</div>'
                })
            }).addTo(map);

            // Create the routing control
            routingControl = L.Routing.control({
                waypoints: [
                    L.latLng(lat, lon), // Real-time location marker
                    nearestHospitalMarker.getLatLng() // Nearest hospital marker
                ],
                routeWhileDragging: true,
                lineOptions: {
                    styles: [{color: 'Green', opacity: 0.5, weight: 6}]
                },
                createMarker: function(i, wp, nWps) {
                    // Prevent creation of default markers
                    return null;
                }
            }).addTo(map);
        }
    }
}
