/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { marked } from 'marked';
import hljs from 'highlight.js';
import { ChatMessage, MessageSender, UrlContextMetadataItem } from '../types';

// Configure marked to use highlight.js for syntax highlighting
marked.setOptions({
  highlight: function(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  },
  langPrefix: 'hljs language-', // Prefix for CSS classes
} as any); // Added 'as any' to bypass the type error

interface MessageItemProps {
  message: ChatMessage;
}

const SenderAvatar: React.FC<{ sender: MessageSender }> = ({ sender }) => {
  if (sender === MessageSender.USER) {
    return (
      <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 border border-white/5 shadow-sm">
        YOU
      </div>
    );
  }

  if (sender === MessageSender.MODEL) {
    return (
      <img 
        src="https://hassanraza.us/favicon.png" 
        alt="HR" 
        className="w-8 h-8 rounded-full flex-shrink-0 border border-white/10 shadow-sm"
        referrerPolicy="no-referrer"
      />
    );
  }

  // SYSTEM
  return (
    <div className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0 border border-white/5">
      SYS
    </div>
  );
};

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isUser = message.sender === MessageSender.USER;
  const isModel = message.sender === MessageSender.MODEL;
  const isSystem = message.sender === MessageSender.SYSTEM;

  const renderMessageContent = () => {
    if (isModel && !message.isLoading) {
      const proseClasses = "markdown-body w-full min-w-0"; 
      const rawMarkup = marked.parse(message.text || "") as string;
      return <div className={proseClasses} dangerouslySetInnerHTML={{ __html: rawMarkup }} />;
    }
    
    let textColorClass = '';
    if (isUser) {
        textColorClass = 'text-white';
    } else if (isSystem) {
        textColorClass = 'text-[#A8ABB4]';
    } else { // Model loading, also use prose colors
        textColorClass = 'text-[#E2E2E2]';
    }
    return <div className={`whitespace-pre-wrap text-[15px] leading-relaxed ${textColorClass}`}>{message.text}</div>;
  };
  
  let bubbleClasses = "p-3 rounded-lg shadow w-full "; // Added w-full

  if (isUser) {
    bubbleClasses += "bg-white/5 border border-white/10 text-white rounded-2xl rounded-tr-none";
  } else if (isModel) {
    bubbleClasses += `bg-transparent border border-white/5 text-zinc-300 rounded-2xl rounded-tl-none`;
  } else { // System message
    bubbleClasses += "bg-zinc-900 border border-white/5 text-zinc-500 rounded-2xl text-[12px]";
  }

  return (
    <div className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-start gap-2 max-w-[85%]`}>
        {!isUser && <SenderAvatar sender={message.sender} />}
        <div className={bubbleClasses}>
          {message.isLoading ? (
            <div className="flex items-center space-x-1.5">
              <div className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.3s] ${isUser ? 'bg-white' : 'bg-[#A8ABB4]'}`}></div>
              <div className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.15s] ${isUser ? 'bg-white' : 'bg-[#A8ABB4]'}`}></div>
              <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${isUser ? 'bg-white' : 'bg-[#A8ABB4]'}`}></div>
            </div>
          ) : (
            renderMessageContent()
          )}
          
          {isModel && message.urlContext && message.urlContext.length > 0 && (
            <div className="mt-2.5 pt-2.5 border-t border-[rgba(255,255,255,0.1)]">
              <h4 className="text-xs font-semibold text-[#A8ABB4] mb-1">Context URLs Retrieved:</h4>
              <ul className="space-y-0.5">
                {message.urlContext.map((meta, index) => {
                  const statusText = typeof meta.urlRetrievalStatus === 'string' 
                    ? meta.urlRetrievalStatus.replace('URL_RETRIEVAL_STATUS_', '') 
                    : 'UNKNOWN';
                  const isSuccess = meta.urlRetrievalStatus === 'URL_RETRIEVAL_STATUS_SUCCESS';

                  return (
                    <li key={index} className="text-[11px] text-[#A8ABB4]">
                      <a href={meta.retrievedUrl} target="_blank" rel="noopener noreferrer" className="hover:underline break-all text-[#79B8FF]">
                        {meta.retrievedUrl}
                      </a>
                      <span className={`ml-1.5 px-1 py-0.5 rounded-sm text-[9px] ${
                        isSuccess
                          ? 'bg-white/[.12] text-white'
                          : 'bg-slate-600/30 text-slate-400'
                      }`}>
                        {statusText}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
        {isUser && <SenderAvatar sender={message.sender} />}
      </div>
    </div>
  );
};

export default MessageItem;
