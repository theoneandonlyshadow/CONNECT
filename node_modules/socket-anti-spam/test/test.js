'use strict'

var assert = require('assert')
var assert = require('assert-plus')
var clientIo = require('socket.io-client')
var io = require('socket.io').listen(3000, { log: false })
var SocketAntiSpam = require('../antispam')

var passed = false
var passedBan = false
var disconnected = false
var times = 0
var clientSocket = clientIo.connect('http://127.0.0.1:3000', {
  forceNew: true,
})

const socketAntiSpam = new SocketAntiSpam({
  banTime:            30,     // Ban time in minutes
  kickThreshold:      1,      // User gets kicked after this many spam score
  kickTimesBeforeBan: 1,      // User gets banned after this many kicks
  banning:            true,   // Uses temp IP banning after kickTimesBeforeBan
  io:                 io,     // Bind the socketio variable
})

var authenticateEventWorks = false
socketAntiSpam.event.on('authenticate', function() {
  authenticateEventWorks = true
})

var spamscoreEventWorks = false
socketAntiSpam.event.on('spamscore', function() {
  spamscoreEventWorks = true
})

var kickEventWorks = false
socketAntiSpam.event.on('kick', function() {
  kickEventWorks = true
})

var banEventWorks = false
socketAntiSpam.event.on('ban', function(a,b,c) {
  banEventWorks = true
})

var ip = '::ffff:127.0.0.1'
if (process.version.indexOf('v0.10') > -1)
  ip = '127.0.0.1'

function repeat() {
  if (disconnected) {
    times++
    if (times >= 4) {
      disconnected = true
      return
    }

    clientSocket = clientIo.connect('http://127.0.0.1:3000', {
      forceNew: true,
    })

    clientSocket.on('connect', function() {
      disconnected = false
    })

    clientSocket.on('reconnect', function() {
      disconnected = false
    })

    clientSocket.on('disconnect', function() {
      disconnected = true
    })

    disconnected = false
    return
  }

  clientSocket.emit('spamming', { some: 'data' })
  setTimeout(function() { repeat() }, 250)
}

clientSocket.on('connect', function() {
  disconnected = false
})

clientSocket.on('reconnect', function() {
  disconnected = false
})

clientSocket.on('disconnect', function() {
  disconnected = true
})

var canSpam = false
io.sockets.on('connection', function(socket) {
  socket.on('spamming', function() {
    if (canSpam)
      socket.emit('spamscore', null)
  })
})



describe('Ban system', function() {
  this.timeout(3000)
  it('Wait 2000ms for lastInteract', function(done) {
    setTimeout(function(done) {
      console.log(socketAntiSpam.getBans())
      done()
    }, 2000, done)
  })

  it('Connect to the webserver, spam socket.emits and get disconnect/kicked', function(done) {
    canSpam = true
    var spammerino = setInterval(function() {
      repeat()
      if (!disconnected)
        return
      clearInterval(spammerino)
      done()
    }, 1)
  })

  it('Get Banned', function(done) {
    var spammerino = setInterval(function() {
      repeat()
      if (!disconnected)
        return
      clearInterval(spammerino)
      done()
    }, 1)
  })

  it('Confirm ban', function(done) {
    socketAntiSpam.getBans().then(bans => {
      assert.equal(bans[0].ip, ip)
      done()
    })
  })

  it('unBan ip', function(done) {
    socketAntiSpam.unBan(ip)
    socketAntiSpam.getBans().then(bans => {
      assert.equal(bans.length, 0)
      done()
    })
  })

  it('ban ip', function(done) {
    socketAntiSpam.ban(ip)
    socketAntiSpam.getBans().then(bans => {
      assert.equal(bans[0].ip, ip)
      done()
    })
  })

  it('ban ip for 1 ms', function(done) {
    socketAntiSpam.unBan(ip)
    socketAntiSpam.ban(ip, 0.000000001)
    socketAntiSpam.getBans().then(bans => {
      assert.equal(bans[0].ip, ip)
      done()
    })
  })
})

describe('Init function', function() {
  this.timeout(3000)
  it('Call constructor', function() {
    const socketAntiSpam = new SocketAntiSpam({
      banTime: 30,            // Ban time in minutes
      kickThreshold: 2,       // User gets kicked after this many spam score
      kickTimesBeforeBan: 1,  // User gets banned after this many kicks
      banning: true,          // Uses temp IP banning after kickTimesBeforeBan
      io: io,                  // Bind the socketio variable
    })
  })

  it('Call constructor with only banTime', function() {
    const socketAntiSpam = new SocketAntiSpam({
      banTime: 30,            // Ban time in minutes
    })
  })

  it('Call constructor with only kickThreshold', function() {
    const socketAntiSpam = new SocketAntiSpam({
      kickThreshold: 2,       // User gets kicked after this many spam score
    })
  })

  it('Call constructor with only kickTimesBeforeBan', function() {
    const socketAntiSpam = new SocketAntiSpam({
      kickTimesBeforeBan: 1,   // User gets banned after this many kicks
    })
  })
})

describe('Events', function() {
  it('Authenticate', function() {
    assert.equal(authenticateEventWorks, true)
  })

  it('Ban', function() {
    assert.equal(banEventWorks, true)
  })

  it('Kick', function() {
    assert.equal(kickEventWorks, true)
  })

  it('Spamscore', function() {
    assert.equal(spamscoreEventWorks, true)
  })
})

describe('Error Handling', function() {
  this.timeout(1000)
  it('Call authentication without a socket', function(done) {
      socketAntiSpam.authenticate('test').catch(e => {
        done()
      })
  })

  it('Call ban without options', function(done) {
    socketAntiSpam.ban().catch(e => {
      assert.throws(function() {
        throw new Error(e)
      }, Error)
      done()
    })
  })

  it('Call unban without options', function(done) {
    socketAntiSpam.unBan().catch(e => {
      assert.throws(function() {
        throw new Error(e)
      }, Error)
      done()
    })
  })

  it('Call addSpam without a socket variable', function(done) {
    socketAntiSpam.addSpam().catch(e => {
      assert.throws(function() {
        throw new Error(e)
      }, Error)
      done()
    })
  })

  it('Call ban with a non existing ip', function(done) {
    socketAntiSpam.ban({
      ip: 'kappa',
    }).catch(e => {
      assert.throws(function() {
        throw new Error(e)
      }, Error)
      done()
    })
  })

  it('Call unban with a non existing ip', function(done) {
    socketAntiSpam.unBan({
      ip: 'kappa',
    }).catch(e => {
      assert.throws(function() {
        throw new Error(e)
      }, Error)
      done()
    })
  })
})
