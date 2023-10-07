const passport = require('passport');
const session = require('express-session');
const RedisStore = require('connect-redis')(session)
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const mongoose = require('mongoose');
const bcrypt = require("bcrypt"); // For password hashing
const LogInCollection = require("./mongodb");



const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');

//..

const express = require('express');
const app = express();
const server = http.createServer(app);
app.use(express.json());
const port = 8040;

const io = socketio(server);  

server.listen(port, () => {
  try {
    console.log('\x1b[36m%s\x1b[0m', `Middleware connected to port :: ${port}`);
  } catch (error) {
    console.error(error);
  }
});

//..

// main.js
const fs = require('fs');

// Define the path to the folder containing your JavaScript files
const scriptsFolder = path.join(__dirname, 'public/registration/'); // Corrected path to 'scripts'


// Read the files in the folder
fs.readdir(scriptsFolder, (err, files) => {
  if (err) {
    console.error('Error reading scripts folder:', err);
    return;
  }

  // Loop through the files and require them
  files.forEach((file) => {
    if (file == 'handler.js') {
      const scriptPath = path.join(scriptsFolder, file);
      console.log(`Executing ${file} from server.js`);
      require(scriptPath);
    }
  });
});


const EventEmitter = require('events');
const emitter = new EventEmitter();

// Check the current maximum listener limit
const currentLimit = emitter.getMaxListeners();
console.log('Current maximum listener limit:', currentLimit);

// Set a new maximum listener limit (e.g., 100)
emitter.setMaxListeners(100);

// Check the updated maximum listener limit
const updatedLimit = emitter.getMaxListeners();
console.log('Updated maximum listener limit:', updatedLimit);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// mongo stuff ----

mongoose.set('strictQuery', false);
mongoose.set('strictQuery', true);


app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const templatePath = path.join(__dirname, '/public/registration/');
const publicPath = path.join(__dirname, '/public/registration/');

app.set('view engine', 'hbs');
app.set('views', templatePath);
app.use(express.static(publicPath));

app.get('/signup', (req, res) => {
  res.render('signup'); // Remove the leading slash and ".hbs" extension
});

app.get('/login', (req, res) => {
  res.render('login'); // Remove the leading slash and ".hbs" extension
});

app.get('/chat', (req, res) => {
  res.redirect('/chat/chat.html');
});

app.get('/404', (req, res) => {
  res.redirect('/404/index.html');
});



app.post('/signup', async (req, res) => {
    try {
        const checking = await LogInCollection.findOne({ name: req.body.name });

        if (checking) {
            res.redirect('/404');
        } else {
            // Hash the password before storing it
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

            const data = {
                name: req.body.name,
                password: hashedPassword,
            };

            await LogInCollection.create(data);
			//do sum else
      res.redirect('/chat');

        }
    } catch (error) {
        console.error(error);
        res.redirect('/404');
    }
});

app.post('/login', async (req, res) => {
  try {
    const check = await LogInCollection.findOne({ name: req.body.name });

    if (!check) {
      // Show the "User not found" error popup
      res.redirect('/404'); // Redirect as needed

    } else {
      const passwordMatch = await bcrypt.compare(req.body.password, check.password);

      if (passwordMatch) {
        req.session.user = {
          name: req.body.name,
                };
        //send to chat
        res.redirect('/chat');
      } else {
        res.redirect('/404'); // Redirect as needed
      }
    }
  } catch (error) {
    console.error(error);


    res.redirect('/404'); // Redirect as needed
  }
});





// mpngo stuff ----

// INIT

const botName = 'Automated';

// Run when client connects
io.on('connection', socket => {
  
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    socket.emit('message', formatMessage(botName, 'Welcome to CONNECT!'));

    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} has joined the system.`)
      );

    const ip = socket.handshake.headers['x-forwarded-for'] || socket.conn.remoteAddress.split(":")[3];

    console.log('USER: ', user.username, ip, socket.id, ' - connected');

    // Send user and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  // Listen for chatMessage

  // Modify socket.emit for file upload
socket.on("chatMessage", (message) => {
  const user = getCurrentUser(socket.id);

  if (message.text) {
    io.to(user.room).emit("message", formatMessage(user.username, message.text));
  }

  if (message.downloadLink && message.filename) {
    // Emit a separate message for the file
    io.to(user.room).emit("fileMessage", {
      username: user.username,
      downloadLink: message.downloadLink,
      filename: message.filename
    });
    io.to(user.room).emit("message", formatMessage(user.username, message.text, message.downloadLink, message.filename ));
  }
  
});
	
	const ip = socket.handshake.headers['x-forwarded-for'] || socket.conn.remoteAddress.split(":")[3];

	
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.username, msg));

  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the system.`)
      )
const ip = socket.handshake.headers['x-forwarded-for'] || socket.conn.remoteAddress.split(":")[3];

console.log('USER: ', user.username, ip, socket.id,' - disconnected')
		
      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});

app.use(express.json());
app.all(/api/, function(req, res, next){
  console.log(`\n${req.method} ${req.url} --> ${JSON.stringify(req.body, '\t', 2)}`);
  res.status(200).end();
})

process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err);
});

process.on('warning', (warning) => {
  console.warn(warning.name);    // Print the warning name
  console.warn(warning.message); // Print the warning message
  console.warn(warning.stack);   // Print the stack trace
});



process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific logging, throwing an error, or other logic here
});


// Begin reading from stdin so the process does not exit.
process.stdin.resume();

process.on('SIGINT', () => {
  console.log('Received SIGINT. Press exit.');
});

// Using a single function to handle multiple signals
function handle(signal) {
  console.log(`Received ${signal}`);
}

process.on('SIGINT', handle);
process.on('SIGTERM', handle);


// trello


