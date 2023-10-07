[![](https://nodei.co/npm/socket-anti-spam.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/socket-anti-spam)

[![](https://david-dm.org/michaeldegroot/socket-anti-spam.svg 'deps') ](https://david-dm.org/michaeldegroot/socket-anti-spam 'david-dm')
[![](https://travis-ci.org/michaeldegroot/socket-anti-spam.svg?branch=master 'testing') ](https://travis-ci.org/michaeldegroot/socket-anti-spam 'travis-ci')
[![](https://coveralls.io/repos/michaeldegroot/socket-anti-spam/badge.svg?branch=master&service=github)](https://coveralls.io/github/michaeldegroot/socket-anti-spam?branch=master)
![](https://img.shields.io/badge/Node-%3E%3D6.0-green.svg)
![](https://img.shields.io/npm/dt/socket-anti-spam.svg)
![](https://img.shields.io/npm/l/express.svg)
___
# What it does


Keeps track of how many socket.emit's an ip has submitted under a certain timeframe and determine if it is spammy behaviour.
If the module determined the user is spamming the socket will receive a temp ip ban. Everything is customizable.


___
# How it works
All connected sockets will have a object binded to them full of information that socket-anti-spam keeps track of.
This includes how much 'spamScore'someone has. If a socket is doing a socket.emit his spamScore will increase.
The module will give all sockets connected a -1 spamScore every second (no intervals!).
if the spamScore is above a certain spamScore threshold the socket will be disconnected.
If the socket keeps spamming after a certain kick threshold, the socket will be temp ip banned.


[You can see a demo of the module in action here, please remember that this is from previous versions and the appearances might look different](https://bitbucket.org/repo/kR4677/images/1013607973-socketspam.gif)
___
# Changelog


[https://github.com/michaeldegroot/socket-anti-spam/commits/master](https://github.com/michaeldegroot/socket-anti-spam/commits/master)
___
#  Getting started


##### 1. Start by installing the package:
  npm install socket-anti-spam

##### 2. Load the code

```javascript
  const SocketAntiSpam  = require('socket-anti-spam')
  const socket-io = require('socket.io').listen(8080)

  // Redis is not needed, but can be used
  const redis = require('redis')
  const client = redis.createClient()

  const socketAntiSpam = new SocketAntiSpam({
    banTime:            30,         // Ban time in minutes
    kickThreshold:      2,          // User gets kicked after this many spam score
    kickTimesBeforeBan: 1,          // User gets banned after this many kicks
    banning:            true,       // Uses temp IP banning after kickTimesBeforeBan
    io:                 socket-io,  // Bind the socket.io variable
    redis:              client,      // Redis client if you are sharing multiple servers
  })

  // Call functions with created reference 'socketAntiSpam'
  socketAntiSpam.event.on('ban', data => {
    // Do stuff
  })
````

_Now all sockets will be individually checked if they spam your socket.emits and if they do they will be disconnected, after to many repeated offenses they will be temp banned (ip based)._

___

## Events


###  event.on('authenticate', callback)
_Event fires when a socket authenticates with the socket-anti-spam module_

__Example__

````js
socketAntiSpam.event.on('authenticate', socket => {
  // We have the socket var that tried to authenticate


  // We could get his IP
  console.log(socket.ip)
})
````


###  event.on('kick', callback)
_Event fires when a socket was kicked_

__Example__

````js
socketAntiSpam.event.on('kick', (socket, data) => {
  // We have the socket var that was kicked

  // The second parameter is a object that was binded to the socket with some extra information
  // It's how socket-anti-spam keeps track of sockets and their states
})
````


###  event.on('ban', callback)
_Event fires when a socket was banned_

__Example__

````js
socketAntiSpam.event.on('ban', (socket, data) => {
  // We have the socket var that was banned

  // The second parameter is a object that was binded to the socket with some extra information
  // It's how socket-anti-spam keeps track of sockets and their states
})
````


###  event.on('spamscore', callback)
_Event fires when a socket received a new spamscore_

__Example__

````js
socketAntiSpam.event.on('spamscore', (socket, data) => {
  // We have the socket var that received a new spamscore update

  // The second parameter is a object that was binded to the socket with some extra information
  // It's how socket-anti-spam keeps track of sockets and their states

  // If you want the spamscore you can get it via:
  console.log(data.score)
})
````

## API


###  .addSpam(socket)
```js
socket:     Object      // The user socket variable
```
_Can be used to increase the spam score of a socket, if you set the io variable in the init function you do not need this. Unless you want to do something other then adding a spamscore for every socket emit_

__Example__

````js
const io = require('socket.io')
io.sockets.on('connection', socket => {
    socket.on('chatMessage', () => {
        socketAntiSpam.addSpam(socket) // Adds a spamscore because this socket sent a emit
        // The rest of your code
    })
})
````

###  .getBans()
_Returns a array full of ip's that are currently banned_

__Example__

````js
const bans = socketAntiSpam.getBans()
console.log(bans)   // Returns a array full of ip's that are currently banned
````
###  .ban(data,minutes)
```js
data:       Object / String     //  Can be either socket.ip or a ip in string format you want to ban
minutes:    Number              // Number in minutes how long the ban will be active, if not supplied default will be used (60)
```
_Simply bans a socket or ip_

__Example__ banning a ip in string format

````js
socketAntiSpam.ban('127.0.0.1') // Bye!
````

__Example__ banning a socket, and set ban time for 5 minutes

````js
io.sockets.on('connection', socket => {
    socketAntiSpam.ban(socket, 5)
})
````
###  .unBan(data)
```js
data:   Object / String    //  Can be either socket.ip or a ip in string format you want to unban
```
_Simply unbans a socket or ip_

__Example__ unbanning a ip in string format

````js
socketAntiSpam.unban('127.0.0.1') // He's back!
````

__Example__ unbanning a socket

````js
io.sockets.on('connection', socket => {
    socketAntiSpam.unBan(socket)
})
````

___
# Contact
You can contact me at specamps@gmail.com
