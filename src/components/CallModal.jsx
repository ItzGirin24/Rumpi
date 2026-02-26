import React, { useState, useRef, useEffect } from 'react';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext_new';
import { getUserById } from '../services/firestoreService';
import { 
  initializeSocket, 
  getSocket, 
  initializeLocalStream, 
  createPeerConnection, 
  addLocalStreamToPeerConnection,
  startCall as startCallService,
  acceptCall as acceptCallService,
  endCall as endCallService,
  getCurrentRoomId,
  closePeerConnection,
  stopLocalStream
} from '../services/callService';

const CallModal = ({ isOpen, onClose, contactId, callType, isIncoming = false, callerId = null }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [contact, setContact] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === 'audio');
  const [isSpeakerOff, setIsSpeakerOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isRinging, setIsRinging] = useState(isIncoming);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [error, setError] = useState(null);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [currentCallId, setCurrentCallId] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const callTimerRef = useRef(null);

  useEffect(() => {
    if (isOpen && user) {
      loadContact();
      initializeCallConnection();
    }

    return () => {
      cleanup();
    };
  }, [isOpen, contactId, user]);

  useEffect(() => {
    if (isConnected) {
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    }

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [isConnected]);

  const loadContact = async () => {
    try {
      const contactData = await getUserById(contactId);
      setContact(contactData);
    } catch (error) {
      console.error('Error loading contact:', error);
    }
  };

  const initializeCallConnection = async () => {
    try {
      setError(null);
      setIsRinging(true);

      // Get local media stream
      const stream = await initializeLocalStream(callType);
      setLocalStream(stream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection
      const pc = createPeerConnection((remoteMediaStream) => {
        console.log('Remote stream received:', remoteMediaStream);
        setRemoteStream(remoteMediaStream);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteMediaStream;
        }
      });

      if (!pc) {
        throw new Error('Failed to create peer connection');
      }

      peerConnectionRef.current = pc;

      // Add local stream to peer connection
      addLocalStreamToPeerConnection(stream);

      // Set up WebRTC event handlers
      pc.onconnectionstatechange = () => {
        console.log('Connection state:', pc.connectionState);
        if (pc.connectionState === 'connected') {
          setIsConnected(true);
          setIsRinging(false);
        } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          setIsConnected(false);
        }
      };

      // For outgoing calls, create and send offer
      if (!isIncoming) {
        const roomId = `call-${user.uid}-${contactId}-${Date.now()}`;
        setCurrentRoomId(roomId);

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // Start the call through the service
        const callData = await startCallService(user.uid, contactId, callType);
        setCurrentCallId(callData.id);

        // Send offer through socket
        const socket = getSocket();
        if (socket) {
          socket.emit('offer', {
            room: roomId,
            offer: offer,
            callType: callType,
            callerId: user.uid,
            receiverId: contactId
          });
        }
      } else if (callerId) {
        // For incoming calls, set up room ID and wait for offer
        setCurrentRoomId(callerId);
      }

      // Listen for WebRTC signaling messages
      setupSignalingListeners();

    } catch (error) {
      console.error('Error initializing call:', error);
      setError(error.message);
      setIsRinging(false);
    }
  };

  const setupSignalingListeners = () => {
    const socket = getSocket();
    if (!socket) return;

    // Handle offer (for incoming calls)
    socket.on('offer', async (data) => {
      console.log('Received offer:', data);
      if (data.callerId !== user.uid && (data.receiverId === user.uid || data.receiverId === contactId)) {
        try {
          if (peerConnectionRef.current && data.offer) {
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
            
            const answer = await peerConnectionRef.current.createAnswer();
            await peerConnectionRef.current.setLocalDescription(answer);

            socket.emit('answer', {
              room: data.room,
              answer: answer,
              calleeId: data.callerId
            });

            setCurrentRoomId(data.room);
          }
        } catch (error) {
          console.error('Error handling offer:', error);
        }
      }
    });

    // Handle answer (for outgoing calls)
    socket.on('answer', async (data) => {
      console.log('Received answer:', data);
      try {
        if (peerConnectionRef.current && data.answer) {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
          setIsConnected(true);
          setIsRinging(false);
        }
      } catch (error) {
        console.error('Error handling answer:', error);
      }
    });

    // Handle ICE candidates
    socket.on('ice_candidate', async (data) => {
      console.log('Received ICE candidate:', data);
      try {
        if (peerConnectionRef.current && data.candidate) {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    });

    // Handle call accepted
    socket.on('call_accepted', async (data) => {
      console.log('Call accepted:', data);
      setIsConnected(true);
      setIsRinging(false);
    });

    // Handle call ended
    socket.on('call_ended', (data) => {
      console.log('Call ended by remote:', data);
      cleanup();
      onClose();
    });

    // Handle participant left
    socket.on('participant_left', (data) => {
      console.log('Participant left:', data);
      cleanup();
      onClose();
    });
  };

  const acceptCall = async () => {
    try {
      setIsRinging(false);
      
      // Accept call through the service
      if (isIncoming && callerId) {
        const roomId = `call-${callerId}-${user.uid}-${Date.now()}`;
        setCurrentRoomId(roomId);
        
        await acceptCallService(null, roomId);

        const socket = getSocket();
        if (socket) {
          socket.emit('join_room', { room: roomId });
        }
      }
    } catch (error) {
      console.error('Error accepting call:', error);
      setError(error.message);
    }
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream && callType === 'video') {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = isVideoOff;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const toggleSpeaker = () => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = !isSpeakerOff;
      setIsSpeakerOff(!isSpeakerOff);
    }
  };

  const handleEndCall = async () => {
    try {
      await endCallService(currentRoomId, currentCallId);
    } catch (error) {
      console.error('Error ending call:', error);
    }
    cleanup();
    onClose();
  };

  const cleanup = () => {
    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    setRemoteStream(null);
    setIsConnected(false);
    setIsRinging(false);
    setCallDuration(0);
    setCurrentRoomId(null);
    setCurrentCallId(null);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`relative rounded-lg shadow-lg max-w-md w-full mx-4 ${
        theme === 'dark' ? 'bg-[#202C33]' : 'bg-white'
      }`}>
        {/* Header */}
        <div className="p-4 text-center">
          <h3 className={`text-lg font-semibold mb-2 ${
            theme === 'dark' ? 'text-[#E9EDEF]' : 'text-[#111B21]'
          }`}>
            {contact?.displayName || 'Unknown'}
          </h3>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-[#8696A0]' : 'text-[#667781]'
          }`}>
            {error ? `Error: ${error}` : 
             isRinging ? (isIncoming ? 'Incoming call...' : 'Calling...') : 
             isConnected ? formatDuration(callDuration) : 'Connecting...'}
          </p>
        </div>

        {/* Video Area */}
        {callType === 'video' && (
          <div className="relative aspect-video bg-black rounded-lg mx-4 mb-4">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover rounded-lg"
            />
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="absolute bottom-2 right-2 w-24 h-18 object-cover rounded-lg border-2 border-white"
            />
          </div>
        )}

        {/* Audio Call - Show contact info */}
        {callType === 'audio' && (
          <div className="flex flex-col items-center justify-center h-32 mb-4">
            <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mb-2">
              <Phone className="h-8 w-8 text-white" />
            </div>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-[#8696A0]' : 'text-[#667781]'
            }`}>
              {isConnected ? 'Call connected' : isRinging ? 'Ringing...' : 'Connecting...'}
            </p>
          </div>
        )}

        {/* Call Controls */}
        <div className="p-4">
          {isIncoming && !isConnected ? (
            <div className="flex justify-center gap-4">
              <button
                onClick={handleEndCall}
                className="p-4 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
              >
                <PhoneOff className="h-6 w-6 text-white" />
              </button>
              <button
                onClick={acceptCall}
                className="p-4 bg-green-500 hover:bg-green-600 rounded-full transition-colors"
              >
                <Phone className="h-6 w-6 text-white" />
              </button>
            </div>
          ) : (
            <div className="flex justify-center gap-4">
              <button
                onClick={toggleMute}
                className={`p-3 rounded-full transition-colors ${
                  isMuted
                    ? 'bg-red-500 hover:bg-red-600'
                    : theme === 'dark'
                      ? 'bg-[#2A3942] hover:bg-[#3A4952]'
                      : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {isMuted ? (
                  <MicOff className="h-5 w-5 text-white" />
                ) : (
                  <Mic className={`h-5 w-5 ${
                    theme === 'dark' ? 'text-[#E9EDEF]' : 'text-[#111B21]'
                  }`} />
                )}
              </button>

              {callType === 'video' && (
                <button
                  onClick={toggleVideo}
                  className={`p-3 rounded-full transition-colors ${
                    isVideoOff
                      ? 'bg-red-500 hover:bg-red-600'
                      : theme === 'dark'
                        ? 'bg-[#2A3942] hover:bg-[#3A4952]'
                        : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {isVideoOff ? (
                    <VideoOff className="h-5 w-5 text-white" />
                  ) : (
                    <Video className={`h-5 w-5 ${
                      theme === 'dark' ? 'text-[#E9EDEF]' : 'text-[#111B21]'
                    }`} />
                  )}
                </button>
              )}

              <button
                onClick={toggleSpeaker}
                className={`p-3 rounded-full transition-colors ${
                  isSpeakerOff
                    ? 'bg-red-500 hover:bg-red-600'
                    : theme === 'dark'
                      ? 'bg-[#2A3942] hover:bg-[#3A4952]'
                      : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {isSpeakerOff ? (
                  <VolumeX className="h-5 w-5 text-white" />
                ) : (
                  <Volume2 className={`h-5 w-5 ${
                    theme === 'dark' ? 'text-[#E9EDEF]' : 'text-[#111B21]'
                  }`} />
                )}
              </button>

              <button
                onClick={handleEndCall}
                className="p-4 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
              >
                <PhoneOff className="h-6 w-6 text-white" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallModal;
