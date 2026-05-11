"use client";

import React, { useState, useEffect } from "react";
import { X, Save, ScrollText } from "lucide-react";

interface Archive {
  id: number;
  name: string;
  content: string;
  isDefault: boolean;
}

interface ArchiveModalProps {
  archive: Archive | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function ArchiveModal({ archive, onClose, onSaved }: ArchiveModalProps) {
  const [name, setName] = useState(archive?.name || "");
  const [content, setContent] = useState(archive?.content || "");
  const [isDefault, setIsDefault] = useState(archive?.isDefault || false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !content) {
      setError("Please fill in all required fields.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const url = archive 
        ? `/api/user/archives/${archive.id}` 
        : "/api/user/archives";
      const method = archive ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, content, isDefault }),
      });

      if (res.ok) {
        onSaved();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save archive.");
      }
    } catch (error) {
      setError("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <ScrollText className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {archive ? "Edit Archive" : "New Archive"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                Archive Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='e.g. "My Detective Persona", "Professional Identity"'
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                Content / Identity Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Describe who you are, your background, your personality, or your relationship with the characters..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 transition-colors min-h-[200px] resize-none"
                required
              />
              <p className="mt-2 text-xs text-zinc-500 italic">
                This content will be added to the AI's system prompt to give it context about who it is talking to.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isDefault"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-5 h-5 rounded border-zinc-800 bg-zinc-950 text-blue-600 focus:ring-blue-500 focus:ring-offset-zinc-900 transition-all"
              />
              <label htmlFor="isDefault" className="text-sm font-medium text-zinc-300 cursor-pointer">
                Set as Default Archive
              </label>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 p-3 rounded-lg">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-2 py-3 px-8 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {saving ? "Saving..." : "Save Archive"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
