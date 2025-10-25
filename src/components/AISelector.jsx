import React from 'react';
import { Bot, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useTheme } from '../context/ThemeContext';

const AISelector = ({ onSelectAI }) => {
  const { theme } = useTheme();

  const aiContacts = [
    {
      id: 'ai-contact-1',
      name: 'Alex Rivera',
      avatar: 'https://ui-avatars.com/api/?name=Alex+Rivera&background=ff6b6b&color=fff',
      status: 'AI Assistant - Always here to chat!',
      description: 'Witty and knowledgeable AI assistant'
    },
    {
      id: 'ai-contact-2',
      name: 'Maya Patel',
      avatar: 'https://ui-avatars.com/api/?name=Maya+Patel&background=4ecdc4&color=fff',
      status: 'AI Companion - Ready for conversation!',
      description: 'Friendly and empathetic AI companion'
    }
  ];

  return (
    <div className={`h-full flex flex-col items-center justify-center p-8 ${
      theme === 'dark' ? 'bg-[#111B21]' : 'bg-[#F0F2F5]'
    }`}>
      <div className={`max-w-md w-full text-center mb-8 ${
        theme === 'dark' ? 'bg-[#202C33]' : 'bg-white'
      } rounded-lg p-6 shadow-lg`}>
        <Bot className={`h-16 w-16 mx-auto mb-4 ${
          theme === 'dark' ? 'text-[#00A884]' : 'text-[#25D366]'
        }`} />
        <h1 className={`text-2xl font-bold mb-2 ${
          theme === 'dark' ? 'text-[#E9EDEF]' : 'text-[#111B21]'
        }`}>
          AI Chat
        </h1>
        <p className={`text-sm ${
          theme === 'dark' ? 'text-[#667781]' : 'text-gray-600'
        }`}>
          Pilih AI companion untuk memulai percakapan yang menarik
        </p>
      </div>

      <div className="grid gap-4 w-full max-w-md">
        {aiContacts.map((ai) => (
          <div
            key={ai.id}
            onClick={() => onSelectAI(ai.id)}
            className={`p-4 rounded-lg cursor-pointer transition-all hover:scale-105 ${
              theme === 'dark'
                ? 'bg-[#202C33] hover:bg-[#2A3942] border border-[#2A3942]'
                : 'bg-white hover:bg-gray-50 border border-gray-200'
            } shadow-md`}
          >
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={ai.avatar} alt={ai.name} />
                <AvatarFallback>{ai.name[0]}</AvatarFallback>
              </Avatar>

              <div className="flex-1 text-left">
                <h3 className={`font-semibold ${
                  theme === 'dark' ? 'text-[#E9EDEF]' : 'text-[#111B21]'
                }`}>
                  {ai.name}
                </h3>
                <p className={`text-sm mb-1 ${
                  theme === 'dark' ? 'text-[#667781]' : 'text-gray-600'
                }`}>
                  {ai.status}
                </p>
                <p className={`text-xs ${
                  theme === 'dark' ? 'text-[#8696A0]' : 'text-gray-500'
                }`}>
                  {ai.description}
                </p>
              </div>

              <div className={`p-2 rounded-full ${
                theme === 'dark' ? 'bg-[#00A884]' : 'bg-[#25D366]'
              }`}>
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={`mt-8 text-center ${
        theme === 'dark' ? 'text-[#667781]' : 'text-gray-600'
      }`}>
        <p className="text-sm">
          AI companions ini akan merespons pesan Anda secara otomatis dengan percakapan yang natural
        </p>
      </div>
    </div>
  );
};

export default AISelector;
