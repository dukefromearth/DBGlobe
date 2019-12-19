const socket = io();
const search_data = ["Volcano", "Hurricane", "Earthquake"];
var latest_data = {};

map.on('load', function () {
    map.loadImage("/client/assets/fire-icon.png", function (error, image) {
        if (error) throw error;
        map.addImage("Volcano", image);
        // Add a layer showing the places.
    });
    map.loadImage("/client/assets/earthquake-icon.png", function (error, image) {
        if (error) throw error;
        map.addImage("Earthquake", image);
        // Add a layer showing the places.
    });
    map.loadImage("/client/assets/hurricane-icon.png", function (error, image) {
        if (error) throw error;
        map.addImage("Hurricane", image);
        // Add a layer showing the places.
    });

    socket.on('data_packet', function (type, data) {
        map.addLayer({
            'id': type,
            'type': 'symbol',
            'source': {
                'type': 'geojson',
                'data': data,
            },
            'layout': {
                'icon-image': type,
                "icon-size": .03,
                'icon-allow-overlap': true
            },

        });
    });

    // When a click event occurs on a feature in the places layer, open a popup at the
    // location of the feature, with description HTML from its properties.
    map.on('click', 'Hurricane', function (e) {
        var coordinates = e.features[0].geometry.coordinates.slice();
        var description = e.features[0].properties.description;

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(description)
            .addTo(map);
    });

    // Change the cursor to a pointer when the mouse is over the places layer.
    map.on('mouseenter', 'Hurricane' || 'Earthquake', function () {
        map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'Hurricane', function () {
        map.getCanvas().style.cursor = '';
    });
});

var setActive = function (type) {
    console.log(type);
    return function () {
        var y = document.getElementById(search_data[type]);
        if (y.getAttribute('class') === 'year active') {
            return;
        }
        var yy = document.getElementsByClassName('year');
        for (i = 0; i < yy.length; i++) {
            yy[i].setAttribute('class', 'year');
        }
        y.setAttribute('class', 'year active');
        active = type;
        // y.addEventListener('mouseover', socket.emit('hover', search_data[type]));
    };
};
var active = "0";
var send = document.getElementById("sendbutton");
var years = document.getElementById("amount");
console.log(send);
send.addEventListener('click', function () {
    let trig = false;
    for (let id in map.getStyle().layers) {
        layer = map.getStyle().layers[id];
        if (layer.id === search_data[active]) {
            map.removeLayer(layer.id);
            map.removeSource(layer.id);
            trig = true;
        }
    }
    if (!trig) socket.emit('hover', search_data[active], years.value);
});

for (var i = 0; i < search_data.length; i++) {
    var y = document.getElementById(search_data[i]);
    y.addEventListener('mouseover', setActive(i));
}