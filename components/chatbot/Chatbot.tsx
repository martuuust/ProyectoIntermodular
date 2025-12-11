import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { useTranslations } from '../../context/LanguageContext';
import { Message } from '../../types';
import { CloseIcon, SendIcon, UserIcon as UserAvatarIcon } from '../icons/Icons';
import { CAMPS_DATA } from '../../constants';

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

const EugenioAvatar: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-slate-200 ${className}`}>
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="eugenio-skin" cx="50%" cy="40%" r="60%" fx="50%" fy="40%">
          <stop offset="0%" stopColor="#FDEAE0" />
          <stop offset="100%" stopColor="#F0CDBF" />
        </radialGradient>
        <linearGradient id="eugenio-hair" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="80%" stopColor="#E0E0E0" />
          <stop offset="100%" stopColor="#C0C0C0" />
        </linearGradient>
        <linearGradient id="eugenio-shirt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#A9D4D6" />
            <stop offset="100%" stopColor="#8EB8BA" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="50" fill="#E9F6FF"/>
      <path d="M25 90 C 40 100, 60 100, 75 90 L 75 100 H 25 Z" fill="url(#eugenio-shirt)" />
      <path d="M50 88 L 46 96 H 54 Z" fill="#E9F6FF"/>
      <circle cx="50" cy="50" r="32" fill="url(#eugenio-skin)" />
      <path d="M28 35 Q 50 18, 72 35 C 85 45, 80 65, 72 55 C 80 22, 20 22, 28 55 C 20 65, 15 45, 28 35 Z" fill="url(#eugenio-hair)" />
      <path d="M38 42 Q 50 40, 62 42" stroke="#D3B8AE" strokeWidth="0.7" fill="none" />
      <path d="M40 45 Q 50 43, 60 45" stroke="#D3B8AE" strokeWidth="0.7" fill="none" />
      <path d="M30 52 L 33 53" stroke="#D3B8AE" strokeWidth="0.7" fill="none" />
      <path d="M31 55 L 34 55" stroke="#D3B8AE" strokeWidth="0.7" fill="none" />
      <path d="M70 52 L 67 53" stroke="#D3B8AE" strokeWidth="0.7" fill="none" />
      <path d="M69 55 L 66 55" stroke="#D3B8AE" strokeWidth="0.7" fill="none" />
      <g stroke="#475569" strokeWidth="2">
        <circle cx="40" cy="53" r="8" fill="rgba(210, 230, 255, 0.3)" />
        <circle cx="60" cy="53" r="8" fill="rgba(210, 230, 255, 0.3)" />
        <path d="M48 53 H 52" />
        <path d="M30 52 H 18" strokeLinecap="round"/>
        <path d="M70 52 H 82" strokeLinecap="round"/>
      </g>
      <g fill="#333">
        <circle cx="40" cy="53" r="1.8" />
        <circle cx="60" cy="53" r="1.8" />
      </g>
      <g fill="white">
         <circle cx="41" cy="52" r="0.7" />
         <circle cx="61" cy="52" r="0.7" />
      </g>
      <path d="M48 58 C 50 62, 52 62, 50 66" stroke="#D3B8AE" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M42 70 Q 50 75, 58 70" stroke="#A08C82" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M37 67 Q 42 71, 40 74" stroke="#D3B8AE" strokeWidth="0.7" fill="none" />
      <path d="M63 67 Q 58 71, 60 74" stroke="#D3B8AE" strokeWidth="0.7" fill="none" />
    </svg>
  </div>
);

const UserAvatar: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center flex-shrink-0 ${className}`}>
    <UserAvatarIcon />
  </div>
);

