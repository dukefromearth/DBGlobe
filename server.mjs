// Dependencies.
/*jshint esversion: 6 *///
import express from 'express';
import http from 'http';
import path from 'path';
import socketIO from 'socket.io';
import mysql from 'mysql';


var con = mysql.createConnection({
  host: "localhost",
  user: "jeffrey",
  password: "password"
});

con.connect(function (err) {
  if (err) throw err;
  // con.query("SELECT Latitude as lat, Longitude as lon, Magnitude/(select max(Magnitude) from dbglobe.disaster_data ) as mag FROM dbglobe.disaster_data", function (err, result, fields) {
  //   if (err) throw err;
  //   db_data = result;
  //   console.log(db_data);
  // });
  console.log("Connected!");
});

function queryAllData() {
  var db_data = {};
  let search_data = ["Volcano", "Hurricane", "Earthquake"];
  for (let i = 0; i < search_data.length; i++) {
    let q = "SELECT Date as date, Latitude as lat, Longitude as lon, Magnitude as mag from dbglobe.disaster_data d where d.EventID = ?";
    con.query(q, [search_data[i], search_data[i]], function (err, result, fields) {
      if (err) throw err;
      else {
        db_data[search_data[i]] = { data: result };
      }
    });
  }
  return db_data;
}

function mapify(data, d_low, d_high) {
  let rv = [];
  let d1 = new Date(d_low);
  let d2 = new Date(d_high+"/12/31");
  for (let i in data) {
    let event = data[i];
    let event_date = new Date(event.date);
    if (d1.getTime() < event_date && d2.getTime() > event_date) {
      rv.push({
        'type': 'Feature',
        'properties': {
          'description': "Date: " + event.date + "\n Magnitude: " + event.mag,
          'icon': 'volcano',
          'iconSize': [100]
        },
        'geometry': {
          'type': 'Point',
          'coordinates': [event.lon, event.lat]
        }
      });
    }
  }
  return {
    'type': 'FeatureCollection',
    'features': rv
  };
}

const db_data = queryAllData();
const __dirname = path.resolve(path.dirname(''));
const HOST = process.env.HOST || '0.0.0.0';
const environment = process.env.ENV || "prod";
const app = express();
const server = http.Server(app);
const io = socketIO(server);
const port_num = 5000;

var sockets = {};

app.set('port', port_num);
app.use('/client', express.static('./client'));

// Routing
app.get('/', function (request, response) {
  response.sendFile(path.join(__dirname, '/index.html'));
});

server.listen(port_num, function () {
  console.log(`Running as ${environment} environment`);
  console.log('Starting server on port', port_num);
});

io.on('connection', function (socket) {
  socket.on('new player', function () {
    sockets[socket.id] = socket;
  });

  socket.on('disconnect', function () {
    delete sockets[socket.id];
  });

  socket.on('hover', function (type, years) {
    let start_year = years.substr(0, 4);
    let end_year = years.substr(7, 10);
    let rv = db_data[type];
    if (rv) socket.emit('data_packet', type, mapify(db_data[type].data,start_year,end_year));
  });
});