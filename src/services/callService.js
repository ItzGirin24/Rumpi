import io from 'socket.io-client';
import { db, auth } from '../firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  getDoc,
  deleteDoc
} from 'firebase/firestore';

// Collection names
const CALLS_COLLECTION = 'calls';

// Call states
export const CALL_STATES = {
  RINGING: 'ringing',
  CONNECTED: 'connected',
  ENDED: 'ended',
  MISSED: 'missed'
};

// Call types
export const CALL_TYPES = {
  AUDIO: 'audio',
  VIDEO: 'video'
};

// Socket.IO instance
let socket = null;

// WebRTC variables
let localStream = null;
let remoteStream = null;
let peerConnection = null;
let currentRoomId = null;

// STUN/TURN servers for WebRTC
const iceServers = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]
};

// Initialize Socket.IO
export const initializeSocket = (userId) => {
  if (socket) {
    socket.disconnect();
  }

  // Connect to the signaling server
  const serverUrl = 'http://localhost:8000';
  
  socket = io(serverUrl, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  });

  socket.on('connect', () => {
    console.log('Connected to signaling server');
    // Register user when connected
    socket.emit('register', userId);
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from signaling server');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  // Handle incoming calls
  socket.on('incoming_call', (data) => {
    console.log('Incoming call received via socket:', data);
  });

  // Handle call accepted
  socket.on('call_accepted', (data) => {
    console.log('Call accepted:', data);
    if (data.roomId) {
      joinCallRoom(data.roomId);
    }
  });

  // Handle call rejected
  socket.on('call_rejected', (data) => {
    console.log('Call rejected:', data);
  });

  // Handle call ended
  socket.on('call_ended', (data) => {
    console.log('Call ended:', data);
  });

  // Handle WebRTC signaling - OFFER
  socket.on('offer', async (data) => {
    console.log('Received offer:', data);
    // The CallModal will handle this through its own listener
    window.dispatchEvent(new CustomEvent('webrtc-offer', { detail: data }));
  });

  // Handle WebRTC signaling - ANSWER
  socket.on('answer', async (data) => {
    console.log('Received answer:', data);
    window.dispatchEvent(new CustomEvent('webrtc-answer', { detail: data }));
  });

  // Handle WebRTC signaling - ICE CANDIDATE
  socket.on('ice_candidate', async (data) => {
    console.log('Received ICE candidate:', data);
    window.dispatchEvent(new CustomEvent('webrtc-ice-candidate', { detail: data }));
  });

  // Handle participant joined
  socket.on('participant_joined', (data) => {
    console.log('Participant joined:', data);
  });

  // Handle participant left
  socket.on('participant_left', (data) => {
    console.log('Participant left:', data);
    window.dispatchEvent(new CustomEvent('webrtc-participant-left', { detail: data }));
  });

  return socket;
};

// Join a call room
const joinCallRoom = (roomId) => {
  if (socket && roomId) {
    socket.emit('join_room', { room: roomId });
    currentRoomId = roomId;
    console.log('Joined call room:', roomId);
  }
};

// Leave a call room
const leaveCallRoom = (roomId) => {
  if (socket && roomId) {
    socket.emit('leave_room', { room: roomId });
    console.log('Left call room:', roomId);
  }
};

// Get current socket instance
export const getSocket = () => socket;

// Get current room ID
export const getCurrentRoomId = () => currentRoomId;

// Create peer connection
export const createPeerConnection = (onRemoteStream) => {
  try {
    peerConnection = new RTCPeerConnection(iceServers);

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      console.log('Remote track received:', event.streams[0]);
      remoteStream = event.streams[0];
      if (onRemoteStream) {
        onRemoteStream(remoteStream);
      }
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socket && currentRoomId) {
        socket.emit('ice_candidate', {
          room: currentRoomId,
          candidate: event.candidate
        });
      }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log('Peer connection state:', peerConnection.connectionState);
    };

    // Handle ICE connection state changes
    peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', peerConnection.iceConnectionState);
    };

    return peerConnection;
  } catch (error) {
    console.error('Error creating peer connection:', error);
    return null;
  }
};

// Add local stream to peer connection
export const addLocalStreamToPeerConnection = (stream) => {
  if (peerConnection && stream) {
    stream.getTracks().forEach(track => {
      peerConnection.addTrack(track, stream);
    });
    console.log('Local stream added to peer connection');
  }
};

// Get local stream
export const getLocalStream = () => localStream;

// Get remote stream
export const getRemoteStream = () => remoteStream;

// Get peer connection
export const getPeerConnection = () => peerConnection;

// Initialize local media stream
export const initializeLocalStream = async (callType) => {
  try {
    const constraints = {
      audio: true,
      video: callType === 'video' ? { width: 640, height: 480, facingMode: 'user' } : false
    };

    localStream = await navigator.mediaDevices.getUserMedia(constraints);
    console.log('Local stream initialized');
    return localStream;
  } catch (error) {
    console.error('Error initializing local stream:', error);
    throw error;
  }
};

// Close peer connection and streams
export const closePeerConnection = () => {
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
    console.log('Peer connection closed');
  }
};

// Stop local stream
export const stopLocalStream = () => {
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    localStream = null;
    console.log('Local stream stopped');
  }
};

