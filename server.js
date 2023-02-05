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
            socket.disconnect()
        })
    } catch (err) {
        console.log("disconnect error", err)
    }

    //Join a room
    try {
        socket.on('join-room', (data) => {
            socket.join(data.room)
            if (!connectedUsers[data.room]) {
                console.log(data, connectedUsers, "no users w that room")
                connectedUsers[data.room] = [];
            }
            // Check if the user is already in the room
            let userCount = connectedUsers[data.room].filter(user => user === data.user).length;
            if (userCount > 0) {
                // If the user is already in the room, add a number to the user name
                data.user = `${data.user}${userCount + 1}`;
            }
            connectedUsers[data.room].push(data.user)
            io.to(data.room).emit("updateUserlog", connectedUsers[data.room]);
        })
    } catch (err) {
        console.log("Joining room error:", err)
    }

    //leave a room
    try {
        socket.on("leave-room", (data) => {
            socket.disconnect()
            socket.to(data.room).emit("User disconnected")
            if (!connectedUsers[data.room]) {
                connectedUsers[data.room] = [];
            }
            var i;
            for (i = 0; i < connectedUsers[data.room].length; i++) {
                const listOfUsers = connectedUsers[data.room][i];
                if (data.user === listOfUsers) {
                    connectedUsers[data.room].splice(i, 1);
                    break;
                }
            }
            io.to(data.room).emit("updateUserlog", connectedUsers[data.room]);
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
            console.log("this is from getConnectedUsers", data, connectedUsers[data.room])
            socket.emit("connectedUsers", connectedUsers[data.room] || []);
        })
    } catch (err) {
        console.log("Get all connections error:" + err)
    }
    try {
        socket.on('typing', (data) => {
            socket.to(data.room).emit('typingResponse', data.message)
        });
    } catch (err) {
        console.log(err)
    }

})
httpServer.listen(8000, () => {
    console.log('Listening on port 8000')
})