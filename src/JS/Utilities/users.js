const users = [];

const addUser=({username,id,room})=>{
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    if(!username || !room){
        return {
            error: "Please enter a username and room"
        }
    }

    const existingUser = users.find(user=>{
        return user.room === room && user.username === username;
    })

    if(existingUser){
        return {
            error: "Username already present in room"
        }
    }

    const user = {username,id,room};
    users.push(user);
    return {user};
}

const deleteUser = (id)=>{
    const index = users.findIndex(user=>{
        return user.id === id;
    })

    if(index!=-1){
        return users.splice(index,1)[0];
    }
}

const getUser = (id) =>{
    return users.find(user=> user.id === id );
}

const getUsersInRoom = room =>{
    return users.filter(user=> user.room === room);
}

module.exports = {
    addUser,
    getUser,
    getUsersInRoom,
    deleteUser
}