// Start a call
export const startCall = async (callerId, receiverId, callType) => {
  try {
    if (!socket) {
      throw new Error('Socket not initialized');
    }

    console.log('Starting call from', callerId, 'to', receiverId, 'type:', callType);

    // Create unique room ID
    const roomId = `call-${callerId}-${receiverId}-${Date.now()}`;
    currentRoomId = roomId;

    // Create call data for tracking in Firestore
    const callData = {
      callerId,
      receiverId,
      callType,
      state: CALL_STATES.RINGING,
      startTime: new Date(),
      roomId: roomId
    };

    // Save call to Firestore
    const docRef = await addDoc(collection(db, CALLS_COLLECTION), callData);
    console.log('Call saved to Firestore with ID:', docRef.id);

    // Notify receiver about incoming call through socket
    socket.emit('start_call', {
      callerId,
      receiverId,
      callType,
      roomId,
      callId: docRef.id
    });

    // Join the call room immediately
    joinCallRoom(roomId);

    return { id: docRef.id, ...callData };
  } catch (error) {
    console.error('Error starting call:', error);
    throw error;
  }
};

// Accept a call
export const acceptCall = async (callId, roomId) => {
  try {
    if (!socket) {
      throw new Error('Socket not initialized');
    }

    console.log('Accepting call:', callId, 'room:', roomId);

    // Update call state in Firestore
    const callRef = doc(db, CALLS_COLLECTION, callId);
    await updateDoc(callRef, {
      state: CALL_STATES.CONNECTED,
      acceptedTime: new Date()
    });

    // Set the room ID
    currentRoomId = roomId;

    // Notify caller that call is accepted
    socket.emit('accept_call', { 
      roomId: roomId,
      callId: callId
    });

    // Join the call room
    joinCallRoom(roomId);

    console.log('Call accepted, joined room:', roomId);
    return { state: CALL_STATES.CONNECTED };
  } catch (error) {
    console.error('Error accepting call:', error);
    throw error;
  }
};

// End a call
export const endCall = async (roomId, callId = null) => {
  try {
    console.log('Ending call:', roomId, 'callId:', callId);

    // Leave the call room
    leaveCallRoom(roomId);

    // Notify other participants
    if (socket) {
      socket.emit('end_call', { roomId: roomId });
    }

    // Update call state in Firestore if callId is provided
    if (callId) {
      const callRef = doc(db, CALLS_COLLECTION, callId);
      await updateDoc(callRef, {
        state: CALL_STATES.ENDED,
        endTime: new Date()
      });
    }

    // Close peer connection and stop streams
    closePeerConnection();
    stopLocalStream();

    currentRoomId = null;
    console.log('Call ended successfully');
    return { state: CALL_STATES.ENDED };
  } catch (error) {
    console.error('Error ending call:', error);
    throw error;
  }
};

// Reject a call
export const rejectCall = async (callId, roomId) => {
  try {
    if (!socket) {
      throw new Error('Socket not initialized');
    }

    console.log('Rejecting call:', callId);

    // Update call state in Firestore
    const callRef = doc(db, CALLS_COLLECTION, callId);
    await updateDoc(callRef, {
      state: 'rejected',
      rejectedTime: new Date()
    });

    // Notify caller
    socket.emit('reject_call', { roomId: roomId });

    console.log('Call rejected');
    return { state: 'rejected' };
  } catch (error) {
    console.error('Error rejecting call:', error);
    throw error;
  }
};

// Listen for incoming calls from Firestore
export const listenForIncomingCalls = (userId, callback) => {
  console.log('Setting up listener for incoming calls for user:', userId);

  const q = query(
    collection(db, CALLS_COLLECTION),
    where('receiverId', '==', userId),
    where('state', '==', CALL_STATES.RINGING)
  );

  return onSnapshot(q, (snapshot) => {
    console.log('Incoming calls snapshot received:', snapshot.size, 'calls');
    const calls = [];
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const callData = change.doc.data();
        console.log('New incoming call detected:', { id: change.doc.id, ...callData });
        calls.push({ id: change.doc.id, ...callData });
      }
    });
    if (calls.length > 0) {
      console.log('Calling callback with new incoming calls:', calls);
      callback(calls);
    }
  }, (error) => {
    console.error('Error listening for incoming calls:', error);
  });
};

// Send signaling message (offer/answer)
export const sendSignalingMessage = (type, data, roomId) => {
  if (!socket) {
    console.error('Socket not initialized');
    return;
  }

  const room = roomId || currentRoomId;
  console.log('Sending signaling message:', type, 'to room:', room);

  socket.emit(type, {
    room: room,
    ...data
  });
};

// Mark call as missed
export const markCallAsMissed = async (callId) => {
  try {
    const callRef = doc(db, CALLS_COLLECTION, callId);
    await updateDoc(callRef, {
      state: CALL_STATES.MISSED
    });
  } catch (error) {
    console.error('Error marking call as missed:', error);
    throw error;
  }
};

// Delete call document
export const deleteCall = async (callId) => {
  try {
    await deleteDoc(doc(db, CALLS_COLLECTION, callId));
    console.log('Call deleted:', callId);
  } catch (error) {
    console.error('Error deleting call:', error);
  }
};

// Get call by ID
export const getCallById = async (callId) => {
  try {
    const callDoc = await getDoc(doc(db, CALLS_COLLECTION, callId));
    if (callDoc.exists()) {
      return { id: callDoc.id, ...callDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting call:', error);
    return null;
  }
};

// Export WebRTC helper functions
export { peerConnection, localStream, remoteStream };
