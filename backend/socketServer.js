const jwt = require('jsonwebtoken');

// In-memory storage for active chats
const activeChats = new Map();

function createRoomName(email1, email2) {
    return [email1, email2].sort().join('_');
}

function setupSocketServer(io) {
    // Store active connections
    const activeConnections = new Map();

    // Middleware to authenticate socket connections
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication token required'));
            }

            const decoded = jwt.verify(token, process.env.SECRET);
            if (!decoded._id || !decoded.email) {
                return next(new Error('Invalid token format'));
            }

            socket.employeeId = decoded._id;
            socket.employeeEmail = decoded.email;
            next();
        } catch (error) {
            console.error('Socket authentication error:', error);
            if (error.name === 'TokenExpiredError') {
                next(new Error('Token expired'));
            } else if (error.name === 'JsonWebTokenError') {
                next(new Error('Invalid token'));
            } else {
                next(new Error('Authentication failed'));
            }
        }
    });

    io.on('connection', (socket) => {
        console.log('New connection:', socket.employeeEmail);

        // Store the connection
        activeConnections.set(socket.employeeEmail, socket);

        // Handle joining a chat
        socket.on('join_chat', ({ sourceEmail, targetEmail }) => {
            try {
                // Validate emails
                if (!sourceEmail || !targetEmail) {
                    throw new Error('Invalid email addresses');
                }

                // Verify that sourceEmail matches the authenticated user
                if (sourceEmail !== socket.employeeEmail) {
                    throw new Error('Unauthorized: Email mismatch');
                }

                const roomName = createRoomName(sourceEmail, targetEmail);
                socket.join(roomName);

                // Initialize chat history for the room if it doesn't exist
                if (!activeChats.has(roomName)) {
                    activeChats.set(roomName, []);
                }

                // Send existing chat history for the room
                socket.emit('chat_history', activeChats.get(roomName));

            } catch (error) {
                console.error('Join chat error:', error);
                socket.emit('error', {
                    message: error.message || 'Failed to join chat',
                    details: process.env.NODE_ENV === 'development' ? error.stack : undefined
                });
            }
        });

        // Handle sending messages
        socket.on('send_message', (messageData) => {
            try {
                // Validate the message
                if (!messageData.content || !messageData.targetEmail) {
                    throw new Error('Message content and target email are required');
                }

                // Validate sender is authenticated
                if (!socket.employeeEmail) {
                    throw new Error('Not authenticated');
                }

                const roomName = createRoomName(socket.employeeEmail, messageData.targetEmail);

                // Create message object
                const message = {
                    sourceEmail: socket.employeeEmail,
                    targetEmail: messageData.targetEmail,
                    content: messageData.content,
                    timestamp: new Date()
                };

                // Store message in memory
                if (!activeChats.has(roomName)) {
                    activeChats.set(roomName, []);
                }
                activeChats.get(roomName).push(message);

                // Broadcast the message to the room
                io.to(roomName).emit('message', message);

            } catch (error) {
                console.error('Message sending error:', error);
                socket.emit('error', {
                    message: error.message || 'Failed to send message',
                    details: process.env.NODE_ENV === 'development' ? error.stack : undefined
                });
            }
        });

        // Handle leaving chat
        socket.on('leave_chat', ({ sourceEmail, targetEmail }) => {
            try {
                if (!sourceEmail || !targetEmail) {
                    throw new Error('Invalid email addresses');
                }
                // Verify that sourceEmail matches the authenticated user
                if (sourceEmail !== socket.employeeEmail) {
                    throw new Error('Unauthorized: Email mismatch');
                }
                const roomName = createRoomName(sourceEmail, targetEmail);
                socket.leave(roomName);

                // Clear chat history when both users have left
                const room = io.sockets.adapter.rooms.get(roomName);
                if (!room || room.size === 0) {
                    activeChats.delete(roomName);
                }
            } catch (error) {
                console.error('Leave chat error:', error);
                socket.emit('error', {
                    message: error.message || 'Failed to leave chat',
                    details: process.env.NODE_ENV === 'development' ? error.stack : undefined
                });
            }
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('Disconnected:', socket.employeeEmail);
            activeConnections.delete(socket.employeeEmail);

            // Clean up any empty rooms this user was in
            for (const [roomName, messages] of activeChats.entries()) {
                const room = io.sockets.adapter.rooms.get(roomName);
                if (!room || room.size === 0) {
                    activeChats.delete(roomName);
                }
            }
        });

        // Handle errors
        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });
    });
}

module.exports = setupSocketServer; 