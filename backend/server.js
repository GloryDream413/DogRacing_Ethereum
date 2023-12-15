const express = require('express');
const app = express();
//const https = require("https");
const http = require("http");
const fs = require("fs");
const cors = require('cors');
const { Server } = require('socket.io');

const api = require("./src/api");

const bodyParser = require('body-parser');
const morgan = require('morgan');
const _ = require('lodash');
const path = require("path");
const db = require('./src/config/db');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cors({origin: '*'}));
app.use("/api", api);

// DB connect
db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

const server = http.createServer(app);

// const httpsPort = 3306;
// const privateKey = fs.readFileSync("/etc/letsencrypt/live/degenland.tech/privkey.pem");
// const certificate = fs.readFileSync("/etc/letsencrypt/live/degenland.tech/fullchain.pem");

// const credentials = {
//   key: privateKey,
//   cert: certificate,
// }

// const server = https.createServer(credentials, app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

//Add this before the app.get() block
io.on('connection', (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);

  //Listens and logs the message to the console
  socket.on('message', (data) => {
    io.emit('messageResponse', data);
  });

  socket.on('disconnect', () => {
    console.log('🔥: A user disconnected');
  });
});

server.listen(5000, () => {console.log('Server is running on port 5000')});