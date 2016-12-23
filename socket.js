const redis = require('redis')
const WebSocketServer = require('ws').Server

const REDIS_TOPIC = 'test topic'
let rPub, rSub

const start = (socketPort, index) => {
  // need two clients because once subscribed a channel is in "subscribe" mode and can't publish
  rSub = redis.createClient({ port: 6379 })
  rPub = rSub.duplicate()

  rSub.on('message', (...args) => onRedisMessage(...args, index))
  rSub.subscribe(REDIS_TOPIC)

  const wss = new WebSocketServer({port: socketPort})
  const {host} = wss.options
  wss.on('connection', (ws) => onConnection(ws, socketPort, index, host))
}

const onRedisMessage = (channel, data, socketIndex) => {
  const obj = JSON.parse(data)

  // filter out redis messages originating from this socket
  if (obj.socket !== socketIndex) {
    console.log('# REDIS message: ', channel, data)
  }

}

const onConnection = (ws, port, index, host) => {
  console.log(`# SOCKET connection #${index} on port ${port} of ${host}`)

  ws.on('message', (payload) => {
    try {
      let incomingMessage = JSON.parse(payload)
      console.log('# SOCKET message', incomingMessage)
      echoToRedis(incomingMessage)
    } catch (err) {
      console.log('invalid payload,', err)
    }
  })

  ws.on('close', () => {
    console.log('# SOCKET on close')
  })

  ws.on('error', () => {
    console.log('# SOCKET on error')
  })
}

function echoToRedis(incomingMessage) {
  let payload = JSON.stringify(incomingMessage)
  rPub && rPub.publish(REDIS_TOPIC, payload)
}

module.exports = start
