"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Message, Chat } from "@/types";

export function useChat(characterId: string | string[] | undefined) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [rollBackState, setRollBackState] = useState<{ id: number, content: string } | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    if (activeMenuId) {
      window.addEventListener("click", handleClickOutside);
    }
    return () => window.removeEventListener("click", handleClickOutside);
  }, [activeMenuId]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const initChat = async () => {
      if (!characterId) return;
      try {
        const chatRes = await fetch(`/api/chats/${characterId}`);
        if (!chatRes.ok) throw new Error("Failed to load chat");
        const chatData = await chatRes.json();
        setChat(chatData);

        const msgRes = await fetch(`/api/messages?chatId=${chatData.id}`);
        if (msgRes.ok) {
          const msgData = await msgRes.json();
          if (msgData.length === 0 && chatData.character.greeting) {
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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || !chat || isSending) return;

    const userMessage = inputValue;
    setInputValue("");
    setIsSending(true);

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
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      const res = await fetch(`/api/messages/${id}`, { method: "DELETE" });
      if (res.ok) {
        const msgIndex = messages.findIndex(m => m.id === id);
        if (msgIndex !== -1) {
          const msgToDelete = messages[msgIndex];
          let newMessages = [...messages];
          if (msgToDelete.role === "user" && messages[msgIndex + 1]?.role === "assistant") {
            newMessages.splice(msgIndex, 2);
          } else {
            newMessages.splice(msgIndex, 1);
          }
          setMessages(newMessages);
        }
      }
    } catch (error) {
      console.error("Delete Error:", error);
    }
  };

  const handleEdit = async (id: number) => {
    if (!editValue.trim()) return;
    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editValue }),
      });
      if (res.ok) {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, content: editValue } : m));
        setEditingMessageId(null);
      }
    } catch (error) {
      console.error("Edit Error:", error);
    }
  };

  const handleReroll = async (msgId: number) => {
    if (isSending || !chat) return;
    
    const aiMsg = messages.find(m => m.id === msgId);
    if (!aiMsg) return;

    setRollBackState({ id: aiMsg.id, content: aiMsg.content });
    
    setIsSending(true);
    try {
      const msgIndex = messages.findIndex(m => m.id === msgId);
      const userPrompt = messages[msgIndex - 1]?.content;
      if (!userPrompt) throw new Error("No prompt found for re-roll");

      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: chat.id,
          content: userPrompt,
          isReroll: true,
          oldAiMessageId: aiMsg.id
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => prev.map(m => m.id === msgId ? data.aiMessage : m));
      }
    } catch (error) {
      console.error("Reroll Error:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleUndoReroll = async () => {
    if (!rollBackState || !chat) return;
    try {
      const res = await fetch(`/api/messages/${rollBackState.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: rollBackState.content }),
      });
      if (res.ok) {
        setMessages(prev => prev.map(m => m.id === rollBackState.id ? { ...m, content: rollBackState.content } : m));
        setRollBackState(null);
      }
    } catch (error) {
      console.error("Undo Error:", error);
    }
  };

  const handleResend = async (id: number) => {
    if (isSending || !chat) return;
    const userMsg = messages.find(m => m.id === id);
    if (!userMsg) return;

    setInputValue("");
    setIsSending(true);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: chat.id,
          content: userMsg.content,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.aiMessage]);
      }
    } catch (error) {
      console.error("Resend Error:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleUpdateArchive = async (archiveId: number | null) => {
    if (!chat || !characterId) return;
    try {
      const res = await fetch(`/api/chats/${characterId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archiveId }),
      });
      if (res.ok) {
        const updatedChat = await res.json();
        setChat(updatedChat);
      }
    } catch (error) {
      console.error("Update Archive Error:", error);
    }
  };

  return {
    chat,
    messages,
    inputValue,
    setInputValue,
    isLoading: status === "loading" || isLoading,
    isSending,
    editingMessageId,
    setEditingMessageId,
    editValue,
    setEditValue,
    rollBackState,
    setRollBackState,
    activeMenuId,
    setActiveMenuId,
    messagesEndRef,
    handleSendMessage,
    handleDelete,
    handleEdit,
    handleReroll,
    handleUndoReroll,
    handleResend,
    handleUpdateArchive,
  };
}
