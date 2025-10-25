import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Video, VideoOff } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext_new';
import { getUserById } from '../services/firestoreService';
import { acceptCall, endCall, markCallAsMissed, getSocket } from '../services/callService';

const IncomingCallNotification = ({ call, onAccept, onDecline, onClose }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [caller, setCaller] = useState(null);
  const [isRinging, setIsRinging] = useState(true);
  const ringTimeoutRef = useRef(null);
  const ringAudioRef = useRef(null);

  useEffect(() => {
    loadCaller();
    playRingingSound();

    // Auto-decline after 30 seconds
    ringTimeoutRef.current = setTimeout(() => {
      handleDecline();
    }, 30000);

    // Listen for contact name updates
    const handleContactNameUpdate = (event) => {
      const { contactId: updatedContactId, customName } = event.detail;
      if (updatedContactId === call.callerId) {
        // Update the caller display name
        setCaller(prev => prev ? { ...prev, displayName: customName || prev.displayName } : prev);
      }
    };

    window.addEventListener('contactNameUpdated', handleContactNameUpdate);

    return () => {
      stopRingingSound();
      if (ringTimeoutRef.current) {
        clearTimeout(ringTimeoutRef.current);
      }
      window.removeEventListener('contactNameUpdated', handleContactNameUpdate);
    };
  }, [call]);

  const loadCaller = async () => {
    try {
      const callerData = await getUserById(call.callerId);
      setCaller(callerData);
    } catch (error) {
      console.error('Error loading caller:', error);
    }
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

  const handleAccept = async () => {
    try {
      await acceptCall(call.id);
      stopRingingSound();
      if (ringTimeoutRef.current) {
        clearTimeout(ringTimeoutRef.current);
      }
      setIsRinging(false);
      onAccept(call);
    } catch (error) {
      console.error('Error accepting call:', error);
    }
  };

  const handleDecline = async () => {
    try {
      // Notify server that call is rejected
      const socket = getSocket();
      if (socket) {
        socket.emit('reject_call', { roomId: call.id });
      }

      await endCall(call.id);
      await markCallAsMissed(call.id);
      stopRingingSound();
      if (ringTimeoutRef.current) {
        clearTimeout(ringTimeoutRef.current);
      }
      setIsRinging(false);
      onDecline(call);
    } catch (error) {
      console.error('Error declining call:', error);
    }
  };

  if (!caller) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 w-80 rounded-lg shadow-lg border ${
      theme === 'dark'
        ? 'bg-[#202C33] border-[#2A3942] text-[#E9EDEF]'
        : 'bg-white border-gray-200 text-[#111B21]'
    }`}>
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            {call.callType === 'video' ? (
              <Video className="h-6 w-6 text-white" />
            ) : (
              <Phone className="h-6 w-6 text-white" />
            )}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold">{caller.displayName}</h4>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-[#8696A0]' : 'text-[#667781]'
            }`}>
              {call.callType === 'video' ? 'Video call' : 'Voice call'}
            </p>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={handleDecline}
            className="p-3 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
          >
            <PhoneOff className="h-6 w-6 text-white" />
          </button>
          <button
            onClick={handleAccept}
            className="p-3 bg-green-500 hover:bg-green-600 rounded-full transition-colors"
          >
            <Phone className="h-6 w-6 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallNotification;
