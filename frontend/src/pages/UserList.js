import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments, faSearch } from "@fortawesome/free-solid-svg-icons";
import { io } from "socket.io-client";
import '../styles/UserList.css';
import '../styles/Chat.css';
import '../styles/Auth.css';

const UserList = () => {
    const [users, setUsers] = useState(null);
    const [filteredUsers, setFilteredUsers] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [unreadCounts, setUnreadCounts] = useState({});
    const [socket, setSocket] = useState(null);
    const { user } = useAuthContext();

    useEffect(() => {
        const fetchUsers = async () => {
            const url = "http://localhost:4000/api/user/list";
            const response = await fetch(url);
            const data = await response.json();
            const filteredData = data.filter(u => u.email !== user?.email);
            setUsers(filteredData);
            setFilteredUsers(filteredData);
        };

        if (user) {
            fetchUsers();
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            // Connect to WebSocket server
            const newSocket = io("http://localhost:4000");
            setSocket(newSocket);

            // Register user
            newSocket.emit("register", user.email);

            // Get initial unread message counts
            newSocket.emit("get_unread_messages", { userEmail: user.email });

            // Listen for unread message updates
            newSocket.on("unread_messages_update", ({ from, count }) => {
                setUnreadCounts(prev => ({
                    ...prev,
                    [from]: count
                }));
            });

            // Listen for initial unread counts
            newSocket.on("unread_messages_counts", (counts) => {
                setUnreadCounts(counts);
            });

            return () => {
                newSocket.close();
            };
        }
    }, [user]);

    // Handle search
    useEffect(() => {
        if (users) {
            const filtered = users.filter(userItem =>
                userItem.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredUsers(filtered);
        }
    }, [searchTerm, users]);

    return (
        <div className="user-list-container">
            <h2>Available Users</h2>

            {/* Search Box */}
            <div className="search-box">
                <FontAwesomeIcon icon={faSearch} className="search-icon" />
                <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Users Stack */}
            <div className="users-stack">
                {filteredUsers && filteredUsers.map((userItem) => (
                    <div key={userItem.email} className="user-card">
                        <div className="user-info">
                            <div className="user-avatar">
                                {userItem.email[0].toUpperCase()}
                            </div>
                            <h3>{userItem.email}</h3>
                        </div>
                        <Link
                            to="/chat"
                            state={{ targetEmail: userItem.email }}
                            className="chat-link"
                            title="Start chat"
                        >
                            <div className="chat-icon-container">
                                <FontAwesomeIcon icon={faComments} />
                                {unreadCounts[userItem.email] > 0 && (
                                    <span className="unread-count">
                                        {unreadCounts[userItem.email]}
                                    </span>
                                )}
                            </div>
                        </Link>
                    </div>
                ))}
                {filteredUsers && filteredUsers.length === 0 && (
                    <div className="no-results">
                        No users found matching "{searchTerm}"
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserList;