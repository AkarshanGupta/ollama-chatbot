'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import ChatBox from '@/components/ChatBox';
import { MessageSquare, Sparkles } from 'lucide-react';

interface Chat {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export default function Home() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchChats = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/chats');
      if (response.ok) {
        const chatsData = await response.json();
        setChats(chats);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const createNewChat = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: 'New Chat' }),
      });

      if (response.ok) {
        const newChat = await response.json();
        setChats(prev => [newChat, ...prev]);
        setSelectedChatId(newChat.id);
      }
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/chat/${chatId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setChats(prev => prev.filter(chat => chat.id !== chatId));
        if (selectedChatId === chatId) {
          setSelectedChatId(null);
        }
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        chats={chats}
        selectedChatId={selectedChatId}
        onSelectChat={setSelectedChatId}
        onNewChat={createNewChat}
        onDeleteChat={deleteChat}
      />
      
      <div className="flex-1 flex flex-col">
        {selectedChatId ? (
          <ChatBox 
            chatId={selectedChatId} 
            onUpdateChats={fetchChats}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md mx-auto px-6">
              <div className="mb-8">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Local ChatGPT
                </h1>
                <p className="text-gray-600 mb-8">
                  Start a conversation with your local AI assistant powered by Ollama
                </p>
              </div>
              
              <button
                onClick={createNewChat}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Start New Chat
              </button>
              
              <div className="mt-8 text-sm text-gray-500">
                <p>Make sure Ollama is running with gemma:2b model</p>
                <p className="mt-1">Endpoint: http://localhost:11434</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}