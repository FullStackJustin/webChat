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
var connectedUsers = [];

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
            socket.disconnect()
            socket.to(data.room).emit("User disconnected")
            var i;
            for (i = 0; i < connectedUsers.length; i++) {
                const listOfUsers = connectedUsers[i];
                if (data.user === listOfUsers) {
                    connectedUsers.splice(i, 1);
                    break;
                }
            }
            io.to(data.room).emit("updateUserlog", connectedUsers);
        })
    } catch (err) {
        console.log("leave room error:", err)
    }

    //send message to general chat room
    try {
        socket.on("message", (data) => {
            socket.broadcast.emit("receive_message", data)
        })
    } catch (err) {
        console.log("main chat message error:", err)
    }

    //Join a room
    try {
        socket.on('join-room', async (data) => {
            socket.join(data.room)
            connectedUsers.push(data.user)
            io.to(data.room).emit("updateUserlog", connectedUsers);
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

    //Get connected users
    try {
        socket.on("getConnectedUsers", (data) => {
            // connectedUsers.push(data)
            console.log(data, connectedUsers)
            socket.emit("connectedUsers", connectedUsers);
        })
    } catch (err) {
        console.log("Get all connections error:" + err)
    }


})
httpServer.listen(8000, () => {
    console.log('Listening on port 8000')
})