const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onClose }) => {
  const { t, lang } = useTranslations();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [chat, setChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    if (isOpen) {
        // Usa la API key de entorno; si falta, recurre al valor proporcionado
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY ?? 'AIzaSyA0QyLSljIwEUNPfc7HTjXzkQ0FxwgI2YE';
        const ai = new GoogleGenAI({ apiKey });
        const campInfo = CAMPS_DATA.map(camp => 
            `- Name: ${camp.name}\n  Location: ${camp.location}\n  Summary: ${camp.description}\n  Activities & Details: ${camp.longDescription}`
        ).join('\n\n');
        
        const languageMap: Record<string, string> = {
            es: 'Spanish',
            en: 'English',
            va: 'Valencian'
        };
        const currentLanguage = languageMap[lang] || 'Spanish';

        const systemInstruction = `You are Eugenio, the expert virtual guide for vlcCamp, a summer camp coordination service in the Valencian Community. Your personality is cheerful, enthusiastic, and very helpful. 🥳

Your main goal is to help users find their perfect summer camp. You can:
- Provide details about specific camps.
- Compare different camps.
- Suggest camps based on interests like "water sports", "nature", "farm animals", or "adventure".

IMPORTANT RULES:
1. You MUST ONLY use the camp data provided below to answer questions.
2. IMPORTANT: You MUST respond exclusively in ${currentLanguage}. Do not switch languages.
3. DO NOT invent information like prices, specific dates, or availability. If asked, explain that you don't have that information and suggest visiting the official camp page for the most up-to-date details.
4. Keep your answers concise, friendly, and easy to read. Use emojis to make the conversation more engaging!
5. If you don't know the answer, politely say that you can't help with that specific query but you can help with other questions about activities or locations.

Here is the camp data you have access to:
---
${campInfo}
---
Always end your responses by encouraging the user to ask more questions.`;

        const newChat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: systemInstruction,
            },
        });
        setChat(newChat);
        setMessages([{ sender: 'bot', text: t('chatbot.welcomeMessage') }]);
    } else {
        setMessages([]);
        setChat(null);
    }
  }, [isOpen, t, lang]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !chat || isLoading) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chat.sendMessageStream({ message: input });
      
      let botResponseText = '';
      setMessages(prev => [...prev, { sender: 'bot', text: '' }]);
      
      for await (const chunk of response) {
        botResponseText += chunk.text;
        setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].text = botResponseText;
            return newMessages;
        });
      }
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 w-full max-w-sm h-[32rem] bg-white rounded-xl shadow-2xl flex flex-col z-50 animate-slide-up-fast">
      <header className="bg-white p-4 rounded-t-xl flex justify-between items-center border-b flex-shrink-0">
        <div className="flex items-center gap-3">
            <EugenioAvatar />
            <h3 className="font-bold text-slate-800">{t('chatbot.title')}</h3>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
          <CloseIcon />
        </button>
      </header>

      <div className="flex-1 p-4 overflow-y-auto bg-slate-50">
        <div className="flex flex-col gap-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex gap-2.5 items-start ${msg.sender === 'user' ? 'justify-end' : ''}`}>
              {msg.sender === 'bot' && <EugenioAvatar className="w-8 h-8" />}
              <div className={`max-w-xs px-4 py-2 rounded-2xl ${msg.sender === 'user' ? 'bg-[#8EB8BA] text-white rounded-br-none' : 'bg-slate-200 text-slate-800 rounded-bl-none'}`}>
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              </div>
              {msg.sender === 'user' && <UserAvatar />}
            </div>
          ))}
           <div ref={messagesEndRef} />
        </div>
      </div>

      <footer className="p-4 border-t bg-white rounded-b-xl flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('chatbot.inputPlaceholder')}
            className="flex-1 p-2 bg-slate-100 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8EB8BA]"
            disabled={isLoading}
          />
          <button type="submit" className="bg-[#8EB8BA] text-white p-2 rounded-lg disabled:bg-slate-400" disabled={isLoading || !input.trim()}>
            <SendIcon />
          </button>
        </form>
      </footer>
       <style>{`
          @keyframes slide-up-fast {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-slide-up-fast {
            animation: slide-up-fast 0.3s ease-out forwards;
          }
        `}</style>
    </div>
  );
};

export default Chatbot;