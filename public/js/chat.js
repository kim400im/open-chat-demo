const socket = io();

console.log(socket);

const query = new URLSearchParams(location.search);

const username = query.get('username');

const room = query.get('room'); 
//  주소에서 추출한다.


// emit으로 보내고 on으로 받는다.
// {username, room}, (error) 가 index.js의 socket.on 안으로 들어간다. 
socket.emit('join',{username, room}, (error) => {
    if (error){
        alert(error);
        location.href='/'; 
    }
})

const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// index.js에 io.to를 보면 된다. 거기서 정보가 날아온다.
socket.on('roomData', ({room, users}) => {
    // mustache를 이용해서 html을 생성
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })

    document.querySelector('#sidebar').innerHTML = html;
})

const messages = document.querySelector('#messages');

const messageTemplate = document.querySelector('#message-template').innerHTML
socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })

    messages.insertAdjacentHTML('beforeend', html);
    scrollBottom();
})

function scrollBottom(){
    messages.scrollTop = messages.scrollHeight;
}

const messageForm = document.querySelector('#message-form');
const messageFormInput = messageForm.querySelector('input');
const messageFormButton = messageForm.querySelector('button');

// event가 발생했을 떄 event를 가져오고
messageForm.addEventListener('submit', (e) => {
    // 페이지가 refresh 되지 않도록 한다. 
    e.preventDefault();

    // 메시지를 보낸 후 전송 버튼을 다시 못 누르도록 diable 시킴
    messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value;

    socket.emit('sendMessage', message, (error) =>{
        messageFormButton.removeAttribute('disabled'); // 다시 누를 수 있게 설정
        messageFormInput.value = '';
        messageFormInput.focus();

        if(error) {
            return console.log(error);
        }
    })
})