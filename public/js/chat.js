const socket = io();

const $sendButton = document.getElementById('send');
const $locationButton = document.querySelector('#sendLocation');
const $input = document.querySelector('input');
const $messages = document.querySelector('#messages');
const $sidebar = document.querySelector("#chat-sidebar");

const $messageTemplate = document.querySelector("#message-template").innerHTML;
const $locationMessageTemplate = document.querySelector("#location-message-template").innerHTML;
const $sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;
const {username,room} = Qs.parse(location.search, {ignoreQueryPrefix: true});

let val = '';

socket.emit('join',{username,room},(error)=>{
    alert(error);
    location.href='/';
});

const autoScroll = ()=>{
    const $newMessage = $messages.lastElementChild;

    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = newMessageMargin+$newMessage.offsetHeight;

    const visibleHeight = $messages.offsetHeight;

    const containerHeight = $messages.scrollHeight;

    const scrollOffset = $messages.scrollTop + visibleHeight;

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight;
    }
}

socket.on('message',({msg,username})=>{
    const html = Mustache.render($messageTemplate,{
        message: msg.text,
        username: username,
        createdAt : moment(msg.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html);
    autoScroll();
})


socket.on('locationMessage',({location,username})=>{
    const html = Mustache.render($locationMessageTemplate,{
        username: username,
        location: location.text,
        createdAt: moment(location.createdAt).format("h:mm a")
    })
    $messages.insertAdjacentHTML('beforeend',html);
    autoScroll();
})

socket.on('room-data',({userList,room})=>{
    const html = Mustache.render($sidebarTemplate,{
        room,
        userList
    })
    $sidebar.innerHTML = html;
})

$input.addEventListener('change',(event)=>{
    val = event.target.value;
})

$sendButton.addEventListener('click',()=>{
    if(val){
        $sendButton.setAttribute('disabled','disabled');
        $input.value = "";
        $input.focus();
        socket.emit('comm',val,(ack)=>{
            $sendButton.removeAttribute('disabled');
            console.log("Message",ack);
        });
        val = "";
    }

})

$locationButton.addEventListener('click',()=>{
    $locationButton.setAttribute("disabled","disabled");
    if(!navigator.geolocation){
        alert("Your browser does not support geolocation");
    }
    else{
        navigator.geolocation.getCurrentPosition(position=>{
            socket.emit("location",`https://google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`,(ack)=>{
                console.log("Location received");
                $locationButton.removeAttribute('disabled');
            });
        })
    }
})
// socket.on('countUpdated',count=>{
//     console.log("Updated Count value: ",count);
// })

// document.querySelector('button').addEventListener('click',()=>{
//     console.log('CLicked');
//     socket.emit('increment');
// })