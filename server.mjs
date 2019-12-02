// Dependencies.
/*jshint esversion: 6 *///
import express from 'express';
import http from 'http';
import path from 'path';
import socketIO from 'socket.io';

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

  socket.on('hover', function (data) {
    console.log(data);
  });

});