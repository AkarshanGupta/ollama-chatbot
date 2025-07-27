'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Square, Loader2 } from 'lucide-react';
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
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">{chat.title}</h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="max-w-4xl mx-auto">
          {chat.messages.length === 0 ? (
            <div className="flex items-center justify-center h-full py-12">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg">Start the conversation</p>
                <p className="text-gray-400 text-sm mt-1">Type a message below to begin</p>
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
                <div className="flex items-start gap-4 px-6 py-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-medium">AI</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">AI is thinking...</span>
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
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={1}
                style={{
                  minHeight: '44px',
                  maxHeight: '120px',
                  height: Math.min(120, Math.max(44, input.split('\n').length * 20 + 24)),
                }}
                disabled={isStreaming}
              />
            </div>
            
            {isStreaming ? (
              <button
                onClick={stopStreaming}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <Square className="w-4 h-4" />
                Stop
              </button>
            ) : (
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            )}
          </div>
          
          <div className="mt-2 text-xs text-gray-500 text-center">
            Press Enter to send, Shift+Enter for new line, Esc to stop
          </div>
        </div>
      </div>
    </div>
  );
}