import io from 'socket.io-client';
import { db } from '../firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  orderBy,
  limit,
  or,
  getDoc
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

// Initialize Socket.IO
export const initializeSocket = (userId) => {
  if (socket) {
    socket.disconnect();
  }

  socket = io('http://localhost:8000', {
    transports: ['websocket', 'polling']
  });

  socket.on('connect', () => {
    console.log('Connected to signaling server');
    // Register user when connected
    socket.emit('register', userId);
  });

  // Handle incoming calls
  socket.on('incoming_call', (data) => {
    console.log('Incoming call received:', data);
    // This will be handled by the component that listens for incoming calls
  });

  // Handle call events
  socket.on('call_accepted', (data) => {
    console.log('Call accepted:', data);
  });

  socket.on('call_rejected', (data) => {
    console.log('Call rejected:', data);
  });

  socket.on('call_ended', (data) => {
    console.log('Call ended:', data);
  });

  // Handle WebRTC signaling
  socket.on('offer', (data) => {
    console.log('Received offer:', data);
  });

  socket.on('answer', (data) => {
    console.log('Received answer:', data);
  });

  socket.on('ice_candidate', (data) => {
    console.log('Received ICE candidate:', data);
  });

  socket.on('participant_left', (data) => {
    console.log('Participant left:', data);
  });

  return socket;
};

// Get current socket instance
export const getSocket = () => socket;

// Initialize WebRTC
export const initializeWebRTC = async () => {
  try {
    // Get user media
    localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    });

    // Create peer connection
    peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    // Add local stream to peer connection
    localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStream);
    });

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      remoteStream = event.streams[0];
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socket) {
        // This will be set dynamically when starting/accepting calls
        // For now, we'll emit to a placeholder room
        socket.emit('ice_candidate', {
          room: 'current-call-room',
          candidate: event.candidate
        });
      }
    };

    return { localStream, peerConnection };
  } catch (error) {
    console.error('Error initializing WebRTC:', error);
    throw error;
  }
};

// Start a call using WebRTC + Socket.IO
export const startCall = async (callerId, receiverId, callType) => {
  try {
    if (!socket) {
      throw new Error('Socket not initialized');
    }

    console.log('Starting call from', callerId, 'to', receiverId);

    // Create unique room ID
    const roomId = `call-${callerId}-${receiverId}-${Date.now()}`;

    // Create call data for tracking
    const callData = {
      callerId,
      receiverId,
      callType,
      state: CALL_STATES.RINGING,
      startTime: new Date(),
      roomId
    };

    // Save call to Firestore first
    const docRef = await addDoc(collection(db, CALLS_COLLECTION), callData);
    console.log('Call saved to Firestore with ID:', docRef.id);

    // Notify signaling server about the call
    socket.emit('start_call', {
      callerId,
      receiverId,
      callType,
      roomId
    });

    return { id: docRef.id, ...callData };
  } catch (error) {
    console.error('Error starting call:', error);
    throw error;
  }
};

// Accept a call using WebRTC
export const acceptCall = async (callId) => {
  try {
    if (!socket) {
      throw new Error('Socket not initialized');
    }

    // Get call data from Firestore
    const callRef = doc(db, CALLS_COLLECTION, callId);
    const callDoc = await getDoc(callRef);
    if (!callDoc.exists()) {
      throw new Error('Call not found');
    }
    const callData = callDoc.data();
    const roomId = callData.roomId;

    // Update call state in Firestore
    await updateDoc(callRef, {
      state: CALL_STATES.CONNECTED,
      acceptedTime: new Date()
    });

    // Notify server that call is accepted
    socket.emit('accept_call', { roomId });

    // Join the call room
    socket.emit('join_room', { room: roomId });

    console.log('Call accepted:', callId, 'room:', roomId);
    return { state: CALL_STATES.CONNECTED, acceptedTime: new Date() };
  } catch (error) {
    console.error('Error accepting call:', error);
    throw error;
  }
};

// End a call using WebRTC
export const endCall = async (roomId) => {
  try {
    // Notify server that call is ended
    if (socket) {
      socket.emit('end_call', { roomId, endedBy: 'user' });
    }

    // Close peer connection
    if (peerConnection) {
      peerConnection.close();
      peerConnection = null;
    }

    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      localStream = null;
    }

    console.log('Call ended:', roomId);
    return { state: CALL_STATES.ENDED, endTime: new Date() };
  } catch (error) {
    console.error('Error ending call:', error);
    throw error;
  }
};

// Listen for incoming calls
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

// Listen for call updates
export const listenForCallUpdates = (callId, callback) => {
  const callRef = doc(db, CALLS_COLLECTION, callId);
  return onSnapshot(callRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    }
  });
};

// Get call history
export const getCallHistory = (userId, callback) => {
  const q = query(
    collection(db, CALLS_COLLECTION),
    where('callerId', '==', userId),
    or(where('receiverId', '==', userId)),
    orderBy('startTime', 'desc'),
    limit(50)
  );

  return onSnapshot(q, (snapshot) => {
    const calls = [];
    snapshot.forEach((doc) => {
      calls.push({ id: doc.id, ...doc.data() });
    });
    callback(calls);
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

// WebRTC signaling functions
export const sendSignalingMessage = async (callId, message) => {
  try {
    const signalingRef = collection(db, CALLS_COLLECTION, callId, 'signaling');
    await addDoc(signalingRef, {
      ...message,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error sending signaling message:', error);
    throw error;
  }
};

export const listenForSignalingMessages = (callId, callback) => {
  const signalingRef = collection(db, CALLS_COLLECTION, callId, 'signaling');
  const q = query(signalingRef, orderBy('timestamp', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const messages = [];
    snapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    callback(messages);
  });
};
