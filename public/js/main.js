
const socket =  io();
const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById('room-name'); 
const userList = document.getElementById('users'); 


// get Username and room name from URL;
const{username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

// join chat room 
socket.emit('joinRoom', {username, room})

// get room and users 
socket.on('roomUsers', ({room, users})=>{
    outputRoomName(room); 
    outputUsers(users); 
})

// msg from server 
socket.on('message', (message)=>{
    // console.log(message)
    outputMessage(message)

    // scroll down to bottom when msg received
    chatMessages.scrollTop = chatMessages.scrollHeight; 
})

// on submit of message 
chatForm.addEventListener('submit', e=>{
    e.preventDefault();
    const msg = e.target.elements.msg.value;
    e.target.elements.msg.value = ""
    e.target.elements.msg.focus()
    // this is for sending the msg to server by using emit
    socket.emit('chatMessage', msg);

})



// output message to dom
function outputMessage(message){
     const div = document.createElement('div');
     div.classList.add('message'); 
     div.innerHTML=`<p className="meta">${message.username}<span>${message.time}</span></p>
     <p className="text"> ${message.text}
     </p>`
    document.querySelector('.chat-messages').appendChild(div);
}


// add room name to DOM 
function outputRoomName(room){
    roomName.innerText = room; 
}


// Add users to DOM
    function outputUsers(users){
        userList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
        `
    }

