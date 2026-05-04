import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, User, Bot, Copy, ThumbsUp, ThumbsDown, Globe, Search, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ai, CHAT_MODEL } from '../lib/gemini';
import { Message, ChatSession } from '../types';

interface ChatProps {
  session: ChatSession | null;
  onUpdateSession: (session: ChatSession) => void;
}

export default function Chat({ session, onUpdateSession }: ChatProps) {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = session?.messages || [];

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const generateTitle = async (firstMessage: string) => {
    try {
      const response = await ai.models.generateContent({
        model: CHAT_MODEL,
        contents: [{ role: 'user', parts: [{ text: `Generate a very short, concise title (max 4 words) for a chat that starts with: "${firstMessage}". Return only the title text.` }] }],
      });
      return response.text.replace(/[""]/g, '').trim();
    } catch (e) {
      return firstMessage.slice(0, 30) + '...';
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const currentInput = input.trim();
    setInput('');
    setIsTyping(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: currentInput,
      timestamp: Date.now(),
    };

    let updatedSession: ChatSession;
    
    if (!session) {
      const title = await generateTitle(currentInput);
      updatedSession = {
        id: Date.now().toString(),
        title,
        messages: [userMessage],
        lastModified: Date.now(),
      };
    } else {
      updatedSession = {
        ...session,
        messages: [...session.messages, userMessage],
        lastModified: Date.now(),
      };
    }

    onUpdateSession(updatedSession);

    let modelMessageId = "";
    let streamedContent = "";
    let sessionWithPlaceholder: any = null;

    try {
      const history = updatedSession.messages.slice(0, -1).map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }));

      modelMessageId = (Date.now() + 1).toString();
      streamedContent = "";

      const placeholderModelMessage: Message = {
        id: modelMessageId,
        role: 'model',
        content: '',
        timestamp: Date.now(),
      };

      sessionWithPlaceholder = {
        ...updatedSession,
        messages: [...updatedSession.messages, placeholderModelMessage],
      };
      
      onUpdateSession(sessionWithPlaceholder);

      // Show searching state if enabled
      if (webSearchEnabled) {
        setIsSearching(true);
      }

      const streamResponse = await ai.models.generateContentStream({
        model: CHAT_MODEL,
        contents: [...history, { role: 'user', parts: [{ text: currentInput }] }],
        config: {
          systemInstruction: `You are FrameForge, your expert gaming buddy and tech support partner. You specialize in solving the tough stuff: technical configurations, hardware bottlenecks, FPS optimizations, and pro-level troubleshooting. 

          MISSION PROTOCOL:
          1. BUDDY PROTOCOL: Be a supportive friend. If the user is frustrated with lag or crashes, show empathy. Respond with a warm, conversational greeting (e.g., "Yo! Good to see you in the forge. Let's get this fixed," "Hey buddy, I've got your back—what's the mission today?"). Be the kind of helper that makes people feel comfortable asking any question, no matter how technical or simple.
          2. PRECISION FIRST: Before dropping advice, make sure you have the intel. If a request is broad, ask for hardware specs (CPU/GPU), current settings, or resolution in a friendly way.
          3. CASUAL EXPERTISE: Your tone should be relaxed, technical but accessible. Use gaming lingo naturally (e.g., "ping," "frame drops," "thermal throttling") while staying helpful.
          4. REAL-TIME INTEL: Use Google Search whenever you need the latest patch notes, benchmarks, or driver versions.
          5. VERIFICATION: If you pull data from a search, just let them know (e.g., "Checking the latest grid data for you...").`,
          tools: webSearchEnabled ? [{ googleSearch: {} }] : [],
        }
      });

      let firstChunk = true;
      for await (const chunk of streamResponse) {
        if (firstChunk) {
          setIsSearching(false);
          firstChunk = false;
        }
        
        // Handle safety filter triggers or empty responses
        const candidate = chunk.candidates?.[0];
        if (candidate?.finishReason === 'SAFETY') {
          streamedContent += "\n\n[Message interrupted by safety filters]";
        }
        
        const part = candidate?.content?.parts?.[0];
        const text = part?.text || "";
        
        if (text) {
          streamedContent += text;
          onUpdateSession({
            ...sessionWithPlaceholder,
            messages: sessionWithPlaceholder.messages.map(msg => 
              msg.id === modelMessageId ? { ...msg, content: streamedContent } : msg
            )
          });
        }
      }
    } catch (error) {
      console.error("Chat Error:", error);
      
      // If we already have some content, just mark it as an error but don't delete what we have
      if (streamedContent) {
        onUpdateSession({
          ...sessionWithPlaceholder,
          messages: sessionWithPlaceholder.messages.map(msg => 
            msg.id === modelMessageId ? { ...msg, content: streamedContent, status: 'error' } : msg
          )
        });
      } else {
        const errorMessage: Message = {
          id: Date.now().toString(),
          role: 'model',
          content: "I'm sorry, I encountered an error. Please try again.",
          status: 'error',
          timestamp: Date.now(),
        };
        
        onUpdateSession({
          ...updatedSession,
          messages: [...updatedSession.messages, errorMessage],
        });
      }
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0d0f] text-gray-100 relative overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 py-10 custom-scrollbar relative z-10 scroll-smooth">
        <div className="max-w-4xl mx-auto space-y-4 pb-40">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-12 px-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative w-80 h-48 rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(6,182,212,0.4)] border-2 border-cyan-500/50 group">
                  <img 
                    src="https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=2071&auto=format&fit=crop" 
                    alt="FrameForge Character" 
                    className="w-full h-full object-cover object-center brightness-90 contrast-110 group-hover:brightness-110 group-hover:scale-110 transition-all duration-1000"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-cyan-900/20 to-black/20"></div>
                  <div className="absolute inset-0 border-8 border-cyan-900/10 mix-blend-overlay"></div>
                </div>
                <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-cyan-800 rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.6)] border-2 border-[#0d0d0f] animate-pulse z-10 transition-transform group-hover:scale-110">
                  <Zap size={24} className="text-white" />
                </div>
              </motion.div>

              <div>
                <motion.h1 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-6xl font-extrabold tracking-tight text-white drop-shadow-[0_0_20px_rgba(34,211,238,0.6)]"
                  style={{ fontFamily: '"Cinzel", serif' }}
                >
                  FrameForge
                </motion.h1>
                <div className="flex items-center justify-center gap-3 mt-6">
                  <span className="h-[1px] w-12 bg-cyan-600/50"></span>
                  <p className="text-cyan-500 text-sm font-black tracking-[0.6em] uppercase">Forged for Gamers</p>
                  <span className="h-[1px] w-12 bg-cyan-600/50"></span>
                </div>
              </div>
            </div>
          )}

          <AnimatePresence>
            {(isSearching || isTyping) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-2 mb-6 px-4 py-3 bg-cyan-500/5 rounded-xl border border-cyan-500/20 w-fit min-w-[240px] shadow-[0_0_20px_rgba(6,182,212,0.05)]"
              >
                <div className="flex items-center gap-3 text-cyan-500/80">
                  <div className="relative flex items-center justify-center">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      className="w-4 h-4 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full"
                    />
                    <Zap size={8} className="absolute text-cyan-400 animate-pulse" />
                  </div>
                  <span className="text-[10px] uppercase font-black tracking-[0.2em] flex items-center gap-2">
                    {isSearching ? 'Accessing Intelligence Grid' : 'Processing Core Query'}
                  </span>
                </div>
                
                <div className="h-1 w-full bg-cyan-900/30 rounded-full overflow-hidden relative">
                  <motion.div 
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_#06b6d4]"
                  />
                </div>
                
                <p className="text-[8px] text-gray-500 uppercase tracking-tight flex justify-between">
                  <span>Status: {isSearching ? 'Active Scan' : 'Syncing'}</span>
                  <span>{isSearching ? 'Ping: 24ms' : 'Load: 42%'}</span>
                </p>
              </motion.div>
            )}

            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`flex w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[85%] md:max-w-[70%] group ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-lg overflow-hidden shrink-0 shadow-lg border border-white/10 mt-auto ${
                    message.role === 'model' ? 'border-cyan-500/30' : 'border-blue-500/30'
                  }`}>
                    {message.role === 'model' ? (
                      <img 
                        src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=100&h=100&auto=format&fit=crop" 
                        alt="AI"
                        className="w-full h-full object-cover transition-all duration-500"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <img 
                        src="https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=100&h=100&auto=format&fit=crop" 
                        alt="User"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </div>

                  {/* Bubble */}
                  <div className="flex flex-col gap-1">
                    <div className={`px-4 py-3 rounded-2xl shadow-xl transition-all relative hover:scale-[1.01] duration-300 ${
                      message.role === 'user' 
                        ? 'bg-blue-600/10 border border-blue-500/30 text-blue-50 rounded-tr-none border-r-4 border-r-blue-500 shadow-blue-500/5' 
                        : 'bg-[#16171d] border border-white/5 text-gray-200 rounded-tl-none border-l-4 border-l-cyan-600 shadow-cyan-500/5'
                    }`}>
                      <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-[#0a0a0c] prose-pre:p-4 prose-pre:rounded-lg prose-pre:border prose-pre:border-white/5 text-sm md:text-base selection:bg-cyan-500/30">
                        <Markdown remarkPlugins={[remarkGfm]}>{message.content}</Markdown>
                        {message.status === 'error' && <span className="text-red-400 text-[10px] mt-2 block font-mono animate-pulse">!! ERROR: SIGNAL INTERRUPTED !!</span>}
                      </div>
                    </div>
                    
                    <div className={`flex items-center gap-4 mt-1 px-1 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </span>
                      {message.role === 'model' && message.content && (
                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 ml-2">
                          <button className="hover:text-cyan-400 transition-colors p-0.5" title="Copy"><Copy size={12} /></button>
                          <button className="hover:text-blue-400 transition-colors p-0.5" title="Useful"><ThumbsUp size={12} /></button>
                          <button className="hover:text-red-500 transition-colors p-0.5" title="Not Useful"><ThumbsDown size={12} /></button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#0d0d0f] via-[#0d0d0f]/80 to-transparent pt-12 z-20">
        <div className="max-w-3xl mx-auto px-4 pb-8">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur opacity-10 group-focus-within:opacity-25 transition duration-500"></div>
            <textarea
              id="chat-input"
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={webSearchEnabled ? "Querying external grids allowed..." : "Local core query only..."}
              className="relative w-full bg-[#16171d] border border-white/10 rounded-xl py-4 pl-12 pr-12 focus:ring-1 focus:ring-cyan-500/50 shadow-2xl resize-none max-h-48 overflow-y-auto custom-scrollbar outline-none transition-all placeholder:text-gray-600"
            />
            <button
              onClick={() => setWebSearchEnabled(!webSearchEnabled)}
              className={`absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all z-30 ${
                webSearchEnabled ? 'text-cyan-500 bg-cyan-500/10' : 'text-gray-600 hover:text-gray-400'
              }`}
              title={webSearchEnabled ? "Web Search Enabled" : "Web Search Disabled"}
            >
              <Globe size={18} className={webSearchEnabled ? 'animate-pulse' : ''} />
            </button>
            <button
              id="send-btn"
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${
                input.trim() && !isTyping ? 'bg-cyan-700 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'text-gray-700 cursor-not-allowed'
              }`}
            >
              <Send size={18} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

