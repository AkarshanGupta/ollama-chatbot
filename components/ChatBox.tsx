'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Square, Loader2, MessageSquare, Bot, Sparkles } from 'lucide-react';
import Message from './Message';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
}

interface ChatBoxProps {
  chatId: string;
  onUpdateChats: () => void;
}

export default function ChatBox({ chatId, onUpdateChats }: ChatBoxProps) {
  const [chat, setChat] = useState<Chat | null>(null);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages, streamingMessage]);

  useEffect(() => {
    fetchChat();
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [chatId]);

  const fetchChat = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/chat/${chatId}`);
      if (response.ok) {
        const chatData = await response.json();
        setChat(chatData);
      }
    } catch (error) {
      console.error('Error fetching chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;

    const messageContent = input.trim();
    setInput('');
    setIsStreaming(true);
    setStreamingMessage('');

    // Optimistically add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date().toISOString(),
    };

    setChat(prev => prev ? {
      ...prev,
      messages: [...prev.messages, userMessage]
    } : null);

    try {
      const response = await fetch(`http://localhost:3001/api/chat/${chatId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: messageContent }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let buffer = '';
        
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.content) {
                  setStreamingMessage(prev => prev + data.content);
                }
                
                if (data.done) {
                  setIsStreaming(false);
                  setStreamingMessage('');
                  await fetchChat();
                  onUpdateChats();
                  return;
                }
                
                if (data.error) {
                  console.error('Stream error:', data.error);
                  setIsStreaming(false);
                  setStreamingMessage('');
                  return;
                }
              } catch (parseError) {
                console.error('Error parsing stream data:', parseError);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsStreaming(false);
      setStreamingMessage('');
    }
  };

  const stopStreaming = async () => {
    try {
      await fetch(`http://localhost:3001/api/chat/${chatId}/stop`, {
        method: 'POST',
      });
      setIsStreaming(false);
      setStreamingMessage('');
    } catch (error) {
      console.error('Error stopping stream:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
    if (e.key === 'Escape') {
      stopStreaming();
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Chat not found</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 px-6 py-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">{chat.title}</h1>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white via-slate-50/30 to-blue-50/20">
        <div className="max-w-4xl mx-auto">
          {chat.messages.length === 0 ? (
            <div className="flex items-center justify-center h-full py-20">
              <div className="text-center">
                <div className="relative mx-auto mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                    <Send className="w-8 h-8 text-slate-400" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-700 mb-2">Ready to Chat!</h3>
                <p className="text-slate-500 text-lg mb-1">Start the conversation with your AI assistant</p>
                <p className="text-slate-400 text-sm">Type a message below to begin your journey</p>
              </div>
            </div>
          ) : (
            <div className="py-6">
              {chat.messages.map((message) => (
                <Message key={message.id} message={message} />
              ))}
              
              {isStreaming && streamingMessage && (
                <Message
                  message={{
                    id: 'streaming',
                    role: 'assistant',
                    content: streamingMessage,
                    timestamp: new Date().toISOString(),
                  }}
                  isStreaming={true}
                />
              )}
              
              {isStreaming && !streamingMessage && (
                <div className="flex items-start gap-4 px-6 py-6 bg-gradient-to-r from-green-50/50 to-blue-50/50">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg animate-pulse">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm font-medium text-slate-600">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white/90 backdrop-blur-sm border-t border-slate-200/50 p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-4">
            <div className="flex-1 relative group">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                className="w-full px-5 py-4 border-2 border-slate-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md placeholder-slate-400 group-hover:border-slate-300"
                rows={1}
                style={{
                  minHeight: '52px',
                  maxHeight: '120px',
                  height: Math.min(120, Math.max(52, input.split('\n').length * 24 + 28)),
                }}
                disabled={isStreaming}
              />
            </div>
            
            {isStreaming ? (
              <button
                onClick={stopStreaming}
                className="group px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center gap-3 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Square className="w-5 h-5 group-hover:animate-pulse" />
                Stop
              </button>
            ) : (
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="group px-6 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-3 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:shadow-none"
              >
                <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                Send
              </button>
            )}
          </div>
          
          <div className="mt-4 flex items-center justify-center gap-6 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-slate-100 rounded border text-slate-600 font-mono">Enter</kbd>
              <span>Send</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-slate-100 rounded border text-slate-600 font-mono">Shift+Enter</kbd>
              <span>New line</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-slate-100 rounded border text-slate-600 font-mono">Esc</kbd>
              <span>Stop</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}