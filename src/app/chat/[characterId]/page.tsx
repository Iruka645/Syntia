"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  ArrowLeft, 
  Send, 
  User, 
  MoreVertical, 
  Loader2, 
  Bot,
  MessageSquare
} from "lucide-react";
import Link from "next/link";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

interface Character {
  id: number;
  name: string;
  description: string;
  greeting: string;
}

interface Chat {
  id: number;
  character: Character;
}

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const characterId = params.characterId;

  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const initChat = async () => {
      try {
        // 1. Get or Create Chat
        const chatRes = await fetch(`/api/chats/${characterId}`);
        if (!chatRes.ok) throw new Error("Failed to load chat");
        const chatData = await chatRes.json();
        setChat(chatData);

        // 2. Fetch Messages
        const msgRes = await fetch(`/api/messages/${chatData.id}`);
        if (msgRes.ok) {
          const msgData = await msgRes.json();
          if (msgData.length === 0 && chatData.character.greeting) {
            // If no history, show greeting (but don't save it to DB yet or save as initial)
            setMessages([{
              id: 0,
              role: "assistant",
              content: chatData.character.greeting,
              createdAt: new Date().toISOString()
            }]);
          } else {
            setMessages(msgData);
          }
        }
      } catch (error) {
        console.error("Chat Init Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (status === "authenticated") {
      initChat();
    }
  }, [status, characterId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !chat || isSending) return;

    const userMessage = inputValue;
    setInputValue("");
    setIsSending(true);

    // Optimistically add user message
    const tempUserMsg: Message = {
      id: Date.now(),
      role: "user",
      content: userMessage,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: chat.id,
          content: userMessage,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Replace temp message and add AI message
        setMessages((prev) => [
          ...prev.filter(m => m.id !== tempUserMsg.id),
          data.userMessage,
          data.aiMessage
        ]);
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      console.error("Send Error:", error);
      // Optional: Add error message to UI
    } finally {
      setIsSending(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link href="/characters" className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-zinc-400" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 overflow-hidden">
              {chat?.character.avatarUrl ? (
                <img src={chat.character.avatarUrl} alt={chat.character.name} className="w-full h-full object-cover" />
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
        <button className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400">
          <MoreVertical className="w-5 h-5" />
        </button>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`flex gap-3 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              {/* Avatar for AI */}
              {msg.role === "assistant" && (
                <div className="w-8 h-8 shrink-0 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden">
                  {chat?.character.avatarUrl ? (
                    <img src={chat.character.avatarUrl} alt={chat.character.name} className="w-full h-full object-cover" />
                  ) : (
                    <Bot className="w-4 h-4 text-indigo-500" />
                  )}
                </div>
              )}
              
              <div className={`space-y-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div 
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user" 
                      ? "bg-indigo-600 text-white rounded-tr-none" 
                      : "bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-none shadow-sm"
                  }`}
                >
                  {msg.content}
                </div>
                <p className="text-[10px] text-zinc-600 px-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        ))}
        {isSending && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[80%] items-center">
              <div className="w-8 h-8 shrink-0 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <Bot className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-2xl rounded-tl-none">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-zinc-950 border-t border-zinc-900">
        <form 
          onSubmit={handleSendMessage}
          className="max-w-4xl mx-auto relative flex items-center gap-3"
        >
          <div className="relative flex-1">
            <input 
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-4 pl-5 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-zinc-600"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button 
                type="submit"
                disabled={!inputValue.trim() || isSending}
                className={`p-2 rounded-xl transition-all ${
                  inputValue.trim() && !isSending 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 active:scale-90" 
                    : "text-zinc-600 bg-zinc-800 cursor-not-allowed"
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </form>
        <p className="text-center text-[10px] text-zinc-600 mt-4">
          Character responses are generated by AI and may be inaccurate.
        </p>
      </div>
    </div>
  );
}
