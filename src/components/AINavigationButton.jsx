import React from 'react';
import { Bot } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const AINavigationButton = ({ onClick }) => {
  const { theme } = useTheme();

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 flex items-center gap-3 rounded-lg transition-colors ${
        theme === 'dark'
          ? 'bg-[#202C33] hover:bg-[#2A3942] text-[#E9EDEF]'
          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
      }`}
    >
      <div className={`p-2 rounded-full ${
        theme === 'dark' ? 'bg-[#00A884]' : 'bg-[#25D366]'
      }`}>
        <Bot className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1 text-left">
        <h3 className={`font-medium ${
          theme === 'dark' ? 'text-[#E9EDEF]' : 'text-gray-800'
        }`}>
          AI Chat
        </h3>
        <p className={`text-sm ${
          theme === 'dark' ? 'text-[#667781]' : 'text-gray-600'
        }`}>
          Percakapan tanpa batas dengan AI companions
        </p>
      </div>
    </button>
  );
};

export default AINavigationButton;
