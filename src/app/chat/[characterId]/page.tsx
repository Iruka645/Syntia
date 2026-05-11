"use client";

import { useParams } from "next/navigation";
import { Loader2, Bot } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { MessageInput } from "@/components/chat/MessageInput";

export default function ChatPage() {
  const params = useParams();
  const characterId = params?.characterId as string;

  const {
    chat,
    messages,
    inputValue,
    setInputValue,
    isLoading,
    isSending,
    editingMessageId,
    setEditingMessageId,
    editValue,
    setEditValue,
    rollBackState,
    setRollBackState,
    activeMenuId,
    setActiveMenuId,
    messagesEndRef,
    handleSendMessage,
    handleDelete,
    handleEdit,
    handleReroll,
    handleUndoReroll,
    handleResend,
    handleUpdateArchive,
  } = useChat(characterId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100">
      <ChatHeader chat={chat} onUpdateArchive={handleUpdateArchive} />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
        {messages.map((msg, index) => (
          <MessageBubble 
            key={msg.id}
            msg={msg}
            chat={chat}
            isLast={index === messages.length - 1}
            editingMessageId={editingMessageId}
            setEditingMessageId={setEditingMessageId}
            editValue={editValue}
            setEditValue={setEditValue}
            handleEdit={handleEdit}
            activeMenuId={activeMenuId}
            setActiveMenuId={setActiveMenuId}
            handleResend={handleResend}
            handleDelete={handleDelete}
            handleReroll={handleReroll}
            rollBackState={rollBackState}
            setRollBackState={setRollBackState}
            handleUndoReroll={handleUndoReroll}
          />
        ))}
        {isSending && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[80%] items-center">
              <div className="w-8 h-8 shrink-0 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <Bot className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-2xl rounded-tl-none">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput 
        inputValue={inputValue}
        setInputValue={setInputValue}
        isSending={isSending}
        handleSendMessage={handleSendMessage}
      />
    </div>
  );
}
