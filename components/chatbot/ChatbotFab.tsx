import React from 'react';
import { ChatbotIcon } from '../icons/Icons';

interface ChatbotFabProps {
  onToggle: () => void;
}

const ChatbotFab: React.FC<ChatbotFabProps> = ({ onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="fixed bottom-6 right-6 bg-[#8EB8BA] text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform duration-300 z-50"
      aria-label="Open chatbot"
    >
      <ChatbotIcon />
    </button>
  );
};

export default ChatbotFab;
