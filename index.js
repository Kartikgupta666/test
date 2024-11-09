const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let rooms = {}; // Store room users

// Serve static files (optional, for frontend)
app.use(express.static('public'));

// Handle socket connections
io.on('connection', (socket) => {
    console.log('A user connected: ' + socket.id);

    // When a user joins a room
    socket.on('join-room', (roomId, peerId) => {
        if (!rooms[roomId]) {
            rooms[roomId] = [];
        }
        rooms[roomId].push(peerId);
        console.log(`User ${peerId} joined room ${roomId}`);

        // Notify all users in the room about the new user
        socket.to(roomId).emit('room-users', rooms[roomId]);

        // When user leaves the room
        socket.on('disconnect', () => {
            rooms[roomId] = rooms[roomId].filter(id => id !== peerId);
            console.log(`User ${peerId} left room ${roomId}`);
            socket.to(roomId).emit('room-users', rooms[roomId]);
        });
    });

    // Broadcast to the room when users leave
    socket.on('disconnect', () => {
        console.log('User disconnected: ' + socket.id);
    });
});

// Start server
server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
