const express = require('express');
const app = express();

// express랑 websocket이랑 연동을 해야한다.
const http = require('http');
const path = require('path');
const server = http.createServer(app);
const {Server} = require('socket.io');
const { addUser, getUsersInRoom, removeUser, getUser } = require('./utils/users');
const { generateMessage } = require('./utils/messages');
const io = new Server(server)
// 이 과정을 통해서 io를 사용하면 된다.

// 웹에 연결이 되면 소켓을 하나 할당해서 연결한다.
// 그럼 각각의 유저는 소켓 번호를 부여받는다. 유저마다 소켓 번호는 다 다름
io.on('connection', (socket) => {
    console.log('socket', socket.id);

    // options는 클라가 보낸 데이터다.
    socket.on('join', (options, callback) => {
        const {error, user} = addUser({id: socket.id, ...options}) // 이걸 options를 받아서 addUser에 보낸다.

        if (error) {
            // callback이 chat.js에 있는 emit 함수
            return callback(error);
        }

        socket.join(user.room)
        // socket이 방 안에 들어간다.  user.room 안으로 추가되는 소켓

        socket.emit('message', generateMessage('Admin', `${user.room} 방에 오신 걸 환영합니다`));
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username}가 방에 참여했습니다`))

        // user room에 있는 모든 사람에게 보내준다.
        // room 이름과 users 목록을 전달한다. 모든 사용자에게 
        // io 니까 서버 기준으로 함. socket이면 현재 소켓을 기준으로 함
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
    });
    socket.on('sendMessage', (message, callback) => {

        const user = getUser(socket.id);
        
        io.to(user.room).emit('message', generateMessage(user.username, message));
        callback();
    });
    socket.on('disconnect', () => {
        console.log('socket disconnected', socket.id)
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username}가 방을 나갔습니다.`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    });
    
})


// public 폴더 안에 있는 정적 파일들을 제공해주기 위해서는 express static이라는 middleware를 사용한다.
// use가 middleware를 등록한다. 
const publicDirectoryPath = path.join(__dirname, '../public');
app.use(express.static(publicDirectoryPath))

const port = 4000;
server.listen(port, () =>{
    console.log(`Server is up on port ${port}`);
})