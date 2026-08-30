"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bot, Loader2, RotateCcw, X } from "lucide-react";
import { Chat } from "@/types";
import ArchiveSelector from "./ArchiveSelector";
import { AvatarImage } from "@/components/AvatarImage";

interface ChatHeaderProps {
  chat: Chat | null;
  onUpdateArchive: (archiveId: number | null) => void;
  onResetChat: () => Promise<boolean>;
  isResetting: boolean;
}

export function ChatHeader({ chat, onUpdateArchive, onResetChat, isResetting }: ChatHeaderProps) {
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);

  const confirmReset = async () => {
    const resetSucceeded = await onResetChat();
    if (resetSucceeded) setIsConfirmingReset(false);
  };

  return (
    <header className="relative z-50 flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <Link href="/characters" className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-zinc-400" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 overflow-hidden">
            <AvatarImage
              src={chat?.character.avatarUrl}
              alt={chat?.character.name || "Character avatar"}
              sizes="40px"
              className="object-cover"
            >
              <Bot className="w-6 h-6 text-indigo-400" />
            </AvatarImage>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">{chat?.character.name}</h1>
            <p className="text-xs text-indigo-400 font-medium">Online</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ArchiveSelector currentArchiveId={chat?.archiveId} onSelect={onUpdateArchive} />
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsConfirmingReset(true)}
            disabled={!chat || isResetting}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Reset chat history"
          >
            {isResetting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Reset chat</span>
          </button>

          {isConfirmingReset && (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="reset-chat-title"
              className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-zinc-700 bg-zinc-900 p-4 shadow-2xl shadow-black/40"
            >
              <button
                type="button"
                onClick={() => setIsConfirmingReset(false)}
                className="absolute right-3 top-3 rounded-lg p-1 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
                aria-label="Cancel reset"
              >
                <X className="h-4 w-4" />
              </button>
              <h2 id="reset-chat-title" className="pr-7 text-sm font-bold text-zinc-100">
                Reset this chat?
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                All messages with {chat?.character.name} will be permanently deleted. Your character
                and selected archive will stay unchanged.
              </p>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsConfirmingReset(false)}
                  disabled={isResetting}
                  className="rounded-lg px-3 py-2 text-xs font-semibold text-zinc-300 transition-colors hover:bg-zinc-800"
                >
                  Keep history
                </button>
                <button
                  type="button"
                  onClick={confirmReset}
                  disabled={isResetting}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isResetting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Delete all messages
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
