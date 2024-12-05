const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const bodyParser = require('body-parser');
const { handleSocketConnection } = require('./socketHandlers');
const { handleLogin } = require('./userAuth');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '../client')));

app.post('/login', handleLogin);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

io.on('connection', handleSocketConnection);

const PORT = process.env.PORT || 8443;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
