# Initial setup

Clone the code into a local repository. 
Navigate to the DBGlobe folder
Run "npm i" to download all dependencies
Run "npm start" to begin the node server
Navigate to your browser and go to localhost:5000


**The WebGL Globe** supports data in `JSON` format, a sample of which you can find [here](https://github.com/dataarts/webgl-globe/blob/master/globe/population909500.json). `webgl-globe` makes heavy use of the [Three.js library](https://github.com/mrdoob/three.js/).

# Data Format

The following illustrates the `JSON` data format that the globe expects:

```javascript
var data = [
    [
    'seriesA', [ latitude, longitude, magnitude, latitude, longitude, magnitude, ... ]
    ],
    [
    'seriesB', [ latitude, longitude, magnitude, latitude, longitude, magnitude, ... ]
    ]
];
```
# Basic socket usage
https://socket.io/docs/emit-cheatsheet/

Emits follow a format of:

Client Side
    socket.emit('name_of_data', data);
Server Side
    socket.on('name_of_data', function(data) {
        process_this_data(data);
    });
Us cmd F to search for socket usage in our server.mjs and /client/index.js files

# Basic Usage of WebGL Globe

The following code polls a `JSON` file (formatted like the one above) for geo-data and adds it to an animated, interactive WebGL globe.

```javascript
// Where to put the globe?
var container = document.getElementById( 'container' );

// Make the globe
var globe = new DAT.Globe( container );

// We're going to ask a file for the JSON data.
var xhr = new XMLHttpRequest();

// Where do we get the data?
xhr.open( 'GET', 'myjson.json', true );

// What do we do when we have it?
xhr.onreadystatechange = function() {

    // If we've received the data
    if ( xhr.readyState === 4 && xhr.status === 200 ) {

        // Parse the JSON
        var data = JSON.parse( xhr.responseText );

        // Tell the globe about your JSON data
        for ( var i = 0; i < data.length; i ++ ) {
            globe.addData( data[i][1], {format: 'magnitude', name: data[i][0]} );
        }

        // Create the geometry
        globe.createPoints();

        // Begin animation
        globe.animate();

    }

};

// Begin request
xhr.send( null );
```
