import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { getContactById } from '../mock/chatData';
import { useTheme } from '../context/ThemeContext';
import { formatDistanceToNow } from 'date-fns';

const ChatListItem = ({ conversation, active, onClick }) => {
  const { theme } = useTheme();
  const contact = getContactById(conversation.contactId);

  if (!contact) return null;

  const timeAgo = formatDistanceToNow(conversation.timestamp, {
    addSuffix: false
  });

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
          <AvatarImage src={contact.avatar} alt={contact.name} />
          <AvatarFallback>{contact.name[0]}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className={`font-medium truncate ${
              theme === 'dark' ? 'text-[#E9EDEF]' : 'text-[#111B21]'
            }`}>
              {contact.name}
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