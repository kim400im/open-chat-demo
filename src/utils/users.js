const users = [];

const addUser = ({id, username, room}) => {
    username = username.trim();
    room = room.trim();

    if(!username || !room){
        return {
            error : '사용자 이름과 방이 필요합니다.'
        }
    }
    // const existingUser = users.find((user) => {
    //     return user.room === room && user.username === username
    // })
    // if (existingUser) {
    //     return {
    //         error: '사용자 이름이 사용 중입니다.'
    //     }
    // }

    const user = {id, username, room}
    users.push(user);
    return {user}
}

const getUsersInRoom = (room) => {
    room = room.trim();

    return users.filter(user => user.room === room);
}

const getUser = (id) => {
    return users.find(user => user.id === id);
}

const removeUser = (id) => {
    // 배열 안에 해당하는게 없으면 -1을 반환한다. 
    const index = users.findIndex((user) => user.id === id);

    if(index !== -1){
        return users.splice(index, 1)[0];
        // return 값이 socket.on('disconnect')에서 user로 간다. 
    }
}

module.exports = {
    addUser,
    getUsersInRoom,
    getUser,
    removeUser
}