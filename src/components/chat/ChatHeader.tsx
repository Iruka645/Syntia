"use client";

import Link from "next/link";
import { ArrowLeft, Bot, MoreVertical } from "lucide-react";
import { Chat } from "@/types";
import ArchiveSelector from "./ArchiveSelector";
import Image from "next/image";

interface ChatHeaderProps {
  chat: Chat | null;
  onUpdateArchive: (archiveId: number | null) => void;
}

export function ChatHeader({ chat, onUpdateArchive }: ChatHeaderProps) {
  return (
    <header className="relative z-50 flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <Link href="/characters" className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-zinc-400" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 overflow-hidden">
            {chat?.character.avatarUrl ? (
              <Image src={chat.character.avatarUrl} alt={chat.character.name} className="w-full h-full object-cover" />
            ) : (
              <Bot className="w-6 h-6 text-indigo-400" />
            )}
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">{chat?.character.name}</h1>
            <p className="text-xs text-indigo-400 font-medium">Online</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <ArchiveSelector 
          currentArchiveId={chat?.archiveId} 
          onSelect={onUpdateArchive} 
        />
        <button className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
