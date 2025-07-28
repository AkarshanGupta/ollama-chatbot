// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Sidebar from '@/components/Sidebar';
// import ChatBox from '@/components/ChatBox';
// import { MessageSquare, Sparkles } from 'lucide-react';

// interface Chat {
//   id: string;
//   title: string;
//   createdAt: string;
//   updatedAt: string;
// }

// export default function Home() {
//   const [chats, setChats] = useState<Chat[]>([]);
//   const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   const fetchChats = async () => {
//     try {
//       const response = await fetch('http://localhost:3001/api/chats');
//       if (response.ok) {
//         const chatsData = await response.json();
//         setChats(chats);
//       }
//     } catch (error) {
//       console.error('Error fetching chats:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchChats();
//   }, []);

//   const createNewChat = async () => {
//     try {
//       const response = await fetch('http://localhost:3001/api/chat', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ title: 'New Chat' }),
//       });

//       if (response.ok) {
//         const newChat = await response.json();
//         setChats(prev => [newChat, ...prev]);
//         setSelectedChatId(newChat.id);
//       }
//     } catch (error) {
//       console.error('Error creating new chat:', error);
//     }
//   };

//   const deleteChat = async (chatId: string) => {
//     try {
//       const response = await fetch(`http://localhost:3001/api/chat/${chatId}`, {
//         method: 'DELETE',
//       });

//       if (response.ok) {
//         setChats(prev => prev.filter(chat => chat.id !== chatId));
//         if (selectedChatId === chatId) {
//           setSelectedChatId(null);
//         }
//       }
//     } catch (error) {
//       console.error('Error deleting chat:', error);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-50">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex h-screen bg-gray-50">
//       <Sidebar
//         chats={chats}
//         selectedChatId={selectedChatId}
//         onSelectChat={setSelectedChatId}
//         onNewChat={createNewChat}
//         onDeleteChat={deleteChat}
//       />
      
//       <div className="flex-1 flex flex-col">
//         {selectedChatId ? (
//           <ChatBox 
//             chatId={selectedChatId} 
//             onUpdateChats={fetchChats}
//           />
//         ) : (
//           <div className="flex-1 flex items-center justify-center">
//             <div className="text-center max-w-md mx-auto px-6">
//               <div className="mb-8">
//                 <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
//                   <Sparkles className="w-8 h-8 text-white" />
//                 </div>
//                 <h1 className="text-3xl font-bold text-gray-900 mb-2">
//                   Local ChatGPT
//                 </h1>
//                 <p className="text-gray-600 mb-8">
//                   Start a conversation with your local AI assistant powered by Ollama
//                 </p>
//               </div>
              
//               <button
//                 onClick={createNewChat}
//                 className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//               >
//                 <MessageSquare className="w-5 h-5 mr-2" />
//                 Start New Chat
//               </button>
              
//               <div className="mt-8 text-sm text-gray-500">
//                 <p>Make sure Ollama is running with gemma:2b model</p>
//                 <p className="mt-1">Endpoint: http://localhost:11434</p>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import ChatBox from '@/components/ChatBox';
import { MessageSquare, Sparkles, Zap, Brain } from 'lucide-react';

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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="text-slate-600 font-medium">Initializing AI Assistant...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
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
              <div className="mb-12">
                <div className="relative mx-auto w-24 h-24 mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-2xl rotate-6 animate-pulse"></div>
                  <div className="relative bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-2xl w-full h-full flex items-center justify-center shadow-2xl">
                    <Brain className="w-12 h-12 text-white animate-pulse" />
                  </div>
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-3">
                  Local AI Assistant
                </h1>
                <p className="text-slate-600 text-lg leading-relaxed mb-8">
                  Experience the power of local AI with <span className="font-semibold text-indigo-600">Ollama</span> and <span className="font-semibold text-purple-600">Gemma 2B</span>
                </p>
              </div>
              
              <button
                onClick={createNewChat}
                className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl font-semibold text-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                <Zap className="relative w-6 h-6 mr-3 group-hover:animate-pulse" />
                <span className="relative">Start New Conversation</span>
                Start New Chat
              </button>
              
              <div className="mt-10 p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                  <p className="text-sm font-medium text-slate-700">System Status</p>
                </div>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Ollama Server</span>
                    <span className="text-green-600 font-medium">localhost:11434</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Model</span>
                    <span className="text-indigo-600 font-medium">gemma:2b</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}