'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, Sparkles, Mic, Headset, PhoneCall, MoreVertical } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useGlobal } from '@/app/providers';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export function FloatingAIAssistant() {
  const { t } = useGlobal();
  const [isOpen, setIsOpen] = useState(false);
  const [showOmnichannel, setShowOmnichannel] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([{ role: 'assistant', content: t('ai_welcome') }]);
  }, [t]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user' as const, content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...messages,
            userMessage
          ]
        })
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantReply = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      setIsLoading(false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const dataStr = line.substring(6);
                if (dataStr === '[DONE]') break;
                try {
                    const data = JSON.parse(dataStr);
                    const token = data.choices[0]?.delta?.content || '';
                    assistantReply += token;
                    setMessages(prev => {
                        const newMessages = [...prev];
                        newMessages[newMessages.length - 1] = { role: 'assistant', content: assistantReply };
                        return newMessages;
                    });
                } catch (_e) {
                    // Silently ignore malformed stream chunks
                }
            }
        }
      }
    } catch (error) {
      setMessages(prev => {
          if (prev[prev.length -1].role === 'assistant' && prev[prev.length -1].content === '') {
              const newArr = [...prev];
              newArr[newArr.length - 1].content = t('connection_lost');
              return newArr;
          }
          return [...prev, { role: 'assistant', content: t('connection_lost') }];
      });
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-20 right-0 w-[350px] sm:w-[400px] h-[550px] bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden flex flex-col border border-gray-100 dark:border-white/10 shadow-2xl transition-colors"
          >
            {/* Header */}
            <div className="bg-white/80 dark:bg-slate-900/80 p-5 border-b border-gray-100 dark:border-white/10 flex items-center justify-between backdrop-blur-xl relative">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#057A42] to-emerald-400 flex items-center justify-center p-[1px] relative shadow-lg">
                  <div className="w-full h-full bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center transition-colors">
                    <Bot className="w-6 h-6 text-[#057A42] dark:text-emerald-400" />
                  </div>
                </div>
                <div>
                  <h3 className="font-black text-gray-900 dark:text-white text-sm uppercase tracking-tight">F.R.E.S.H AI</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">{t('omnichannel_online')}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                    <button onClick={() => setShowOmnichannel(!showOmnichannel)} className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 dark:text-slate-300 transition-colors" aria-label="More options">
                      <MoreVertical className="w-5 h-5" />
                   </button>
                   <AnimatePresence>
                     {showOmnichannel && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10 }}
                          className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl z-50"
                        >
                           <button className="w-full text-left px-5 py-4 text-xs font-bold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-3 transition-colors">
                              <Headset className="w-4 h-4 text-blue-500" /> {t('handoff_human')}
                           </button>
                           <button className="w-full text-left px-5 py-4 text-xs font-bold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-3 border-t border-gray-100 dark:border-white/5 transition-colors">
                              <PhoneCall className="w-4 h-4 text-emerald-500" /> {t('voice_call_ai')}
                           </button>
                        </motion.div>
                     )}
                   </AnimatePresence>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 dark:text-slate-300 transition-colors" aria-label="Close chat">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 hide-scrollbar bg-gray-50 dark:bg-slate-900/50 transition-colors">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-[1.5rem] px-5 py-4 text-sm leading-relaxed font-medium shadow-sm transition-all ${
                    msg.role === 'user' 
                      ? 'bg-[#057A42] text-white rounded-tr-none' 
                      : 'bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/5 text-gray-800 dark:text-slate-200 rounded-tl-none'
                  }`}>
                    {msg.role === 'assistant' && idx === 0 && (
                      <Sparkles className="w-4 h-4 text-yellow-500 dark:text-emerald-400 mb-2" />
                    )}
                    <div className="markdown-body prose dark:prose-invert prose-sm">
                       <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/5 rounded-2xl rounded-tl-none px-5 py-4 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-white/10 backdrop-blur-xl transition-colors">
              <div className="relative flex items-center gap-3">
                <button 
                  onClick={() => setIsRecording(!isRecording)}
                  className={`p-3 rounded-2xl transition-all shrink-0 border ${isRecording ? 'bg-red-50 dark:bg-red-900/20 text-red-500 border-red-200 dark:border-red-900/50 animate-pulse' : 'bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-slate-500 border-gray-100 dark:border-white/10 hover:text-[#057A42] dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-white/10'}`}
                  aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                >
                  <Mic className="w-5 h-5" />
                </button>
                <div className="relative flex-1">
                    <input 
                      type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
                      placeholder={isRecording ? t('listening') : t('ask_anything')}
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl py-3.5 pl-5 pr-14 text-sm text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#057A42] transition-all font-bold"
                      disabled={isRecording}
                    />
                    <button 
                      onClick={handleSend} disabled={!input.trim() || isLoading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-[#057A42] text-white disabled:opacity-30 transition-all shadow-lg hover:scale-105"
                      aria-label="Send message"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col items-end">
        <AnimatePresence>
          {!isOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: 1 }}
              className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/10 rounded-2xl p-4 mb-4 text-[11px] font-bold text-gray-600 dark:text-slate-300 max-w-[220px] shadow-2xl relative"
            >
              <div className="absolute bottom-[-6px] right-6 w-3 h-3 bg-white dark:bg-slate-800 border-r border-b border-gray-100 dark:border-white/10 rotate-45" />
              {t('ai_welcome').substring(0, 80)}...
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-[#057A42] to-emerald-400 p-[1px] shadow-2xl relative z-50 transition-all"
          aria-label={isOpen ? 'Close AI assistant' : 'Open AI assistant'}
        >
          <div className="w-full h-full rounded-[2rem] bg-white dark:bg-slate-900 flex items-center justify-center relative overflow-hidden transition-colors">
            <div className={`absolute inset-0 ${isOpen ? 'bg-orange-500/10' : 'bg-[#057A42]/10 animate-pulse'}`}></div>
            {isOpen ? (
              <X className="w-7 h-7 text-orange-500 relative z-10" />
            ) : (
              <Bot className="w-7 h-7 text-[#057A42] dark:text-emerald-400 relative z-10" />
            )}
          </div>
        </motion.button>
      </div>
    </div>
  );
}
