const messages = [];

function handleSocketConnection(socket) {
    let username = null;

    // Handle user joining the chat
    socket.on('join', (user) => {
        username = user;
        socket.emit('chat history', messages);
        socket.broadcast.emit('user joined', username);
    });

    // Handle chat messages
    socket.on('chat message', (msg) => {
        if (username) {
            const message = { 
                username, 
                text: msg.text, 
                fileType: msg.fileType, 
                fileData: msg.fileData, 
                timestamp: new Date() 
            };
            messages.push(message);
            socket.broadcast.emit('chat message', message);
        }
    });

    // Handle typing event
    socket.on('typing', () => {
        if (username) {
            socket.broadcast.emit('typing', username);
        }
    });

    // Handle stop typing event
    socket.on('stop typing', () => {
        if (username) {
            socket.broadcast.emit('stop typing', username);
        }
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
        if (username) {
            socket.broadcast.emit('user left', username);
        }
    });
}

module.exports = { handleSocketConnection };
