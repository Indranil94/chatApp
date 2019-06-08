const getMessage = (text)=>{
    return {
        text,
        createdAt : new Date().getTime()
    }
}

const getLocationMessage = (text)=>{
    return {
        text,
        createdAt : new Date().getTime()
    }
}
module.exports = {
    getMessage,
    getLocationMessage
};