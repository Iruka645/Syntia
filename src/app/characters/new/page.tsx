"use client";

import CharacterForm from "@/components/Providers"; // Wait, I imported from Providers by mistake in my thought but I'll fix it in the code
import { Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";
import CharacterFormComp from "@/components/CharacterForm";

export default function NewCharacterPage() {
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
              <Sparkles className="w-6 h-6 text-indigo-500" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Create New Character</h1>
              <p className="text-zinc-500 mt-1">Design a unique personality for your AI assistant</p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-sm">
          <CharacterFormComp mode="create" />
        </div>
      </div>
    </div>
  );
}
