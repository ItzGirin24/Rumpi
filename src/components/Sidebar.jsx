import React, { useState, useEffect } from 'react';
import { Search, MoreVertical, MessageSquarePlus, Users, Archive } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Input } from './ui/input';
import ChatListItem from './ChatListItem_new';
import SettingsModal from './SettingsModal';
import AddContactModal from './AddContactModal';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext_new';
import { getUserConversations, getUserContacts } from '../services/firestoreService';

const Sidebar = ({ activeChat, onChatSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [contacts, setContacts] = useState([]);
  const { theme } = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadConversations();
      loadContacts();
    }

    // Listen for contact name updates
    const handleContactNameUpdate = (event) => {
      // Refresh contacts when a name is updated
      if (user) {
        loadContacts();
      }
    };

    window.addEventListener('contactNameUpdated', handleContactNameUpdate);

    return () => {
      window.removeEventListener('contactNameUpdated', handleContactNameUpdate);
    };
  }, [user]);

  const loadConversations = async () => {
    try {
      getUserConversations(user.uid, (userConversations) => {
        setConversations(userConversations);
      });
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadContacts = async () => {
    try {
      const userContacts = await getUserContacts(user.uid);
      // Add AI contacts
      const aiContacts = [
        {
          id: 'ai-contact-1',
          contactUserId: 'ai-contact-1',
          customName: null,
          addedAt: new Date(),
          user: {
            uid: 'ai-contact-1',
            displayName: 'Alex Rivera',
            email: 'alex@ai.com',
            photoURL: 'https://ui-avatars.com/api/?name=Alex+Rivera&background=ff6b6b&color=fff',
            phoneNumber: '+62 817 6666 6666',
            online: true,
            lastSeen: new Date(),
            isAI: true
          }
        },
        {
          id: 'ai-contact-2',
          contactUserId: 'ai-contact-2',
          customName: null,
          addedAt: new Date(),
          user: {
            uid: 'ai-contact-2',
            displayName: 'Maya Patel',
            email: 'maya@ai.com',
            photoURL: 'https://ui-avatars.com/api/?name=Maya+Patel&background=4ecdc4&color=fff',
            phoneNumber: '+62 818 7777 7777',
            online: true,
            lastSeen: new Date(),
            isAI: true
          }
        }
      ];
      setContacts([...userContacts, ...aiContacts]);
    } catch (error) {
      console.error('Error loading contacts:', error);
      // Fallback to AI contacts only
      const aiContacts = [
        {
          id: 'ai-contact-1',
          contactUserId: 'ai-contact-1',
          customName: null,
          addedAt: new Date(),
          user: {
            uid: 'ai-contact-1',
            displayName: 'Alex Rivera',
            email: 'alex@ai.com',
            photoURL: 'https://ui-avatars.com/api/?name=Alex+Rivera&background=ff6b6b&color=fff',
            phoneNumber: '+62 817 6666 6666',
            online: true,
            lastSeen: new Date(),
            isAI: true
          }
        },
        {
          id: 'ai-contact-2',
          contactUserId: 'ai-contact-2',
          customName: null,
          addedAt: new Date(),
          user: {
            uid: 'ai-contact-2',
            displayName: 'Maya Patel',
            email: 'maya@ai.com',
            photoURL: 'https://ui-avatars.com/api/?name=Maya+Patel&background=4ecdc4&color=fff',
            phoneNumber: '+62 818 7777 7777',
            online: true,
            lastSeen: new Date(),
            isAI: true
          }
        }
      ];
      setContacts(aiContacts);
    }
  };

  const handleContactAdded = () => {
    // Refresh contacts and conversations after adding new contact
    loadContacts();
    loadConversations();
  };

  const filteredConversations = (conversations || []).filter(conv => {
    // Only show conversations where the other participant is in contacts
    const otherParticipantId = conv.participants.find(p => p !== user.uid);
    const contact = (contacts || []).find(c => c.contactUserId === otherParticipantId);

    // If no contact found, don't show this conversation
    if (!contact) return false;

    // Filter by search query
    return contact.user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           conv.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <>
      <div className={`h-full flex flex-col border-r md:border-r ${
        theme === 'dark'
          ? 'bg-[#111B21] border-[#2A3942]'
          : 'bg-[#F0F2F5] border-gray-200'
      }`}>
        {/* Header */}
        <div className={`px-4 py-3 flex items-center justify-between ${
          theme === 'dark' ? 'bg-[#202C33]' : 'bg-[#F0F2F5]'
        }`}>
          <Avatar className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity">
            <AvatarImage src={user.photoURL} alt={user.displayName} />
            <AvatarFallback>{user.displayName[0]}</AvatarFallback>
          </Avatar>
          
          <div className="flex items-center gap-6">
            <Users className={`h-5 w-5 cursor-pointer transition-colors ${
              theme === 'dark' 
                ? 'text-[#AEBAC1] hover:text-white' 
                : 'text-[#54656F] hover:text-black'
            }`} />
            <MessageSquarePlus
              className={`h-5 w-5 cursor-pointer transition-colors ${
                theme === 'dark'
                  ? 'text-[#AEBAC1] hover:text-white'
                  : 'text-[#54656F] hover:text-black'
              }`}
              onClick={() => setShowAddContact(true)}
            />
            <MoreVertical 
              className={`h-5 w-5 cursor-pointer transition-colors ${
                theme === 'dark' 
                  ? 'text-[#AEBAC1] hover:text-white' 
                  : 'text-[#54656F] hover:text-black'
              }`}
              onClick={() => setShowSettings(true)}
            />
          </div>
        </div>

        {/* Search */}
        <div className={`px-3 py-2 ${
          theme === 'dark' ? 'bg-[#111B21]' : 'bg-[#F0F2F5]'
        }`}>
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
              theme === 'dark' ? 'text-[#AEBAC1]' : 'text-[#54656F]'
            }`} />
            <Input
              placeholder="Cari atau mulai chat baru"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 rounded-lg border-none ${
                theme === 'dark'
                  ? 'bg-[#202C33] text-[#E9EDEF] placeholder:text-[#667781]'
                  : 'bg-white text-black placeholder:text-gray-500'
              }`}
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div className={`px-3 py-1 flex gap-2 ${
          theme === 'dark' ? 'bg-[#111B21]' : 'bg-[#F0F2F5]'
        }`}>
          <button className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            theme === 'dark'
              ? 'bg-[#202C33] text-[#00A884] hover:bg-[#2A3942]'
              : 'bg-[#E9EDEF] text-[#008069] hover:bg-[#D1D7DB]'
          }`}>
            Semua
          </button>
          <button className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            theme === 'dark'
              ? 'text-[#8696A0] hover:bg-[#202C33]'
              : 'text-[#54656F] hover:bg-[#E9EDEF]'
          }`}>
            Belum dibaca
          </button>
          <button className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            theme === 'dark'
              ? 'text-[#8696A0] hover:bg-[#202C33]'
              : 'text-[#54656F] hover:bg-[#E9EDEF]'
          }`}>
            Grup
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
          {filteredConversations.length > 0 ? (
            filteredConversations.map(conv => {
              // Find the other participant in the conversation (not the current user)
              const otherParticipantId = conv.participants.find(p => p !== user.uid);
              return (
                <ChatListItem
                  key={conv.id}
                  conversation={{...conv, currentUserId: user.uid}}
                  active={activeChat === otherParticipantId}
                  onClick={() => onChatSelect(otherParticipantId)}
                  contacts={contacts}
                />
              );
            })
          ) : (
            <div className={`text-center py-8 px-4 ${
              theme === 'dark' ? 'text-[#8696A0]' : 'text-gray-500'
            }`}>
              Tidak ada chat yang ditemukan
            </div>
          )}
        </div>
      </div>

      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}

      {showAddContact && (
        <AddContactModal
          isOpen={showAddContact}
          onClose={() => setShowAddContact(false)}
          onContactAdded={handleContactAdded}
        />
      )}
    </>
  );
};

export default Sidebar;