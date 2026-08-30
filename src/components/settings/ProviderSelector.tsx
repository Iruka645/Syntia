"use client";

import React from "react";

interface ProviderSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const providers = [
  { id: "gemini", name: "Google Gemini", description: "Fast and efficient" },
  { id: "openai", name: "OpenAI (GPT)", description: "Versatile and smart" },
  { id: "claude", name: "Anthropic Claude", description: "Human-like and safe" },
  { id: "grok", name: "xAI Grok", description: "Real-time and witty" },
  { id: "local", name: "Local (Unsloth)", description: "Private, local OpenAI-compatible server" },
];

export default function ProviderSelector({ value, onChange }: ProviderSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {providers.map((provider) => (
        <label
          key={provider.id}
          className={`
            relative flex cursor-pointer rounded-lg border bg-zinc-900 p-4 shadow-sm focus:outline-none
            ${value === provider.id ? "border-blue-500 ring-1 ring-blue-500" : "border-zinc-800"}
            hover:border-zinc-700 transition-all
          `}
        >
          <input
            type="radio"
            name="provider"
            value={provider.id}
            checked={value === provider.id}
            onChange={() => onChange(provider.id)}
            className="sr-only"
          />
          <span className="flex flex-1">
            <span className="flex flex-col">
              <span className="block text-sm font-medium text-white">{provider.name}</span>
              <span className="mt-1 flex items-center text-xs text-zinc-400">
                {provider.description}
              </span>
            </span>
          </span>
          {value === provider.id && (
            <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </label>
      ))}
    </div>
  );
}
