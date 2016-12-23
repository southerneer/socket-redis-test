// create a client connection to the socket server
// send messages at intervals
const WebSocket = require('ws')
const socket = require('./socket.js')
const ports = [3007,3008,3009]
const messageInterval = 2000

// start the two socket servers
ports.forEach((port,i) => socket(port, i))

// now ping messages back and forth between the servers
ports.forEach((port,index) => {
  const ws = new WebSocket(`ws://0.0.0.0:${port}`)

  ws.on('open', () => {
    console.log('# SOCKET open:', index)
    let i = 0

    setInterval(() => {
      const payload = {counter: i, socket: index}
      ws.send(JSON.stringify(payload))
      // console.log('sent')
      i++
    }, messageInterval)
  })
})
