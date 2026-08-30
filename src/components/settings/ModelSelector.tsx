"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Sparkles } from "lucide-react";

interface ModelSelectorProps {
  provider: string;
  value: string;
  onChange: (value: string) => void;
}

const providerModels: Record<string, { id: string; name: string; isLatest?: boolean }[]> = {
  gemini: [
    { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", isLatest: true },
    { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash" },
    { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash" },
    { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro" },
  ],
  openai: [
    { id: "gpt-4o", name: "GPT-4o", isLatest: true },
    { id: "gpt-4o-mini", name: "GPT-4o mini" },
  ],
  claude: [
    { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet", isLatest: true },
    { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku" },
  ],
  grok: [{ id: "grok-2-latest", name: "Grok 2 Latest", isLatest: true }],
};

export default function ModelSelector({ provider, value, onChange }: ModelSelectorProps) {
  const models = useMemo(
    () => (provider === "local" ? [] : providerModels[provider] || providerModels.gemini),
    [provider]
  );
  const isPreset = models.some((m) => m.id === value);

  const [prevProvider, setPrevProvider] = useState(provider);
  const [isCustomMode, setIsCustomMode] = useState(!isPreset && value !== "");
  const [customValue, setCustomValue] = useState(isPreset ? "" : value);

  // Sync internal state when provider changes during render (React 18+ pattern)
  if (provider !== prevProvider) {
    setPrevProvider(provider);
    setIsCustomMode(false);
  }

  // If provider changes or value becomes invalid for new provider, update parent via effect
  useEffect(() => {
    if (provider === "local") return;

    const isCurrentValueInNewModels = models.some((m) => m.id === value);
    if (!value || (!isCustomMode && !isCurrentValueInNewModels)) {
      const defaultLatest = models.find((m) => m.isLatest)?.id || models[0]?.id;
      if (defaultLatest && defaultLatest !== value) {
        onChange(defaultLatest);
      }
    }
  }, [provider, models, value, isCustomMode, onChange]);

  const handleCustomToggle = () => {
    setIsCustomMode(true);
    onChange(customValue);
  };

  const handlePresetSelect = (id: string) => {
    setIsCustomMode(false);
    onChange(id);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomValue(e.target.value);
    onChange(e.target.value);
  };

  const isCustomActive = isCustomMode || (!isPreset && value !== "");

  if (provider === "local") {
    return (
      <div className="space-y-2">
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Model ID exposed by Unsloth (for example, local-model)"
          required
          className="w-full bg-zinc-950 border border-emerald-500/50 rounded-xl py-3 px-4 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono text-sm text-zinc-100"
        />
        <p className="px-2 text-xs text-zinc-500">
          Use the exact model ID shown by the local server.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {models.map((m) => {
          const selected = !isCustomActive && value === m.id;
          return (
            <label
              key={m.id}
              onClick={() => handlePresetSelect(m.id)}
              className={`
                relative flex cursor-pointer items-center justify-between rounded-xl border bg-zinc-950/60 p-4 shadow-sm backdrop-blur-sm focus:outline-none
                ${selected ? "border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500" : "border-zinc-800/80"}
                hover:border-zinc-700 transition-all
              `}
            >
              <div className="flex flex-col">
                <span className="flex items-center gap-2 text-sm font-bold text-white">
                  {m.name}
                  {m.isLatest && (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                      <Sparkles className="w-2.5 h-2.5" /> Latest
                    </span>
                  )}
                </span>
                <span className="mt-1 text-xs text-zinc-500 font-mono">{m.id}</span>
              </div>
              {selected && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
            </label>
          );
        })}

        {/* Custom Input Toggle Card */}
        <label
          onClick={handleCustomToggle}
          className={`
            relative flex cursor-pointer items-center justify-between rounded-xl border bg-zinc-950/60 p-4 shadow-sm backdrop-blur-sm focus:outline-none
            ${isCustomActive ? "border-purple-500 bg-purple-500/5 ring-1 ring-purple-500" : "border-zinc-800/80"}
            hover:border-zinc-700 transition-all
          `}
        >
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white">Custom Model</span>
            <span className="mt-1 text-xs text-zinc-500">Type custom model string</span>
          </div>
          {isCustomActive && <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />}
        </label>
      </div>

      {isCustomActive && (
        <div className="animate-in fade-in slide-in-from-top-1 duration-200 pt-2">
          <input
            type="text"
            value={customValue}
            onChange={handleCustomChange}
            placeholder="e.g. gemini-2.5-flash-tuning or custom identifier..."
            className="w-full bg-zinc-950 border border-purple-500/50 rounded-xl py-3 px-4 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono text-sm text-zinc-100"
          />
        </div>
      )}
    </div>
  );
}
