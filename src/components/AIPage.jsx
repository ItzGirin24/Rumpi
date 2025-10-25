import React, { useState } from 'react';
import { Bot, MessageCircle, ArrowLeft, Sparkles, Brain, Heart } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import AISelector from './AISelector';
import AIChatPage from './AIChatPage';

const AIPage = ({ onBack }) => {
  const [selectedAI, setSelectedAI] = useState(null);
  const { theme } = useTheme();

  const handleAISelect = (aiId) => {
    setSelectedAI(aiId);
  };

  const handleBackToSelector = () => {
    setSelectedAI(null);
  };

  if (selectedAI) {
    return <AIChatPage selectedAI={selectedAI} onBack={handleBackToSelector} />;
  }

  return (
    <div className={`h-full flex flex-col ${
      theme === 'dark' ? 'bg-[#111B21]' : 'bg-[#F0F2F5]'
    }`}>
      {/* Header */}
      <div className={`px-4 py-3 flex items-center gap-3 border-b ${
        theme === 'dark' ? 'bg-[#202C33] border-[#2A3942]' : 'bg-white border-gray-200'
      }`}>
        <button
          onClick={onBack}
          className={`p-2 rounded-full transition-colors ${
            theme === 'dark' ? 'hover:bg-[#2A3942]' : 'hover:bg-gray-100'
          }`}
        >
          <ArrowLeft className={`h-5 w-5 ${
            theme === 'dark' ? 'text-[#AEBAC1]' : 'text-gray-600'
          }`} />
        </button>

        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${
            theme === 'dark' ? 'bg-[#00A884]' : 'bg-[#25D366]'
          }`}>
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className={`text-xl font-semibold ${
              theme === 'dark' ? 'text-[#E9EDEF]' : 'text-[#111B21]'
            }`}>
              AI Chat
            </h1>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-[#667781]' : 'text-gray-600'
            }`}>
              Percakapan tanpa batas dengan AI companions
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AISelector onSelectAI={handleAISelect} />
      </div>

      {/* Features Section */}
      <div className={`p-6 border-t ${
        theme === 'dark' ? 'border-[#2A3942] bg-[#202C33]' : 'border-gray-200 bg-white'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 text-center ${
          theme === 'dark' ? 'text-[#E9EDEF]' : 'text-[#111B21]'
        }`}>
          Fitur AI Chat
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg text-center ${
            theme === 'dark' ? 'bg-[#111B21]' : 'bg-gray-50'
          }`}>
            <Brain className={`h-8 w-8 mx-auto mb-2 ${
              theme === 'dark' ? 'text-[#00A884]' : 'text-[#25D366]'
            }`} />
            <h4 className={`font-medium mb-1 ${
              theme === 'dark' ? 'text-[#E9EDEF]' : 'text-[#111B21]'
            }`}>
              Intelligent Responses
            </h4>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-[#667781]' : 'text-gray-600'
            }`}>
              AI yang memahami konteks dan memberikan jawaban yang relevan
            </p>
          </div>

          <div className={`p-4 rounded-lg text-center ${
            theme === 'dark' ? 'bg-[#111B21]' : 'bg-gray-50'
          }`}>
            <MessageCircle className={`h-8 w-8 mx-auto mb-2 ${
              theme === 'dark' ? 'text-[#00A884]' : 'text-[#25D366]'
            }`} />
            <h4 className={`font-medium mb-1 ${
              theme === 'dark' ? 'text-[#E9EDEF]' : 'text-[#111B21]'
            }`}>
              Unlimited Conversations
            </h4>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-[#667781]' : 'text-gray-600'
            }`}>
              Chat tanpa batas waktu dengan berbagai topik menarik
            </p>
          </div>

          <div className={`p-4 rounded-lg text-center ${
            theme === 'dark' ? 'bg-[#111B21]' : 'bg-gray-50'
          }`}>
            <Heart className={`h-8 w-8 mx-auto mb-2 ${
              theme === 'dark' ? 'text-[#00A884]' : 'text-[#25D366]'
            }`} />
            <h4 className={`font-medium mb-1 ${
              theme === 'dark' ? 'text-[#E9EDEF]' : 'text-[#111B21]'
            }`}>
              Personalized Experience
            </h4>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-[#667781]' : 'text-gray-600'
            }`}>
              Setiap AI memiliki kepribadian unik untuk pengalaman yang berbeda
            </p>
          </div>
        </div>

        <div className={`mt-6 p-4 rounded-lg ${
          theme === 'dark' ? 'bg-[#111B21]' : 'bg-blue-50'
        }`}>
          <div className="flex items-start gap-3">
            <Sparkles className={`h-5 w-5 mt-0.5 ${
              theme === 'dark' ? 'text-[#00A884]' : 'text-blue-600'
            }`} />
            <div>
              <h4 className={`font-medium mb-1 ${
                theme === 'dark' ? 'text-[#E9EDEF]' : 'text-blue-900'
              }`}>
                Powered by OpenAI
              </h4>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-[#667781]' : 'text-blue-700'
              }`}>
                Menggunakan teknologi AI terdepan untuk memberikan pengalaman percakapan yang natural dan menarik
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPage;
