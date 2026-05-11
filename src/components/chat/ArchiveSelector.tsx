"use client";

import React, { useState, useEffect, useRef } from "react";
import { ScrollText, ChevronDown, Check, UserCircle } from "lucide-react";
import { UserArchive } from "@/types";

interface ArchiveSelectorProps {
  currentArchiveId: number | null | undefined;
  onSelect: (archiveId: number | null) => void;
}

export default function ArchiveSelector({ currentArchiveId, onSelect }: ArchiveSelectorProps) {
  const [archives, setArchives] = useState<UserArchive[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchArchives();
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchArchives = async () => {
    try {
      const res = await fetch("/api/user/archives");
      if (res.ok) {
        const data = await res.json();
        setArchives(data);
      }
    } catch (error) {
      console.error("Failed to fetch archives:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentArchive = archives.find(a => a.id === currentArchiveId);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 rounded-full text-xs font-medium text-zinc-300 transition-all"
      >
        <ScrollText className="w-3.5 h-3.5 text-amber-400" />
        <span className="truncate max-w-[100px]">
          {currentArchive ? currentArchive.name : "No Archive"}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 border-b border-zinc-800 bg-zinc-900/50">
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Select Persona</h4>
          </div>
          <div className="max-h-64 overflow-y-auto p-1">
            <button
              onClick={() => {
                onSelect(null);
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800 text-left transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-zinc-800 rounded-md group-hover:bg-zinc-700">
                  <UserCircle className="w-4 h-4 text-zinc-400" />
                </div>
                <span className="text-sm text-zinc-300 font-medium">None (Global Default)</span>
              </div>
              {!currentArchiveId && <Check className="w-4 h-4 text-blue-500" />}
            </button>

            {archives.map((archive) => (
              <button
                key={archive.id}
                onClick={() => {
                  onSelect(archive.id);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800 text-left transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-amber-500/10 rounded-md group-hover:bg-amber-500/20">
                    <ScrollText className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-zinc-100 font-medium">{archive.name}</span>
                    <span className="text-[10px] text-zinc-500 line-clamp-1">{archive.content}</span>
                  </div>
                </div>
                {currentArchiveId === archive.id && <Check className="w-4 h-4 text-blue-500" />}
              </button>
            ))}
          </div>
          <div className="p-2 border-t border-zinc-800 bg-zinc-900/30">
            <Link 
              href="/settings" 
              className="block w-full text-center py-2 text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Manage Archives in Settings
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
