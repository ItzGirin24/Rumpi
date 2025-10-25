import React, { useState } from 'react';
import { Check, CheckCheck, MoreVertical, Reply, Copy, Forward, Star, Pin, Trash2, Info } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext_new';
import { format } from 'date-fns';
import { currentUser } from '../mock/chatData';
import { deleteMessageForUser } from '../services/firestoreService';

const MessageBubble = ({ message, isGroup, onMessageDeleted }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isOwnMessage = message.senderId === user?.uid;
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const timeString = format(message.timestamp, 'HH:mm');

  const handleContextMenu = (e) => {
    e.preventDefault();
    setMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  const handleMenuClick = (action) => {
    console.log('Menu action:', action, 'for message:', message.id);
    setShowContextMenu(false);

    switch (action) {
      case 'copy':
        navigator.clipboard.writeText(message.text);
        break;
      case 'reply':
        // TODO: Implement reply functionality
        console.log('Reply to message:', message.id);
        break;
      case 'forward':
        // TODO: Implement forward functionality
        console.log('Forward message:', message.id);
        break;
      case 'star':
        // TODO: Implement star functionality
        console.log('Star message:', message.id);
        break;
      case 'pin':
        // TODO: Implement pin functionality
        console.log('Pin message:', message.id);
        break;
      case 'delete':
        handleDeleteMessage();
        break;
      case 'info':
        // TODO: Implement info functionality
        console.log('Show info for message:', message.id);
        break;
      default:
        break;
    }
  };

  const handleDeleteMessage = async () => {
    if (!user?.uid) return;

    try {
      await deleteMessageForUser(message.id, user.uid);
      if (onMessageDeleted) {
        onMessageDeleted(message.id);
      }
      console.log('Message deleted successfully');
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message. Please try again.');
    }
  };

  const menuItems = [
    { icon: Reply, label: 'Reply', action: 'reply' },
    { icon: Copy, label: 'Copy', action: 'copy' },
    { icon: Forward, label: 'Forward', action: 'forward' },
    { icon: Star, label: 'Star', action: 'star' },
    { icon: Pin, label: 'Pin', action: 'pin' },
    { icon: Trash2, label: 'Delete for me', action: 'delete' },
    { icon: Info, label: 'Info', action: 'info' },
  ];

  return (
    <>
      <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-1`}>
        <div
          className={`max-w-[65%] rounded-lg px-3 py-2 shadow-sm relative ${
            isOwnMessage
              ? theme === 'dark'
                ? 'bg-[#005C4B]'
                : 'bg-[#D9FDD3]'
              : theme === 'dark'
              ? 'bg-[#202C33]'
              : 'bg-white'
          }`}
          onContextMenu={handleContextMenu}
        >
        {isGroup && !isOwnMessage && message.senderName && (
          <p className={`text-xs font-semibold mb-1 ${
            theme === 'dark' ? 'text-[#00A884]' : 'text-[#008069]'
          }`}>
            {message.senderName}
          </p>
        )}
        
        <p className={`text-sm whitespace-pre-wrap break-words ${
          theme === 'dark' ? 'text-[#E9EDEF]' : 'text-[#111B21]'
        }`}>
          {message.text}
        </p>

        <div className="flex items-center justify-end gap-1 mt-1">
          <span className={`text-xs ${
            theme === 'dark' ? 'text-[#8696A0]' : 'text-[#667781]'
          }`}>
            {timeString}
          </span>
          {isOwnMessage && (
            <span className="ml-1">
              {message.status === 'read' ? (
                <CheckCheck className={`h-4 w-4 ${
                  theme === 'dark' ? 'text-[#53BDEB]' : 'text-[#4FC3F7]'
                }`} />
              ) : message.status === 'delivered' ? (
                <CheckCheck className={`h-4 w-4 ${
                  theme === 'dark' ? 'text-[#8696A0]' : 'text-[#667781]'
                }`} />
              ) : (
                <Check className={`h-4 w-4 ${
                  theme === 'dark' ? 'text-[#8696A0]' : 'text-[#667781]'
                }`} />
              )}
            </span>
          )}
        </div>
      </div>

      {showContextMenu && (
        <div
          className="fixed z-50"
          style={{ left: menuPosition.x, top: menuPosition.y }}
          onClick={() => setShowContextMenu(false)}
        >
          <div className={`rounded-lg shadow-lg border ${
            theme === 'dark'
              ? 'bg-[#233138] border-[#2A3942]'
              : 'bg-white border-gray-200'
          } min-w-[200px] py-1`}>
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.action}
                  onClick={() => handleMenuClick(item.action)}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:${
                    theme === 'dark' ? 'bg-[#2A3942]' : 'bg-gray-50'
                  } ${
                    theme === 'dark' ? 'text-[#E9EDEF]' : 'text-gray-700'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default MessageBubble;