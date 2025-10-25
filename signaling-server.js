const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Enable CORS for all origins (adjust in production)
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  credentials: true
}));

const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Store active calls and users
const activeCalls = new Map(); // callId -> { caller, receiver, participants: Set }
const userSockets = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Register user
  socket.on('register', (userId) => {
    userSockets.set(userId, socket.id);
    socket.userId = userId;
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  // Join call room
  socket.on('join_room', (data) => {
    const { room } = data;
    socket.join(room);
    console.log(`User ${socket.userId} joined room: ${room}`);

    // If this is a new call room, initialize it
    if (!activeCalls.has(room)) {
      activeCalls.set(room, {
        participants: new Set(),
        caller: socket.userId,
        receiver: null
      });
    }

    // Add participant to call
    activeCalls.get(room).participants.add(socket.userId);
  });

  // Leave call room
  socket.on('leave_room', (data) => {
    const { room } = data;
    socket.leave(room);
    console.log(`User ${socket.userId} left room: ${room}`);

    // Remove participant from call
    if (activeCalls.has(room)) {
      activeCalls.get(room).participants.delete(socket.userId);

      // If no participants left, clean up the call
      if (activeCalls.get(room).participants.size === 0) {
        activeCalls.delete(room);
      }
    }
  });

  // Handle WebRTC offer
  socket.on('offer', (data) => {
    const { room, offer } = data;
    console.log(`Received offer in room ${room} from ${socket.userId}`);

    // Send offer to other participants in the room
    socket.to(room).emit('offer', { offer, from: socket.userId });
  });

  // Handle WebRTC answer
  socket.on('answer', (data) => {
    const { room, answer } = data;
    console.log(`Received answer in room ${room} from ${socket.userId}`);

    // Send answer to other participants in the room
    socket.to(room).emit('answer', { answer, from: socket.userId });
  });

  // Handle ICE candidates
  socket.on('ice_candidate', (data) => {
    const { room, candidate } = data;
    console.log(`Received ICE candidate in room ${room} from ${socket.userId}`);

    // Send ICE candidate to other participants in the room
    socket.to(room).emit('ice_candidate', { candidate, from: socket.userId });
  });

  // Handle call initiation
  socket.on('start_call', (data) => {
    const { callerId, receiverId, callType, roomId } = data;
    console.log(`Call started: ${callerId} -> ${receiverId}, type: ${callType}, room: ${roomId}`);

    // Notify receiver
    const receiverSocketId = userSockets.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('incoming_call', {
        callerId,
        receiverId,
        callType,
        roomId
      });
    }
  });

  // Handle call acceptance
  socket.on('accept_call', (data) => {
    const { roomId } = data;
    console.log(`Call accepted in room: ${roomId}`);

    // Notify all participants in the room
    io.to(roomId).emit('call_accepted', { roomId });
  });

  // Handle call rejection
  socket.on('reject_call', (data) => {
    const { roomId, rejectedBy } = data;
    console.log(`Call rejected in room: ${roomId} by ${rejectedBy}`);

    // Notify all participants in the room
    io.to(roomId).emit('call_rejected', { roomId, rejectedBy });
  });

  // Handle call end
  socket.on('end_call', (data) => {
    const { roomId, endedBy } = data;
    console.log(`Call ended in room: ${roomId} by ${endedBy}`);

    // Notify all participants in the room
    io.to(roomId).emit('call_ended', { roomId, endedBy });

    // Clean up call
    activeCalls.delete(roomId);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    // Remove from userSockets
    if (socket.userId) {
      userSockets.delete(socket.userId);
    }

    // Clean up any calls this user was in
    for (const [roomId, callData] of activeCalls.entries()) {
      if (callData.participants.has(socket.userId)) {
        callData.participants.delete(socket.userId);

        // Notify other participants
        socket.to(roomId).emit('participant_left', {
          roomId,
          userId: socket.userId
        });

        // If no participants left, clean up the call
        if (callData.participants.size === 0) {
          activeCalls.delete(roomId);
        }
      }
    }
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down signaling server...');
  server.close(() => {
    console.log('Signaling server shut down');
    process.exit(0);
  });
});
