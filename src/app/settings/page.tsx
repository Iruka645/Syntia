"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ProviderSelector from "@/components/settings/ProviderSelector";
import ArchiveList from "@/components/settings/ArchiveList";
import { 
  Save, Key, Brain, CheckCircle2, AlertCircle, 
  ArrowLeft, User as UserIcon, Shield, ScrollText 
} from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Profile State
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // AI Provider State
  const [provider, setProvider] = useState("gemini");
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/user/settings");
      if (res.ok) {
        const data = await res.json();
        setName(data.name || "");
        setUsername(data.username || "");
        setProvider(data.defaultProvider);
        setApiKey(data.apiKey || "");
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          username, 
          password: password || undefined, 
          defaultProvider: provider, 
          apiKey 
        }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Settings saved successfully!" });
        setPassword(""); // Clear password field after save
        fetchSettings();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Failed to save settings." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred while saving." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 pb-20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/characters" 
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold">Settings</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold rounded-lg transition-all"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save All Changes"}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-12 space-y-16">
        {/* Profile Section */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <UserIcon className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Profile Information</h2>
              <p className="text-zinc-500 text-sm">Update your display name and login credentials.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-8">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="How you want to be called"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="Login username"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-zinc-400">New Password (leave blank to keep current)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>
        </section>

        {/* AI Provider Section */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Brain className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">AI Provider Settings</h2>
              <p className="text-zinc-500 text-sm">Configure which AI brain powers your conversations.</p>
            </div>
          </div>

          <div className="space-y-8 bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-8">
            <div>
              <h3 className="text-sm font-medium text-zinc-400 mb-4">Choose Default Provider</h3>
              <ProviderSelector value={provider} onChange={setProvider} />
            </div>

            <div className="pt-6 border-t border-zinc-800/50">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-medium text-zinc-400">Secure API Key</h3>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your API key..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 focus:outline-none focus:border-purple-500 transition-colors"
                />
                {apiKey.endsWith("...") && (
                  <p className="text-[10px] text-zinc-500 mt-2 px-2 italic">
                    A key is already saved. Type a new one to replace it.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* User Archives Section */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <ScrollText className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">User Archives (Personas)</h2>
              <p className="text-zinc-500 text-sm">Create different personas or context for the AI to recognize you.</p>
            </div>
          </div>
          
          <ArchiveList />
        </section>

        {/* Status Message */}
        {message && (
          <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 px-6 py-3 rounded-full shadow-2xl animate-in slide-in-from-bottom-4 duration-300 ${
            message.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
          }`}>
            {message.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-medium">{message.text}</span>
          </div>
        )}
      </div>
    </div>
  );
}
