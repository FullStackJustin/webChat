const express = require('express');
const app = express();
const http = require('http');
const httpServer = http.createServer(app);
const { Server } = require('socket.io');
const cors = require('cors');
app.use(cors());
const io = new Server(httpServer, {
    autoConnect: false,
    cors: {
        origin: 'http://localhost:3000',
        methods: ["GET", "POST"]
    }
})
app.get('/', (req, res) => {
    res.send('<p>hola</p>')
})
io.on('connect', (socket) => {
    console.log("user connected:" + socket.id)

    //User disconnected
    try {
        socket.on('disconnect', () => {
            console.log(socket.id + ': disconnected')
        })
    } catch (err) {
        console.log("disconnect error", err)
    }

    //leave a room
    try {
        socket.on("leave-room", (data) => {
            socket.leave(data)
            socket.to(data).emit("User disconnected")
            console.log(data)
        })
    } catch (err) {
        console.log("leave room error:", err)
    }

    //send message to general chat room
    try {
        socket.on("message", (data) => {
            socket.broadcast.emit("receive_message", data)
            console.log(data)
        })
    } catch (err) {
        console.log("main chat message error:", err)
    }

    //Join a room
    try {
        socket.on('join-room', (data) => {
            socket.join(data.room)
            console.log(socket.adapter.rooms)
            console.log(data)
        })
    } catch (err) {
        console.log("Joining room error:", err)
    }
    
    // send message to joined room
    try {
        socket.on("send_msg", (data) => {
            socket.to(data.room).emit("receive_msg", data);
        })
    } catch (err) {
        console.log("private room message error:", err)
    }


})
httpServer.listen(8000, () => {
    console.log('Listening on port 8000')
})