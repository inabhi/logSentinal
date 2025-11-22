import React from 'react';
import { Message } from '../types';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isModel = message.role === 'model';

  return (
    <div className={`flex w-full mb-6 ${isModel ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex max-w-[85%] ${isModel ? 'flex-row' : 'flex-row-reverse'}`}>
        
        {/* Avatar */}
        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 ${isModel ? 'bg-primary-600 mr-3' : 'bg-dark-700 ml-3 border border-gray-600'}`}>
          {isModel ? (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
          ) : (
            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          )}
        </div>

        {/* Content */}
        <div className={`flex flex-col ${isModel ? 'items-start' : 'items-end'}`}>
            <div className={`rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-lg ${
              isModel 
                ? 'bg-dark-800 text-gray-200 border border-dark-700' 
                : 'bg-primary-600 text-white'
            }`}>
              {isModel ? (
                 <div className="prose prose-invert prose-sm max-w-none prose-pre:bg-dark-900 prose-pre:border prose-pre:border-gray-700 prose-code:text-primary-100">
                    <ReactMarkdown components={{
                        code({node, inline, className, children, ...props}: any) {
                            return !inline ? (
                                <code className={`${className} block p-2 rounded bg-black/30 font-mono text-xs overflow-x-auto my-2`} {...props}>
                                    {children}
                                </code>
                            ) : (
                                <code className="bg-black/20 rounded px-1 py-0.5 font-mono text-xs" {...props}>
                                    {children}
                                </code>
                            )
                        }
                    }}>{message.text}</ReactMarkdown>
                 </div>
              ) : (
                <p className="whitespace-pre-wrap">{message.text}</p>
              )}
            </div>
            <span className="text-[10px] text-gray-500 mt-1 px-1">
              {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
            </span>
        </div>
      </div>
    </div>
  );
};