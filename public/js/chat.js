// goal: deploy the chat application
// 1. setup git and commit files
//      - ignore node_modules folder
// 2. setup a github repository and push code up
// 3. setup a heroku app and push code up
// 4. open the live app and test your work



const socket = io();

// elements
const $msgForm = document.querySelector('#msg-form');
const $msgFormInput = $msgForm.querySelector('input');
const $msgFormButton = $msgForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');
const $sidebar = document.querySelector('#sidebar');

// templates
const msgTemplate = document.querySelector('#msg-template').innerHTML;
const msgLocationTemplate = document.querySelector('#msg-location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });


// display a message
socket.on('message', (msg) => {
    console.log(msg);

    const html = Mustache.render(msgTemplate, {
        username: msg.username,
        message: msg.text,
        createdAt: moment(msg.createdAt).format('h:mm:ss a')
    });
    $messages.insertAdjacentHTML('beforeend', html);

    autoscroll();
});

// display location message
socket.on('locationMessage', (msg) => {
    console.log('locationMessage', msg);
    const html = Mustache.render(msgLocationTemplate, {
        username: msg.username,
        url: msg.url,
        createdAt: moment(msg.createdAt).format('h:mm:ss a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
});

// updating roomData
socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });
    $sidebar.innerHTML = html;
});

const autoscroll = () => {
    // new message element
    const $newMessage = $messages.lastElementChild;

    // height of new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // visible height
    const visibleHeight = $messages.offsetHeight;

    // height of messages container
    const containerHeight = $messages.scrollHeight;

    // how far have i scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }

};

// send a message
$msgForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // disable the send message button here
    $msgFormButton.setAttribute('disabled', 'disabled');

    const msg = $msgFormInput.value;
    socket.emit('sendMessage', msg, (err) => {

        // re-enable the send message button here
        $msgFormButton.removeAttribute('disabled');
        $msgFormInput.value = '';
        $msgFormInput.focus();

        if (err) {
            return console.log(err);
        }
        console.log('Message delivered');
    });
});

// send location
$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser');
    }

    $sendLocationButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {
        const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        };
        socket.emit('sendLocation', coords, () => {
            $sendLocationButton.removeAttribute('disabled');
            console.log('Location shared!');
        });
    });
});

// on join, checks for error
socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = '/';
    }
});
