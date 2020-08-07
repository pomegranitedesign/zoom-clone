const express = require('express')
const { v4: uuid } = require('uuid')
const { ExpressPeerServer } = require('peer')

const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const peerServer = ExpressPeerServer(server, { debug: true })

// Middlewares / Settings
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use('/peerjs', peerServer)

app.get('/', (req, res) => {
	res.redirect(`/${uuid()}`)
})

app.get('/:roomID', (req, res) => {
	const { roomID } = req.params
	res.render('room', { roomID })
})

// Socket
io.on('connection', (socket) => {
	socket.on('join-room', (roomID, userID) => {
		console.log('New user joined the room', roomID, userID)
		socket.join(roomID)
		socket.to(roomID).broadcast.emit('user-connected', userID)
		socket.on('message', (message) => {
			io.to(roomID).emit('createMessage', { message })
		})
	})
})

server.listen(3030)
