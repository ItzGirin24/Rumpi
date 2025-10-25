import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, Bot, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext_new';
import { generateAIResponse, getAIPersonality } from '../services/aiService';
import { sendMessage, getConversationMessages } from '../services/firestoreService';

const AIChatPage = ({ selectedAI, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { theme } = useTheme();
  const { user } = useAuth();

  const aiData = {
    'ai-contact-1': {
      name: 'Alex Rivera',
      avatar: 'https://ui-avatars.com/api/?name=Alex+Rivera&background=ff6b6b&color=fff',
      status: 'AI Assistant - Always here to chat!',
      personality: 'alex'
    },
    'ai-contact-2': {
      name: 'Maya Patel',
      avatar: 'https://ui-avatars.com/api/?name=Maya+Patel&background=4ecdc4&color=fff',
      status: 'AI Companion - Ready for conversation!',
      personality: 'maya'
    }
  };

  const currentAI = aiData[selectedAI];

  useEffect(() => {
    loadMessages();
  }, [selectedAI]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const conversationId = `ai-${user.uid}-${selectedAI}`;
      const conversationMessages = await getConversationMessages(conversationId);
      setMessages(conversationMessages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setIsLoading(true);

    try {
      // Send user message
      const conversationId = `ai-${user.uid}-${selectedAI}`;
      await sendMessage(conversationId, user.uid, selectedAI, messageText);

      // Add user message to local state
      const userMessage = {
        id: Date.now().toString(),
        senderId: user.uid,
        text: messageText,
        timestamp: new Date(),
        status: 'sent'
      };
      setMessages(prev => [...prev, userMessage]);

      // Generate AI response
      const conversationHistory = messages.slice(-10); // Last 10 messages for context
      const aiResponse = await generateAIResponse(messageText, conversationHistory, currentAI.personality);

      // Send AI response
      await sendMessage(conversationId, selectedAI, user.uid, aiResponse);

      // Add AI response to local state
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        senderId: selectedAI,
        text: aiResponse,
        timestamp: new Date(),
        status: 'delivered'
      };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`h-full flex flex-col ${
      theme === 'dark' ? 'bg-[#111B21]' : 'bg-[#F0F2F5]'
    }`}>
      {/* Header */}
      <div className={`px-4 py-3 flex items-center gap-3 border-b ${
        theme === 'dark' ? 'bg-[#202C33] border-[#2A3942]' : 'bg-white border-gray-200'
      }`}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className={`p-2 ${
            theme === 'dark' ? 'text-[#AEBAC1] hover:bg-[#2A3942]' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <Avatar className="h-10 w-10">
          <AvatarImage src={currentAI.avatar} alt={currentAI.name} />
          <AvatarFallback>{currentAI.name[0]}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <h1 className={`font-semibold ${
            theme === 'dark' ? 'text-[#E9EDEF]' : 'text-[#111B21]'
          }`}>
            {currentAI.name}
          </h1>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-[#667781]' : 'text-gray-600'
          }`}>
            {currentAI.status}
          </p>
        </div>

        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          theme === 'dark' ? 'bg-[#00A884] text-white' : 'bg-[#25D366] text-white'
        }`}>
          AI
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <Bot className={`h-12 w-12 mx-auto mb-4 ${
              theme === 'dark' ? 'text-[#667781]' : 'text-gray-400'
            }`} />
            <h3 className={`text-lg font-medium mb-2 ${
              theme === 'dark' ? 'text-[#E9EDEF]' : 'text-[#111B21]'
            }`}>
              Mulai Percakapan dengan {currentAI.name}
            </h3>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-[#667781]' : 'text-gray-600'
            }`}>
              Kirim pesan pertama Anda dan {currentAI.name} akan merespons!
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.senderId === user.uid ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.senderId !== user.uid && (
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={currentAI.avatar} alt={currentAI.name} />
                  <AvatarFallback>{currentAI.name[0]}</AvatarFallback>
                </Avatar>
              )}

              <div className={`max-w-[70%] ${
                message.senderId === user.uid ? 'order-1' : 'order-2'
              }`}>
                <div className={`px-4 py-2 rounded-lg ${
                  message.senderId === user.uid
                    ? theme === 'dark'
                      ? 'bg-[#005C4B] text-[#E9EDEF]'
                      : 'bg-[#DCF8C6] text-[#111B21]'
                    : theme === 'dark'
                      ? 'bg-[#202C33] text-[#E9EDEF]'
                      : 'bg-white text-[#111B21]'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                </div>
                <p className={`text-xs mt-1 ${
                  theme === 'dark' ? 'text-[#667781]' : 'text-gray-500'
                } ${message.senderId === user.uid ? 'text-right' : 'text-left'}`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>

              {message.senderId === user.uid && (
                <Avatar className="h-8 w-8 flex-shrink-0 order-2">
                  <AvatarImage src={user.photoURL} alt={user.displayName} />
                  <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={currentAI.avatar} alt={currentAI.name} />
              <AvatarFallback>{currentAI.name[0]}</AvatarFallback>
            </Avatar>
            <div className={`px-4 py-2 rounded-lg ${
              theme === 'dark' ? 'bg-[#202C33]' : 'bg-white'
            }`}>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={`px-4 py-3 border-t ${
        theme === 'dark' ? 'bg-[#202C33] border-[#2A3942]' : 'bg-white border-gray-200'
      }`}>
        <div className="flex gap-3">
          <Input
            placeholder={`Kirim pesan ke ${currentAI.name}...`}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className={`flex-1 ${
              theme === 'dark'
                ? 'bg-[#2A3942] border-[#2A3942] text-[#E9EDEF] placeholder:text-[#667781]'
                : 'bg-gray-50 border-gray-300'
            }`}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isLoading}
            className="px-4 bg-[#25D366] hover:bg-[#128C7E] text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIChatPage;
