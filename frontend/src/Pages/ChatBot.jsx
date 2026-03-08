import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const ChatBot = () => {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketConnection = io("http://localhost:5000/");  // Connect to the backend
    setSocket(socketConnection);

    socketConnection.on("chatResponse", (msg) => {
      setResponse(msg);  // Update the response when a message is received
    });

    return () => {
      socketConnection.disconnect();
    };
  }, []);

  const handleSubmit = () => {
    if (message) {
      socket.emit("chatMessage", message);  // Emit the message to the server
      setMessage("");  // Clear the input after sending
    }
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {response && <div className="message bot">{response}</div>}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask something..."
      />
      <button onClick={handleSubmit}>Send</button>
    </div>
  );
};

export default ChatBot;
