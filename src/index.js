const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');


const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicPath = path.join(__dirname, '../public');

app.use(express.static(publicPath));


// hmm, it seems like all event listeners are placed inside this io.on(connection) block;
io.on('connection', (socket) => {
    // announce new connection
    console.log('new websocket connection')

    // a user joins the room: listen for 'join' event
    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options });

        if (error) {
            return callback(error);
        }

        // let the user join the room they entered
        socket.join(user.room);

        // welcome message to new connection
        socket.emit('message', generateMessage('Admin', `Welcome to ${user.room}!`));

        // broadcast new connection
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`));

        // send roomData when a user joins
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });

        callback();
    });

    // a user sends a message: listen for messages being sent
    socket.on('sendMessage', (msg, callback) => {

        const user = getUser(socket.id);

        const filter = new Filter();
        if (filter.isProfane(msg)) {
            return callback('Profanity is not allowed');
        }

        io.to(user.room).emit('message', generateMessage(user.username, msg));
        callback();
    });
 
    // a user sends location data: broadcast new location
    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, coords));
        callback();

    });

    // a user leaves the room: broadcast a disconnect
    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin' ,`${user.username} has left the room`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            });
        }
        
    });
});


server.listen(port, () => {
    console.log(`Server is up on port ${port}!`);
});


