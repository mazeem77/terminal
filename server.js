const express = require('express');
const app = express();
const http = require('http').Server(app);
const cors = require('cors');

const pty = require('node-pty');

app.use(cors());
const io = require('socket.io')(http, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log("Connected!")
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
    console.log("input!")
    term.write(data);
  });

  socket.on('resize', (cols, rows) => {
    console.log("resize!")
    term.resize(cols, rows);
  });

  socket.on('disconnect', () => {
    console.log("resize!")
    term.kill();
  });
});

const port = process.env.PORT || 3001;
http.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
