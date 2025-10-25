import React, { useState, useRef, useEffect } from 'react';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext_new';
import { getUserById } from '../services/firestoreService';
import { getSocket, initializeWebRTC } from '../services/callService';

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

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const ringAudioRef = useRef(null);
  const callTimerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      loadContact();
      if (!isIncoming) {
        // For outgoing calls, initialize WebRTC and start the call
        initializeCall();
      } else {
        // For incoming calls, just setup the UI and wait for signaling
        setupIncomingCall();
      }
      if (isIncoming) {
        playRingingSound();
      }
    }

    return () => {
      cleanup();
    };
  }, [isOpen, contactId, callType, isIncoming]);

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

  const initializeCall = async () => {
    try {
      // Get user media
      const constraints = {
        audio: true,
        video: callType === 'video' ? { width: 640, height: 480 } : false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Initialize WebRTC peer connection
      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' }
        ]
      };

      peerConnectionRef.current = new RTCPeerConnection(configuration);

      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnectionRef.current.addTrack(track, stream);
      });

      // Handle remote stream
      peerConnectionRef.current.ontrack = (event) => {
        remoteStreamRef.current = event.streams[0];
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Handle ICE candidates
      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          // Send ICE candidate to remote peer via signaling
          sendSignalingMessage({
            type: 'ice-candidate',
            candidate: event.candidate,
            targetUserId: contactId
          });
        }
      };

      // Handle connection state changes
      peerConnectionRef.current.onconnectionstatechange = () => {
        if (peerConnectionRef.current.connectionState === 'connected') {
          setIsConnected(true);
          setIsRinging(false);
          stopRingingSound();
        }
      };

      // Listen for signaling messages
      const socket = getSocket();
      if (socket) {
        socket.on('answer', async (data) => {
          console.log('Received answer for outgoing call:', data);
          if (data.from !== user.uid) {
            try {
              await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
            } catch (error) {
              console.error('Error handling answer in outgoing call:', error);
            }
          }
        });

        socket.on('ice_candidate', async (data) => {
          console.log('Received ICE candidate for outgoing call:', data);
          if (data.from !== user.uid && data.candidate) {
            try {
              await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
            } catch (error) {
              console.error('Error adding ICE candidate in outgoing call:', error);
            }
          }
        });
      }

      if (!isIncoming) {
        // Create offer for outgoing call
        const offer = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(offer);

        // Send offer to remote peer
        sendSignalingMessage({
          type: 'call-offer',
          offer: offer,
          callType: callType,
          targetUserId: contactId
        });
      }

    } catch (error) {
      console.error('Error initializing call:', error);
    }
  };

  const sendSignalingMessage = (message) => {
    const socket = getSocket();
    if (!socket) {
      console.error('Socket not connected');
      return;
    }

    // Send signaling message through Socket.IO
    if (message.type === 'ice-candidate') {
      socket.emit('ice_candidate', {
        room: message.roomId || 'current-call-room',
        candidate: message.candidate
      });
    } else if (message.type === 'call-offer') {
      socket.emit('offer', {
        room: message.roomId || 'current-call-room',
        offer: message.offer
      });
    } else if (message.type === 'call-answer') {
      socket.emit('answer', {
        room: message.roomId || 'current-call-room',
        answer: message.answer
      });
    }

    console.log('Sent signaling message:', message);
  };

  const playRingingSound = () => {
    // Skip ringing sound to avoid audio issues
    console.log('Ringing sound skipped to avoid audio context issues');
  };

  const stopRingingSound = () => {
    if (ringAudioRef.current) {
      ringAudioRef.current.pause();
      ringAudioRef.current.currentTime = 0;
    }
  };

  const setupIncomingCall = async () => {
    // Setup WebRTC connection for incoming call
    try {
      // Get user media
      const constraints = {
        audio: true,
        video: callType === 'video' ? { width: 640, height: 480 } : false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Initialize WebRTC peer connection
      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' }
        ]
      };

      peerConnectionRef.current = new RTCPeerConnection(configuration);

      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnectionRef.current.addTrack(track, stream);
      });

      // Handle remote stream
      peerConnectionRef.current.ontrack = (event) => {
        remoteStreamRef.current = event.streams[0];
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Handle ICE candidates
      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          sendSignalingMessage({
            type: 'ice-candidate',
            candidate: event.candidate,
            targetUserId: callerId || contactId
          });
        }
      };

      // Handle connection state changes
      peerConnectionRef.current.onconnectionstatechange = () => {
        if (peerConnectionRef.current.connectionState === 'connected') {
          setIsConnected(true);
          setIsRinging(false);
          stopRingingSound();
        }
      };

      // Listen for signaling messages
      const socket = getSocket();
      if (socket) {
        socket.on('offer', async (data) => {
          console.log('Received offer:', data);
          if (data.from !== user.uid) {
            try {
              await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
              const answer = await peerConnectionRef.current.createAnswer();
              await peerConnectionRef.current.setLocalDescription(answer);

              sendSignalingMessage({
                type: 'call-answer',
                answer: answer,
                targetUserId: data.from
              });
            } catch (error) {
              console.error('Error handling offer:', error);
            }
          }
        });

        socket.on('answer', async (data) => {
          console.log('Received answer:', data);
          if (data.from !== user.uid) {
            try {
              await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
            } catch (error) {
              console.error('Error handling answer:', error);
            }
          }
        });

        socket.on('ice_candidate', async (data) => {
          console.log('Received ICE candidate:', data);
          if (data.from !== user.uid && data.candidate) {
            try {
              await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
            } catch (error) {
              console.error('Error adding ICE candidate:', error);
            }
          }
        });
      }

    } catch (error) {
      console.error('Error setting up WebRTC for incoming call:', error);
    }
  };

  const acceptCall = async () => {
    // Handle incoming call acceptance
    setIsRinging(false);
    stopRingingSound();

    // Notify server that call is accepted
    const socket = getSocket();
    if (socket) {
      socket.emit('accept_call', { roomId: 'current-call-room' });
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current && callType === 'video') {
      localStreamRef.current.getVideoTracks().forEach(track => {
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

  const endCall = () => {
    cleanup();
    onClose();
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }
    stopRingingSound();
    setIsConnected(false);
    setCallDuration(0);
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
            {isRinging ? 'Calling...' : isConnected ? formatDuration(callDuration) : 'Connecting...'}
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

        {/* Audio Visualization for Audio Calls */}
        {callType === 'audio' && (
          <div className="flex justify-center items-center h-32 mb-4">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center">
              <Phone className="h-8 w-8 text-white" />
            </div>
          </div>
        )}

        {/* Call Controls */}
        <div className="p-4">
          {isIncoming && !isConnected ? (
            <div className="flex justify-center gap-4">
              <button
                onClick={endCall}
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
                onClick={endCall}
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
