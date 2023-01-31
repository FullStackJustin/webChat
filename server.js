const express = require('express');
const app = express();
const http = require('http');
const httpServer = http.createServer(app);
const { Server } = require('socket.io');
const cors = require('cors');
app.use(cors());
const io = new Server(httpServer,{
    autoConnect: false,
    cors:{
        origin:'http://localhost:3001',
        methods: ["GET", "POST"]
    }
})
app.get('/', (req, res) => {
    res.send('<p>hola</p>')
})
io.on('connect', (socket) => {
    console.log("user connected:" + socket.id)
    socket.on('disconnect', ()=>{
        console.log(socket.id + ': disconnected')
    })
    socket.on("leave-room", (data) => {
        socket.disconnect()
        socket.to(data).emit("User disconnected")
        console.log(data)
    })
    socket.on("message", (data) => {
        socket.broadcast.emit("receive_message", data)
        console.log(data)
    })
    socket.on('join-room', (data) => {
        socket.join(data.room)
        console.log(socket.adapter.rooms)
        console.log(data)
    })
    socket.on("send_msg", (data) => {
        socket.to(data.room).emit("receive_msg", data);
    })

    
})
httpServer.listen(3000, () => {
    console.log('Listening on port 3000')
})