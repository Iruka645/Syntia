"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  X,
  Loader2,
  Sparkles,
  MessageSquare,
  Info,
  Terminal,
  Plus,
  Key,
  Brain,
  ChevronDown,
  ChevronUp,
  Cpu,
} from "lucide-react";
import ProviderSelector from "@/components/settings/ProviderSelector";
import ModelSelector from "@/components/settings/ModelSelector";
import { AvatarImage } from "@/components/AvatarImage";

interface CharacterFormProps {
  initialData?: {
    id?: number;
    name: string;
    description: string;
    systemPrompt: string;
    greeting: string;
    avatarUrl?: string;
    provider?: string;
    model?: string;
    apiKey?: string;
    baseUrl?: string;
  };
  mode: "create" | "edit";
}

export default function CharacterForm({ initialData, mode }: CharacterFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    systemPrompt: initialData?.systemPrompt || "",
    greeting: initialData?.greeting || "",
    avatarUrl: initialData?.avatarUrl || "",
    provider: initialData?.provider || "",
    model: initialData?.model || "",
    apiKey: initialData?.apiKey ? "••••••••••••••••••••••••••••••••" : "",
    baseUrl: initialData?.baseUrl || "",
  });
  const [showOverride, setShowOverride] = useState(
    !!initialData?.provider ||
      !!initialData?.model ||
      !!initialData?.apiKey ||
      !!initialData?.baseUrl
  );
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(initialData?.avatarUrl || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      let currentAvatarUrl = formData.avatarUrl;

      // 1. Upload file if exists
      if (file) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", file);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          currentAvatarUrl = uploadData.url;
        } else {
          throw new Error("Failed to upload image");
        }
      }

      // 2. Save character
      const url = mode === "create" ? "/api/characters" : `/api/characters/${initialData?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, avatarUrl: currentAvatarUrl }),
      });

      if (res.ok) {
        router.push("/characters");
        router.refresh();
      } else {
        const data = await res.json();
        throw new Error(data.message || "Something went wrong");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteCharacter = async () => {
    if (!initialData?.id || !confirm("Are you sure you want to delete this character?")) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/characters/${initialData.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/characters");
        router.refresh();
      } else {
        throw new Error("Failed to delete character");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-2xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Avatar Upload Section */}
      <div className="flex flex-col items-center gap-4 py-4">
        <div
          onClick={() => document.getElementById("avatar-upload")?.click()}
          className="relative w-32 h-32 rounded-3xl bg-zinc-900 border-2 border-dashed border-zinc-800 hover:border-indigo-500 transition-all cursor-pointer overflow-hidden group"
        >
          <AvatarImage src={previewUrl} alt="Avatar Preview" sizes="128px" className="object-cover">
            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600 group-hover:text-indigo-400 transition-colors">
              <Plus className="w-8 h-8 mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Upload Photo</span>
            </div>
          </AvatarImage>
          {previewUrl && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-xs text-white font-bold">Change Photo</span>
            </div>
          )}
        </div>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <p className="text-xs text-zinc-500">Recommended: Square image, 512x512px</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Basic Info */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-400 ml-1">
              <Info className="w-4 h-4" /> Character Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Miyori"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-zinc-100"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-400 ml-1">
              <MessageSquare className="w-4 h-4" /> Short Description
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Briefly describe the personality..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-zinc-100 resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-400 ml-1">
              <Sparkles className="w-4 h-4" /> Greeting Message
            </label>
            <textarea
              required
              rows={4}
              value={formData.greeting}
              onChange={(e) => setFormData({ ...formData, greeting: e.target.value })}
              placeholder="What should the character say first?"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-zinc-100 resize-none"
            />
          </div>
        </div>

        {/* Right Column: AI Config */}
        <div className="space-y-6">
          <div className="space-y-2 h-full flex flex-col">
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-400 ml-1">
              <Terminal className="w-4 h-4" /> AI System Prompt
            </label>
            <textarea
              required
              value={formData.systemPrompt}
              onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
              placeholder="Instructions for the AI (Personality, tone, rules...)"
              className="flex-1 w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-zinc-100 resize-none font-mono text-sm"
            />
            <p className="text-[10px] text-zinc-500 mt-2 ml-1">
              This prompt is hidden from the user and defines how the AI behaves.
            </p>
          </div>
        </div>
      </div>

      {/* AI Provider Override Section */}
      <div className="border-t border-zinc-800 pt-8">
        <button
          type="button"
          onClick={() => setShowOverride(!showOverride)}
          className="flex items-center justify-between w-full p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-all group"
        >
          <div className="flex items-center gap-3">
            <Brain className="w-5 h-5 text-indigo-400" />
            <div className="text-left">
              <h3 className="font-bold text-white group-hover:text-indigo-400 transition-colors">
                AI Provider Override
              </h3>
              <p className="text-xs text-zinc-500">
                Optional: Use a specific AI model or API key for this character only
              </p>
            </div>
          </div>
          {showOverride ? (
            <ChevronUp className="w-5 h-5 text-zinc-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-zinc-500" />
          )}
        </button>

        {showOverride && (
          <div className="mt-6 space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="space-y-4">
              <label className="text-sm font-medium text-zinc-400 ml-1">Select Provider</label>
              <ProviderSelector
                value={formData.provider || "gemini"}
                onChange={(val) => setFormData({ ...formData, provider: val })}
              />
            </div>

            <div className="space-y-4 pt-2 border-t border-zinc-800/50">
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-400 ml-1">
                <Cpu className="w-4 h-4 text-indigo-400" /> Override AI Model
              </label>
              <ModelSelector
                provider={formData.provider || "gemini"}
                value={formData.model}
                onChange={(val) => setFormData({ ...formData, model: val })}
              />
            </div>

            <div className="space-y-2">
              {formData.provider === "local" && (
                <div className="space-y-2 mb-8">
                  <label className="flex items-center gap-2 text-sm font-medium text-zinc-400 ml-1">
                    <Terminal className="w-4 h-4" /> Override Unsloth API Endpoint
                  </label>
                  <input
                    type="url"
                    value={formData.baseUrl}
                    onChange={(event) => setFormData({ ...formData, baseUrl: event.target.value })}
                    placeholder="Leave blank to use the global local-provider endpoint"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-zinc-100 font-mono text-sm"
                  />
                </div>
              )}
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-400 ml-1">
                <Key className="w-4 h-4" /> Override API Key
                {formData.provider === "local" ? " (optional)" : ""}
              </label>
              <input
                type="password"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                placeholder="Enter character-specific API key (optional)..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-zinc-100"
              />
              {(formData.apiKey.endsWith("...") || formData.apiKey.includes("••••")) && (
                <p className="text-[10px] text-zinc-500 mt-1 ml-1 italic">
                  Note: An override key is already saved. Leave it to keep it, or clear it to use
                  your global key.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-8 border-t border-zinc-800">
        {mode === "edit" ? (
          <button
            type="button"
            onClick={deleteCharacter}
            disabled={isSubmitting}
            className="text-red-500 hover:text-red-400 text-sm font-medium transition-colors"
          >
            Delete Character
          </button>
        ) : (
          <div></div>
        )}

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-all"
          >
            <X className="w-5 h-5" /> Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white px-8 py-3 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span className="font-bold">
              {mode === "create" ? "Create Character" : "Save Changes"}
            </span>
          </button>
        </div>
      </div>
    </form>
  );
}
