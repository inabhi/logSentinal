import React, { useState, useRef, useEffect } from 'react';
import { UploadPanel } from './components/UploadPanel';
import { ChatMessage } from './components/ChatMessage';
import { LogFile, RepoContext, Message } from './types';
import { analyzeLogsWithGemini } from './services/geminiService';
import ReactMarkdown from 'react-markdown'; // Add to imports if needed, mostly used in ChatMessage

const App: React.FC = () => {
  const [files, setFiles] = useState<LogFile[]>([]);
  const [repoContext, setRepoContext] = useState<RepoContext>({
    repoUrl: '',
    branch: 'main',
    buildVersion: '',
    hasAccess: false,
  });
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `**System Online.** 
      
I am ready to analyze your node logs. Please upload the relevant log files using the panel on the left. 

If you suspect a code-level bug, enable "Repository Context" and provide the build details. I will attempt to pinpoint whether the issue is a **misconfiguration** or a **software bug** requiring a patch.`,
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAnalyzing]);

  const handleSendMessage = async () => {
    if (!input.trim() && files.length === 0) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsAnalyzing(true);

    try {
      const responseText = await analyzeLogsWithGemini(userMsg.text, messages, files, repoContext);
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Critical Error: Unable to process analysis request. Please check API Key and connectivity.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-dark-900 text-gray-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <UploadPanel 
        files={files} 
        onFilesChange={setFiles}
        repoContext={repoContext}
        onRepoContextChange={setRepoContext}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Header */}
        <header className="h-16 border-b border-dark-700 flex items-center px-6 bg-dark-900/95 backdrop-blur z-10">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse mr-2"></div>
            <span className="font-mono text-sm text-primary-500 tracking-wider">
              {isAnalyzing ? 'ANALYZING LOGS...' : 'SYSTEM READY'}
            </span>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <div className="max-w-4xl mx-auto">
            {messages.map(msg => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            
            {isAnalyzing && (
              <div className="flex w-full mb-6 justify-start">
                <div className="flex max-w-[85%] flex-row">
                   <div className="shrink-0 w-8 h-8 rounded-full bg-primary-600 mr-3 flex items-center justify-center mt-1">
                     <svg className="w-4 h-4 text-white animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                   </div>
                   <div className="flex items-center p-4 bg-dark-800 rounded-2xl border border-dark-700">
                      <span className="text-sm text-gray-400 font-mono animate-pulse">Thinking process initiated...</span>
                   </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-6 bg-dark-900 border-t border-dark-700">
          <div className="max-w-4xl mx-auto relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe the issue or ask for analysis..."
              className="w-full bg-dark-800 border border-dark-600 rounded-xl pl-4 pr-14 py-4 text-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none resize-none shadow-xl"
              rows={1}
              style={{ minHeight: '60px' }}
            />
            <button
              onClick={handleSendMessage}
              disabled={isAnalyzing || (!input.trim() && files.length === 0)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </div>
          <p className="text-center text-xs text-gray-600 mt-2">
            Gemini 3.0 Pro Preview • Log Data is processed securely
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;