// DOM
const videoGrid = document.querySelector('#video-grid')
const myVideo = document.createElement('video')
myVideo.muted = true

const socket = io('/')
const peer = new Peer(undefined, {
	path: '/peerjs',
	host: '/',
	port: 3030
})

let myVideoStream
navigator.mediaDevices
	.getUserMedia({
		video: true,
		audio: true
	})
	.then((stream) => {
		myVideoStream = stream
		addVideoStream(myVideo, stream)
		peer.on('call', (call) => {
			call.answer(stream)
			const video = document.createElement('video')
			call.on('stream', (userVideoStream) =>
				addVideoStream(video, userVideoStream)
			)
		})
		socket.on('user-connected', (userID) =>
			connectToNewUser(userID, stream)
		)
	})

const connectToNewUser = (userID, stream) => {
	const call = peer.call(userID, stream)
	const video = document.createElement('video')
	call.on('stream', (userVideoStream) => {
		addVideoStream(video, userVideoStream)
	})
}

peer.on('open', (userID) => {
	socket.emit('join-room', roomID, userID)
})

// Helper
const addVideoStream = (video, stream) => {
	video.srcObject = stream
	video.addEventListener('loadedmetadata', () => {
		video.play()
	})
	videoGrid.append(myVideo)
}

// Chat
let msg = $('input')
$('html').keydown((e) => {
	if (e.which === 13 && msg.val().length !== 0) {
		socket.emit('message', msg.val())
		msg.val('')
	}
})

socket.on('createMessage', (data) => {
	$('.messages').append(
		`<li class="message"><b>user</b><br/>${data.message}</li>`
	)
	scrollToBottom()
})

const scrollToBottom = () => {
	const d = $('.main__chat_window')
	d.scrollTop(d.prop('scrollHeight'))
}

// Mute video
const muteUnmute = () => {
	const enabled = myVideoStream.getAudioTracks()[0].enabled
	if (enabled) {
		myVideoStream.getAudioTracks()[0].enabled = false
		setUnmuteButton()
	} else {
		setMuteButton()
		myVideoStream.getAudioTracks()[0].enabled = true
	}
}
const setMuteButton = () => {
	const html = `
		<i class="unmute fas fa-microphone"></i>
		<span>Mute</span>
	`
	document.querySelector('.main__mute_button').innerHTML = html
}

const setUnmuteButton = () => {
	const html = `
		<i class="unmute fas fa-microphone-slash"></i>
		<span>Unmute</span>
	`
	document.querySelector('.main__mute_button').innerHTML = html
}

// Play video
const setPlayStop = () => {
	const enabled = myVideoStream.getVideoTracks()[0].enabled
	if (enabled) {
		myVideoStream.getVideoTracks()[0].enabled = false
		setPlayVideo()
	} else {
		myVideoStream.getVideoTracks()[0].enabled = true
		setStopVideo()
	}
}
const setStopVideo = () => {
	const html = `
		<i class="fas fa-video"></i>
		<span>Stop Video</span>
	`
	document.querySelector('.main__video_button').innerHTML = html
}
const setPlayVideo = () => {
	const html = `
		<i class="stop fas fa-video-slash"></i>
		<span>Play Video</span>
	`
	document.querySelector('.main__video_button').innerHTML = html
}
