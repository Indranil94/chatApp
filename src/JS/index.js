const path = require('path');
const express = require('express');
const util = require('./Utilities/utilities')
const http = require('http');
const app = express();
const socketIo = require('socket.io');
const Filter = require('bad-words');
const users = require('./Utilities/users')

const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 3000;

const publicDirPath = path.join(__dirname,'../../public')
app.use(express.static(publicDirPath));
let count =0;
io.on('connection',(socket)=>{
    console.log("Web socket connected");

    socket.on('join',({username,room},callback)=>{
        const {user,error} = users.addUser({username,room,id: socket.id});
        if(error){
            return callback(error);
        }

        socket.join(user.room);


        socket.emit('message',{
            msg: util.getMessage('Welcome!'),
            username:'Admin'
        });
        socket.broadcast.to(user.room).emit("message",{
            msg: util.getMessage(`${user.username} has joined`),
            username: 'Admin'
        });
        const userList = users.getUsersInRoom(user.room); 
        io.to(user.room).emit('room-data',{room: user.room,userList});
    })
    
    socket.on('comm',(msg,callback)=>{
        const user = users.getUser(socket.id);
        if(user){
            const filter = new Filter();
            if(filter.isProfane(msg)){
                return callback("No Profane words allowed")
            }
            io.to(user.room).emit('message',{
                msg: util.getMessage(msg),
                username :user.username
            });
            callback("Delivered");
        }
        else{
            callback("Delivery failed");
        }
        
    })

    socket.on('location',(data,callback)=>{
        const user = users.getUser(socket.id);
        if(user){
            io.to(user.room).emit("locationMessage",{
                location: util.getLocationMessage(data),
                username: user.username    
            });
            callback("Message delivered")
        }
        else{
            callback("Delivery failed")
        }

    })

    socket.on("disconnect",()=>{
        const user = users.deleteUser(socket.id);
        if(user){
            io.to(user.room).emit("message",{
                msg: util.getMessage(`${user.username} has left the room`),
                username: 'Admin'
            });
            const userList = users.getUsersInRoom(user.room); 
            io.to(user.room).emit('room-data',{room: user.room,userList});
        }
        
    })

    // socket.emit("countUpdated",count);

    // socket.on('increment',()=>{
    //     count++;
    //     //socket.emit("countUpdated",count);
    //     io.emit("countUpdated",count);
    // })
})

server.listen(PORT,()=>{
    console.log('Running on port '+PORT)
})