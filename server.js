const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const pty = require('node-pty');

app.use(express.static(__dirname + '/public'));

io.on('connection', (socket) => {
  const term = pty.spawn('bash', [], {
    name: 'xterm-256color',
    cols: 80,
    rows: 30,
    cwd: process.env.HOME,
    env: process.env
  });

  term.onData(data => {
    socket.emit('output', data);
  });

  socket.on('input', (data) => {
    term.write(data);
  });

  socket.on('resize', (cols, rows) => {
    term.resize(cols, rows);
  });

  socket.on('disconnect', () => {
    term.kill();
  });
});

const port = process.env.PORT || 3002;
http.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

