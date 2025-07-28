// 'use client';

// import { User, Bot } from 'lucide-react';
// import { cn } from '@/lib/utils';

// interface MessageProps {
//   message: {
//     id: string;
//     role: 'user' | 'assistant';
//     content: string;
//     timestamp: string;
//   };
//   isStreaming?: boolean;
// }

// export default function Message({ message, isStreaming = false }: MessageProps) {
//   const isUser = message.role === 'user';
  
//   const formatTime = (timestamp: string) => {
//     return new Date(timestamp).toLocaleTimeString([], { 
//       hour: '2-digit', 
//       minute: '2-digit' 
//     });
//   };

//   return (
//     <div className={cn(
//       "flex items-start gap-4 px-6 py-4 group",
//       isUser ? "bg-gray-50" : "bg-white"
//     )}>
//       {/* Avatar */}
//       <div className={cn(
//         "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
//         isUser 
//           ? "bg-blue-500 text-white" 
//           : "bg-green-500 text-white"
//       )}>
//         {isUser ? (
//           <User className="w-4 h-4" />
//         ) : (
//           <Bot className="w-4 h-4" />
//         )}
//       </div>

//       {/* Content */}
//       <div className="flex-1 min-w-0">
//         <div className="flex items-center gap-2 mb-1">
//           <span className="font-medium text-sm text-gray-900">
//             {isUser ? 'You' : 'AI Assistant'}
//           </span>
//           <span className="text-xs text-gray-500">
//             {formatTime(message.timestamp)}
//           </span>
//           {isStreaming && (
//             <div className="flex items-center gap-1">
//               <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
//               <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
//               <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
//             </div>
//           )}
//         </div>
        
//         <div className={cn(
//           "prose prose-sm max-w-none",
//           isUser ? "text-gray-900" : "text-gray-800"
//         )}>
//           <div className="whitespace-pre-wrap break-words">
//             {message.content}
//             {isStreaming && (
//               <span className="inline-block w-2 h-5 bg-gray-400 ml-1 animate-pulse"></span>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
'use client';

import { User, Bot, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageProps {
  message: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  };
  isStreaming?: boolean;
}

export default function Message({ message, isStreaming = false }: MessageProps) {
  const isUser = message.role === 'user';
  
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={cn(
      "flex items-start gap-4 px-6 py-6 group transition-all duration-200 hover:bg-slate-50/50",
      isUser 
        ? "bg-gradient-to-r from-blue-50/30 to-indigo-50/30 border-l-4 border-blue-200/50" 
        : "bg-gradient-to-r from-green-50/30 to-emerald-50/30 border-l-4 border-green-200/50"
    )}>
      {/* Avatar */}
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg transition-all duration-200 group-hover:scale-110",
        isUser 
          ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white" 
          : "bg-gradient-to-br from-green-500 to-emerald-600 text-white"
      )}>
        {isUser ? (
          <User className="w-5 h-5" />
        ) : (
          <Bot className="w-5 h-5" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <span className={cn(
            "font-bold text-sm",
            isUser 
              ? "text-blue-700" 
              : "text-green-700"
          )}>
            {isUser ? 'You' : 'AI Assistant'}
          </span>
          {!isUser && (
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-yellow-500" />
              <span className="text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">AI</span>
            </div>
          )}
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
            {formatTime(message.timestamp)}
          </span>
          {isStreaming && (
            <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              <span className="text-xs font-medium text-green-700 ml-1">typing</span>
            </div>
          )}
        </div>
        
        <div className={cn(
          "prose prose-sm max-w-none leading-relaxed",
          isUser ? "text-slate-800" : "text-slate-700"
        )}>
          <div className={cn(
            "whitespace-pre-wrap break-words p-4 rounded-2xl shadow-sm border transition-all duration-200 group-hover:shadow-md",
            isUser 
              ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50" 
              : "bg-gradient-to-br from-white to-slate-50 border-slate-200/50"
          )}>
            {message.content}
            {isStreaming && (
              <span className="inline-block w-0.5 h-5 bg-green-500 ml-1 animate-pulse"></span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}