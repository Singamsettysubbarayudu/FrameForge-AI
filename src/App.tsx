/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Chat from './components/Chat';
import { Menu, X, ChevronLeft } from 'lucide-react';
import { ChatSession } from './types';

const MIN_SIDEBAR_WIDTH = 200;
const MAX_SIDEBAR_WIDTH = 450;
const DEFAULT_SIDEBAR_WIDTH = 260;

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('sidebar-width');
    return saved ? parseInt(saved, 10) : DEFAULT_SIDEBAR_WIDTH;
  });
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('frame-forge-sessions');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('frame-forge-sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('sidebar-width', sidebarWidth.toString());
  }, [sidebarWidth]);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing) {
      const newWidth = e.clientX;
      if (newWidth >= MIN_SIDEBAR_WIDTH && newWidth <= MAX_SIDEBAR_WIDTH) {
        setSidebarWidth(newWidth);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    } else {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  const currentSession = sessions.find(s => s.id === currentSessionId) || null;

  const handleNewChat = () => {
    setCurrentSessionId(null);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleSelectSession = (id: string) => {
    setCurrentSessionId(id);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleDeleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (currentSessionId === id) setCurrentSessionId(null);
  };

  const handleUpdateSession = (updatedSession: ChatSession) => {
    setSessions(prev => {
      const exists = prev.find(s => s.id === updatedSession.id);
      if (exists) {
        return prev.map(s => s.id === updatedSession.id ? updatedSession : s);
      }
      return [updatedSession, ...prev];
    });
    if (!currentSessionId) setCurrentSessionId(updatedSession.id);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div 
      id="app-container" 
      className={`flex h-screen w-full overflow-hidden font-sans bg-[#343541] ${isResizing ? 'cursor-col-resize select-none' : ''}`}
    >
      {/* Desktop/Mobile Toggle when closed */}
      {!isSidebarOpen && (
        <button 
          className="absolute top-4 left-4 z-50 p-2 bg-[#202123]/80 backdrop-blur-md rounded-lg text-white border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all shadow-xl group"
          onClick={toggleSidebar}
        >
          <Menu size={20} className="group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* Sidebar - Desktop */}
      <div 
        ref={sidebarRef}
        style={{ width: isSidebarOpen ? `${sidebarWidth}px` : '0px' }}
        className={`hidden md:flex relative flex-col border-r border-white/10 ${!isSidebarOpen ? 'overflow-hidden border-none' : ''} ${!isResizing ? 'transition-[width] duration-300 ease-in-out' : ''}`}
      >
        <Sidebar 
          sessions={sessions}
          currentSessionId={currentSessionId}
          onNewChat={handleNewChat} 
          onSelectSession={handleSelectSession}
          onDeleteSession={handleDeleteSession}
          width={sidebarWidth}
        />
        
        {/* Resize Handle and Collapse Button */}
        {isSidebarOpen && (
          <>
            <div
              className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-cyan-500/50 transition-colors z-50 ${isResizing ? 'bg-cyan-500' : ''}`}
              onMouseDown={startResizing}
            />
            <button
               onClick={() => setIsSidebarOpen(false)}
               className="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-12 bg-[#0a0a0c] border border-white/10 rounded-r-md flex items-center justify-center text-gray-400 hover:text-white hover:bg-cyan-500/20 transition-all z-[60] group cursor-pointer shadow-lg"
               title="Collapse Sidebar"
            >
               <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
          </>
        )}
      </div>

      {/* Sidebar - Mobile Overlay */}
      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={toggleSidebar}>
          <div className="w-[260px] h-full" onClick={e => e.stopPropagation()}>
            <Sidebar 
              sessions={sessions}
              currentSessionId={currentSessionId}
              onNewChat={handleNewChat} 
              onSelectSession={handleSelectSession}
              onDeleteSession={handleDeleteSession}
              onClose={() => setIsSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 h-full relative">
        <Chat 
          session={currentSession}
          onUpdateSession={handleUpdateSession}
        />
      </main>
    </div>
  );
}


