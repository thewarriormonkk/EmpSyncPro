import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import io from 'socket.io-client';

const Chat = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { employee } = useAuthContext();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [error, setError] = useState(null);
    const [errorTimeout, setErrorTimeout] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(true);
    const [reconnectAttempt, setReconnectAttempt] = useState(0);
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const targetEmployee = location.state?.targetEmployee;

    // Function to handle errors with auto-dismissal
    const handleError = (errorMessage) => {
        setError(errorMessage);
        if (errorTimeout) {
            clearTimeout(errorTimeout);
        }
        const timeout = setTimeout(() => {
            setError(null);
        }, 5000);
        setErrorTimeout(timeout);
    };

    // Function to initialize socket connection
    const initializeSocket = (token) => {
        try {
            socketRef.current = io('http://localhost:4000', {
                auth: { token },
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                transports: ['websocket']
            });

            socketRef.current.on('connect', () => {
                console.log('Connected to chat server');
                setIsConnected(true);
                setIsConnecting(false);
                setError(null);
                setReconnectAttempt(0);

                // Join the chat room
                socketRef.current.emit('join_chat', {
                    sourceEmail: employee.email,
                    targetEmail: targetEmployee.email
                });
            });

            socketRef.current.on('connect_error', (err) => {
                console.error('Connection error:', err);
                setIsConnected(false);
                setIsConnecting(false);
                handleError(err.message || 'Failed to connect to chat server');

                // Increment reconnection attempt counter
                setReconnectAttempt(prev => prev + 1);
                if (reconnectAttempt >= 5) {
                    handleError('Unable to connect after multiple attempts. Please try again later.');
                }
            });

            socketRef.current.on('error', (err) => {
                console.error('Socket error:', err);
                handleError(err.message || 'Chat error occurred');
            });

            socketRef.current.on('message', (message) => {
                setMessages(prev => [...prev, message]);
            });

            socketRef.current.on('chat_history', (history) => {
                setMessages(history || []);
            });

            socketRef.current.on('disconnect', () => {
                setIsConnected(false);
                setIsConnecting(true);
                handleError('Disconnected from chat server. Attempting to reconnect...');
            });

        } catch (error) {
            console.error('Socket setup error:', error);
            setIsConnected(false);
            setIsConnecting(false);
            handleError('Failed to initialize chat connection');
        }
    };

    useEffect(() => {
        // Don't attempt connection if we don't have necessary data
        if (!targetEmployee || !employee) {
            setIsConnecting(false);
            handleError('Missing required data for chat');
            return;
        }

        // Get the token from local storage to ensure it's the latest
        const storedEmployee = JSON.parse(localStorage.getItem('employee'));
        if (!storedEmployee?.token) {
            setIsConnecting(false);
            handleError('Authentication token not found');
            return;
        }

        setIsConnecting(true);
        setError(null);

        // Initialize socket connection
        initializeSocket(storedEmployee.token);

        // Cleanup on unmount
        return () => {
            if (errorTimeout) {
                clearTimeout(errorTimeout);
            }
            if (socketRef.current) {
                socketRef.current.emit('leave_chat', {
                    sourceEmail: employee.email,
                    targetEmail: targetEmployee.email
                });
                socketRef.current.disconnect();
            }
        };
    }, [employee, targetEmployee, errorTimeout]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !isConnected) return;

        try {
            socketRef.current.emit('send_message', {
                targetEmail: targetEmployee.email,
                content: newMessage.trim()
            });
            setNewMessage('');
        } catch (error) {
            console.error('Send message error:', error);
            handleError('Failed to send message');
        }
    };

    const handleEndChat = () => {
        if (socketRef.current) {
            socketRef.current.disconnect();
        }
        navigate('/employees');
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        const timeString = date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).toLowerCase();

        if (isToday) {
            return timeString;
        } else {
            return `${date.toLocaleDateString([], {
                month: 'short',
                day: 'numeric'
            })} ${timeString}`;
        }
    };

    if (!targetEmployee || !employee) {
        return <div className="chat-error">Invalid chat session</div>;
    }

    return (
        <div className="chat-container">
            <div className="chat-header">
                <div className="chat-header-info">
                    <h2>Chat with {targetEmployee.name}</h2>
                    <p>{targetEmployee.department}</p>
                    {isConnected && <span className="connection-status connected">Connected</span>}
                    {!isConnected && <span className="connection-status disconnected">Disconnected</span>}
                </div>
                <button className="end-chat-btn" onClick={handleEndChat}>
                    <FontAwesomeIcon icon={faTimes} /> End Chat
                </button>
            </div>

            {error && (
                <div className="chat-error" onClick={() => setError(null)}>
                    <span>{error}</span>
                    <small>(Click to dismiss)</small>
                </div>
            )}

            <div className="messages-container">
                {isConnecting ? (
                    <div className="chat-status">
                        Connecting to chat...
                        {reconnectAttempt > 0 && ` (Attempt ${reconnectAttempt}/5)`}
                    </div>
                ) : messages.length === 0 ? (
                    <div className="chat-status">No messages yet. Start the conversation!</div>
                ) : (
                    messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`message ${msg.sourceEmail === employee.email ? 'sent' : 'received'}`}
                        >
                            <p>{msg.content}</p>
                            <small>{formatTimestamp(msg.timestamp)}</small>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="message-form">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={isConnecting ? "Connecting..." : "Type your message..."}
                    disabled={!isConnected || isConnecting}
                />
                <button
                    type="submit"
                    disabled={!isConnected || isConnecting || !newMessage.trim()}
                    className={(!isConnected || isConnecting) ? 'disabled' : ''}
                >
                    <FontAwesomeIcon icon={faPaperPlane} />
                </button>
            </form>
        </div>
    );
};

export default Chat;