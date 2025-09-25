// Add this to your existing server/index.js file

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { handlePrivateMessaging } = require('./socket/privateMessagingHandler');

const app = express();
const server = http.createServer(app);

// Socket.IO setup with CORS
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

// Initialize private messaging handler
handlePrivateMessaging(io);

// Your existing middleware and routes...
app.use(cors());
app.use(express.json());

// Add private messaging routes
const privateMessageRoutes = require('./routes/privateMessageRoutes');
app.use('/api/private-messages', privateMessageRoutes);

// Your existing routes...

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Socket.IO enabled for private messaging`);
});

module.exports = { app, server, io };