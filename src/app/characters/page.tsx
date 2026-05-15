"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { User, MessageCircle, Plus, LogOut, Settings } from "lucide-react";
import { signOut } from "next-auth/react";
import { SessionUser } from "@/types";
import Image from "next/image";

interface Character {
  id: number;
  name: string;
  description: string;
  avatarUrl: string | null;
  greeting: string;
  createdBy: number;
}

export default function CharacterSelection() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const res = await fetch("/api/characters");
        if (res.ok) {
          const data = await res.json();
          setCharacters(data);
        }
      } catch (error) {
        console.error("Failed to fetch characters:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchCharacters();
    }
  }, [status]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">MyChatBot</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link 
              href="/settings"
              className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600 transition-all group cursor-pointer"
              title="AI Settings"
            >
              <div className="w-6 h-6 rounded-full bg-zinc-700 group-hover:bg-indigo-600 flex items-center justify-center transition-colors">
                <User className="w-4 h-4 text-zinc-400 group-hover:text-white" />
              </div>
              <span className="text-sm font-medium group-hover:text-indigo-400 transition-colors">{session?.user?.name}</span>
            </Link>

            <button 
              onClick={() => router.push("/settings")}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-indigo-400"
              title="AI Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            <button 
              onClick={() => signOut()}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-red-400"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold mb-2">Choose Your Character</h1>
            <p className="text-zinc-400">Select a character to start a conversation</p>
          </div>
          <button 
            onClick={() => router.push("/characters/new")}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">New Character</span>
          </button>
        </div>

        {/* Character Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map((char) => (
            <div 
              key={char.id}
              className="group relative bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden hover:border-indigo-500/50 transition-all hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer"
              onClick={() => router.push(`/chat/${char.id}`)}
            >
              {/* Card Header (Avatar) */}
              <div className="h-48 bg-zinc-800 relative overflow-hidden">
                {char.avatarUrl ? (
                  <Image 
                    src={char.avatarUrl} 
                    alt={char.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-700/20 to-zinc-900/40 animate-pulse"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <User className="w-20 h-20 text-zinc-700 opacity-50" />
                    </div>
                  </>
                )}
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-white text-indigo-600 font-bold px-6 py-2 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform">
                    Chat Now
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-400 transition-colors">{char.name}</h3>
                <p className="text-zinc-400 text-sm line-clamp-2 mb-4 h-10">
                  {char.description}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Active Now</span>
                  {(session?.user as SessionUser)?.id === char.createdBy.toString() && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/characters/manage/${char.id}`);
                      }}
                      className="p-1 hover:bg-zinc-800 rounded transition-colors text-zinc-600 hover:text-indigo-400"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Empty State / Add New Placeholder */}
          {characters.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-3xl text-zinc-500">
              <p>No characters found. Create your first one!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
