'use client';

import { useState } from 'react';
import { MessageSquare, Plus, Trash2, Sparkles, Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Chat {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface SidebarProps {
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
}

export default function Sidebar({
  chats,
  selectedChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
}: SidebarProps) {
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="w-80 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col h-full shadow-2xl border-r border-slate-700/50">
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-700/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            AI Assistant
          </h2>
        </div>
        <button
          onClick={onNewChat}
          className="group w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
            <Plus className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-white group-hover:text-blue-200 transition-colors">New Conversation</span>
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {chats.length === 0 ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-slate-500" />
            </div>
            <p className="text-slate-400 font-medium">No conversations yet</p>
            <p className="text-slate-500 text-sm mt-1">Start your first chat above</p>
          </div>
        ) : (
          <div className="space-y-2">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={cn(
                  "group relative flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg",
                  selectedChatId === chat.id
                    ? "bg-gradient-to-r from-blue-600/30 to-purple-600/30 border border-blue-500/30 shadow-lg shadow-blue-500/10"
                    : "hover:bg-slate-800/50 border border-transparent hover:border-slate-700/50"
                )}
                onClick={() => onSelectChat(chat.id)}
                onMouseEnter={() => setHoveredChatId(chat.id)}
                onMouseLeave={() => setHoveredChatId(null)}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200",
                  selectedChatId === chat.id
                    ? "bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg"
                    : "bg-slate-700/50 group-hover:bg-slate-600/50"
                )}>
                  <MessageSquare className={cn(
                    "w-4 h-4 transition-colors",
                    selectedChatId === chat.id ? "text-white" : "text-slate-400 group-hover:text-slate-300"
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-semibold truncate transition-colors",
                    selectedChatId === chat.id ? "text-white" : "text-slate-200 group-hover:text-white"
                  )}>
                    {chat.title}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <p className="text-xs text-slate-500">
                      {formatDate(chat.updatedAt)}
                    </p>
                  </div>
                </div>
                
                {hoveredChatId === chat.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/20 border border-transparent hover:border-red-500/30 transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-400 transition-colors" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-slate-700/50 bg-gradient-to-r from-slate-800/30 to-slate-700/30">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <p className="text-xs font-semibold text-slate-300">Powered by Ollama</p>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <p className="text-xs text-slate-400">gemma:2b model</p>
          </div>
        </div>
      </div>
    </div>
  );
}