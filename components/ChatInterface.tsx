/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, MessageSender } from '../types'; 
import MessageItem from './MessageItem';
import { Send, Menu } from 'lucide-react';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (query: string) => void;
  isLoading: boolean;
  placeholderText?: string;
  initialQuerySuggestions?: string[];
  onSuggestedQueryClick?: (query: string) => void;
  isFetchingSuggestions?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  isLoading, 
  placeholderText,
  initialQuerySuggestions,
  onSuggestedQueryClick,
  isFetchingSuggestions,
}) => {
  const [userQuery, setUserQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = () => {
    if (userQuery.trim() && !isLoading) {
      onSendMessage(userQuery.trim());
      setUserQuery('');
    }
  };

  const showSuggestions = initialQuerySuggestions && initialQuerySuggestions.length > 0 && messages.filter(m => m.sender !== MessageSender.SYSTEM).length <= 1;

  return (
    <div className="flex flex-col h-full bg-[#111] backdrop-blur-md rounded-2xl shadow-2xl border border-white/5 overflow-hidden">
      <div className="px-6 py-5 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-black/20">
        <div className="flex items-center gap-4">
          <img 
            src="https://hassanraza.us/favicon.png" 
            alt="Hassan Raza" 
            className="w-10 h-10 rounded-full border border-white/10 shadow-lg object-cover"
            referrerPolicy="no-referrer"
          />
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Hassan Raza</h2>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 w-fit mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <p className="text-[10px] uppercase font-bold tracking-widest text-blue-500">Active</p>
            </div>
          </div>
        </div>
        <div className="hidden sm:block">
           <p className="text-[10px] uppercase font-bold tracking-widest text-white/40">AI Assistant</p>
        </div>
      </div>

      <div className="flex-grow p-6 overflow-y-auto chat-container bg-transparent">
        {/* New wrapper for max-width and centering */}
        <div className="max-w-4xl mx-auto w-full">
          {messages.map((msg) => (
            <MessageItem key={msg.id} message={msg} />
          ))}
          
          {isFetchingSuggestions && (
              <div className="flex justify-center items-center p-3">
                  <div className="flex items-center space-x-1.5 text-[#A8ABB4]">
                      <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"></div>
                      <span className="text-sm">Fetching suggestions...</span>
                  </div>
              </div>
          )}

          {showSuggestions && onSuggestedQueryClick && (
            <div className="my-3 px-1">
              <p className="text-xs text-[#A8ABB4] mb-1.5 font-medium">Or try one of these: </p>
              <div className="flex flex-wrap gap-1.5">
                {initialQuerySuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => onSuggestedQueryClick(suggestion)}
                    className="bg-zinc-900 border border-white/10 text-white/70 px-4 py-2 rounded-xl text-xs hover:bg-white hover:text-black transition-all shadow-lg active:scale-95 font-medium"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-6 border-t border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="relative group max-w-3xl mx-auto">
          <textarea
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            placeholder="Ask anything about Hassan's experience..."
            className="w-full h-14 py-4 pl-5 pr-14 border border-white/10 bg-white/5 text-white placeholder-white/30 rounded-2xl focus:ring-2 focus:ring-white/10 focus:border-white/20 transition-all resize-none text-[15px] shadow-inner scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            rows={1}
            disabled={isLoading || isFetchingSuggestions}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || isFetchingSuggestions || !userQuery.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 bg-white text-black rounded-xl transition-all hover:scale-105 active:scale-95 disabled:bg-white/10 disabled:text-white/20 disabled:scale-100 flex items-center justify-center shadow-lg"
            aria-label="Send message"
          >
            {(isLoading && messages[messages.length-1]?.isLoading && messages[messages.length-1]?.sender === MessageSender.MODEL) ? 
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> 
              : <Send size={20} />
            }
          </button>
        </div>
        <p className="text-center text-[10px] text-white/30 mt-4 tracking-tighter uppercase font-medium">Hassan Raza &copy;</p>
      </div>
    </div>
  );
};

export default ChatInterface;
