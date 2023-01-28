const express = require('express');
const app = express();
const http = require('http');
const httpServer = http.createServer(app);
const { Server } = require('socket.io');
const cors = require('cors');
app.use(cors());
const io = new Server(httpServer,{
    cors:{
        origin:'http://localhost:3001',
        methods: ["GET", "POST"]
    }
})
app.get('/', (req, res) => {
    res.send('<p>hola</p>')
})
io.on('connection', (socket) => {
    console.log("user connected:" + socket.id)
    socket.on('disconnect', ()=>{
        console.log('User disconnected')
    })
    socket.on("message", (data) => {
        socket.broadcast.emit("receive_message", data)
    })
    socket.on('time', (data) => {
        socket.broadcast.emit("time_received", data)
    })
})
httpServer.listen(3000, () => {
    console.log('Listening on port 3000')
})