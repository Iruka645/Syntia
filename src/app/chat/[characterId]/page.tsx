"use client";

import { useParams } from "next/navigation";
import { Loader2, Bot, AlertCircle, Settings as SettingsIcon } from "lucide-react";
import Link from "next/link";
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
    isResetting,
    editingMessageId,
    setEditingMessageId,
    editValue,
    setEditValue,
    rollBackState,
    setRollBackState,
    activeMenuId,
    setActiveMenuId,
    chatError,
    messagesEndRef,
    handleSendMessage,
    handleDelete,
    handleEdit,
    handleReroll,
    handleUndoReroll,
    handleResend,
    handleUpdateArchive,
    handleResetChat,
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
      <ChatHeader
        chat={chat}
        onUpdateArchive={handleUpdateArchive}
        onResetChat={handleResetChat}
        isResetting={isResetting}
      />

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

      {/* Inline Guidance Error Banner */}
      {chatError && (
        <div className="mx-6 mb-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-500/20 rounded-xl mt-0.5">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            </div>
            <div className="flex-1 text-xs">
              <h4 className="font-bold text-amber-400 text-sm mb-1">AI Communication Disruption</h4>
              <p className="text-zinc-300 leading-relaxed mb-3">{chatError.message}</p>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/settings"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold transition-all border border-amber-500/30"
                >
                  <SettingsIcon className="w-3.5 h-3.5" /> Change Global Model
                </Link>
                {chat?.character && (
                  <Link
                    href={`/characters/manage/${chat.character.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-medium transition-all border border-zinc-800"
                  >
                    Edit Character Override
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <MessageInput
        inputValue={inputValue}
        setInputValue={setInputValue}
        isSending={isSending}
        handleSendMessage={handleSendMessage}
      />
    </div>
  );
}
