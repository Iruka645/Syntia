"use client";

import { useEffect, useState, use } from "react";
import CharacterFormComp from "@/components/characters/CharacterForm";
import { Settings, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function EditCharacterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [character, setCharacter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        const res = await fetch(`/api/characters/${id}`);
        if (res.ok) {
          const data = await res.json();
          setCharacter(data);
        }
      } catch (error) {
        console.error("Failed to fetch character:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCharacter();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!character) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-500">
        <p className="mb-4">Character not found</p>
        <Link href="/characters" className="text-indigo-500 hover:underline">Back to Characters</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-12">
          <Link 
            href="/characters" 
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-indigo-400 transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Characters
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600/20 rounded-2xl flex items-center justify-center border border-indigo-500/30">
              <Settings className="w-6 h-6 text-indigo-500" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Edit Character</h1>
              <p className="text-zinc-500 mt-1">Refine the personality and settings for {character.name}</p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-sm">
          <CharacterFormComp mode="edit" initialData={{
            id: character.id,
            name: character.name,
            description: character.description || "",
            systemPrompt: character.systemPrompt,
            greeting: character.greeting,
            avatarUrl: (character as any).avatarUrl,
            provider: (character as any).provider,
            apiKey: (character as any).apiKey
          }} />
        </div>
      </div>
    </div>
  );
}
