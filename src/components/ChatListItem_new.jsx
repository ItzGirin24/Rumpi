import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useTheme } from '../context/ThemeContext';
import { getUserById } from '../services/firestoreService';
import { formatDistanceToNow } from 'date-fns';

const ChatListItem = ({ conversation, active, onClick, contacts }) => {
  const { theme } = useTheme();
  const [contact, setContact] = useState(null);

  useEffect(() => {
    loadContact();

    // Listen for contact name updates
    const handleContactNameUpdate = (event) => {
      const { contactId: updatedContactId, customName } = event.detail;
      const otherParticipantId = conversation.participants.find(p => p !== conversation.currentUserId);
      if (updatedContactId === otherParticipantId) {
        // Update the contact display name
        setContact(prev => prev ? { ...prev, displayName: customName || prev.displayName } : prev);
      }
    };

    window.addEventListener('contactNameUpdated', handleContactNameUpdate);

    return () => {
      window.removeEventListener('contactNameUpdated', handleContactNameUpdate);
    };
  }, [conversation, contacts]);

  const loadContact = async () => {
    try {
      // Find the other participant in the conversation (not the current user)
      const otherParticipantId = conversation.participants.find(p => p !== conversation.currentUserId);

      // First try to find in contacts array (for custom names)
      const contactFromContacts = contacts?.find(c => c.contactUserId === otherParticipantId);
      if (contactFromContacts) {
        setContact({
          ...contactFromContacts.user,
          displayName: contactFromContacts.customName || contactFromContacts.user.displayName
        });
        return;
      }

      // Fallback to direct user lookup
      const contactData = await getUserById(otherParticipantId);
      setContact(contactData);
    } catch (error) {
      console.error('Error loading contact:', error);
    }
  };

  if (!contact) return null;

  const timeAgo = conversation.timestamp ? formatDistanceToNow(conversation.timestamp.toDate ? conversation.timestamp.toDate() : conversation.timestamp, {
    addSuffix: false
  }) : '';

  return (
    <div
      onClick={onClick}
      className={`px-4 py-3 cursor-pointer transition-colors ${
        active
          ? theme === 'dark'
            ? 'bg-[#2A3942]'
            : 'bg-[#F0F2F5]'
          : theme === 'dark'
          ? 'hover:bg-[#202C33]'
          : 'hover:bg-[#F5F6F6]'
      } ${
        theme === 'dark' ? 'border-b border-[#2A3942]' : 'border-b border-gray-100'
      }`}
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-12 w-12 flex-shrink-0">
          <AvatarImage src={contact.photoURL} alt={contact.displayName} />
          <AvatarFallback>{contact.displayName[0]}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className={`font-medium truncate ${
              theme === 'dark' ? 'text-[#E9EDEF]' : 'text-[#111B21]'
            }`}>
              {contact.displayName}
            </h3>
            <span className={`text-xs flex-shrink-0 ml-2 ${
              conversation.unreadCount > 0
                ? theme === 'dark' ? 'text-[#00A884]' : 'text-[#008069]'
                : theme === 'dark' ? 'text-[#667781]' : 'text-[#667781]'
            }`}>
              {timeAgo}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <p className={`text-sm truncate ${
              conversation.unreadCount > 0
                ? theme === 'dark' ? 'text-[#E9EDEF]' : 'text-[#111B21]'
                : theme === 'dark' ? 'text-[#667781]' : 'text-[#667781]'
            }`}>
              {conversation.lastMessage}
            </p>
            {conversation.unreadCount > 0 && (
              <span className={`flex-shrink-0 ml-2 min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full text-xs font-medium text-white ${
                theme === 'dark' ? 'bg-[#00A884]' : 'bg-[#25D366]'
              }`}>
                {conversation.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatListItem;
