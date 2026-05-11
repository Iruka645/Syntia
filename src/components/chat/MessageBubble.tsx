"use client";

import { 
  Bot, 
  MoreVertical, 
  RefreshCw, 
  Pencil, 
  Trash2, 
  Sparkles, 
  Check, 
  X as CloseIcon 
} from "lucide-react";
import { Message, Chat } from "@/types";

interface MessageBubbleProps {
  msg: Message;
  chat: Chat | null;
  isLast: boolean;
  editingMessageId: number | null;
  setEditingMessageId: (id: number | null) => void;
  editValue: string;
  setEditValue: (val: string) => void;
  handleEdit: (id: number) => void;
  activeMenuId: number | null;
  setActiveMenuId: (id: number | null) => void;
  handleResend: (id: number) => void;
  handleDelete: (id: number) => void;
  handleReroll: (id: number) => void;
  rollBackState: { id: number, content: string } | null;
  setRollBackState: (state: { id: number, content: string } | null) => void;
  handleUndoReroll: () => void;
}

export function MessageBubble({
  msg,
  chat,
  isLast,
  editingMessageId,
  setEditingMessageId,
  editValue,
  setEditValue,
  handleEdit,
  activeMenuId,
  setActiveMenuId,
  handleResend,
  handleDelete,
  handleReroll,
  rollBackState,
  setRollBackState,
  handleUndoReroll
}: MessageBubbleProps) {
  return (
    <div className={`flex group ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
      <div className={`flex gap-3 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
        {/* Avatar for AI */}
        {msg.role === "assistant" && (
          <div className="w-8 h-8 shrink-0 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden">
            {chat?.character.avatarUrl ? (
              <img src={chat.character.avatarUrl} alt={chat.character.name} className="w-full h-full object-cover" />
            ) : (
              <Bot className="w-4 h-4 text-indigo-500" />
            )}
          </div>
        )}
        
        <div className={`space-y-1 relative ${msg.role === "user" ? "items-end" : "items-start"}`}>
          {editingMessageId === msg.id ? (
            <div className="flex flex-col gap-2 min-w-[240px]">
              <textarea 
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full bg-zinc-900 border border-indigo-500/50 rounded-xl p-3 text-sm focus:outline-none"
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <button 
                  onClick={() => setEditingMessageId(null)}
                  className="px-3 py-1 text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleEdit(msg.id)}
                  className="px-3 py-1 text-xs bg-indigo-600 rounded-lg font-bold"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="relative group/bubble">
              <div 
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user" 
                    ? "bg-indigo-600 text-white rounded-tr-none" 
                    : "bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-none shadow-sm"
                }`}
              >
                {msg.content}
              </div>

              {/* Action Menu Trigger (Three Dots) */}
              <div className={`flex items-center gap-2 mt-1 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <p className="text-[10px] text-zinc-600">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                
                <div className="relative">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(activeMenuId === msg.id ? null : msg.id);
                    }}
                    className="p-1 text-zinc-600 hover:text-zinc-400 transition-colors"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>

                  {/* Dropdown Menu */}
                  {activeMenuId === msg.id && (
                    <div className={`absolute bottom-full mb-2 w-32 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 py-1 ${
                      msg.role === "user" ? "right-0" : "left-0"
                    }`}>
                      {msg.role === "user" ? (
                        <>
                          {isLast && (
                            <button 
                              onClick={() => handleResend(msg.id)}
                              className="w-full px-4 py-2 text-left text-xs hover:bg-zinc-800 text-indigo-400 flex items-center gap-2"
                            >
                              <RefreshCw className="w-3.5 h-3.5" /> Resend
                            </button>
                          )}
                          <button 
                            onClick={() => {
                              setEditingMessageId(msg.id);
                              setEditValue(msg.content);
                            }}
                            className="w-full px-4 py-2 text-left text-xs hover:bg-zinc-800 flex items-center gap-2"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(msg.id)}
                            className="w-full px-4 py-2 text-left text-xs hover:bg-zinc-800 text-red-400 flex items-center gap-2"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </>
                      ) : (
                        <>
                          {isLast && (
                            <button 
                              onClick={() => handleReroll(msg.id)}
                              className="w-full px-4 py-2 text-left text-xs hover:bg-zinc-800 text-indigo-400 flex items-center gap-2"
                            >
                              <Sparkles className="w-3.5 h-3.5" /> Re-roll
                            </button>
                          )}
                          <button 
                            onClick={() => handleDelete(msg.id)}
                            className="w-full px-4 py-2 text-left text-xs hover:bg-zinc-800 text-red-400 flex items-center gap-2"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Re-roll Accept/Decline UI */}
              {rollBackState?.id === msg.id && msg.role === "assistant" && (
                <div className="mt-3 flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 rounded-xl p-2 w-fit">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase px-2">New response?</span>
                  <button 
                    onClick={() => setRollBackState(null)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-500 rounded-lg text-[10px] font-bold hover:bg-green-500/20 transition-all"
                  >
                    <Check className="w-3 h-3" /> Accept
                  </button>
                  <button 
                    onClick={handleUndoReroll}
                    className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-500 rounded-lg text-[10px] font-bold hover:bg-red-500/20 transition-all"
                  >
                    <CloseIcon className="w-3 h-3" /> Decline
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
