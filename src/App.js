


import React, { useState, useEffect } from 'react';
import './App.css';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext_new';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import Login from './components/Login';
import IncomingCallNotification from './components/IncomingCallNotification';
import CallModal from './components/CallModal';
import { getUserConversations, getUserContacts } from './services/firestoreService';
import { setupPresence } from './services/presenceService';
import { listenForIncomingCalls, startCall, initializeSocket } from './services/callService';

const MainApp = () => {
  const [activeChat, setActiveChat] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [incomingCalls, setIncomingCalls] = useState([]);
  const [activeCall, setActiveCall] = useState(null);
  const { theme, sidebarPosition, fontSize } = useTheme();
  const { user, loading } = useAuth();

  // Handle mobile back navigation
  const handleBack = () => {
    setActiveChat(null);
  };

  useEffect(() => {
    const handlePopState = () => {
      if (activeChat) {
        setActiveChat(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeChat]);

  useEffect(() => {
    if (user) {
      loadConversations();
      // Initialize socket connection
      initializeSocket(user.uid);
      // Listen for incoming calls
      console.log('Setting up incoming call listener for user:', user.uid);
      const unsubscribe = listenForIncomingCalls(user.uid, (calls) => {
        console.log('Incoming calls callback triggered with:', calls);
        setIncomingCalls(calls);
      });
      return unsubscribe;
    }
  }, [user, forceUpdate]);

  const loadConversations = async () => {
    try {
      console.log('Loading conversations for user:', user.uid);
      getUserConversations(user.uid, (userConversations) => {
        console.log('Loaded conversations:', userConversations);
        setConversations(userConversations);
      });
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  // Find the conversation ID for the active chat (contact)
  const getConversationId = () => {
    if (!activeChat || !conversations.length) return null;

    console.log('Finding conversation for activeChat:', activeChat);
    console.log('Available conversations:', conversations);

    // Find conversation between current user and activeChat contact
    const conversation = conversations.find(conv =>
      conv.participants.includes(user.uid) &&
      conv.participants.includes(activeChat) &&
      conv.participants.length === 2 // Direct message conversation
    );

    console.log('Found conversation:', conversation);
    return conversation ? conversation.id : null;
  };

  const fontSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  if (loading) {
    return (
      <div className={`h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-[#111B21]' : 'bg-white'
      }`}>
        <div className="text-center">
          <div className={`text-6xl mb-4 ${
            theme === 'dark' ? 'text-[#AEBAC1]' : 'text-gray-400'
          }`}>
            <img src="/RumpiLogo.png" alt="Rumpi Logo" className="w-16 h-16 mx-auto" />
          </div>
          <p className={`text-lg ${
            theme === 'dark' ? 'text-[#E9EDEF]' : 'text-gray-800'
          }`}>
            Loading Rumpi Chat...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className={`h-screen flex ${fontSizeClasses[fontSize]} ${
      theme === 'dark' ? 'bg-[#111B21]' : 'bg-white'
    }`}>
      <div className={`flex w-full h-full ${
        sidebarPosition === 'right' ? 'flex-row-reverse' : 'flex-row'
      }`}>
        {/* Mobile: Show sidebar only when no active chat, Desktop: Always show */}
        <div className={`${
          activeChat
            ? 'hidden md:block w-[30%] min-w-[340px] max-w-[500px]'
            : 'w-full md:w-[30%] md:min-w-[340px] md:max-w-[500px]'
        } h-full`}>
          <Sidebar
            activeChat={activeChat}
            onChatSelect={setActiveChat}
          />
        </div>

        {/* Mobile: Show chat area only when active chat exists, Desktop: Always show */}
        <div className={`${
          activeChat
            ? 'w-full md:flex-1'
            : 'hidden md:flex-1'
        } h-full`}>
          <ChatArea
            conversationId={getConversationId()}
            contactId={activeChat}
            conversations={conversations}
            onConversationCreated={() => setForceUpdate(prev => prev + 1)}
            onBack={handleBack}
          />
        </div>
      </div>

      {/* Active Call Modal */}
      {activeCall && (
        <CallModal
          isOpen={true}
          onClose={() => setActiveCall(null)}
          contactId={activeCall.callerId}
          callType={activeCall.callType}
          isIncoming={true}
          callerId={activeCall.callerId}
        />
      )}

      {/* Incoming Call Notifications */}
      {console.log('Rendering incoming calls:', incomingCalls)}
      {incomingCalls.map((call) => (
        <IncomingCallNotification
          key={call.id}
          call={call}
          onAccept={(call) => {
            console.log('Accepting call:', call);
            setActiveCall(call);
            setIncomingCalls(prev => prev.filter(c => c.id !== call.id));
          }}
          onDecline={(call) => {
            console.log('Declining call:', call);
            setIncomingCalls(prev => prev.filter(c => c.id !== call.id));
          }}
          onClose={(call) => {
            console.log('Closing call notification:', call);
            setIncomingCalls(prev => prev.filter(c => c.id !== call.id));
          }}
        />
      ))}
      {/* Incoming Call Notifications */}
    </div>
  );
};

function App() {
  useEffect(() => {
    setupPresence();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
