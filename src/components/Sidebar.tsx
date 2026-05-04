import React from 'react';
import { Plus, MessageSquare, Settings, User, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatSession } from '../types';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onClose?: () => void;
  width?: number;
}

export default function Sidebar({ 
  sessions, 
  currentSessionId, 
  onNewChat, 
  onSelectSession, 
  onDeleteSession,
  onClose 
}: SidebarProps) {
  return (
    <div id="sidebar" className="w-full h-full bg-[#0a0a0c] text-white flex flex-col p-2 space-y-2 relative border-r border-white/5">
      {onClose && (
        <button 
          onClick={onClose}
          className="md:hidden absolute top-2 right-2 p-1 text-gray-400 hover:text-cyan-400"
        >
          <X size={20} />
        </button>
      )}

      <button
        id="new-chat-btn"
        onClick={onNewChat}
        className="flex items-center gap-3 px-3 py-3 mt-4 rounded-md border border-cyan-500/30 hover:bg-cyan-500/10 hover:border-cyan-500 transition-all duration-200 text-sm font-medium group"
      >
        <Plus size={16} className="text-cyan-400 group-hover:scale-110 transition-transform" />
        Forge New Path
      </button>

      <div id="chat-history" className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
        <div className="text-xs font-semibold text-gray-600 px-3 py-4 uppercase tracking-widest">
          History
        </div>
        
        <AnimatePresence initial={false}>
          {sessions.length === 0 ? (
            <div className="px-3 py-2 text-xs text-gray-600 italic">No conversations yet</div>
          ) : (
            sessions.map((session) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => onSelectSession(session.id)}
                className={`flex items-center justify-between gap-3 px-3 py-3 rounded-md cursor-pointer transition-all group ${
                  currentSessionId === session.id ? 'bg-[#16171d] border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.05)]' : 'hover:bg-[#16171d]'
                }`}
              >
                <div className="flex items-center gap-3 truncate min-w-0">
                  <MessageSquare size={16} className={currentSessionId === session.id ? 'text-cyan-500' : 'text-gray-500 group-hover:text-cyan-500'} />
                  <div className={`text-sm truncate ${currentSessionId === session.id ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                    {session.title || 'New Chat'}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-cyan-400 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <div id="sidebar-footer" className="border-t border-white/5 pt-2 space-y-1">
        <div className="flex items-center justify-between px-3 py-3 rounded-md hover:bg-[#16171d] transition-colors cursor-pointer group border border-transparent hover:border-cyan-500/20">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full overflow-hidden border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
               <img 
                 src="https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=50&h=50&auto=format&fit=crop" 
                 alt="Profile"
                 className="w-full h-full object-cover"
                 referrerPolicy="no-referrer"
               />
             </div>
             <div className="text-sm font-medium">User Account</div>
          </div>
          <Settings size={16} className="text-gray-400 group-hover:text-white" />
        </div>
      </div>
    </div>
  );
}

