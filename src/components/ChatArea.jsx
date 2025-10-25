import React, { useState, useRef, useEffect } from 'react';
import { Search, MoreVertical, Phone, Video, Smile, Paperclip, Mic, Send, X, Pause, Play, User } from 'lucide-react';
import CallModal from './CallModal';
import ContactProfileModal from './ContactProfileModal';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import MessageBubble from './MessageBubble_new';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext_new';
import { getConversationMessages, sendMessage, getUserById, markMessagesAsRead, markMessagesAsDelivered, getUserContacts } from '../services/firestoreService';
import { startCall, initializeSocket, initializeWebRTC } from '../services/callService';
import UserStatus from './UserStatus';
import { Input } from './ui/input';

const ChatArea = ({ conversationId, contactId, conversations, onConversationCreated, onBack }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [contact, setContact] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState(null);
  const [showRecordingOptions, setShowRecordingOptions] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [callType, setCallType] = useState('audio');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showContactProfile, setShowContactProfile] = useState(false);
  const [contactData, setContactData] = useState(null);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const audioChunksRef = useRef([]);

  const markMessagesAsReadForConversation = async () => {
    if (!conversationId || !user?.uid) return;

    try {
      await markMessagesAsRead(conversationId, user.uid);
      console.log('Messages marked as read for conversation:', conversationId);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const markMessagesAsDeliveredForConversation = async () => {
    if (!conversationId || !user?.uid) return;

    try {
      await markMessagesAsDelivered(conversationId, user.uid);
      console.log('Messages marked as delivered for conversation:', conversationId);
    } catch (error) {
      console.error('Error marking messages as delivered:', error);
    }
  };

  useEffect(() => {
    if (conversationId && user) {
      console.log('Loading messages for conversationId:', conversationId);
      loadMessages();
      // Mark messages as delivered when conversation is viewed
      setTimeout(() => markMessagesAsDeliveredForConversation(), 500); // Delay to ensure messages are loaded first
      // Mark messages as read when conversation is viewed (after delivered)
      setTimeout(() => markMessagesAsReadForConversation(), 1500); // Delay to ensure messages are loaded first
    } else if (contactId && user && !conversationId) {
      // If we have contactId but no conversationId, try to load messages anyway
      // The sendMessage function will create conversation if needed
      console.log('No conversationId yet, but have contactId:', contactId);
    }
    if (contactId && user) {
      loadContact();
    }

    // Listen for contact name updates
    const handleContactNameUpdate = (event) => {
      const { contactId: updatedContactId, customName } = event.detail;
      if (updatedContactId === contactId) {
        // Update the contact data state
        setContactData(prev => prev ? { ...prev, customName } : prev);
      }
    };

    window.addEventListener('contactNameUpdated', handleContactNameUpdate);

    return () => {
      window.removeEventListener('contactNameUpdated', handleContactNameUpdate);
    };
  }, [conversationId, contactId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async (convId = conversationId) => {
    if (!convId) {
      console.log('No conversationId provided to loadMessages');
      setMessages([]);
      return;
    }
    try {
      console.log('Loading messages for conversation:', convId);
      getConversationMessages(convId, (conversationMessages) => {
        console.log('Received messages:', conversationMessages);
        setMessages(conversationMessages || []);
      });
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    }
  };

  const loadContact = async () => {
    try {
      const contactInfo = await getUserById(contactId);
      setContact(contactInfo);

      // Load contact relationship data
      if (user) {
        const contacts = await getUserContacts(user.uid);
        const contactRelationship = contacts.find(c => c.contactUserId === contactId);
        setContactData(contactRelationship);
      }
    } catch (error) {
      console.error('Error loading contact:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setRecordedAudioBlob(audioBlob);
        setShowRecordingOptions(true);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const cancelRecording = () => {
    setRecordedAudioBlob(null);
    setShowRecordingOptions(false);
    setRecordingTime(0);
  };

  const handleStartCall = async (type) => {
    if (contact) {
      try {
        console.log('Starting call to contact:', contactId, 'type:', type);

        // Initialize socket first
        await initializeSocket(user.uid);

        const callData = await startCall(user.uid, contactId, type);
        console.log('Call started successfully:', callData);

        // Show the call modal
        setCallType(type);
        setShowCallModal(true);
      } catch (error) {
        console.error('Error starting call:', error);
        // Show error to user
        alert('Failed to start call. Please try again.');
      }
    }
  };

  const sendVoiceNote = async (audioBlob) => {
    if (!user || !conversationId) return;

    try {
      // Convert blob to base64 for storage
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = reader.result;

        const result = await sendMessage(
          conversationId,
          user.uid,
          '', // Empty text for voice note
          contactId,
          'voice', // Message type
          base64Audio // Audio data
        );

        if (result && result.conversationId && !conversationId) {
          onConversationCreated && onConversationCreated();
        }
      };
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error('Error sending voice note:', error);
    }
  };

  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Early return AFTER all hooks
  if (!conversationId) {
    return (
      <div className={`h-full flex flex-col ${
        theme === 'dark' ? 'bg-[#0B141A]' : 'bg-[#F0F2F5]'
      }`}>
        {/* Mobile back button */}
        <div className={`md:hidden px-4 py-3 flex items-center border-b ${
          theme === 'dark'
            ? 'bg-[#202C33] border-[#2A3942]'
            : 'bg-[#F0F2F5] border-gray-200'
        }`}>
          <button
            onClick={() => window.history.back()}
            className={`p-2 rounded-full hover:bg-opacity-10 transition-colors ${
              theme === 'dark' ? 'hover:bg-white' : 'hover:bg-black'
            }`}
          >
            ←
          </button>
          <span className={`ml-4 font-medium ${
            theme === 'dark' ? 'text-[#E9EDEF]' : 'text-[#111B21]'
          }`}>
            Pilih Chat
          </span>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className={`text-6xl mb-4 ${
              theme === 'dark' ? 'text-[#AEBAC1]' : 'text-gray-400'
            }`}>
              💬
            </div>
            <h2 className={`text-2xl font-light mb-2 ${
              theme === 'dark' ? 'text-[#E9EDEF]' : 'text-gray-800'
            }`}>
              WhatsApp Web Custom
            </h2>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-[#8696A0]' : 'text-gray-500'
            }`}>
              Pilih chat untuk mulai percakapan
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!contact) {
    return null;
  }

  const handleSendMessage = async () => {
    if (messageText.trim() && user) {
      try {
        console.log('Sending message:', messageText.trim());
        console.log('Current conversationId:', conversationId);
        console.log('ContactId:', contactId);

        const result = await sendMessage(conversationId, user.uid, messageText.trim(), contactId);
        console.log('Send result:', result);

        if (result && result.conversationId && !conversationId) {
          // If a new conversation was created, trigger parent update
          console.log('New conversation created:', result.conversationId);
          onConversationCreated && onConversationCreated();
          // Also start loading messages for the new conversation
          setTimeout(() => loadMessages(result.conversationId), 100);
        }

        setMessageText('');
        // Messages will update automatically via real-time listener
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMessageDeleted = (messageId) => {
    // Update local state to immediately hide deleted message
    setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
  };

  const filteredMessages = (messages || []).filter(message => {
    // Filter out messages deleted for current user
    if (message.deletedFor && message.deletedFor.includes(user?.uid)) {
      return false;
    }
    // Filter out messages deleted by sender
    if (message.deletedBySender) {
      return false;
    }
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return message.text?.toLowerCase().includes(query) ||
             message.senderName?.toLowerCase().includes(query);
    }
    return true;
  });

  return (
    <div className={`h-full flex flex-col ${
      theme === 'dark' ? 'bg-[#0B141A]' : 'bg-[#EFEAE2]'
    }`}>
      {/* Chat Header */}
      <div className={`px-4 py-2.5 flex flex-col border-b ${
        theme === 'dark'
          ? 'bg-[#202C33] border-[#2A3942]'
          : 'bg-[#F0F2F5] border-gray-200'
      }`}>
        {/* Search Bar */}
        {showSearch && (
          <div className="pb-2">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                theme === 'dark' ? 'text-[#AEBAC1]' : 'text-[#54656F]'
              }`} />
              <Input
                placeholder="Cari pesan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-10 rounded-lg border-none ${
                  theme === 'dark'
                    ? 'bg-[#2A3942] text-[#E9EDEF] placeholder:text-[#667781]'
                    : 'bg-white text-black placeholder:text-gray-500'
                }`}
              />
              <button
                onClick={() => {
                  setShowSearch(false);
                  setSearchQuery('');
                }}
                className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                  theme === 'dark' ? 'text-[#AEBAC1] hover:text-white' : 'text-[#54656F] hover:text-black'
                }`}
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Header Content */}
        <div className="flex items-center justify-between">
          {/* Mobile back button */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={onBack}
              className={`p-2 rounded-full hover:bg-opacity-10 transition-colors ${
                theme === 'dark' ? 'hover:bg-white' : 'hover:bg-black'
              }`}
            >
              ←
            </button>
          </div>

          <div className="flex items-center gap-3 flex-1">
            <Avatar
              className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setShowContactProfile(true)}
            >
              <AvatarImage src={contact.photoURL} alt={contact.displayName} />
              <AvatarFallback>{contact.displayName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className={`font-medium truncate cursor-pointer hover:opacity-80 transition-opacity ${
                theme === 'dark' ? 'text-[#E9EDEF]' : 'text-[#111B21]'
              }`}
              onClick={() => setShowContactProfile(true)}
              >
                {contactData?.customName || contact.displayName}
              </h3>
              <UserStatus userId={contact.uid} />
            </div>
          </div>

          <div className="flex items-center gap-5">
            <Video
              onClick={() => handleStartCall('video')}
              className={`h-5 w-5 cursor-pointer transition-colors ${
                theme === 'dark'
                  ? 'text-[#AEBAC1] hover:text-white'
                  : 'text-[#54656F] hover:text-black'
              }`}
            />
            <Phone
              onClick={() => handleStartCall('audio')}
              className={`h-5 w-5 cursor-pointer transition-colors ${
                theme === 'dark'
                  ? 'text-[#AEBAC1] hover:text-white'
                  : 'text-[#54656F] hover:text-black'
              }`}
            />
            <Search
              onClick={() => setShowSearch(!showSearch)}
              className={`h-5 w-5 cursor-pointer transition-colors ${
                theme === 'dark'
                  ? 'text-[#AEBAC1] hover:text-white'
                  : 'text-[#54656F] hover:text-black'
              }`}
            />
            <MoreVertical className={`h-5 w-5 cursor-pointer transition-colors ${
              theme === 'dark'
                ? 'text-[#AEBAC1] hover:text-white'
                : 'text-[#54656F] hover:text-black'
            }`} />
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto px-4 md:px-12 py-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent"
        style={{
          backgroundImage: theme === 'dark'
            ? 'url("data:image/svg+xml,%3Csvg width="80" height="80" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23182229" fill-opacity="0.4"%3E%3Cpath d="M0 0h40v40H0z"/%3E%3C/g%3E%3C/svg%3E")'
            : 'url("data:image/svg+xml,%3Csvg width="80" height="80" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23D9DBD5" fill-opacity="0.3"%3E%3Cpath d="M0 0h40v40H0z"/%3E%3C/g%3E%3C/svg%3E")'
        }}
      >
        <div className="space-y-2">
          {filteredMessages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isGroup={false}
              onMessageDeleted={handleMessageDeleted}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className={`px-4 py-2 flex items-center gap-2 ${
        theme === 'dark' ? 'bg-[#202C33]' : 'bg-[#F0F2F5]'
      }`}>
        <button className={`p-2 rounded-full hover:bg-opacity-10 transition-colors ${
          theme === 'dark' ? 'hover:bg-white' : 'hover:bg-black'
        }`}>
          <Smile className={`h-6 w-6 ${
            theme === 'dark' ? 'text-[#AEBAC1]' : 'text-[#54656F]'
          }`} />
        </button>
        <button className={`p-2 rounded-full hover:bg-opacity-10 transition-colors ${
          theme === 'dark' ? 'hover:bg-white' : 'hover:bg-black'
        }`}>
          <Paperclip className={`h-6 w-6 ${
            theme === 'dark' ? 'text-[#AEBAC1]' : 'text-[#54656F]'
          }`} />
        </button>

        <Input
          placeholder="Ketik pesan"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyPress={handleKeyPress}
          className={`flex-1 rounded-lg border-none ${
            theme === 'dark'
              ? 'bg-[#2A3942] text-[#E9EDEF] placeholder:text-[#667781]'
              : 'bg-white text-black placeholder:text-gray-500'
          }`}
        />

        {showRecordingOptions ? (
          <div className="flex items-center gap-2">
            <button
              onClick={cancelRecording}
              className={`p-2 rounded-full transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-600 hover:bg-gray-700'
                  : 'bg-gray-400 hover:bg-gray-500'
              }`}
            >
              <X className="h-5 w-5 text-white" />
            </button>
            <button
              onClick={() => {
                if (recordedAudioBlob) {
                  sendVoiceNote(recordedAudioBlob);
                  setRecordedAudioBlob(null);
                  setShowRecordingOptions(false);
                  setRecordingTime(0);
                }
              }}
              className={`p-2 rounded-full transition-colors ${
                theme === 'dark'
                  ? 'bg-[#00A884] hover:bg-[#06CF9C]'
                  : 'bg-[#25D366] hover:bg-[#128C7E]'
              }`}
            >
              <Send className="h-5 w-5 text-white" />
            </button>
          </div>
        ) : messageText.trim() ? (
          <button
            onClick={handleSendMessage}
            className={`p-2 rounded-full transition-colors ${
              theme === 'dark'
                ? 'bg-[#00A884] hover:bg-[#06CF9C]'
                : 'bg-[#25D366] hover:bg-[#128C7E]'
            }`}
          >
            <Send className="h-5 w-5 text-white" />
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={isRecording ? (isPaused ? resumeRecording : pauseRecording) : startRecording}
              className={`p-2 rounded-full transition-colors ${
                isRecording
                  ? theme === 'dark'
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-red-500 hover:bg-red-600'
                  : theme === 'dark'
                    ? 'hover:bg-white'
                    : 'hover:bg-black'
              } hover:bg-opacity-10`}
            >
              {isRecording ? (
                <div className="flex items-center gap-1">
                  {isPaused ? (
                    <Play className="h-4 w-4 text-white" />
                  ) : (
                    <Pause className="h-4 w-4 text-white" />
                  )}
                  <span className="text-xs text-white font-mono">
                    {formatRecordingTime(recordingTime)}
                  </span>
                </div>
              ) : (
                <Mic className={`h-6 w-6 ${
                  theme === 'dark' ? 'text-[#AEBAC1]' : 'text-[#54656F]'
                }`} />
              )}
            </button>
            {isRecording && (
              <button
                onClick={stopRecording}
                className={`p-2 rounded-full transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-600 hover:bg-gray-700'
                    : 'bg-gray-400 hover:bg-gray-500'
                }`}
              >
                <div className="w-3 h-3 bg-white rounded-sm"></div>
              </button>
            )}
            {isRecording && isPaused && (
              <button
                onClick={resumeRecording}
                className={`p-2 rounded-full transition-colors ${
                  theme === 'dark'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                <Play className="h-4 w-4 text-white" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Call Modal */}
      <CallModal
        isOpen={showCallModal}
        onClose={() => setShowCallModal(false)}
        contactId={contactId}
        callType={callType}
      />

      {/* Contact Profile Modal */}
      <ContactProfileModal
        isOpen={showContactProfile}
        onClose={() => setShowContactProfile(false)}
        contactId={contactId}
        contactData={contactData}
      />
    </div>
  );
};

export default ChatArea;
